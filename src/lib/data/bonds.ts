import "server-only";
import { admin } from "@/lib/supabase/admin";
import { ActionError, type Profile } from "@/lib/errors";
import { track } from "@/lib/events";
import { loadPublicProfiles, blockedIds, type PublicProfile } from "@/lib/data/profile";
import {
  chemistryDelta, drawRound1, drawRound2, drawRound3, drawRound4, initialChemistry,
  isMyMove, r1Overlap, r3Accuracy, r4Overlap, roundView, type R1, type R2, type R3, type R4, type Resp,
} from "@/lib/rounds/logic";
import { PERSONA_BY_KEY, personaR1, personaR2Ask, personaR2Answer, personaR3, personaR4, personaReaction } from "@/lib/demo/persona-answers";
import { roundQuip } from "@/lib/ai";
import { clamp } from "@/lib/utils";
import type { Database, Json } from "@/lib/supabase/database.types";

export type Bond = Database["public"]["Tables"]["bonds"]["Row"];
export const BASE_SLOTS = 3;
export const BOND_TTL_HOURS = 72;
const OPEN_STATUSES = ["invited", "active", "revealed"];

export function slotLimit(p: Pick<Profile, "extra_slot_until">) {
  return BASE_SLOTS + (p.extra_slot_until && new Date(p.extra_slot_until) > new Date() ? 1 : 0);
}

export const partnerOf = (b: Pick<Bond, "user_a" | "user_b">, me: string) => (b.user_a === me ? b.user_b : b.user_a);

async function openBondCount(userId: string) {
  const { data } = await admin()
    .from("bonds")
    .select("id, status, user_a")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .in("status", OPEN_STATUSES);
  // Invites you've received don't use a slot until you accept them.
  return (data ?? []).filter((b) => !(b.status === "invited" && b.user_a !== userId)).length;
}

export async function slotsUsed(userId: string) {
  return openBondCount(userId);
}

const freshExpiry = () => new Date(Date.now() + BOND_TTL_HOURS * 3600_000).toISOString();

/** Lazily expire bonds/invites with no move for 72h. Evaluator-only bonds are exempt so the demo stays playable. */
export async function expireStale(userId: string) {
  const db = admin();
  const { data } = await db
    .from("bonds")
    .select("id, user_a, user_b, expires_at, status")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .in("status", ["invited", "active"])
    .lt("expires_at", new Date().toISOString());
  if (!data?.length) return;
  const people = await db.from("profiles").select("id, is_evaluator, is_demo").in("id", data.flatMap((b) => [b.user_a, b.user_b]));
  const exempt = new Set((people.data ?? []).filter((p) => p.is_evaluator || p.is_demo).map((p) => p.id));
  const toExpire = data.filter((b) => !(exempt.has(b.user_a) && exempt.has(b.user_b))).map((b) => b.id);
  if (toExpire.length) await db.from("bonds").update({ status: "expired" }).in("id", toExpire);
}

// ---------------------------------------------------------------- reactions & invites
export async function startReaction(viewer: Profile, batchItemId: string) {
  const db = admin();
  const { data: item } = await db.from("batch_items").select("*").eq("id", batchItemId).eq("user_id", viewer.id).maybeSingle();
  if (!item) throw new ActionError("That person isn't in your batch.");
  if (item.status !== "pending") throw new ActionError("You've already decided on this one.");
  if ((await openBondCount(viewer.id)) >= slotLimit(viewer))
    throw new ActionError("All your bond slots are full. Finish or dissolve one first, or use a catalyst for an extra slot.");
  if ((await blockedIds(viewer.id)).has(item.candidate_id)) throw new ActionError("This person isn't available.");

  const { data: partner } = await db.from("profiles").select("id, is_demo, persona, deleted_at").eq("id", item.candidate_id).single();
  if (!partner || partner.deleted_at) throw new ActionError("This person isn't available any more.");

  const { data: existing } = await db
    .from("bonds")
    .select("id")
    .or(`and(user_a.eq.${viewer.id},user_b.eq.${partner.id}),and(user_a.eq.${partner.id},user_b.eq.${viewer.id})`)
    .maybeSingle();
  if (existing) throw new ActionError("You two already have history.");

  // Demo personas accept instantly; real people get an invite.
  const status = partner.is_demo ? "active" : "invited";
  const { data: bond, error } = await db
    .from("bonds")
    .insert({
      user_a: viewer.id,
      user_b: partner.id,
      status,
      match_score: item.score,
      reasons: item.reasons,
      why_text: item.why_text,
      chemistry: initialChemistry(item.score),
      expires_at: freshExpiry(),
    })
    .select("id")
    .single();
  if (error || !bond) throw new ActionError("Couldn't start the reaction. Try again.");
  await db.from("batch_items").update({ status: "reacted" }).eq("id", item.id);
  await track(viewer.id, "reaction_started", { bond: bond.id, demo: partner.is_demo });
  if (partner.is_demo) await track(partner.id, "invite_accepted", { bond: bond.id });
  return bond.id;
}

export async function passItem(viewer: Profile, batchItemId: string, reason?: string) {
  const { error } = await admin()
    .from("batch_items")
    .update({ status: "passed", pass_reason: reason?.slice(0, 40) ?? null })
    .eq("id", batchItemId)
    .eq("user_id", viewer.id)
    .eq("status", "pending");
  if (error) throw new ActionError("Couldn't update that. Try again.");
}

export async function respondInvite(viewer: Profile, bondId: string, accept: boolean) {
  const db = admin();
  const { data: bond } = await db.from("bonds").select("*").eq("id", bondId).eq("user_b", viewer.id).eq("status", "invited").maybeSingle();
  if (!bond) throw new ActionError("That invite is no longer open.");
  if (!accept) {
    await db.from("bonds").update({ status: "declined" }).eq("id", bondId);
    return;
  }
  if ((await openBondCount(viewer.id)) >= slotLimit(viewer)) throw new ActionError("Your bond slots are full. Dissolve one to accept.");
  await db.from("bonds").update({ status: "active", last_move_at: new Date().toISOString(), expires_at: freshExpiry() }).eq("id", bondId);
  await track(viewer.id, "invite_accepted", { bond: bondId });
}

export async function getInvites(viewer: Profile) {
  const { data } = await admin()
    .from("bonds")
    .select("id, user_a, why_text, created_at")
    .eq("user_b", viewer.id)
    .eq("status", "invited")
    .order("created_at", { ascending: false });
  const people = await loadPublicProfiles((data ?? []).map((b) => b.user_a));
  return (data ?? []).filter((b) => people.has(b.user_a)).map((b) => ({ ...b, person: people.get(b.user_a)! }));
}

// ---------------------------------------------------------------- reading bonds
async function allResponses(bondIds: string[]): Promise<(Resp & { bond_id: string })[]> {
  if (!bondIds.length) return [];
  const { data } = await admin().from("round_responses").select("bond_id, user_id, round, payload, submitted_at").in("bond_id", bondIds);
  return (data ?? []) as (Resp & { bond_id: string })[];
}

export type BondSummary = {
  bond: Bond;
  partner: PublicProfile;
  myMove: boolean;
};

export async function listBonds(viewer: Profile): Promise<{ open: BondSummary[]; past: BondSummary[] }> {
  await expireStale(viewer.id);
  const { data } = await admin()
    .from("bonds")
    .select("*")
    .or(`user_a.eq.${viewer.id},user_b.eq.${viewer.id}`)
    .order("last_move_at", { ascending: false });
  const bonds = (data ?? []).filter((b) => !(b.status === "invited" && b.user_b === viewer.id));
  const blocked = await blockedIds(viewer.id);
  const visible = bonds.filter((b) => !blocked.has(partnerOf(b, viewer.id)));
  const people = await loadPublicProfiles(visible.map((b) => partnerOf(b, viewer.id)));
  const responses = await allResponses(visible.filter((b) => b.status === "active").map((b) => b.id));
  const rows = visible
    .filter((b) => people.has(partnerOf(b, viewer.id)))
    .map((b) => ({
      bond: b,
      partner: people.get(partnerOf(b, viewer.id))!,
      myMove: isMyMove(b, viewer.id, responses.filter((r) => r.bond_id === b.id)),
    }));
  return {
    open: rows.filter((r) => OPEN_STATUSES.includes(r.bond.status)),
    past: rows.filter((r) => !OPEN_STATUSES.includes(r.bond.status)),
  };
}

export async function getBondForViewer(viewer: Pick<Profile, "id">, bondId: string) {
  const { data: bond } = await admin().from("bonds").select("*").eq("id", bondId).maybeSingle();
  if (!bond || (bond.user_a !== viewer.id && bond.user_b !== viewer.id)) return null;
  const partnerId = partnerOf(bond, viewer.id);
  if ((await blockedIds(viewer.id)).has(partnerId)) return null;
  return bond;
}

/**
 * Everything the bond screens need, with the reciprocity rule enforced HERE:
 * the partner's answers for a round are only included once both have submitted
 * (round 2: their chosen question becomes visible once you've chosen yours).
 */
export async function getBondDetail(viewer: Profile, bondId: string) {
  await expireStale(viewer.id);
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond) return null;
  const partnerId = partnerOf(bond, viewer.id);
  const [partner, responses, messages] = await Promise.all([
    loadPublicProfiles([partnerId]).then((m) => m.get(partnerId) ?? null),
    allResponses([bond.id]),
    admin().from("messages").select("*").eq("bond_id", bond.id).order("created_at").limit(300),
  ]);
  if (!partner) return null;

  const gated = responses.map((r) => {
    if (r.user_id === viewer.id) return r;
    const mine = responses.find((m) => m.round === r.round && m.user_id === viewer.id);
    const bothSubmitted = !!mine?.submitted_at && !!r.submitted_at;
    if (bothSubmitted) return r;
    if (r.round === 2 && (mine?.payload as R2 | undefined)?.asked != null) {
      return { ...r, payload: { asked: (r.payload as R2).asked }, submitted_at: r.submitted_at ? "hidden" : null };
    }
    return { ...r, payload: null, submitted_at: r.submitted_at ? "hidden" : null };
  });

  return {
    bond,
    partner,
    iAmA: bond.user_a === viewer.id,
    responses: gated,
    messages: messages.data ?? [],
    myMove: isMyMove(bond, viewer.id, responses),
    rounds: [1, 2, 3, 4].map((n) => ({ n, view: roundView(n, bond.round, viewer.id, responses) })),
  };
}

// ---------------------------------------------------------------- playing rounds
async function upsertResponse(bondId: string, round: number, userId: string, payload: unknown, submitted: boolean) {
  const { error } = await admin()
    .from("round_responses")
    .upsert(
      { bond_id: bondId, round, user_id: userId, payload: payload as NonNullable<Json>, submitted_at: submitted ? new Date().toISOString() : null },
      { onConflict: "bond_id,round,user_id" },
    );
  if (error) throw new ActionError("Couldn't save your answer.");
}

async function touchBond(bondId: string, extra: Partial<Bond> = {}) {
  await admin().from("bonds").update({ last_move_at: new Date().toISOString(), expires_at: freshExpiry(), ...extra }).eq("id", bondId);
}

async function partnerIsDemo(bond: Bond, me: string) {
  const { data } = await admin().from("profiles").select("is_demo").eq("id", partnerOf(bond, me)).single();
  return !!data?.is_demo;
}

/** Schedule the demo partner's next move 3–8 seconds from now. */
async function schedulePersona(bond: Bond, me: string) {
  if (!(await partnerIsDemo(bond, me))) return;
  const due = new Date(Date.now() + 3000 + Math.random() * 5000).toISOString();
  await admin().from("bonds").update({ persona_due_at: due }).eq("id", bond.id);
}

export async function submitRoundStep(viewer: Profile, bondId: string, round: number, step: string, payload: unknown) {
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond || bond.status !== "active") throw new ActionError("This bond isn't active.");
  const responses = await allResponses([bondId]);
  const view = roundView(round, bond.round, viewer.id, responses);
  if (view.state !== "play") throw new ActionError("It isn't your move in this round.");

  if (round === 2) {
    const mine = (responses.find((r) => r.round === 2 && r.user_id === viewer.id)?.payload ?? {}) as R2;
    if (view.step === "ask" && step === "ask") {
      await upsertResponse(bondId, 2, viewer.id, { ...mine, ...(payload as object) }, false);
    } else if (view.step === "answer-question" && step === "answer") {
      await upsertResponse(bondId, 2, viewer.id, { ...mine, ...(payload as object) }, true);
    } else {
      throw new ActionError("That step isn't open yet.");
    }
  } else {
    await upsertResponse(bondId, round, viewer.id, payload, true);
  }

  await touchBond(bondId);
  await maybeCompleteRound(bondId, round);
  await schedulePersona(bond, viewer.id);
}

/** Adds an emoji + one-line reaction to the partner's Round 2 answer (after the reveal). */
export async function reactToAnswer(viewer: Profile, bondId: string, reaction: string, note: string) {
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond || bond.round < 2) throw new ActionError("Finish Round 2 first.");
  const { data: mine } = await admin().from("round_responses").select("payload").eq("bond_id", bondId).eq("round", 2).eq("user_id", viewer.id).single();
  await admin()
    .from("round_responses")
    .update({ payload: { ...(mine?.payload as object), reaction, reactionNote: note.slice(0, 120) } as NonNullable<Json> })
    .eq("bond_id", bondId)
    .eq("round", 2)
    .eq("user_id", viewer.id);
}

const QUIP_FALLBACKS: Record<number, (s: string) => string> = {
  1: (s) => s,
  2: () => "Two real answers. That's rarer than you'd think.",
  3: (s) => s,
  4: (s) => s,
};

/** When both have submitted round n: advance the bond, add chemistry, post a system note. */
async function maybeCompleteRound(bondId: string, round: number) {
  const db = admin();
  const { data: bond } = await db.from("bonds").select("*").eq("id", bondId).single();
  if (!bond || bond.round !== round - 1) return;
  const { data: rs } = await db.from("round_responses").select("user_id, payload, submitted_at").eq("bond_id", bondId).eq("round", round);
  const a = rs?.find((r) => r.user_id === bond.user_a);
  const b = rs?.find((r) => r.user_id === bond.user_b);
  if (!a?.submitted_at || !b?.submitted_at) return;

  // Optimistic concurrency: only the request that moves round n-1 → n wins.
  const delta = chemistryDelta(round, a.payload, b.payload);
  const { data: updated } = await db
    .from("bonds")
    .update({ round, chemistry: clamp(bond.chemistry + delta, 0, 100), last_move_at: new Date().toISOString(), expires_at: freshExpiry() })
    .eq("id", bondId)
    .eq("round", round - 1)
    .select("id");
  if (!updated?.length) return;

  let summary = "";
  if (round === 1) {
    const o = r1Overlap(a.payload as R1, b.payload as R1);
    summary = o >= 7 ? `You agree on ${o} of 8. Suspicious.` : o >= 5 ? `${o} of 8 in common. A promising start.` : o >= 3 ? `${o} of 8. Opposites make better stories.` : `Only ${o} of 8. You'll never run out of debates.`;
  } else if (round === 3) {
    const ab = r3Accuracy(a.payload as R3, b.payload as R3);
    const ba = r3Accuracy(b.payload as R3, a.payload as R3);
    summary = `You read each other ${ab}/5 and ${ba}/5. ${ab + ba >= 8 ? "Mind readers." : ab + ba >= 5 ? "Not bad for strangers." : "Plenty left to find out."}`;
  } else if (round === 4) {
    const o = r4Overlap(a.payload as R4, b.payload as R4);
    summary = o.ideas.length ? `You both picked the same date idea${o.ideas.length > 1 ? "s" : ""}${o.slotMatch ? ", and the same time slot" : ""}. Someone book it.` : "Different date ideas. Time to negotiate.";
  } else {
    summary = "Both answered.";
  }
  const quip = await roundQuip(round, summary, QUIP_FALLBACKS[round](summary));
  await db.from("messages").insert({ bond_id: bondId, sender_id: bond.user_a, kind: "system", body: `Round ${round} · ${quip}` });
  await Promise.all([
    track(bond.user_a, "round_completed", { bond: bondId, round }),
    track(bond.user_b, "round_completed", { bond: bondId, round }),
  ]);
}

// ---------------------------------------------------------------- reveal
export async function tapReveal(viewer: Profile, bondId: string) {
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond || bond.status !== "active" || bond.round < 4) throw new ActionError("Finish all four rounds first.");
  const iAmA = bond.user_a === viewer.id;
  await admin().from("bonds").update(iAmA ? { reveal_a: true } : { reveal_b: true }).eq("id", bondId);
  await maybeReveal(bondId);
  await schedulePersona(bond, viewer.id);
}

async function maybeReveal(bondId: string) {
  const db = admin();
  const { data: updated } = await db
    .from("bonds")
    .update({ status: "revealed", last_move_at: new Date().toISOString() })
    .eq("id", bondId)
    .eq("status", "active")
    .eq("reveal_a", true)
    .eq("reveal_b", true)
    .select("user_a, user_b");
  const b = updated?.[0];
  if (b) {
    await db.from("messages").insert({ bond_id: bondId, sender_id: b.user_a, kind: "system", body: "Revealed · You've seen each other now. Plan something real." });
    await Promise.all([track(b.user_a, "revealed", { bond: bondId }), track(b.user_b, "revealed", { bond: bondId })]);
  }
}

// ---------------------------------------------------------------- dissolve / nudge
export async function dissolveBond(viewer: Profile, bondId: string, reason?: string) {
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond || !OPEN_STATUSES.includes(bond.status)) throw new ActionError("This bond is already closed.");
  await admin()
    .from("bonds")
    .update({ status: "dissolved", dissolved_by: viewer.id, dissolve_reason: reason?.slice(0, 60) ?? null })
    .eq("id", bondId);
  await admin().from("date_plans").update({ status: "cancelled" }).eq("bond_id", bondId).in("status", ["proposed", "accepted", "confirmed"]);
  await track(viewer.id, "dissolved", { bond: bondId, reason: reason ?? null });
}

export async function nudge(viewer: Profile, bondId: string) {
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond || bond.status !== "active") throw new ActionError("You can only nudge an active bond.");
  if (bond.nudged_by === viewer.id) throw new ActionError("You've already nudged them once. The ball's in their court.");
  await admin().from("bonds").update({ nudged_by: viewer.id }).eq("id", bondId);
  await admin().from("messages").insert({ bond_id: bondId, sender_id: viewer.id, kind: "system", body: "Nudge · Your move is waiting. No pressure." });
}

// ---------------------------------------------------------------- demo persona engine
/**
 * Makes a demo persona take whatever move is pending in a bond. Called by the client
 * after the scheduled delay, by page loads, and by the "Skip partner wait" demo control.
 * Returns true if the persona did something.
 */
export async function tickPersona(bondId: string, force = false): Promise<boolean> {
  const db = admin();
  const { data: bond } = await db.from("bonds").select("*").eq("id", bondId).single();
  if (!bond || bond.status !== "active") return false;
  if (!force && bond.persona_due_at && new Date(bond.persona_due_at) > new Date()) return false;

  const people = await db.from("profiles").select("id, is_demo, persona").in("id", [bond.user_a, bond.user_b]);
  const persona = people.data?.find((p) => p.is_demo);
  const human = people.data?.find((p) => !p.is_demo);
  if (!persona || !human) return false;
  const p = PERSONA_BY_KEY[(persona.persona as { key?: string } | null)?.key ?? ""];
  if (!p) return false;

  const responses = await allResponses([bondId]);
  let acted = false;

  if (bond.round >= 4) {
    const personaIsA = bond.user_a === persona.id;
    const humanRevealed = personaIsA ? bond.reveal_b : bond.reveal_a;
    const personaRevealed = personaIsA ? bond.reveal_a : bond.reveal_b;
    if (humanRevealed && !personaRevealed) {
      await db.from("bonds").update(personaIsA ? { reveal_a: true } : { reveal_b: true }).eq("id", bondId);
      await maybeReveal(bondId);
      acted = true;
    }
  } else {
    const n = bond.round + 1;
    const humanResp = responses.find((r) => r.round === n && r.user_id === human.id);
    const personaResp = responses.find((r) => r.round === n && r.user_id === persona.id);
    // Personas move only after the human has moved in the current step.
    if (n === 1 && humanResp?.submitted_at && !personaResp) {
      await upsertResponse(bondId, 1, persona.id, personaR1(p, bondId, drawRound1(bondId)), true);
      acted = true;
    } else if (n === 2) {
      const hp = humanResp?.payload as R2 | undefined;
      // Once the human has picked a question for the persona, the persona picks one back
      // and answers the human's question in one go (its answer stays hidden until both submit).
      if (hp?.asked != null && !personaResp?.submitted_at) {
        const options = drawRound2(bondId);
        await upsertResponse(bondId, 2, persona.id, { asked: personaR2Ask(p, bondId, options), answer: personaR2Answer(p, options[hp.asked].id) }, true);
        acted = true;
      }
    } else if (n === 3 && humanResp?.submitted_at && !personaResp) {
      await upsertResponse(bondId, 3, persona.id, personaR3(p, bondId, drawRound3(bondId), (humanResp.payload as R3).self), true);
      acted = true;
    } else if (n === 4 && humanResp?.submitted_at && !personaResp) {
      await upsertResponse(bondId, 4, persona.id, personaR4(p, bondId, drawRound4(bondId), humanResp.payload as R4), true);
      acted = true;
    }
    if (acted) {
      await touchBond(bondId, { persona_due_at: null });
      await maybeCompleteRound(bondId, n);
      // Persona reacts to the human's Round 2 answer once it's revealed.
      if (n === 2) {
        const { data: after } = await db.from("bonds").select("round").eq("id", bondId).single();
        if (after && after.round >= 2) {
          const { data: pr } = await db.from("round_responses").select("payload").eq("bond_id", bondId).eq("round", 2).eq("user_id", persona.id).single();
          await db.from("round_responses").update({ payload: { ...(pr?.payload as object), ...personaReaction(p, bondId) } as NonNullable<Json> }).eq("bond_id", bondId).eq("round", 2).eq("user_id", persona.id);
        }
      }
    }
  }
  return acted;
}
