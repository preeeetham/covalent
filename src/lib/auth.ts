import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";
import { ActionError, type Profile } from "@/lib/errors";

export { ActionError, type Profile };

/** Verified user id from the session JWT, or null. Memoised per request. */
export const getUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return (data?.claims?.sub as string | undefined) ?? null;
});

/** The signed-in user's profile (via service role after verifying the JWT). */
export const getViewer = cache(async (): Promise<Profile | null> => {
  const id = await getUserId();
  if (!id) return null;
  const { data } = await admin().from("profiles").select("*").eq("id", id).maybeSingle();
  if (!data || data.deleted_at) return null;
  // Touch activity at most every 10 minutes (feeds the recency part of matching).
  if (Date.now() - new Date(data.last_active_at).getTime() > 10 * 60_000) {
    await admin().from("profiles").update({ last_active_at: new Date().toISOString() }).eq("id", id);
  }
  return data;
});

/** For pages: must be signed in AND onboarded. */
export async function requireViewer(): Promise<Profile> {
  const v = await getViewer();
  if (!v) redirect("/login");
  if (!v.onboarded_at) redirect(`/onboarding/${Math.max(1, v.onboarding_step)}`);
  return v;
}

/** For server actions: throws instead of redirecting. */
export async function actionViewer(opts: { onboarded?: boolean } = { onboarded: true }): Promise<Profile> {
  const v = await getViewer();
  if (!v) throw new ActionError("Please sign in again.");
  if (opts.onboarded !== false && !v.onboarded_at) throw new ActionError("Finish onboarding first.");
  return v;
}

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/** Wraps a server action body: typed result, friendly errors, no stack traces to the client. */
export async function run<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (e) {
    // Let Next.js redirects/notFound propagate.
    if (e && typeof e === "object" && "digest" in e && String((e as { digest: unknown }).digest).startsWith("NEXT_")) throw e;
    if (e instanceof ActionError) return { ok: false, error: e.message };
    if (e && typeof e === "object" && "issues" in e) return { ok: false, error: "Some of that didn't look right. Check and try again." };
    console.error("[action]", e);
    return { ok: false, error: "Something went wrong on our side. Try again in a moment." };
  }
}

/** Simple fixed-window rate limit backed by Postgres. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const { data, error } = await admin().rpc("hit_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) return; // fail open on limiter errors; never block the user because of it
  if (data === false) throw new ActionError("Slow down a little and try again in a minute.");
}
