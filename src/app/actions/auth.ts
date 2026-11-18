"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { ActionError, rateLimit, run } from "@/lib/auth";
import { track } from "@/lib/events";
import { ageFromDob } from "@/lib/utils";

async function ipKey(prefix: string) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  return `${prefix}:${ip}`;
}

/** Age gate + unbundled consents: collected by email sign-up and by /welcome for Google/GitHub. */
const AgeAndConsents = z.object({
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth."),
  terms: z.literal("on", { message: "Please accept the Terms." }),
  privacy: z.literal("on", { message: "Please accept the Privacy notice." }),
  firewall: z.literal("on", { message: "Please confirm you've read how your data is separated from eLitmus." }),
  marketing: z.string().optional(),
});
const SignupSchema = AgeAndConsents.extend({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

function checkAge(dob: string) {
  const age = ageFromDob(dob);
  if (age === null || age < 18) throw new ActionError("Covalent is only for people aged 18 and over.");
  if (age > 60) throw new ActionError("Please check your date of birth.");
}

function consentFields(f: z.infer<typeof AgeAndConsents>) {
  const now = new Date().toISOString();
  return { dob: f.dob, consent_terms_at: now, consent_privacy_at: now, consent_marketing: f.marketing === "on", onboarding_step: 1 };
}

export async function signUp(_: unknown, formData: FormData) {
  const res = await run(async () => {
    await rateLimit(await ipKey("signup"), 8, 3600);
    const parsed = SignupSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const f = parsed.data;
    checkAge(f.dob);

    // Created server-side as already-confirmed: no confirmation email round-trip for this build.
    const { data: created, error } = await admin().auth.admin.createUser({ email: f.email, password: f.password, email_confirm: true });
    if (error || !created.user) {
      if (error?.message?.toLowerCase().includes("already")) throw new ActionError("That email already has an account. Log in instead.");
      throw new ActionError("Couldn't create your account. Try again.");
    }
    await admin().from("profiles").insert({ id: created.user.id, email: f.email, ...consentFields(f) });
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
    if (signInError) throw new ActionError("Account created. Please log in.");
    await track(created.user.id, "signup");
  });
  if (res.ok) redirect("/onboarding/1");
  return res;
}

/**
 * Second half of Google / GitHub sign-up: the provider proved who they are; we still need
 * the 18+ check and the same consents before a profile exists.
 */
export async function finishSignup(_: unknown, formData: FormData) {
  const res = await run(async () => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) throw new ActionError("Your sign-in expired. Please log in again.");
    const parsed = AgeAndConsents.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    checkAge(parsed.data.dob);

    const { data: existing } = await admin().from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (existing) return;
    const { error } = await admin()
      .from("profiles")
      .insert({ id: user.id, email: user.email?.toLowerCase() ?? null, first_name: firstNameFrom(user.user_metadata), ...consentFields(parsed.data) });
    if (error) throw new ActionError("Couldn't finish setting up your account. Try again.");
    await track(user.id, "signup", { method: user.app_metadata?.provider ?? "oauth" });
  });
  if (res.ok) redirect("/onboarding/1");
  return res;
}

/** First name from the provider profile, used only to pre-fill onboarding (people can change it). */
function firstNameFrom(meta: Record<string, unknown> | undefined): string | null {
  const raw = [meta?.given_name, meta?.full_name, meta?.name].find((x): x is string => typeof x === "string" && x.trim().length > 0);
  const first = raw?.trim().split(/\s+/)[0]?.slice(0, 30);
  return first || null;
}

const LoginSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1), next: z.string().optional() });

export async function logIn(_: unknown, formData: FormData) {
  let next = "/today";
  const res = await run(async () => {
    await rateLimit(await ipKey("login"), 20, 600);
    const parsed = LoginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new ActionError("Enter your email and password.");
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    if (error) throw new ActionError("That email and password don't match.");
    if (parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//")) next = parsed.data.next;
  });
  if (res.ok) redirect(next);
  return res;
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
