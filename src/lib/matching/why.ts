import type { Reason } from "./score";
import { listToSentence } from "@/lib/utils";

/** Deterministic "Why you two" copy, used whenever the LLM is unavailable. */
export function whyYouTwoTemplate(reasons: Reason[], name: string): string {
  const values = reasons.filter((r) => r.kind === "value").map((r) => r.text);
  const element = reasons.find((r) => r.kind === "element");
  const hometown = reasons.find((r) => r.kind === "hometown");
  const parts: string[] = [];
  if (values.length) parts.push(`You and ${name} are on the same page about ${listToSentence(values.slice(0, 2))}.`);
  if (element) parts.push(`You both picked ${element.text}.`);
  if (hometown) parts.push(hometown.text.startsWith("both from") ? `And you're ${hometown.text}.` : `And you ${hometown.text}.`);
  if (!parts.length) parts.push("Different enough to be interesting, aligned where it counts. Worth a reaction.");
  return parts.join(" ");
}
