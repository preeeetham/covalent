"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StepShell } from "./step-shell";
import { handle } from "@/components/ui/toast";
import { saveIntent } from "@/app/actions/onboarding";
import { INTENTS } from "@/content/cities";
import { cn } from "@/lib/utils";

export function IntentStep({ initial }: { initial: string | null }) {
  const router = useRouter();
  const [intent, setIntent] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <StepShell
      eyebrow="Intent"
      title="What are you here for?"
      sub="Honesty here makes everyone's batch better. You can change it later."
      canNext={!!intent}
      loading={pending}
      onBack={() => router.push("/onboarding/1")}
      onNext={() => start(async () => { if (handle(await saveIntent(intent!))) router.push("/onboarding/3"); })}
    >
      <div className="space-y-3" role="radiogroup" aria-label="Intent">
        {INTENTS.map((i) => (
          <button key={i.id} role="radio" aria-checked={intent === i.id} onClick={() => setIntent(i.id)} className={cn("w-full rounded-[22px] border p-5 text-left transition-all", intent === i.id ? "border-transparent bg-ink text-paper shadow-[var(--shadow-lift)]" : "border-line bg-surface text-ink")}>
            <p className="font-display text-xl">{i.label}</p>
            <p className={cn("mt-1 text-sm", intent === i.id ? "text-paper/70" : "text-ink-2")}>{i.hint}</p>
          </button>
        ))}
      </div>
    </StepShell>
  );
}
