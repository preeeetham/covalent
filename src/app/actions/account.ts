"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { admin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ActionError, actionViewer, rateLimit, run } from "@/lib/auth";
import { CITY_IDS } from "@/content/cities";
import { regenerateBatch } from "@/lib/data/batch";
import { tickPersona } from "@/lib/data/bonds";
import { resetEvaluator } from "@/lib/demo/seed-core";

// ---------------------------------------------------------------- profile edits
const ProfileEdit = z.object({
  first_name: z.string().trim().min(1).max(30),
  city: z.enum(CITY_IDS),
  hometown: z.string().trim().max(40).optional().default(""),
  role: z.string().trim().min(1).max(50),
  company: z.string().trim().max(50).optional().default(""),
  intent: z.enum(["serious", "see", "friends"]),
  interested_in: z.array(z.enum(["woman", "man", "nonbinary", "everyone"])).min(1),
});

export async function updateProfile(input: z.input<typeof ProfileEdit>) {
  return run(async () => {
    const v = await actionViewer();
    const p = ProfileEdit.parse(input);
    await admin().from("profiles").update({ ...p, hometown: p.hometown || null, company: p.company || null }).eq("id", v.id);
    revalidatePath("/you");
  });
}

/** DPDP right to erasure: deletes the auth user; every table cascades. Photos removed from storage. */
export async function deleteAccount(confirmText: string) {
  const res = await run(async () => {
    const v = await actionViewer({ onboarded: false });
    if (confirmText.trim().toUpperCase() !== "DELETE") throw new ActionError('Type DELETE to confirm.');
    if (v.is_evaluator) throw new ActionError("Evaluator demo accounts can't be deleted. Sign up a fresh account to try deletion.");
    const db = admin();
    const { data: photos } = await db.from("photos").select("path_original, path_blur").eq("user_id", v.id);
    const paths = (photos ?? []).flatMap((p) => [p.path_original, ...p.path_blur]);
    if (paths.length) await db.storage.from("photos").remove(paths);
    const { error } = await db.auth.admin.deleteUser(v.id);
    if (error) throw new ActionError("Couldn't delete your account. Contact the grievance officer.");
    const supabase = await createClient();
    await supabase.auth.signOut();
  });
  if (res.ok) redirect("/?deleted=1");
  return res;
}

// ---------------------------------------------------------------- waitlist (public)
const Waitlist = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  city: z.string().trim().min(2).max(40),
  gender: z.enum(["woman", "man", "nonbinary", "skip"]).optional(),
});

export async function joinWaitlist(_: unknown, formData: FormData) {
  return run(async () => {
    const h = await headers();
    await rateLimit(`waitlist:${(h.get("x-forwarded-for") ?? "local").split(",")[0]}`, 5, 3600);
    const w = Waitlist.safeParse(Object.fromEntries(formData));
    if (!w.success) throw new ActionError(w.error.issues[0].message);
    const { error } = await admin()
      .from("waitlist")
      .upsert({ email: w.data.email, city: w.data.city, gender: w.data.gender === "skip" ? null : w.data.gender ?? null }, { onConflict: "email" });
    if (error) throw new ActionError("Couldn't save that. Try again.");
    const { count } = await admin().from("waitlist").select("*", { count: "exact", head: true }).eq("city", w.data.city);
    return { city: w.data.city, position: count ?? 1 };
  });
}

// ---------------------------------------------------------------- demo controls (evaluators only)
async function evaluator() {
  const v = await actionViewer();
  if (!v.is_evaluator) throw new ActionError("Demo controls are only for evaluator accounts.");
  return v;
}

export async function demoNewBatch() {
  return run(async () => {
    const v = await evaluator();
    await regenerateBatch(v);
    revalidatePath("/today");
  });
}

export async function demoSkipWaits() {
  return run(async () => {
    const v = await evaluator();
    const { data } = await admin().from("bonds").select("id").or(`user_a.eq.${v.id},user_b.eq.${v.id}`).eq("status", "active");
    let n = 0;
    for (const b of data ?? []) if (await tickPersona(b.id, true)) n++;
    revalidatePath("/bonds", "layout");
    return n;
  });
}

export async function demoReset() {
  return run(async () => {
    const v = await evaluator();
    await resetEvaluator(admin(), (v.persona as { key: string }).key);
    revalidatePath("/", "layout");
  });
}

// ---------------------------------------------------------------- moderation
export async function resolveReport(reportId: string, outcome: "resolved" | "actioned") {
  return run(async () => {
    const v = await actionViewer();
    if (!v.is_admin) throw new ActionError("Admins only.");
    await admin()
      .from("reports")
      .update({ status: z.enum(["resolved", "actioned"]).parse(outcome), resolved_at: new Date().toISOString() })
      .eq("id", z.string().uuid().parse(reportId));
    revalidatePath("/admin");
  });
}
