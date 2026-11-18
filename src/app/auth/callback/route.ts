import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { admin } from "@/lib/supabase/admin";

/**
 * Return leg of Google / GitHub sign-in. Exchanges the one-time code for a session cookie,
 * then sends new people to /welcome (18+ check and consents) and returning people on.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const fail = (reason: string) => NextResponse.redirect(new URL(`/login?error=${reason}`, url.origin));

  if (!code) return fail(url.searchParams.get("error") === "access_denied" ? "oauth_cancelled" : "oauth");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return fail("oauth");

  const { data: profile } = await admin().from("profiles").select("id").eq("id", data.user.id).maybeSingle();
  return NextResponse.redirect(new URL(profile ? next : "/welcome", url.origin));
}

function safeNext(n: string | null) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/today";
}
