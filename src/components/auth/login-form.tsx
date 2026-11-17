"use client";

import { useActionState } from "react";
import Link from "next/link";
import { logIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "@/components/ui/field";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(logIn, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" required className={inputCls} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </Field>
      {state && !state.ok && (
        <p role="alert" className="rounded-2xl bg-acid-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </p>
      )}
      <Button variant="primary" size="lg" block loading={pending}>
        Log in
      </Button>
      <Button type="button" size="lg" block disabled title="Coming with eLitmus single sign-on">
        Continue with eLitmus ID · soon
      </Button>
      <p className="pt-2 text-center text-sm text-ink-2">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-bond-text underline-offset-2 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
