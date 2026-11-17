/**
 * The chemistry test: deterministic content draws, payload validation, scoring,
 * and the per-viewer state machine. Pure functions only — unit-tested.
 */
import { z } from "zod";
import {
  R1_PAIRS, R1_COUNT, R2_QUESTIONS, R2_OPTIONS, R2_THOUGHTFUL_CHARS,
  R3_STATEMENTS, R3_COUNT, R4_IDEAS, R4_OPTIONS, R4_PICKS, SLOTS,
  type DeepQuestion,
} from "@/content/rounds";
import { clamp, sample } from "@/lib/utils";

// ---------------------------------------------------------------- draws (same for both people)
export function drawRound1(bondId: string) {
  return sample(R1_PAIRS, R1_COUNT, `${bondId}:r1`);
}

/** Three questions from three different categories. */
export function drawRound2(bondId: string): DeepQuestion[] {
  const shuffled = sample(R2_QUESTIONS, R2_QUESTIONS.length, `${bondId}:r2`);
  const out: DeepQuestion[] = [];
  const used = new Set<string>();
  for (const q of shuffled) {
    if (used.has(q.category)) continue;
    used.add(q.category);
    out.push(q);
    if (out.length === R2_OPTIONS) break;
  }
  return out;
}

export function drawRound3(bondId: string) {
  return sample(R3_STATEMENTS, R3_COUNT, `${bondId}:r3`);
}

export function drawRound4(bondId: string) {
  return sample(R4_IDEAS, R4_OPTIONS, `${bondId}:r4`);
}

// ---------------------------------------------------------------- payload schemas
export const R1Payload = z.object({ picks: z.array(z.union([z.literal(0), z.literal(1)])).length(R1_COUNT) });
export const R2AskPayload = z.object({ asked: z.number().int().min(0).max(R2_OPTIONS - 1) });
export const R2AnswerPayload = z.object({ answer: z.string().trim().min(2).max(500) });
export const R3Payload = z.object({
  self: z.array(z.boolean()).length(R3_COUNT),
  guess: z.array(z.boolean()).length(R3_COUNT),
});
export const R4Payload = z.object({
  ideas: z.array(z.number().int().min(0).max(R4_OPTIONS - 1)).length(R4_PICKS).refine((a) => a[0] !== a[1], "Pick two different ideas"),
  slot: z.enum(SLOTS.map((s) => s.id) as [string, ...string[]]),
});

export type R1 = z.infer<typeof R1Payload>;
export type R2 = { asked?: number; answer?: string; reaction?: string; reactionNote?: string };
export type R3 = z.infer<typeof R3Payload>;
export type R4 = z.infer<typeof R4Payload>;

// ---------------------------------------------------------------- scoring
export function r1Overlap(a: R1, b: R1) {
  return a.picks.filter((p, i) => p === b.picks[i]).length;
}

/** How many of `guesser`'s guesses matched `target`'s self answers. */
export function r3Accuracy(guesser: R3, target: R3) {
  return guesser.guess.filter((g, i) => g === target.self[i]).length;
}

export function r4Overlap(a: R4, b: R4) {
  const ideas = a.ideas.filter((i) => b.ideas.includes(i));
  return { ideas, slotMatch: a.slot === b.slot };
}

/** Starting chemistry from the match score, mapped into 40–70. */
export function initialChemistry(matchScore: number) {
  return Math.round(40 + (clamp(matchScore, 0, 100) / 100) * 30);
}

/** Chemistry gained when a round completes (both submitted). */
export function chemistryDelta(round: number, a: unknown, b: unknown): number {
  switch (round) {
    case 1:
      return Math.round((r1Overlap(a as R1, b as R1) / 8) * 10);
    case 2: {
      const la = ((a as R2).answer ?? "").length;
      const lb = ((b as R2).answer ?? "").length;
      return (la >= R2_THOUGHTFUL_CHARS ? 4 : 2) + (lb >= R2_THOUGHTFUL_CHARS ? 4 : 2);
    }
    case 3: {
      const acc = (r3Accuracy(a as R3, b as R3) + r3Accuracy(b as R3, a as R3)) / (2 * 5);
      return Math.round(acc * 10);
    }
    case 4: {
      const o = r4Overlap(a as R4, b as R4);
      return o.ideas.length * 4 + (o.slotMatch ? 2 : 0);
    }
    default:
      return 0;
  }
}

export function chemistryBand(c: number) {
  if (c >= 85) return { label: "Covalent", hint: "This is a real bond." };
  if (c >= 70) return { label: "Reactive", hint: "Something's happening here." };
  if (c >= 55) return { label: "Warming", hint: "Give it a round or two." };
  return { label: "Inert", hint: "No reaction yet. Give it time." };
}

// ---------------------------------------------------------------- viewer state machine
export type Resp = { user_id: string; round: number; payload: unknown; submitted_at: string | null };

export type RoundView =
  | { state: "locked" }
  | { state: "play"; step: "answer" | "ask" | "answer-question" }
  | { state: "waiting"; reason: "partner-answer" | "partner-ask" }
  | { state: "done" };

/**
 * What the viewer should see for round `n` given all responses in the bond.
 * `bondRound` = number of rounds completed by BOTH.
 */
export function roundView(n: number, bondRound: number, viewerId: string, responses: Resp[]): RoundView {
  if (n <= bondRound) return { state: "done" };
  if (n > bondRound + 1) return { state: "locked" };

  const mine = responses.find((r) => r.round === n && r.user_id === viewerId);
  const theirs = responses.find((r) => r.round === n && r.user_id !== viewerId);

  if (n === 2) {
    const myAsk = (mine?.payload as R2 | undefined)?.asked;
    const theirAsk = (theirs?.payload as R2 | undefined)?.asked;
    if (myAsk == null) return { state: "play", step: "ask" };
    if (theirAsk == null) return { state: "waiting", reason: "partner-ask" };
    if (!mine?.submitted_at) return { state: "play", step: "answer-question" };
    return { state: "waiting", reason: "partner-answer" };
  }

  if (!mine?.submitted_at) return { state: "play", step: "answer" };
  return { state: "waiting", reason: "partner-answer" };
}

/** Is it the viewer's move anywhere in the bond? Drives "Your move" chips. */
export function isMyMove(bond: { status: string; round: number; reveal_a: boolean; reveal_b: boolean; user_a: string }, viewerId: string, responses: Resp[]) {
  if (bond.status === "invited") return bond.user_a !== viewerId;
  if (bond.status !== "active") return false;
  if (bond.round >= 4) {
    const iAmA = bond.user_a === viewerId;
    return iAmA ? !bond.reveal_a : !bond.reveal_b;
  }
  return roundView(bond.round + 1, bond.round, viewerId, responses).state === "play";
}
