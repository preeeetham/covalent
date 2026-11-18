import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { enabledOAuthProviders } from "@/lib/oauth-providers";

export const metadata: Metadata = { title: "Join" };

export default async function SignupPage() {
  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Find your element.</h1>
      <p className="mt-2 text-ink-2">Four minutes to set up. No swiping, ever.</p>
      <SignupForm providers={await enabledOAuthProviders()} />
    </div>
  );
}
