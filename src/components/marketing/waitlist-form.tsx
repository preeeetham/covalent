"use client";

import { useActionState } from "react";
import { joinWaitlist } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "@/components/ui/field";

export function WaitlistForm() {
  const [state, action, pending] = useActionState(joinWaitlist, null);
  if (state?.ok && state.data) {
    return (
      <div className="rounded-[24px] bg-ok-soft p-6" role="status">
        <p className="font-display text-3xl text-ink">You're #{state.data.position} in {state.data.city}.</p>
        <p className="mt-2 text-ink-2">We'll email you the day it opens. Bring friends — cities open faster with balanced, verified waitlists.</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City">
          <select name="city" required className={inputCls} defaultValue="Pune">
            {["Pune", "Chennai", "Delhi NCR", "Mumbai", "Kolkata", "Ahmedabad", "Other"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="I am" hint="Helps us open balanced.">
          <select name="gender" className={inputCls} defaultValue="skip">
            <option value="skip">Prefer not to say</option>
            <option value="woman">Woman</option>
            <option value="man">Man</option>
            <option value="nonbinary">Non-binary</option>
          </select>
        </Field>
      </div>
      {state && !state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <Button variant="ink" size="lg" block loading={pending}>
        Join the waitlist
      </Button>
    </form>
  );
}
