"use client";

import { useActionState } from "react";
import { finishSignup, logOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { keepValues } from "@/components/ui/keep-values";
import { AgeAndConsents } from "./consents";

export function WelcomeForm() {
  const [state, action, pending] = useActionState(finishSignup, null);
  return (
    <form onSubmit={keepValues(action)} className="mt-8 space-y-4">
      <AgeAndConsents />
      {state && !state.ok && (
        <p role="alert" className="rounded-2xl bg-acid-soft px-4 py-3 text-sm text-ink">
          {state.error}
        </p>
      )}
      <Button variant="primary" size="lg" block loading={pending}>
        Continue
      </Button>
      <Button type="button" variant="ghost" size="md" block onClick={() => logOut()}>
        Not you? Sign out
      </Button>
    </form>
  );
}
