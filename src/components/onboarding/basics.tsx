"use client";

import { useState, useTransition } from "react";
import { StepShell } from "./step-shell";
import { Chip, Field, inputCls } from "@/components/ui/field";
import { handle } from "@/components/ui/toast";
import { saveBasics } from "@/app/actions/onboarding";
import { CITIES, GENDERS } from "@/content/cities";
import { cn } from "@/lib/utils";

type Init = { first_name: string; gender: string | null; interested_in: string[]; city: string | null; role: string; company: string; hometown: string };
type G = "woman" | "man" | "nonbinary";

/** Four tiny screens instead of one long form (Hick's law: one decision at a time). */
export function BasicsStep({ initial }: { initial: Init }) {
  const [screen, setScreen] = useState(0);
  const [name, setName] = useState(initial.first_name);
  const [gender, setGender] = useState<G | null>((initial.gender as G) ?? null);
  const [interested, setInterested] = useState<G[]>(initial.interested_in.filter((x): x is G => x !== "everyone"));
  const [city, setCity] = useState<string | null>(initial.city);
  const [role, setRole] = useState(initial.role);
  const [company, setCompany] = useState(initial.company);
  const [hometown, setHometown] = useState(initial.hometown);
  const [pending, start] = useTransition();

  const back = screen > 0 ? () => setScreen((s) => s - 1) : undefined;

  if (screen === 0)
    return (
      <StepShell eyebrow="About you" title="What should people call you?" sub="First name only. Your surname never appears on Covalent." canNext={name.trim().length > 0} onNext={() => setScreen(1)}>
        <input className={cn(inputCls, "h-16 font-display text-2xl")} value={name} onChange={(e) => setName(e.target.value)} placeholder="First name" maxLength={30} autoFocus aria-label="First name" />
      </StepShell>
    );

  if (screen === 1)
    return (
      <StepShell eyebrow="About you" title={`Nice to meet you, ${name.trim()}.`} sub="How do you identify, and who would you like to meet?" canNext={!!gender && interested.length > 0} onNext={() => setScreen(2)} onBack={back}>
        <p className="mb-2 text-sm font-semibold text-ink">I am a</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Gender">
          {GENDERS.map((g) => (
            <Chip key={g.id} role="radio" active={gender === g.id} onClick={() => setGender(g.id)}>
              {g.label}
            </Chip>
          ))}
        </div>
        <p className="mb-2 mt-6 text-sm font-semibold text-ink">I'd like to meet</p>
        <div className="flex flex-wrap gap-2">
          {GENDERS.map((g) => (
            <Chip key={g.id} active={interested.includes(g.id)} onClick={() => setInterested((xs) => (xs.includes(g.id) ? xs.filter((x) => x !== g.id) : [...xs, g.id]))}>
              {g.plural}
            </Chip>
          ))}
        </div>
      </StepShell>
    );

  if (screen === 2)
    return (
      <StepShell eyebrow="About you" title="Which city are you in?" sub="We launch one city at a time so batches are worth opening." canNext={!!city} onNext={() => setScreen(3)} onBack={back}>
        <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="City">
          {CITIES.map((c) => (
            <button key={c.id} role="radio" aria-checked={city === c.id} onClick={() => setCity(c.id)} className={cn("flex min-h-[64px] flex-col items-start justify-center rounded-2xl border px-4 text-left", city === c.id ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink")}>
              <span className="font-semibold">{c.id}</span>
              <span className={cn("text-xs", city === c.id ? "text-paper/70" : c.live ? "text-ok" : "text-ink-3")}>{c.live ? "● Live now" : "Waitlist"}</span>
            </button>
          ))}
        </div>
      </StepShell>
    );

  return (
    <StepShell
      eyebrow="About you"
      title="What do you do?"
      sub="Just enough for context. Employer names are optional."
      canNext={role.trim().length > 0}
      loading={pending}
      onBack={back}
      onNext={() =>
        start(async () => {
          const res = await saveBasics({ first_name: name, gender: gender!, interested_in: interested, city: city as never, role, company, hometown });
          handle(res);
        })
      }
    >
      <div className="space-y-4">
        <Field label="Role">
          <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} placeholder="Backend Engineer" maxLength={50} />
        </Field>
        <Field label="Kind of company" hint="e.g. Fintech startup, product company, IT services. Optional.">
          <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} maxLength={50} />
        </Field>
        <Field label="Hometown" hint="Optional, but people love finding someone from home.">
          <input className={inputCls} value={hometown} onChange={(e) => setHometown(e.target.value)} placeholder="Nagpur" maxLength={40} />
        </Field>
      </div>
    </StepShell>
  );
}
