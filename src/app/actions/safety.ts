"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { admin } from "@/lib/supabase/admin";
import { ActionError, actionViewer, rateLimit, run } from "@/lib/auth";
import { track } from "@/lib/events";

const uuid = z.string().uuid();

// Not exported: a "use server" module may only export async functions.
const REPORT_REASONS = [
  { id: "fake", label: "Fake or impersonating someone" },
  { id: "harassment", label: "Harassment or hateful messages" },
  { id: "inappropriate", label: "Inappropriate photos or content" },
  { id: "money", label: "Asked for money or contact details" },
  { id: "underage", label: "Might be under 18" },
  { id: "unsafe", label: "Made me feel unsafe" },
  { id: "other", label: "Something else" },
] as const;

export async function report(targetId: string, reason: string, detail?: string, bondId?: string) {
  return run(async () => {
    const v = await actionViewer();
    await rateLimit(`report:${v.id}`, 10, 3600);
    const r = z.enum(REPORT_REASONS.map((x) => x.id) as [string, ...string[]]).parse(reason);
    const target = uuid.parse(targetId);
    if (target === v.id) throw new ActionError("You can't report yourself.");
    await admin().from("reports").insert({
      reporter_id: v.id,
      target_id: target,
      bond_id: bondId ? uuid.parse(bondId) : null,
      reason: r,
      detail: z.string().max(500).optional().parse(detail) ?? null,
    });
    await track(v.id, "report", { reason: r });
  });
}

/** Block is immediate and mutual: neither person sees the other again, and open bonds close. */
export async function block(targetId: string) {
  return run(async () => {
    const v = await actionViewer();
    const target = uuid.parse(targetId);
    if (target === v.id) throw new ActionError("You can't block yourself.");
    await admin().from("blocks").upsert({ blocker_id: v.id, blocked_id: target }, { onConflict: "blocker_id,blocked_id" });
    await admin()
      .from("bonds")
      .update({ status: "dissolved", dissolved_by: v.id, dissolve_reason: "blocked" })
      .or(`and(user_a.eq.${v.id},user_b.eq.${target}),and(user_a.eq.${target},user_b.eq.${v.id})`)
      .in("status", ["invited", "active", "revealed"]);
    revalidatePath("/bonds");
    revalidatePath("/today");
  });
}

export async function unblock(targetId: string) {
  return run(async () => {
    const v = await actionViewer();
    await admin().from("blocks").delete().eq("blocker_id", v.id).eq("blocked_id", uuid.parse(targetId));
    revalidatePath("/you/settings");
  });
}
