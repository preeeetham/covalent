"use client";

import { useState } from "react";
import { browserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { OAuthProvider as Provider } from "@/lib/oauth-providers";

const LABEL: Record<Provider, string> = { google: "Google", github: "GitHub" };

/**
 * Google / GitHub sign-in through Supabase Auth (PKCE). The provider sends people back to
 * /auth/callback, which creates the session and routes new people to /welcome for the
 * 18+ check and consents that the email form collects up front.
 */
export function OAuthButtons({ providers, next }: { providers: Provider[]; next?: string }) {
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (providers.length === 0) return null;

  async function go(provider: Provider) {
    setBusy(provider);
    setError(null);
    const back = new URL("/auth/callback", window.location.origin);
    if (next) back.searchParams.set("next", next);
    const { error } = await browserClient().auth.signInWithOAuth({ provider, options: { redirectTo: back.toString() } });
    if (error) {
      setBusy(null);
      setError(`Couldn't reach ${LABEL[provider]}. Try again or use email.`);
    }
  }

  return (
    <div className="space-y-3">
      <div className={providers.length > 1 ? "grid grid-cols-2 gap-3" : "grid"}>
        {providers.map((p) => (
          <Button key={p} type="button" size="lg" block loading={busy === p} disabled={busy !== null} onClick={() => go(p)} aria-label={`Continue with ${LABEL[p]}`}>
            {busy !== p && (p === "google" ? <GoogleMark /> : <GitHubMark />)} {LABEL[p]}
          </Button>
        ))}
      </div>
      {error && (
        <p role="alert" className="rounded-2xl bg-acid-soft px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4.01-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 1.27 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.57A12 12 0 0 0 12 .3" />
    </svg>
  );
}
