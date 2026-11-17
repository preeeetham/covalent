"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, inputCls } from "@/components/ui/field";

function maxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

function Consent({ name, required, children }: { name: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex gap-3 text-sm leading-snug text-ink-2">
      <input type="checkbox" name={name} required={required} className="mt-0.5 size-5 shrink-0 accent-[var(--bond)]" />
      <span>{children}</span>
    </label>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signUp, null);
  return (
    <form action={action} className="mt-8 space-y-4">
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
      <Field label="Date of birth" hint="Covalent is for adults only (18+). We show your age, never your birthday.">
        <input name="dob" type="date" max={maxDob()} required className={inputCls} />
      </Field>

      <div className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        <Consent name="terms" required>
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-ink underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/guidelines" target="_blank" className="font-semibold text-ink underline">
            Community guidelines
          </Link>
          .
        </Consent>
        <Consent name="privacy" required>
          I've read the{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-ink underline">
            Privacy notice
          </Link>{" "}
          and consent to Covalent processing my data to find me matches.
        </Consent>
        <Consent name="firewall" required>
          <span className="flex items-start gap-1.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-bond" />
            <span>
              I understand <strong className="text-ink">my Covalent data is never shared with eLitmus recruiters or employers</strong>. Only my verification status is used.
            </span>
          </span>
        </Consent>
        <Consent name="marketing">Send me occasional updates, like when a new city opens. (Optional)</Consent>
      </div>

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
        <Link href="/login" className="font-semibold text-bond underline-offset-2 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
