/**
 * How demo personas answer each round. Deterministic (seeded by persona + bond) so a
 * persona behaves consistently, and grounded in their authored quiz answers and voice.
 */
import { PERSONAS, type Persona } from "@/content/personas";
import { R2_QUESTIONS, SLOTS, type DeepQuestion, type Statement } from "@/content/rounds";
import { QUIZ } from "@/content/quiz";
import { hash, rng } from "@/lib/utils";
import type { R1, R2, R3, R4 } from "@/lib/rounds/logic";
import type { Pair, DateIdea } from "@/content/rounds";

export const PERSONA_BY_KEY: Record<string, Persona> = Object.fromEntries(PERSONAS.map((p) => [p.key, p]));

export function personaQuiz(p: Persona): Record<string, number> {
  return Object.fromEntries(QUIZ.map((q, i) => [q.id, p.quiz[i]]));
}

export function personaR1(p: Persona, bondId: string, pairs: Pair[]): R1 {
  return {
    picks: pairs.map((pair) => ((hash(`${p.key}:${pair.id}`) % 2) as 0 | 1)),
  } as R1;
}

/** Personas ask the question closest to what they care about, with a seeded tiebreak. */
export function personaR2Ask(p: Persona, bondId: string, options: DeepQuestion[]): number {
  const r = rng(hash(`${p.key}:${bondId}:ask`));
  return Math.floor(r() * options.length);
}

export function personaR2Answer(p: Persona, questionId: string): string {
  const q = R2_QUESTIONS.find((x) => x.id === questionId);
  return p.deep[q?.category ?? "self"];
}

export function personaR3(p: Persona, bondId: string, statements: Statement[], partnerSelf?: boolean[]): R3 {
  const quiz = personaQuiz(p);
  const self = statements.map((s) => {
    if (s.trait) {
      const v = quiz[s.trait.q] ?? 3;
      if (v === 3) return hash(`${p.key}:${s.id}`) % 2 === 0;
      return s.trait.agreeWhen === "low" ? v < 3 : v > 3;
    }
    return hash(`${p.key}:${s.id}`) % 2 === 0;
  });
  // Personas read people reasonably well: right on 3–4 of 5 when the partner has answered.
  const r = rng(hash(`${p.key}:${bondId}:guess`));
  const misses = new Set<number>();
  const missCount = r() < 0.5 ? 1 : 2;
  while (misses.size < missCount) misses.add(Math.floor(r() * statements.length));
  const guess = statements.map((_, i) => {
    const truth = partnerSelf?.[i] ?? r() < 0.5;
    return misses.has(i) ? !truth : truth;
  });
  return { self, guess };
}

export function personaR4(p: Persona, bondId: string, ideas: DateIdea[], partner?: R4): R4 {
  const r = rng(hash(`${p.key}:${bondId}:r4`));
  const picks = new Set<number>();
  // Usually overlaps with at least one of the partner's picks — they did get this far.
  if (partner && r() < 0.8) picks.add(partner.ideas[Math.floor(r() * 2)]);
  while (picks.size < 2) picks.add(Math.floor(r() * ideas.length));
  const slot = partner && r() < 0.6 ? partner.slot : SLOTS[Math.floor(r() * SLOTS.length)].id;
  return { ideas: [...picks].slice(0, 2), slot } as R4;
}

export function personaReaction(p: Persona, bondId: string): Pick<R2, "reaction" | "reactionNote"> {
  const r = rng(hash(`${p.key}:${bondId}:react`));
  const reactions = ["🥹", "😂", "🤝", "🔥", "💯"];
  return { reaction: reactions[Math.floor(r() * reactions.length)], reactionNote: p.replies[Math.floor(r() * p.replies.length)] };
}

export function personaChatFallback(p: Persona, turn: number): string {
  const extras = [
    "So what's your ideal Sunday looking like?",
    "Okay, important question: chai or coffee on a first date?",
    "What made you sign up for Covalent, honestly?",
    "Tell me one thing about your hometown I'd never guess.",
    "I'm enjoying this. The rounds are a much better start than 'hey'.",
  ];
  const lines = [...p.replies, ...extras];
  return lines[turn % lines.length];
}
