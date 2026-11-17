import { describe, expect, it } from "vitest";
import {
  drawRound1, drawRound2, drawRound3, drawRound4, roundView, chemistryDelta, initialChemistry,
  r1Overlap, r3Accuracy, isMyMove, R4Payload, type Resp,
} from "@/lib/rounds/logic";

describe("draws", () => {
  it("are deterministic per bond and identical for both people", () => {
    expect(drawRound1("bond-1").map((p) => p.id)).toEqual(drawRound1("bond-1").map((p) => p.id));
    expect(drawRound1("bond-1").map((p) => p.id)).not.toEqual(drawRound1("bond-2").map((p) => p.id));
  });
  it("round 2 offers three questions from three different categories", () => {
    const qs = drawRound2("bond-x");
    expect(qs).toHaveLength(3);
    expect(new Set(qs.map((q) => q.category)).size).toBe(3);
  });
  it("sizes", () => {
    expect(drawRound1("b")).toHaveLength(8);
    expect(drawRound3("b")).toHaveLength(5);
    expect(drawRound4("b")).toHaveLength(6);
  });
});

describe("round state machine", () => {
  const me = "me";
  const them = "them";
  const r = (user_id: string, round: number, payload: unknown, submitted = true): Resp => ({
    user_id, round, payload, submitted_at: submitted ? new Date().toISOString() : null,
  });

  it("locks future rounds and marks past ones done", () => {
    expect(roundView(3, 1, me, []).state).toBe("locked");
    expect(roundView(1, 1, me, []).state).toBe("done");
  });
  it("plays, then waits for the partner", () => {
    expect(roundView(1, 0, me, [])).toEqual({ state: "play", step: "answer" });
    expect(roundView(1, 0, me, [r(me, 1, {})])).toEqual({ state: "waiting", reason: "partner-answer" });
  });
  it("round 2 is ask → wait for their ask → answer → wait", () => {
    expect(roundView(2, 1, me, [])).toEqual({ state: "play", step: "ask" });
    const myAsk = r(me, 2, { asked: 1 }, false);
    expect(roundView(2, 1, me, [myAsk])).toEqual({ state: "waiting", reason: "partner-ask" });
    const theirAsk = r(them, 2, { asked: 0 }, false);
    expect(roundView(2, 1, me, [myAsk, theirAsk])).toEqual({ state: "play", step: "answer-question" });
    const myAnswer = r(me, 2, { asked: 1, answer: "hello there" }, true);
    expect(roundView(2, 1, me, [myAnswer, theirAsk])).toEqual({ state: "waiting", reason: "partner-answer" });
  });
  it("knows whose move it is", () => {
    const bond = { status: "active", round: 0, reveal_a: false, reveal_b: false, user_a: me };
    expect(isMyMove(bond, me, [])).toBe(true);
    expect(isMyMove(bond, me, [r(me, 1, {})])).toBe(false);
    expect(isMyMove({ ...bond, status: "invited" }, them, [])).toBe(true);
    expect(isMyMove({ ...bond, status: "invited" }, me, [])).toBe(false);
    expect(isMyMove({ ...bond, round: 4, reveal_a: true }, me, [])).toBe(false);
  });
});

describe("chemistry", () => {
  it("starts between 40 and 70", () => {
    expect(initialChemistry(0)).toBe(40);
    expect(initialChemistry(100)).toBe(70);
  });
  it("round 1 rewards overlap", () => {
    const a = { picks: [0, 0, 0, 0, 1, 1, 1, 1] };
    const b = { picks: [0, 0, 0, 0, 0, 0, 0, 0] };
    expect(r1Overlap(a as never, b as never)).toBe(4);
    expect(chemistryDelta(1, a, a)).toBe(10);
    expect(chemistryDelta(1, a, b)).toBe(5);
  });
  it("round 2 rewards thoughtful answers", () => {
    const long = { answer: "x".repeat(80) };
    const short = { answer: "ok" };
    expect(chemistryDelta(2, long, long)).toBe(8);
    expect(chemistryDelta(2, short, short)).toBe(4);
  });
  it("round 3 scores guessing accuracy", () => {
    const a = { self: [true, true, true, true, true], guess: [true, true, true, true, true] };
    const b = { self: [true, true, true, true, true], guess: [false, false, false, false, false] };
    expect(r3Accuracy(a, b)).toBe(5);
    expect(r3Accuracy(b, a)).toBe(0);
    expect(chemistryDelta(3, a, b)).toBe(5);
  });
  it("round 4 rewards shared date ideas and slot", () => {
    expect(chemistryDelta(4, { ideas: [0, 1], slot: "weekend-morning" }, { ideas: [1, 2], slot: "weekend-morning" })).toBe(6);
  });
  it("round 4 payload rejects duplicate picks", () => {
    expect(R4Payload.safeParse({ ideas: [1, 1], slot: "weekend-morning" }).success).toBe(false);
  });
});
