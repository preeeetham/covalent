/**
 * Message hygiene: detect attempts to move off-platform before two people have met.
 * Soft warning on the client, `flagged=true` on the server. Pure — unit-tested.
 */
const PATTERNS: { kind: string; re: RegExp }[] = [
  // Indian mobile numbers, with or without +91 / spaces / dashes.
  { kind: "phone", re: /(?:\+?91[\s-]?)?[6-9](?:[\s-]?\d){9}\b/ },
  { kind: "upi", re: /\b[\w.-]{2,}@(?:ok\w+|ybl|paytm|upi|apl|ibl|axl|sbi|icici|hdfcbank|axisbank)\b/i },
  { kind: "email", re: /\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/ },
  { kind: "handle", re: /(?:\binsta(?:gram)?\b|\bsnap(?:chat)?\b|\btelegram\b|\bwhats ?app\b)[^\n]{0,20}@?\w{3,}/i },
];

export function detectContactInfo(text: string): string | null {
  for (const p of PATTERNS) if (p.re.test(text)) return p.kind;
  return null;
}

/** Strip URLs and phone numbers from AI output before showing it. */
export function sanitizeAiText(text: string, maxLen = 280) {
  return text
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/(?:\+?91[\s-]?)?[6-9](?:[\s-]?\d){9}\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}
