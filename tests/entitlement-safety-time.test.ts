import { describe, expect, it } from "vitest";
import { ownerPreviewLevel, photoEntitlement } from "@/lib/photos/entitlement";
import { detectContactInfo, sanitizeAiText } from "@/lib/safety";
import { batchDateFor, nextResetAt } from "@/lib/time";
import { archetypeFor } from "@/content/archetypes";

describe("photo entitlement (server-side blur)", () => {
  const base = { viewerId: "v", ownerId: "o", bond: null, inBatchOrInvite: false, blocked: false };

  it("owners always see their own original", () => {
    expect(photoEntitlement({ ...base, ownerId: "v" })).toBe("original");
  });
  it("strangers get nothing", () => {
    expect(photoEntitlement(base)).toBe("none");
  });
  it("batch cards get the heaviest blur", () => {
    expect(photoEntitlement({ ...base, inBatchOrInvite: true })).toBe(0);
  });
  it("blur lightens one level per completed round, never reaching original before reveal", () => {
    for (let round = 0; round <= 4; round++) {
      const level = photoEntitlement({ ...base, bond: { status: "active", round } });
      expect(level).toBe(Math.min(round, 3));
      expect(level).not.toBe("original");
    }
  });
  it("only a revealed bond unlocks the original", () => {
    expect(photoEntitlement({ ...base, bond: { status: "revealed", round: 4 } })).toBe("original");
  });
  it("dissolved bonds fall back to heaviest blur", () => {
    expect(photoEntitlement({ ...base, bond: { status: "dissolved", round: 3 } })).toBe(0);
  });
  it("blocks win over everything except self", () => {
    expect(photoEntitlement({ ...base, blocked: true, bond: { status: "revealed", round: 4 } })).toBe("none");
  });
  it("owners can preview each blur level of their own photo", () => {
    expect(["0", "1", "2", "3"].map(ownerPreviewLevel)).toEqual([0, 1, 2, 3]);
    expect(ownerPreviewLevel("original")).toBe("original");
    expect(ownerPreviewLevel(null)).toBe("original");
    expect(ownerPreviewLevel("4")).toBe("original");
    expect(ownerPreviewLevel("1.5")).toBe("original");
  });
});

describe("contact detection", () => {
  it.each([
    ["call me on 98765 43210", "phone"],
    ["+91-9876543210", "phone"],
    ["pay me at rahul@okicici", "upi"],
    ["mail me me@example.com", "email"],
    ["my insta is @rahul_k", "handle"],
  ])("%s → %s", (text, kind) => {
    expect(detectContactInfo(text)).toBe(kind);
  });
  it("ignores normal chat", () => {
    expect(detectContactInfo("I ran 21 km in 2 hours on Sunday")).toBeNull();
  });
  it("sanitises AI output", () => {
    expect(sanitizeAiText("visit https://x.com or call 9876543210 now")).toBe("visit or call now");
  });
});

describe("batch clock (8 PM IST reset)", () => {
  it("rolls over at 20:00 IST", () => {
    // 19:59 IST on 17 Nov = 14:29 UTC
    expect(batchDateFor(new Date("2026-11-17T14:29:00Z"))).toBe("2026-11-17");
    // 20:00 IST on 17 Nov = 14:30 UTC → belongs to the 18th
    expect(batchDateFor(new Date("2026-11-17T14:30:00Z"))).toBe("2026-11-18");
  });
  it("next reset is the upcoming 20:00 IST", () => {
    expect(nextResetAt(new Date("2026-11-17T10:00:00Z")).toISOString()).toBe("2026-11-17T14:30:00.000Z");
    expect(nextResetAt(new Date("2026-11-17T15:00:00Z")).toISOString()).toBe("2026-11-18T14:30:00.000Z");
  });
});

describe("archetypes", () => {
  it("maps a social, spontaneous spender to Neon or Sodium", () => {
    const a = archetypeFor({ q1: 1, q2: 5, q3: 5, q9: 1, q5: 1 });
    expect(["neon", "sodium"]).toContain(a.id);
  });
  it("maps a quiet homebody to Argon", () => {
    expect(archetypeFor({ q1: 5, q8: 5, q9: 5 }).id).toBe("argon");
  });
});
