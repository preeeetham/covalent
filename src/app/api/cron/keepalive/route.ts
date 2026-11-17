import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";

/**
 * Daily keep-alive (Vercel Cron, see vercel.json). Supabase pauses free projects after
 * ~7 days without activity; one real database query a day keeps the demo awake for reviewers.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`; anything else is rejected.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { count, error } = await admin().from("profiles").select("*", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, profiles: count, at: new Date().toISOString() });
}
