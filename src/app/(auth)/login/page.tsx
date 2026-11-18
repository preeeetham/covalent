import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { enabledOAuthProviders } from "@/lib/oauth-providers";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage(props: PageProps<"/login">) {
  const sp = await props.searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Welcome back.</h1>
      <p className="mt-2 text-ink-2">Your batch might be waiting.</p>
      <LoginForm next={next} error={error} providers={await enabledOAuthProviders()} />
    </div>
  );
}
