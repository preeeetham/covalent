/**
 * Daily batch clock. Batches reset at 8 PM India time — the evening is when people
 * actually open dating apps, so a fresh batch lands right then.
 */
const IST_OFFSET_MIN = 330;
export const RESET_HOUR_IST = 20;

/** The batch "day" a moment belongs to, as YYYY-MM-DD. Rolls over at 20:00 IST. */
export function batchDateFor(now = new Date()): string {
  const istMs = now.getTime() + IST_OFFSET_MIN * 60_000;
  // Shift by (24 - reset) hours so 20:00 IST becomes midnight of the next batch day.
  const shifted = new Date(istMs + (24 - RESET_HOUR_IST) * 3600_000);
  return shifted.toISOString().slice(0, 10);
}

/** Next 20:00 IST after `now`. */
export function nextResetAt(now = new Date()): Date {
  const istMs = now.getTime() + IST_OFFSET_MIN * 60_000;
  const ist = new Date(istMs);
  const resetIst = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), RESET_HOUR_IST, 0, 0);
  let resetUtc = resetIst - IST_OFFSET_MIN * 60_000;
  if (resetUtc <= now.getTime()) resetUtc += 24 * 3600_000;
  return new Date(resetUtc);
}

export function formatIST(iso: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    ...opts,
  }).format(typeof iso === "string" ? new Date(iso) : iso);
}
