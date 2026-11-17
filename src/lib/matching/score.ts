/**
 * Reciprocal compatibility score (0–100). Pure function — no I/O — so it is unit-tested.
 *
 *   40%  values      weighted similarity across quiz answers (dealbreakers ×2)
 *   20%  intent      alignment matrix
 *   15%  elements    Jaccard overlap of interests
 *   10%  hometown    same hometown / same region bonus
 *   10%  recency     how recently the candidate was active
 *    5%  reliability shows up to dates, from post-date feedback
 *
 * Every component is symmetric, so score(a, b) === score(b, a) apart from the
 * recency/reliability terms which describe the candidate. See docs/DECISIONS.md.
 */
import { QUIZ, phraseFor } from "@/content/quiz";
import { ELEMENT_BY_ID } from "@/content/elements";
import { listToSentence } from "@/lib/utils";

export type MatchInput = {
  id: string;
  gender: string | null;
  interested_in: string[];
  city: string | null;
  age: number | null;
  hometown: string | null;
  intent: string | null;
  quiz: Record<string, number>;
  elements: string[];
  last_active_at: string;
  reliability: number;
  is_demo?: boolean;
};

export type Reason = { kind: "value" | "element" | "intent" | "hometown"; text: string; weight: number };

const INTENT_MATRIX: Record<string, Record<string, number>> = {
  serious: { serious: 1, see: 0.6, friends: 0.2 },
  see: { serious: 0.6, see: 1, friends: 0.6 },
  friends: { serious: 0.2, see: 0.6, friends: 1 },
};

const REGIONS: Record<string, string[]> = {
  north: ["kanpur", "lucknow", "chandigarh", "dehradun", "jaipur", "jodhpur", "ludhiana", "varanasi", "patna", "delhi", "noida", "gurgaon", "agra", "meerut", "indore", "bhopal", "ranchi", "raipur"],
  south: ["coimbatore", "vijayawada", "mysuru", "madurai", "kozhikode", "warangal", "tirupati", "nellore", "guntur", "thrissur", "mangaluru", "hyderabad", "chennai", "bengaluru", "kochi", "vizag", "trichy"],
  east: ["bhubaneswar", "guwahati", "kolkata", "shillong", "cuttack", "siliguri"],
  west: ["pune", "mumbai", "nagpur", "surat", "ahmedabad", "nashik", "aurangabad", "vadodara", "goa", "rajkot"],
};

function regionOf(hometown: string | null): string | null {
  if (!hometown) return null;
  const h = hometown.toLowerCase();
  for (const [region, towns] of Object.entries(REGIONS)) if (towns.some((t) => h.includes(t))) return region;
  return null;
}

/** Hard filters: both must be open to each other, same city, age gap within limit. */
export function isEligible(a: MatchInput, b: MatchInput, maxAgeGap = 6): boolean {
  if (a.id === b.id) return false;
  if (!a.gender || !b.gender || !a.city || a.city !== b.city) return false;
  const aWantsB = a.interested_in.includes(b.gender) || a.interested_in.includes("everyone");
  const bWantsA = b.interested_in.includes(a.gender) || b.interested_in.includes("everyone");
  if (!aWantsB || !bWantsA) return false;
  if (a.age != null && b.age != null && Math.abs(a.age - b.age) > maxAgeGap) return false;
  return true;
}

export function valuesSimilarity(a: Record<string, number>, b: Record<string, number>) {
  let total = 0;
  let weights = 0;
  for (const q of QUIZ) {
    const va = a[q.id];
    const vb = b[q.id];
    if (va == null || vb == null) continue;
    total += q.weight * (1 - Math.abs(va - vb) / 4);
    weights += q.weight;
  }
  return weights ? total / weights : 0.5;
}

export function jaccard(a: string[], b: string[]) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

export function scoreMatch(a: MatchInput, b: MatchInput, now = Date.now()) {
  const values = valuesSimilarity(a.quiz, b.quiz);
  const intent = INTENT_MATRIX[a.intent ?? "see"]?.[b.intent ?? "see"] ?? 0.5;
  const elements = jaccard(a.elements, b.elements);
  // Jaccard of two 6-item sets rarely exceeds 0.5; scale so 3 shared ≈ full marks.
  const elementsScaled = Math.min(1, elements * 2.2);

  let hometown = 0;
  if (a.hometown && b.hometown && a.hometown.toLowerCase() === b.hometown.toLowerCase()) hometown = 1;
  else if (regionOf(a.hometown) && regionOf(a.hometown) === regionOf(b.hometown)) hometown = 0.6;

  const daysIdle = (now - new Date(b.last_active_at).getTime()) / 86_400_000;
  const recency = daysIdle <= 1 ? 1 : daysIdle <= 3 ? 0.8 : daysIdle <= 7 ? 0.5 : 0.2;
  const reliability = b.reliability / 100;

  const score =
    40 * values + 20 * intent + 15 * elementsScaled + 10 * hometown + 10 * recency + 5 * reliability;

  return {
    score: Math.round(score),
    parts: { values, intent, elements, hometown, recency, reliability },
    reasons: reasonsFor(a, b, hometown),
  };
}

/** The top specific reasons two people fit — fed to the "Why you two" line. */
export function reasonsFor(a: MatchInput, b: MatchInput, hometownScore = 0): Reason[] {
  const reasons: Reason[] = [];

  for (const q of QUIZ) {
    const va = a.quiz[q.id];
    const vb = b.quiz[q.id];
    if (va == null || vb == null) continue;
    const pa = phraseFor(q, va);
    if (pa && pa === phraseFor(q, vb)) {
      reasons.push({ kind: "value", text: pa, weight: q.weight * (Math.abs(va - 3) + Math.abs(vb - 3)) });
    }
  }

  const shared = a.elements.filter((e) => b.elements.includes(e));
  if (shared.length) {
    const names = shared.slice(0, 3).map((id) => ELEMENT_BY_ID[id]?.name ?? id);
    reasons.push({ kind: "element", text: listToSentence(names), weight: 2 + shared.length });
  }

  if (a.intent && a.intent === b.intent) reasons.push({ kind: "intent", text: a.intent, weight: 3 });
  if (hometownScore === 1) reasons.push({ kind: "hometown", text: `both from ${b.hometown}`, weight: 4 });
  else if (hometownScore > 0) reasons.push({ kind: "hometown", text: "both grew up in the same part of India", weight: 2 });

  return reasons.sort((x, y) => y.weight - x.weight).slice(0, 4);
}

/**
 * Pick the batch: top candidates with a little exploration so everyone doesn't
 * get the same three people. Real users get a small boost over demo personas.
 */
export function pickBatch<T extends { score: number; is_demo?: boolean }>(
  scored: T[],
  k: number,
  random: () => number,
): T[] {
  const boosted = scored
    .map((s) => ({ s, rank: s.score + (s.is_demo ? 0 : 8) + random() * 6 }))
    .sort((x, y) => y.rank - x.rank);
  const pool = boosted.slice(0, Math.max(k, 10));
  const picked: T[] = [];
  // Guarantee the single best match, then explore within the top pool.
  if (pool.length) picked.push(pool.shift()!.s);
  while (picked.length < k && pool.length) {
    const i = Math.floor(random() * Math.min(pool.length, 4));
    picked.push(pool.splice(i, 1)[0].s);
  }
  return picked.sort((x, y) => y.score - x.score);
}
