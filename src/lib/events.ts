import "server-only";
import { admin } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";

/** Funnel analytics (powers /admin). Never throws. */
export type EventName =
  | "signup"
  | "onboarded"
  | "batch_viewed"
  | "reaction_started"
  | "invite_accepted"
  | "round_completed"
  | "revealed"
  | "date_proposed"
  | "date_confirmed"
  | "feedback_given"
  | "dissolved"
  | "payment"
  | "report";

export async function track(userId: string | null, name: EventName, props: Record<string, Json> = {}) {
  try {
    await admin().from("events").insert({ user_id: userId, name, props });
  } catch {
    /* analytics must never break the product */
  }
}
