/**
 * Demo data engine. No Next.js imports: used by `npm run db:seed` (scripts/seed.ts)
 * and by the "Reset this account" demo control. Idempotent.
 */
import { randomUUID, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { avatarSvg } from "./avatar";
import type { Database, Json } from "@/lib/supabase/database.types";
import { PERSONAS, type Persona } from "@/content/personas";
import { EVALUATORS } from "@/content/evaluators";
import { VENUES, venueMapUrl, venueOffer } from "@/content/venues";
import { QUIZ } from "@/content/quiz";
import { archetypeFor } from "@/content/archetypes";
import { storeVariants } from "@/lib/photos/store";
import { scoreMatch, type MatchInput } from "@/lib/matching/score";
import { whyYouTwoTemplate } from "@/lib/matching/why";
import {
  chemistryDelta, drawRound1, drawRound2, drawRound3, drawRound4, initialChemistry,
  type R1, type R2, type R3, type R4,
} from "@/lib/rounds/logic";
import { personaQuiz, personaR1, personaR2Ask, personaR3, personaR4 } from "./persona-answers";
import { clamp } from "@/lib/utils";

type DB = SupabaseClient<Database>;

/** Fail loudly: a silent seed failure leaves evaluators with half-built scenarios. */
function must<T extends { error: { message: string } | null }>(res: T): T {
  if (res.error) throw new Error(`Seed insert failed: ${res.error.message}`);
  return res;
}
const DAY = 86_400_000;

const dobFor = (age: number) => {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - age);
  d.setUTCMonth(Math.abs(age * 37) % 12, 1 + (age * 11) % 27);
  return d.toISOString().slice(0, 10);
};

function avatarPng(p: Persona) {
  return Buffer.from(avatarSvg(p.key, p.gender, p.bg).toString());
}

function asMatchInput(id: string, p: Persona): MatchInput {
  return {
    id, gender: p.gender, interested_in: p.interested_in, city: p.city, age: p.age, hometown: p.hometown,
    intent: p.intent, quiz: personaQuiz(p), elements: p.elements, last_active_at: new Date().toISOString(),
    reliability: 60, is_demo: true,
  };
}

// ---------------------------------------------------------------- venues
export async function upsertVenues(db: DB) {
  const rows = VENUES.map((v) => ({ ...v, map_url: venueMapUrl(v), offer_text: venueOffer(v.partner) }));
  const { error } = await db.from("venues").upsert(rows, { onConflict: "slug" });
  if (error) throw error;
}

// ---------------------------------------------------------------- people
async function ensureAuthUser(db: DB, email: string, password: string) {
  const { data: existing } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) {
    await db.auth.admin.updateUserById(existing.id, { password });
    return existing.id;
  }
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (data?.user) return data.user.id;
  // Auth user exists without a profile (interrupted seed): find it.
  for (let page = 1; page < 50; page++) {
    const { data: list } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const found = list?.users.find((u) => u.email === email);
    if (found) {
      await db.auth.admin.updateUserById(found.id, { password });
      return found.id;
    }
    if (!list || list.users.length < 200) break;
  }
  throw error ?? new Error(`Could not create ${email}`);
}

export async function seedPerson(
  db: DB,
  p: Persona,
  opts: { email: string; password: string; isDemo: boolean; isEvaluator: boolean },
) {
  const id = await ensureAuthUser(db, opts.email, opts.password);
  const quiz = personaQuiz(p);
  const now = new Date().toISOString();
  const { error } = await db.from("profiles").upsert({
    id,
    email: opts.email,
    first_name: p.first_name,
    dob: dobFor(p.age),
    gender: p.gender,
    interested_in: p.interested_in,
    city: p.city,
    hometown: p.hometown,
    role: p.role,
    company: p.company,
    intent: p.intent,
    archetype: archetypeFor(quiz).id,
    verified: true,
    is_demo: opts.isDemo,
    is_evaluator: opts.isEvaluator,
    is_admin: opts.isEvaluator,
    onboarding_step: 7,
    onboarded_at: now,
    last_active_at: now,
    consent_terms_at: now,
    consent_privacy_at: now,
    persona: { key: p.key } as NonNullable<Json>,
    deleted_at: null,
  });
  if (error) throw error;

  await db.from("quiz_answers").upsert(QUIZ.map((q) => ({ user_id: id, question_id: q.id, value: quiz[q.id] })), { onConflict: "user_id,question_id" });
  await db.from("user_elements").delete().eq("user_id", id);
  await db.from("user_elements").insert(p.elements.map((element_id) => ({ user_id: id, element_id })));
  await db.from("user_prompts").delete().eq("user_id", id);
  await db.from("user_prompts").insert(p.prompts.map(([prompt_id, answer], i) => ({ user_id: id, prompt_id, answer, position: i })));

  // Demo and evaluator accounts always get a freshly rendered avatar, so avatar changes
  // reach existing data on re-seed. (Real users' uploads are never touched.)
  const { data: old } = await db.from("photos").select("id, path_original, path_blur").eq("user_id", id);
  if (old?.length) {
    await db.storage.from("photos").remove(old.flatMap((o) => [o.path_original, ...o.path_blur]));
    await db.from("photos").delete().in("id", old.map((o) => o.id));
  }
  await storeVariants(db, id, avatarPng(p), 0);
  return id;
}

export async function seedPersonas(db: DB, log: (s: string) => void = () => {}) {
  const ids: Record<string, string> = {};
  for (const p of PERSONAS) {
    ids[p.key] = await seedPerson(db, p, {
      email: `${p.key}@personas.covalent.test`,
      password: randomBytes(18).toString("base64url"), // personas never log in
      isDemo: true,
      isEvaluator: false,
    });
    log(`  persona ${p.first_name} (${p.city})`);
  }
  return ids;
}

export async function seedEvaluators(db: DB, password: string, log: (s: string) => void = () => {}) {
  const ids: Record<string, string> = {};
  for (const e of EVALUATORS) {
    ids[e.key] = await seedPerson(db, e, { email: e.email, password, isDemo: false, isEvaluator: true });
    log(`  evaluator ${e.first_name} <${e.email}>`);
  }
  return ids;
}

// ---------------------------------------------------------------- bonds with history
type BuildBond = {
  a: { id: string; spec: Persona };
  b: { id: string; spec: Persona };
  roundsDone: number;
  revealed?: boolean;
  chat?: ["a" | "b", string][];
  startedHoursAgo?: number;
};

const ROUND_NOTES: Record<number, string> = {
  1: "Round 1 · A promising start. You agree on more than you'd think.",
  2: "Round 2 · Two real answers. That's rarer than you'd think.",
  3: "Round 3 · Not bad for strangers.",
  4: "Round 4 · You both picked the same date idea. Someone book it.",
};

export async function buildBond(db: DB, o: BuildBond) {
  const id = randomUUID();
  const score = scoreMatch(asMatchInput(o.a.id, o.a.spec), asMatchInput(o.b.id, o.b.spec));
  let chemistry = initialChemistry(score.score);
  const responses: { round: number; user_id: string; payload: unknown }[] = [];

  if (o.roundsDone >= 1) {
    const pairs = drawRound1(id);
    const ra = personaR1(o.a.spec, id, pairs) as R1;
    const rb = personaR1(o.b.spec, id, pairs) as R1;
    responses.push({ round: 1, user_id: o.a.id, payload: ra }, { round: 1, user_id: o.b.id, payload: rb });
    chemistry += chemistryDelta(1, ra, rb);
  }
  if (o.roundsDone >= 2) {
    const opts = drawRound2(id);
    const askA = personaR2Ask(o.a.spec, id, opts);
    const askB = (personaR2Ask(o.b.spec, id, opts) + 1) % opts.length;
    const ra: R2 = { asked: askA, answer: o.a.spec.deep[opts[askB].category] };
    const rb: R2 = { asked: askB, answer: o.b.spec.deep[opts[askA].category] };
    responses.push({ round: 2, user_id: o.a.id, payload: ra }, { round: 2, user_id: o.b.id, payload: rb });
    chemistry += chemistryDelta(2, ra, rb);
  }
  if (o.roundsDone >= 3) {
    const st = drawRound3(id);
    const selfA = personaR3(o.a.spec, id, st).self;
    const selfB = personaR3(o.b.spec, id, st).self;
    const ra: R3 = { self: selfA, guess: personaR3(o.a.spec, id, st, selfB).guess };
    const rb: R3 = { self: selfB, guess: personaR3(o.b.spec, id, st, selfA).guess };
    responses.push({ round: 3, user_id: o.a.id, payload: ra }, { round: 3, user_id: o.b.id, payload: rb });
    chemistry += chemistryDelta(3, ra, rb);
  }
  if (o.roundsDone >= 4) {
    const ideas = drawRound4(id);
    const ra = personaR4(o.a.spec, id, ideas) as R4;
    const rb = personaR4(o.b.spec, id, ideas, ra) as R4;
    responses.push({ round: 4, user_id: o.a.id, payload: ra }, { round: 4, user_id: o.b.id, payload: rb });
    chemistry += chemistryDelta(4, ra, rb);
  }

  const started = Date.now() - (o.startedHoursAgo ?? 30) * 3600_000;
  const { error } = await db.from("bonds").insert({
    id,
    user_a: o.a.id,
    user_b: o.b.id,
    status: o.revealed ? "revealed" : "active",
    round: o.roundsDone,
    chemistry: clamp(chemistry, 0, 100),
    match_score: score.score,
    reasons: score.reasons as unknown as NonNullable<Json>,
    why_text: whyYouTwoTemplate(score.reasons, o.b.spec.first_name),
    reveal_a: !!o.revealed,
    reveal_b: !!o.revealed,
    created_at: new Date(started).toISOString(),
    last_move_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
    expires_at: new Date(Date.now() + 70 * 3600_000).toISOString(),
  });
  if (error) throw error;

  const step = (Date.now() - started) / (o.roundsDone + (o.chat?.length ?? 0) + 2);
  let t = started + step;
  if (responses.length)
    must(await db.from("round_responses").insert(
      responses.map((r) => ({ bond_id: id, round: r.round, user_id: r.user_id, payload: r.payload as NonNullable<Json>, submitted_at: new Date(t).toISOString() })),
    ));

  const msgs: Database["public"]["Tables"]["messages"]["Insert"][] = [];
  const chat = [...(o.chat ?? [])];
  for (let r = 1; r <= o.roundsDone; r++) {
    msgs.push({ bond_id: id, sender_id: o.a.id, kind: "system", body: ROUND_NOTES[r], created_at: new Date((t += step / 2)).toISOString() });
    // Interleave chat after round 1 (chat opens then).
    const take = r === o.roundsDone ? chat.length : Math.ceil(chat.length / (o.roundsDone - r + 1));
    for (const [who, body] of chat.splice(0, take))
      msgs.push({ bond_id: id, sender_id: who === "a" ? o.a.id : o.b.id, kind: "text", body, created_at: new Date((t += step / 3)).toISOString() });
  }
  if (o.revealed) msgs.push({ bond_id: id, sender_id: o.a.id, kind: "system", body: "Revealed · You've seen each other now. Plan something real.", created_at: new Date((t += step / 3)).toISOString() });
  if (msgs.length) must(await db.from("messages").insert(msgs));

  const events: Database["public"]["Tables"]["events"]["Insert"][] = [{ user_id: o.a.id, name: "reaction_started", props: { bond: id, seeded: true } }];
  for (let r = 1; r <= o.roundsDone; r++) for (const u of [o.a.id, o.b.id]) events.push({ user_id: u, name: "round_completed", props: { bond: id, round: r, seeded: true } });
  if (o.revealed) for (const u of [o.a.id, o.b.id]) events.push({ user_id: u, name: "revealed", props: { bond: id, seeded: true } });
  must(await db.from("events").insert(events));
  return id;
}

async function venueId(db: DB, slug: string) {
  const { data } = await db.from("venues").select("id").eq("slug", slug).single();
  return data!.id;
}

async function seedConfirmedDate(db: DB, bondId: string, a: string, b: string, slug: string, startsAt: Date) {
  const { data: plan, error } = await db
    .from("date_plans")
    .insert({ bond_id: bondId, proposed_by: a, venue_id: await venueId(db, slug), starts_at: startsAt.toISOString(), status: "confirmed", paid_a: true, paid_b: true })
    .select("id")
    .single();
  if (error) throw error;
  const paidAt = new Date(Date.now() - DAY).toISOString();
  await db.from("payments").insert([
    { user_id: a, kind: "commitment", amount_inr: 99, provider: "mock", status: "paid", ref: `mock_seed_${plan.id.slice(0, 6)}a`, date_plan_id: plan.id, paid_at: paidAt },
    { user_id: b, kind: "commitment", amount_inr: 99, provider: "mock", status: "paid", ref: `mock_seed_${plan.id.slice(0, 6)}b`, date_plan_id: plan.id, paid_at: paidAt },
  ]);
  await db.from("messages").insert({ bond_id: bondId, sender_id: a, kind: "system", body: "Date confirmed · See you there. Share the plan with a friend for safety." });
  await db.from("events").insert([
    { user_id: a, name: "date_proposed", props: { seeded: true } },
    { user_id: a, name: "date_confirmed", props: { seeded: true } },
    { user_id: b, name: "date_confirmed", props: { seeded: true } },
  ]);
  return plan.id;
}

// ---------------------------------------------------------------- evaluator scenarios
async function personaIds(db: DB) {
  const { data } = await db.from("profiles").select("id, persona").eq("is_demo", true);
  return Object.fromEntries((data ?? []).map((p) => [(p.persona as { key: string }).key, p.id])) as Record<string, string>;
}

async function evaluatorIds(db: DB) {
  const { data } = await db.from("profiles").select("id, persona").eq("is_evaluator", true);
  return Object.fromEntries((data ?? []).map((p) => [(p.persona as { key: string }).key, p.id])) as Record<string, string>;
}

const spec = (key: string) => [...PERSONAS, ...EVALUATORS].find((p) => p.key === key)!;

async function wipe(db: DB, userId: string) {
  await db.from("bonds").delete().or(`user_a.eq.${userId},user_b.eq.${userId}`);
  await db.from("batches").delete().eq("user_id", userId);
  await db.from("payments").delete().eq("user_id", userId);
  await db.from("blocks").delete().or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
  await db
    .from("profiles")
    .update({ catalysts: 2, extra_slot_until: null, reliability: 60, last_active_at: new Date().toISOString() })
    .eq("id", userId);
}

const KABIR_NAINA_CHAT: ["a" | "b", string][] = [
  ["b", "6 of 8 on the first round. Either we're compatible or we both panic-tapped."],
  ["a", "Ha, I'll take compatible. Lucknow and Patna, the two cities Bengaluru forgets exist."],
  ["b", "Exactly. Okay, important: what's your chai order?"],
  ["a", "Cutting, extra adrak. Yours?"],
];

const NAINA_ARJUN_CHAT: ["a" | "b", string][] = [
  ["b", "Okay, a fellow Bihari on Covalent. This is statistically unlikely."],
  ["a", "Patna! Okay my mother will be very happy if this works out."],
  ["b", "Haha slow down. First tell me: litti chokha or biryani, if you had to pick one forever?"],
  ["a", "Litti chokha. I'm not betraying my roots on a dating app."],
  ["b", "Correct answer. Your Round 2 answer about your sister was really sweet, by the way."],
  ["a", "Thank you. Your one about learning SQL on 2G was a whole movie."],
  ["b", "So the rounds say we both want filter coffee and a bookstore. That's very us."],
  ["a", "Then let's actually do it. Indiranagar this weekend?"],
];

const DHRUV_MEERA_CHAT: ["a" | "b", string][] = [
  ["a", "A fellow runner! What's your weekend long run route?"],
  ["b", "Cubbon Park loops, then the dosa place near Lalbagh. You?"],
  ["a", "Same park, different loop. We've probably overtaken each other."],
  ["b", "Unlikely. I'd remember overtaking you 😄"],
  ["a", "Okay that was rude and I respect it. Coffee after a run, Thursday?"],
  ["b", "Booked. Don't be late, I will start without you."],
];

const DHRUV_DIVYA_CHAT: ["a" | "b", string][] = [
  ["b", "Your Round 3 guesses were scarily accurate."],
  ["a", "I read people for a living. Not really, I write Kotlin. But still."],
  ["b", "Ha! Okay, the board game café idea sounds fun."],
  ["a", "Dice Den, Saturday evening? Loser buys chai."],
];

export async function resetEvaluator(db: DB, key: string) {
  const ev = await evaluatorIds(db);
  const pe = await personaIds(db);
  const me = ev[key];
  if (!me) throw new Error(`Unknown evaluator ${key}`);
  await wipe(db, me);

  const kabirNaina = async () => {
    if (!ev["eval-kabir"] || !ev["eval-naina"]) return;
    await db.from("bonds").delete().or(`and(user_a.eq.${ev["eval-kabir"]},user_b.eq.${ev["eval-naina"]}),and(user_a.eq.${ev["eval-naina"]},user_b.eq.${ev["eval-kabir"]})`);
    await buildBond(db, {
      a: { id: ev["eval-kabir"], spec: spec("eval-kabir") },
      b: { id: ev["eval-naina"], spec: spec("eval-naina") },
      roundsDone: 1,
      chat: KABIR_NAINA_CHAT,
      startedHoursAgo: 20,
    });
  };

  if (key === "eval-kabir") {
    await kabirNaina();
    await buildBond(db, { a: { id: me, spec: spec(key) }, b: { id: pe["ananya"], spec: spec("ananya") }, roundsDone: 1, chat: [["b", "Okay, Kanpur and Lucknow. We're basically neighbours."], ["a", "Practically the same city if you squint."]], startedHoursAgo: 8 });
  } else if (key === "eval-naina") {
    await kabirNaina();
    await buildBond(db, { a: { id: me, spec: spec(key) }, b: { id: pe["arjun"], spec: spec("arjun") }, roundsDone: 4, revealed: true, chat: NAINA_ARJUN_CHAT, startedHoursAgo: 46 });
  } else if (key === "eval-dhruv") {
    const meera = await buildBond(db, { a: { id: me, spec: spec(key) }, b: { id: pe["meera"], spec: spec("meera") }, roundsDone: 4, revealed: true, chat: DHRUV_MEERA_CHAT, startedHoursAgo: 60 });
    const upcoming = new Date(Date.now() + 2 * DAY);
    upcoming.setUTCHours(13, 0, 0, 0); // 6:30 PM IST
    await seedConfirmedDate(db, meera, me, pe["meera"], "blr-third-wave-tiffin", upcoming);
    const divya = await buildBond(db, { a: { id: me, spec: spec(key) }, b: { id: pe["divya"], spec: spec("divya") }, roundsDone: 4, revealed: true, chat: DHRUV_DIVYA_CHAT, startedHoursAgo: 140 });
    const past = new Date(Date.now() - 2 * DAY);
    past.setUTCHours(12, 30, 0, 0); // 6 PM IST
    await seedConfirmedDate(db, divya, me, pe["divya"], "blr-dice-den", past);
  }
  // eval-aarohi: intentionally empty. Her first batch is generated when she opens Today.
}

export async function resetAllEvaluators(db: DB) {
  for (const e of EVALUATORS) await resetEvaluator(db, e.key);
}
