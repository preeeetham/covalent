import { describe, expect, it } from "vitest";
import { isEligible, scoreMatch, valuesSimilarity, jaccard, pickBatch, type MatchInput } from "@/lib/matching/score";
import { rng } from "@/lib/utils";

const base = (over: Partial<MatchInput>): MatchInput => ({
  id: "a",
  gender: "woman",
  interested_in: ["man"],
  city: "Bengaluru",
  age: 25,
  hometown: "Kanpur",
  intent: "serious",
  quiz: { q1: 4, q2: 2, q3: 2, q4: 4, q5: 3, q6: 2, q7: 3, q8: 2, q9: 4, q10: 3 },
  elements: ["chai", "books", "badminton"],
  last_active_at: new Date().toISOString(),
  reliability: 50,
  ...over,
});

describe("hard filters", () => {
  const her = base({ id: "her" });
  const him = base({ id: "him", gender: "man", interested_in: ["woman"] });

  it("requires mutual interest", () => {
    expect(isEligible(her, him)).toBe(true);
    expect(isEligible(her, { ...him, interested_in: ["man"] })).toBe(false);
  });
  it("requires the same city", () => {
    expect(isEligible(her, { ...him, city: "Hyderabad" })).toBe(false);
  });
  it("respects the age gap", () => {
    expect(isEligible(her, { ...him, age: 32 })).toBe(false);
    expect(isEligible(her, { ...him, age: 31 })).toBe(true);
  });
  it("never matches someone with themselves", () => {
    expect(isEligible(her, her)).toBe(false);
  });
});

describe("score", () => {
  it("identical values score 1", () => {
    const q = base({}).quiz;
    expect(valuesSimilarity(q, q)).toBe(1);
  });
  it("opposite values on dealbreakers hurt more than on ordinary questions", () => {
    const q = base({}).quiz;
    const flipDealbreaker = { ...q, q4: 1 }; // weight 2, |4-1| = 3
    const flipOrdinary = { ...q, q1: 1 }; // weight 1, |4-1| = 3
    expect(valuesSimilarity(q, flipDealbreaker)).toBeLessThan(valuesSimilarity(q, flipOrdinary));
  });
  it("jaccard", () => {
    expect(jaccard(["a", "b"], ["b", "c"])).toBeCloseTo(1 / 3);
    expect(jaccard([], [])).toBe(0);
  });
  it("is bounded 0–100 and gives reasons", () => {
    const her = base({ id: "her" });
    const him = base({ id: "him", gender: "man", interested_in: ["woman"], elements: ["chai", "books", "gym"] });
    const s = scoreMatch(her, him);
    expect(s.score).toBeGreaterThan(70);
    expect(s.score).toBeLessThanOrEqual(100);
    expect(s.reasons.some((r) => r.kind === "element")).toBe(true);
  });
  it("is symmetric in its values component", () => {
    const a = base({ id: "a" });
    const b = base({ id: "b", quiz: { ...a.quiz, q1: 1, q6: 5 } });
    expect(valuesSimilarity(a.quiz, b.quiz)).toBe(valuesSimilarity(b.quiz, a.quiz));
  });
});

describe("pickBatch", () => {
  it("returns k unique items and always includes the best", () => {
    const items = Array.from({ length: 12 }, (_, i) => ({ id: String(i), score: 50 + i, is_demo: true }));
    const picked = pickBatch(items, 3, rng(42));
    expect(picked).toHaveLength(3);
    expect(new Set(picked.map((p) => p.id)).size).toBe(3);
    expect(picked.map((p) => p.id)).toContain("11");
  });
  it("prefers real users over demo personas at equal score", () => {
    const items = [
      ...Array.from({ length: 6 }, (_, i) => ({ id: `demo${i}`, score: 70, is_demo: true })),
      { id: "real", score: 70, is_demo: false },
    ];
    const picked = pickBatch(items, 3, rng(7));
    expect(picked.map((p) => p.id)).toContain("real");
  });
});
