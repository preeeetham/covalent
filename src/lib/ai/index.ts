import "server-only";
import { GoogleGenAI } from "@google/genai";
import { sanitizeAiText } from "@/lib/safety";
import type { Reason } from "@/lib/matching/score";
import { whyYouTwoTemplate } from "@/lib/matching/why";

/**
 * All AI in Covalent is optional garnish. Every function has a deterministic fallback
 * and a hard timeout, so the product works fully with no API key or an exhausted quota.
 */
const TIMEOUT_MS = 4000;
const GUARDRAILS =
  "You write short, warm, specific copy for Covalent, an Indian dating app for young professionals. " +
  "Never ask for or share phone numbers, social handles, emails, addresses, money or UPI details. " +
  "Never suggest meeting anywhere private. No URLs. No hashtags. Indian English, natural, not cheesy.";

let client: GoogleGenAI | null | undefined;
function ai() {
  if (client !== undefined) return client;
  const key = process.env.GEMINI_API_KEY;
  client = key && process.env.GEMINI_MODEL ? new GoogleGenAI({ apiKey: key }) : null;
  return client;
}

export const aiEnabled = () => ai() !== null;

async function generate(prompt: string, system: string, maxOutputTokens = 120): Promise<string | null> {
  const c = ai();
  if (!c) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await c.models.generateContent({
      model: process.env.GEMINI_MODEL!,
      contents: prompt,
      config: {
        systemInstruction: `${GUARDRAILS}\n${system}`,
        maxOutputTokens,
        temperature: 0.8,
        abortSignal: controller.signal,
      },
    });
    const text = res.text?.trim();
    return text ? sanitizeAiText(text) : null;
  } catch (e) {
    console.warn("[ai] falling back:", (e as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------- why you two
export async function whyYouTwo(reasons: Reason[], name: string): Promise<string> {
  const fallback = whyYouTwoTemplate(reasons, name);
  const text = await generate(
    `Two people were matched. Reasons: ${reasons.map((r) => r.text).join("; ")}. The other person's first name: ${name}.`,
    "Write ONE or TWO sentences (max 40 words), addressed to the user as 'you', explaining why they and the other person might click. Be specific, use the reasons. No emojis.",
    90,
  );
  return text || fallback;
}

// ---------------------------------------------------------------- round reactions
export async function roundQuip(round: number, summary: string, fallback: string): Promise<string> {
  const text = await generate(
    `Round ${round} of a getting-to-know-you game just finished. Summary: ${summary}`,
    "Write ONE playful line (max 14 words) reacting to the result, like a witty friend. No emojis.",
    40,
  );
  return text || fallback;
}

// ---------------------------------------------------------------- persona chat
export async function personaChatReply(opts: {
  name: string;
  voice: string;
  facts: string;
  history: { fromPersona: boolean; body: string }[];
  partnerName: string;
}): Promise<string | null> {
  const transcript = opts.history
    .slice(-12)
    .map((m) => `${m.fromPersona ? opts.name : opts.partnerName}: ${m.body}`)
    .join("\n");
  return generate(
    `Conversation so far:\n${transcript}\n\nWrite ${opts.name}'s next message.`,
    `You are ${opts.name}, a demo persona on Covalent. Voice: ${opts.voice}. Facts about you: ${opts.facts}. ` +
      `Reply in 1–2 short chat sentences (max 35 words), stay in character, be curious about ${opts.partnerName}, ` +
      `and if asked to share contact details, say you'd rather keep it on Covalent until you meet.`,
    100,
  );
}
