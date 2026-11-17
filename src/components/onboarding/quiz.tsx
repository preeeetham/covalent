"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { StepShell } from "./step-shell";
import { handle } from "@/components/ui/toast";
import { saveQuiz } from "@/app/actions/onboarding";
import { QUIZ } from "@/content/quiz";
import { cn } from "@/lib/utils";

/** The values quiz — 10 questions, one per screen, five-point scale between two poles. */
export function QuizStep({ initial }: { initial: Record<string, number> }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(initial);
  const [pending, start] = useTransition();
  const q = QUIZ[i];
  const last = i === QUIZ.length - 1;
  const value = answers[q.id];

  const next = () => {
    if (!last) return setI(i + 1);
    start(async () => {
      if (handle(await saveQuiz(answers))) router.push("/onboarding/4");
    });
  };

  return (
    <StepShell
      eyebrow={`Values · ${i + 1} of ${QUIZ.length}`}
      title={q.prompt}
      sub={q.weight >= 2 ? "This one matters a lot for matching." : undefined}
      canNext={value != null}
      loading={pending}
      cta={last ? "See my element" : "Next"}
      onBack={i > 0 ? () => setI(i - 1) : () => router.push("/onboarding/2")}
      onNext={next}
    >
      <div className="grid grid-cols-2 gap-3 text-sm font-semibold">
        <p className="rounded-2xl bg-surface-2 p-3 text-ink">{q.left}</p>
        <p className="rounded-2xl bg-surface-2 p-3 text-right text-ink">{q.right}</p>
      </div>
      <div className="mt-6 flex items-center justify-between gap-2" role="radiogroup" aria-label={q.prompt}>
        {[1, 2, 3, 4, 5].map((v) => {
          const size = [56, 46, 38, 46, 56][v - 1];
          return (
            <button
              key={v}
              role="radio"
              aria-checked={value === v}
              aria-label={v === 1 ? q.left : v === 5 ? q.right : v === 3 ? "Somewhere in between" : v < 3 ? `Lean: ${q.left}` : `Lean: ${q.right}`}
              onClick={() => {
                setAnswers((a) => ({ ...a, [q.id]: v }));
                if (!last) setTimeout(() => setI((x) => Math.min(x + 1, QUIZ.length - 1)), 220);
              }}
              style={{ width: size, height: size }}
              className={cn(
                "grid shrink-0 place-items-center rounded-full border-2 transition-all",
                value === v ? "border-transparent bg-litmus shadow-[0_8px_20px_-8px_rgb(124_77_255/0.8)]" : "border-line bg-surface hover:border-ink-3",
              )}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-ink-3">
        <span>←</span>
        <span>in between</span>
        <span>→</span>
      </div>
    </StepShell>
  );
}
