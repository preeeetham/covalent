import "server-only";

export type OAuthProvider = "google" | "github";
const ALL: OAuthProvider[] = ["google", "github"];

/**
 * Which social logins are switched on in Supabase Auth (public settings endpoint, cached 5 min).
 * Buttons only render for enabled providers, so a provider that isn't configured yet never
 * leads people to an error page.
 */
export async function enabledOAuthProviders(): Promise<OAuthProvider[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return [];
    const { external } = (await res.json()) as { external?: Record<string, boolean> };
    return ALL.filter((p) => external?.[p]);
  } catch {
    return [];
  }
}
