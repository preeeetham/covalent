import type { Database } from "@/lib/supabase/database.types";

/** A user-facing error: its message is safe to show in the UI. */
export class ActionError extends Error {}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
