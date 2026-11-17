"use client";
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Browser client — used only for realtime subscriptions (reads are RLS-scoped). */
export function browserClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}

/**
 * A browser client whose realtime socket is authenticated as the signed-in user.
 * supabase-js also does this on its INITIAL_SESSION event, but asynchronously; awaiting it
 * here guarantees a channel never joins as `anon` (which RLS would leave empty).
 */
export async function realtimeClient() {
  const sb = browserClient();
  const { data } = await sb.auth.getSession();
  if (data.session) await sb.realtime.setAuth(data.session.access_token);
  return sb;
}
