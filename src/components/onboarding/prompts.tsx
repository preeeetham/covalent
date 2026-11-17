"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StepShell } from "./step-shell";
import { handle } from "@/components/ui/toast";
import { savePrompts } from "@/app/actions/onboarding";
import { PROMPTS, PROMPT_BY_ID } from "@/content/prompts";
import { cn } from "@/lib/utils";

type A = { prompt_id: string; answer: string };

export function PromptsStep({ initial }: { initial: A[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<A[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const done = answers.filter((a) => a.answer.trim().length >= 2);

  const choose = (id: string) => {
    if (!answers.some((a) => a.prompt_id === id)) {
      if (answers.length >= 3) return;
      setAnswers((xs) => [...xs, { prompt_id: id, answer: "" }]);
    }
    setEditing(id);
  };

  return (
    <StepShell
      eyebrow="Prompts"
      title="Give them something to talk about."
      sub="Answer three. Specific beats clever."
      canNext={done.length === 3}
      loading={pending}
      onBack={() => router.push("/onboarding/4")}
      onNext={() => start(async () => { if (handle(await savePrompts(done))) router.push("/onboarding/6"); })}
    >
      <div className="space-y-3">
        {answers.map((a) => (
          <div key={a.prompt_id} className="rounded-[22px] border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-ink-2">{PROMPT_BY_ID[a.prompt_id].text}</p>
              <button onClick={() => setAnswers((xs) => xs.filter((x) => x.prompt_id !== a.prompt_id))} className="-m-2 min-h-[44px] px-2 text-xs font-semibold text-ink-3" aria-label="Remove prompt">
                Remove
              </button>
            </div>
            <textarea
              autoFocus={editing === a.prompt_id}
              value={a.answer}
              onChange={(e) => setAnswers((xs) => xs.map((x) => (x.prompt_id === a.prompt_id ? { ...x, answer: e.target.value } : x)))}
              maxLength={220}
              rows={2}
              placeholder={PROMPT_BY_ID[a.prompt_id].placeholder}
              className="mt-2 w-full resize-none bg-transparent font-display text-lg leading-snug text-ink outline-none placeholder:text-ink-3"
              aria-label={PROMPT_BY_ID[a.prompt_id].text}
            />
          </div>
        ))}
      </div>
      {answers.length < 3 && (
        <>
          <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wider text-ink-3">Choose a prompt ({3 - answers.length} left)</p>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.filter((p) => !answers.some((a) => a.prompt_id === p.id)).map((p) => (
              <button key={p.id} onClick={() => choose(p.id)} className={cn("min-h-[44px] rounded-full border border-line bg-surface px-4 text-left text-sm font-medium text-ink hover:border-ink-3")}>
                {p.text}
              </button>
            ))}
          </div>
        </>
      )}
    </StepShell>
  );
}
