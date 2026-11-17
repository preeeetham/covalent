import "server-only";
import { admin } from "@/lib/supabase/admin";
import { ActionError, type Profile } from "@/lib/errors";
import { track } from "@/lib/events";
import { createPayment, PRICES, provider } from "@/lib/payments";
import { getBondForViewer, partnerOf } from "@/lib/data/bonds";
import { loadPublicProfiles } from "@/lib/data/profile";
import { clamp } from "@/lib/utils";
import { formatIST } from "@/lib/time";
import type { Database } from "@/lib/supabase/database.types";

export type DatePlan = Database["public"]["Tables"]["date_plans"]["Row"];
export type Venue = Database["public"]["Tables"]["venues"]["Row"];
const LIVE_PLAN = ["proposed", "accepted", "confirmed"];

export async function venuesFor(city: string | null) {
  const { data } = await admin().from("venues").select("*").eq("city", city ?? "Bengaluru").order("partner", { ascending: false });
  return data ?? [];
}

async function systemNote(bondId: string, senderId: string, body: string) {
  await admin().from("messages").insert({ bond_id: bondId, sender_id: senderId, kind: "system", body });
}

async function isDemo(id: string) {
  const { data } = await admin().from("profiles").select("is_demo, first_name").eq("id", id).single();
  return data;
}

function validateStart(startsAt: string) {
  const t = new Date(startsAt);
  if (Number.isNaN(t.getTime())) throw new ActionError("Pick a valid date and time.");
  if (t.getTime() < Date.now() + 60 * 60_000) throw new ActionError("Pick a time at least an hour from now.");
  if (t.getTime() > Date.now() + 30 * 86_400_000) throw new ActionError("Pick a date within the next 30 days.");
}

export async function proposeDate(viewer: Profile, bondId: string, venueId: string, startsAt: string, note?: string) {
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond || bond.status !== "revealed") throw new ActionError("You can plan a date after the reveal.");
  validateStart(startsAt);
  const { data: live } = await admin().from("date_plans").select("id").eq("bond_id", bondId).in("status", LIVE_PLAN);
  if (live?.length) throw new ActionError("There's already a plan in progress. Respond to it or cancel it first.");
  const { data: venue } = await admin().from("venues").select("id, name").eq("id", venueId).single();
  if (!venue) throw new ActionError("Pick a venue from the list.");

  const { data: plan, error } = await admin()
    .from("date_plans")
    .insert({ bond_id: bondId, proposed_by: viewer.id, venue_id: venueId, starts_at: new Date(startsAt).toISOString(), note: note?.slice(0, 140) ?? null })
    .select("*")
    .single();
  if (error || !plan) throw new ActionError("Couldn't save the plan.");
  await systemNote(bondId, viewer.id, `Date proposed · ${venue.name}, ${formatIST(plan.starts_at)}`);
  await track(viewer.id, "date_proposed", { bond: bondId });

  // Demo partners accept and commit straight away so evaluators can see the whole flow.
  const partnerId = partnerOf(bond, viewer.id);
  const partner = await isDemo(partnerId);
  if (partner?.is_demo) {
    const partnerIsA = bond.user_a === partnerId;
    await admin().from("date_plans").update({ status: "accepted", ...(partnerIsA ? { paid_a: true } : { paid_b: true }), updated_at: new Date().toISOString() }).eq("id", plan.id);
    await systemNote(bondId, partnerId, `${partner.first_name} accepted and committed ₹${PRICES.commitment}. Your turn to confirm.`);
  }
  return plan.id;
}

async function planForViewer(viewer: Profile, planId: string) {
  const { data: plan } = await admin().from("date_plans").select("*").eq("id", planId).maybeSingle();
  if (!plan) throw new ActionError("That plan doesn't exist.");
  const bond = await getBondForViewer(viewer, plan.bond_id);
  if (!bond) throw new ActionError("That plan doesn't exist.");
  return { plan, bond };
}

export async function respondDate(viewer: Profile, planId: string, accept: boolean) {
  const { plan, bond } = await planForViewer(viewer, planId);
  if (plan.status !== "proposed" || plan.proposed_by === viewer.id) throw new ActionError("Nothing to respond to here.");
  await admin().from("date_plans").update({ status: accept ? "accepted" : "declined", updated_at: new Date().toISOString() }).eq("id", planId);
  await systemNote(bond.id, viewer.id, accept ? "Plan accepted · Commit ₹99 each to lock it in." : "Plan declined · Suggest another time?");
}

export async function counterDate(viewer: Profile, planId: string, venueId: string, startsAt: string) {
  const { plan, bond } = await planForViewer(viewer, planId);
  if (plan.status !== "proposed" || plan.proposed_by === viewer.id) throw new ActionError("You can only counter their proposal.");
  await admin().from("date_plans").update({ status: "countered", updated_at: new Date().toISOString() }).eq("id", planId);
  return proposeDate(viewer, bond.id, venueId, startsAt, "Counter-proposal");
}

export async function cancelDate(viewer: Profile, planId: string) {
  const { plan, bond } = await planForViewer(viewer, planId);
  if (!LIVE_PLAN.includes(plan.status)) throw new ActionError("This plan is already closed.");
  await admin().from("date_plans").update({ status: "cancelled", updated_at: new Date().toISOString() }).eq("id", planId);
  // Mock refunds: any commitment paid on this plan is refunded on cancellation.
  await admin().from("payments").update({ status: "refunded" }).eq("date_plan_id", planId).eq("status", "paid");
  await systemNote(bond.id, viewer.id, "Plan cancelled · Commitments refunded.");
}

export async function startCommitment(viewer: Profile, planId: string) {
  const { plan, bond } = await planForViewer(viewer, planId);
  if (plan.status !== "accepted") throw new ActionError("Both of you need to agree on the plan first.");
  const iAmA = bond.user_a === viewer.id;
  if (iAmA ? plan.paid_a : plan.paid_b) throw new ActionError("You've already committed.");
  return createPayment({
    userId: viewer.id,
    kind: "commitment",
    amountInr: PRICES.commitment,
    datePlanId: planId,
    description: "First-date commitment · becomes ₹99 off at the venue",
  });
}

export async function startCatalystPurchase(viewer: Profile, pack: 1 | 3) {
  return createPayment({
    userId: viewer.id,
    kind: "catalyst",
    amountInr: pack === 3 ? PRICES.catalyst3 : PRICES.catalyst1,
    meta: { qty: pack },
    description: pack === 3 ? "3 catalysts" : "1 catalyst",
  });
}

/** Called after the checkout sheet. Verifies with the provider, then applies the effect. */
export async function completePayment(viewer: Profile, paymentId: string, outcome: "success" | "failure") {
  const db = admin();
  const { data: pay } = await db.from("payments").select("*").eq("id", paymentId).eq("user_id", viewer.id).maybeSingle();
  if (!pay) throw new ActionError("Payment not found.");
  if (pay.status !== "created") throw new ActionError("This payment was already processed.");
  const ok = await provider().verify({ paymentId, ref: pay.ref ?? "", outcome });
  if (!ok) {
    await db.from("payments").update({ status: "failed" }).eq("id", paymentId);
    throw new ActionError("Payment failed. No money was taken. Try again?");
  }
  await db.from("payments").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", paymentId);
  await track(viewer.id, "payment", { kind: pay.kind, amount: pay.amount_inr });

  if (pay.kind === "catalyst") {
    const qty = Number((pay.meta as { qty?: number }).qty ?? 1);
    await db.from("profiles").update({ catalysts: viewer.catalysts + qty }).eq("id", viewer.id);
    return { confirmed: false };
  }

  const { plan, bond } = await planForViewer(viewer, pay.date_plan_id!);
  const iAmA = bond.user_a === viewer.id;
  const paid_a = iAmA ? true : plan.paid_a;
  const paid_b = iAmA ? plan.paid_b : true;
  const confirmed = paid_a && paid_b && plan.status === "accepted";
  await db.from("date_plans").update({ paid_a, paid_b, status: confirmed ? "confirmed" : plan.status, updated_at: new Date().toISOString() }).eq("id", plan.id);
  if (confirmed) {
    await systemNote(bond.id, viewer.id, "Date confirmed · See you there. Share the plan with a friend for safety.");
    await Promise.all([track(bond.user_a, "date_confirmed", { plan: plan.id }), track(bond.user_b, "date_confirmed", { plan: plan.id })]);
  } else {
    await systemNote(bond.id, viewer.id, "Committed ₹99 · Waiting for the other half.");
  }
  return { confirmed };
}

export async function submitFeedback(
  viewer: Profile,
  planId: string,
  f: { showed_up: boolean; felt_safe: boolean; meet_again: boolean; note?: string },
) {
  const { plan, bond } = await planForViewer(viewer, planId);
  if (plan.status !== "confirmed" && plan.status !== "completed") throw new ActionError("Feedback opens after a confirmed date.");
  if (new Date(plan.starts_at) > new Date()) throw new ActionError("Feedback opens after the date time.");
  const db = admin();
  const { error } = await db.from("date_feedback").insert({ date_plan_id: planId, user_id: viewer.id, ...f, note: f.note?.slice(0, 300) ?? null });
  if (error) throw new ActionError("You've already left feedback for this date.");

  // Reliability: showing up builds it, no-shows cost more than shows earn.
  const partnerId = partnerOf(bond, viewer.id);
  const { data: partner } = await db.from("profiles").select("reliability").eq("id", partnerId).single();
  if (partner) await db.from("profiles").update({ reliability: clamp(partner.reliability + (f.showed_up ? 5 : -15), 0, 100) }).eq("id", partnerId);

  if (!f.felt_safe) {
    await db.from("reports").insert({ reporter_id: viewer.id, target_id: partnerId, bond_id: bond.id, reason: "felt-unsafe-on-date", detail: f.note ?? null, source: "feedback" });
    await track(viewer.id, "report", { source: "feedback" });
  }
  // Mock settlement: a no-show forfeits their commitment, everyone else's turns into venue credit.
  const { count } = await db.from("date_feedback").select("*", { count: "exact", head: true }).eq("date_plan_id", planId);
  const partnerDemo = (await isDemo(partnerId))?.is_demo;
  if ((count ?? 0) >= 2 || partnerDemo) await db.from("date_plans").update({ status: "completed" }).eq("id", planId);
  await track(viewer.id, "feedback_given", { plan: planId, showed_up: f.showed_up, felt_safe: f.felt_safe });
}

export type DateRow = {
  plan: DatePlan;
  venue: Venue | null;
  partner: { id: string; first_name: string; photoId: string | null };
  bondId: string;
  iAmA: boolean;
  myFeedback: boolean;
};

export async function listDates(viewer: Profile): Promise<DateRow[]> {
  const db = admin();
  const { data: bonds } = await db.from("bonds").select("id, user_a, user_b").or(`user_a.eq.${viewer.id},user_b.eq.${viewer.id}`);
  const bondIds = (bonds ?? []).map((b) => b.id);
  if (!bondIds.length) return [];
  const { data: plans } = await db.from("date_plans").select("*").in("bond_id", bondIds).order("starts_at", { ascending: false });
  const venueIds = [...new Set((plans ?? []).map((p) => p.venue_id))];
  const [{ data: venues }, { data: fb }] = await Promise.all([
    db.from("venues").select("*").in("id", venueIds.length ? venueIds : ["00000000-0000-0000-0000-000000000000"]),
    db.from("date_feedback").select("date_plan_id").eq("user_id", viewer.id),
  ]);
  const partners = await loadPublicProfiles((bonds ?? []).map((b) => (b.user_a === viewer.id ? b.user_b : b.user_a)));
  return (plans ?? [])
    .filter((p) => !["countered"].includes(p.status))
    .map((p) => {
      const b = bonds!.find((x) => x.id === p.bond_id)!;
      const pid = b.user_a === viewer.id ? b.user_b : b.user_a;
      const pp = partners.get(pid);
      return {
        plan: p,
        venue: venues?.find((v) => v.id === p.venue_id) ?? null,
        partner: { id: pid, first_name: pp?.first_name ?? "Your date", photoId: pp?.photoIds[0] ?? null },
        bondId: b.id,
        iAmA: b.user_a === viewer.id,
        myFeedback: !!fb?.some((f) => f.date_plan_id === p.id),
      };
    });
}

export async function latestPlanForBond(bondId: string) {
  const { data } = await admin().from("date_plans").select("*").eq("bond_id", bondId).neq("status", "countered").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  const { data: venue } = await admin().from("venues").select("*").eq("id", data.venue_id).single();
  return { plan: data, venue };
}

/** Public trusted-contact view. Only first names, venue and time. No auth required. */
export async function getSharedPlan(token: string) {
  if (!/^[a-f0-9]{24}$/.test(token)) return null;
  const db = admin();
  const { data: plan } = await db.from("date_plans").select("*").eq("share_token", token).maybeSingle();
  if (!plan || !["confirmed", "completed"].includes(plan.status)) return null;
  const [{ data: venue }, { data: bond }] = await Promise.all([
    db.from("venues").select("*").eq("id", plan.venue_id).single(),
    db.from("bonds").select("user_a, user_b").eq("id", plan.bond_id).single(),
  ]);
  const { data: people } = await db.from("profiles").select("id, first_name").in("id", [bond!.user_a, bond!.user_b]);
  return { plan, venue, names: (people ?? []).map((p) => p.first_name ?? "Someone") };
}

// ---------------------------------------------------------------- catalysts
export async function useCatalyst(viewer: Profile, kind: "slot" | "extend" | "pick", bondId?: string) {
  if (viewer.catalysts < 1) throw new ActionError("You're out of catalysts.");
  const db = admin();
  if (kind === "slot") {
    if (viewer.extra_slot_until && new Date(viewer.extra_slot_until) > new Date()) throw new ActionError("Your extra slot is already active.");
    await db.from("profiles").update({ extra_slot_until: new Date(Date.now() + 7 * 86_400_000).toISOString() }).eq("id", viewer.id);
  } else if (kind === "extend") {
    const bond = bondId ? await getBondForViewer(viewer, bondId) : null;
    if (!bond || !["active", "invited"].includes(bond.status)) throw new ActionError("Pick an active bond to extend.");
    await db.from("bonds").update({ expires_at: new Date(new Date(bond.expires_at).getTime() + 48 * 3600_000).toISOString() }).eq("id", bond.id);
  } else {
    const { addExtraPick } = await import("@/lib/data/batch");
    const added = await addExtraPick(viewer);
    if (!added) throw new ActionError("Nobody new to add right now. Your catalyst wasn't used.");
  }
  await db.from("profiles").update({ catalysts: viewer.catalysts - 1 }).eq("id", viewer.id);
}
