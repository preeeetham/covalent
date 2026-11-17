/** UI-side mirror of the entitlement rule (the server re-checks on every image request). */
export const levelFor = (b: { status: string; round: number }): number | "original" =>
  b.status === "revealed" ? "original" : Math.min(3, Math.max(0, b.round));

export const roundsToReveal = (round: number) => Math.max(0, 4 - round);
