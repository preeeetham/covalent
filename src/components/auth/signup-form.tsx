"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { keepValues } from "@/components/ui/keep-values";
import { Field, inputCls } from "@/components/ui/field";
import { AgeAndConsents } from "./consents";
import { OAuthButtons } from "./oauth-buttons";
import type { OAuthProvider } from "@/lib/oauth-providers";

export function SignupForm({ providers }: { providers: OAuthProvider[] }) {
  const [state, action, pending] = useActionState(signUp, null);
  return (
    <form onSubmit={keepValues(action)} className="mt-8 space-y-4">
      <OAuthButtons providers={providers} />
      <Button type="button" size="lg" block disabled title="Coming with eLitmus single sign-on">
        Continue with eLitmus ID · soon
      </Button>
      <div className="flex items-center gap-3 text-xs text-ink-3">
        <span className="h-px flex-1 bg-line" /> or with email <span className="h-px flex-1 bg-line" />
      </div>
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" required className={inputCls} />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <input name="password" type="password" autoComplete="new-password" minLength={8} required className={inputCls} />
      </Field>
      <AgeAndConsents />

      {state && !state.ok && (
        <p role="alert" className="rounded-2xl bg-acid-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </p>
      )}
      <Button variant="primary" size="lg" block loading={pending}>
        Create my account
      </Button>
      <p className="pt-2 text-center text-sm text-ink-2">
        Already in?{" "}
        <Link href="/login" className="font-semibold text-bond-text underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
