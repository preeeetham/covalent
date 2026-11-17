/**
 * Server-side blur entitlement — the single source of truth for which version of a
 * photo a viewer may receive. Pure function, unit-tested. Used by /api/photos/[id].
 *
 * Levels: 0 = heaviest blur … 3 = lightest blur, "original" = sharp.
 */
export type BlurLevel = 0 | 1 | 2 | 3 | "original" | "none";

export type EntitlementInput = {
  viewerId: string;
  ownerId: string;
  /** Bond between viewer and owner, if any (any status). */
  bond: { status: string; round: number } | null;
  /** Owner appears in the viewer's batch or as an invite to the viewer. */
  inBatchOrInvite: boolean;
  blocked: boolean;
  /** Admins reviewing a report see the original. */
  isModerator?: boolean;
};

export function photoEntitlement(i: EntitlementInput): BlurLevel {
  if (i.viewerId === i.ownerId) return "original";
  if (i.isModerator) return "original";
  if (i.blocked) return "none";

  if (i.bond) {
    const s = i.bond.status;
    if (s === "revealed") return "original";
    if (s === "active") return Math.min(3, Math.max(0, i.bond.round)) as 0 | 1 | 2 | 3;
    if (s === "invited") return 0;
    // dissolved / expired / declined: fall back to heaviest blur, never sharper.
    return 0;
  }

  if (i.inBatchOrInvite) return 0;
  return "none";
}
