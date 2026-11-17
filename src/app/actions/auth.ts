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

const SignupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Use at least 8 characters."),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth."),
  terms: z.literal("on", { message: "Please accept the Terms." }),
  privacy: z.literal("on", { message: "Please accept the Privacy notice." }),
  firewall: z.literal("on", { message: "Please confirm you've read how your data is separated from eLitmus." }),
  marketing: z.string().optional(),
});

export async function signUp(_: unknown, formData: FormData) {
  const res = await run(async () => {
    await rateLimit(await ipKey("signup"), 8, 3600);
    const parsed = SignupSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) throw new ActionError(parsed.error.issues[0].message);
    const f = parsed.data;
    const age = ageFromDob(f.dob);
    if (age === null || age < 18) throw new ActionError("Covalent is only for people aged 18 and over.");
    if (age > 60) throw new ActionError("Please check your date of birth.");

    // Created server-side as already-confirmed: no confirmation email round-trip for this build.
    const { data: created, error } = await admin().auth.admin.createUser({ email: f.email, password: f.password, email_confirm: true });
    if (error || !created.user) {
      if (error?.message?.toLowerCase().includes("already")) throw new ActionError("That email already has an account. Log in instead.");
      throw new ActionError("Couldn't create your account. Try again.");
    }
    const now = new Date().toISOString();
    await admin().from("profiles").insert({
      id: created.user.id,
      email: f.email,
      dob: f.dob,
      consent_terms_at: now,
      consent_privacy_at: now,
      consent_marketing: f.marketing === "on",
      onboarding_step: 1,
    });
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: f.email, password: f.password });
    if (signInError) throw new ActionError("Account created. Please log in.");
    await track(created.user.id, "signup");
  });
  if (res.ok) redirect("/onboarding/1");
  return res;
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
