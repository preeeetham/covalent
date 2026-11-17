"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StepShell } from "./step-shell";
import { handle } from "@/components/ui/toast";
import { saveElements } from "@/app/actions/onboarding";
import { ELEMENTS, CATEGORY_LABEL, type ElementCategory } from "@/content/elements";
import { ElementTile } from "@/components/brand/element-tile";

export function ElementsStep({ initial }: { initial: string[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(initial);
  const [pending, start] = useTransition();
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 8 ? p : [...p, id]));
  const cats = Object.keys(CATEGORY_LABEL) as ElementCategory[];

  return (
    <StepShell
      eyebrow="Elements"
      title="Pick your elements."
      sub={`5 to 8 things you'd happily talk about for an hour. ${picked.length}/8 picked.`}
      canNext={picked.length >= 5}
      loading={pending}
      onBack={() => router.push("/onboarding/3")}
      onNext={() => start(async () => { if (handle(await saveElements(picked))) router.push("/onboarding/5"); })}
    >
      <div className="space-y-6">
        {cats.map((c) => (
          <div key={c}>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">{CATEGORY_LABEL[c]}</p>
            <div className="flex flex-wrap gap-2.5">
              {ELEMENTS.filter((e) => e.category === c).map((e) => (
                <button key={e.id} onClick={() => toggle(e.id)} aria-pressed={picked.includes(e.id)} aria-label={e.name} className="rounded-2xl transition-transform active:scale-95">
                  <ElementTile id={e.id} selected={picked.includes(e.id)} className={picked.includes(e.id) ? "" : "opacity-80"} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
