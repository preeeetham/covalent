"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Pair } from "@/content/rounds";
import { submitRound } from "@/app/actions/bonds";
import { handle } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlipIn, ResultFooter, WaitingCard, type RoundProps } from "./shared";

type P = { picks: (0 | 1)[] };

export function Round1({ bondId, partnerName, view, mine, theirs, nextRound, pairs }: RoundProps & { pairs: Pair[] }) {
  const router = useRouter();
  const [picks, setPicks] = useState<(0 | 1)[]>([]);
  const [pending, start] = useTransition();
  const idx = picks.length;

  if (view.state === "done" && mine && theirs) {
    const a = (mine as P).picks;
    const b = (theirs as P).picks;
    const same = a.filter((x, i) => x === b[i]).length;
    return (
      <div>
        <p className="mb-5 text-center text-ink-2">
          <span className="font-display text-5xl text-ink">{same}</span>
          <span className="font-display text-2xl text-ink-3">/8</span>
          <br />
          {same >= 7 ? "Suspiciously similar." : same >= 5 ? "A promising start." : same >= 3 ? "Opposites make better stories." : "You'll never run out of debates."}
        </p>
        <div className="mb-2 grid grid-cols-[1fr_auto_1fr] gap-x-3 px-1 text-xs font-bold uppercase tracking-wider text-ink-3">
          <span>You</span>
          <span />
          <span className="text-right">{partnerName}</span>
        </div>
        <ul className="space-y-2">
          {pairs.map((p, i) => {
            const match = a[i] === b[i];
            const label = (x: 0 | 1) => (x === 0 ? `${p.emojiA} ${p.a}` : `${p.emojiB} ${p.b}`);
            return (
              <li key={p.id}>
                <FlipIn i={i}>
                  <div className={cn("grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 rounded-2xl border p-3 text-sm", match ? "border-bond/40 bg-bond-soft" : "border-line bg-surface")}>
                    <span className="font-medium text-ink">{label(a[i])}</span>
                    <span className={cn("font-mono text-xs", match ? "text-bond" : "text-ink-3")}>{match ? "=" : "≠"}</span>
                    <span className="text-right font-medium text-ink">{label(b[i])}</span>
                  </div>
                </FlipIn>
              </li>
            );
          })}
        </ul>
        <ResultFooter bondId={bondId} nextRound={nextRound} />
      </div>
    );
  }

  if (view.state === "waiting") return <WaitingCard partnerName={partnerName} isDemo />;

  const submit = (final: (0 | 1)[]) =>
    start(async () => {
      if (handle(await submitRound(bondId, 1, "answer", { picks: final }))) router.refresh();
    });

  const choose = (v: 0 | 1) => {
    const next = [...picks, v];
    setPicks(next);
  };

  if (idx >= pairs.length) {
    return (
      <div className="mt-10 text-center">
        <p className="font-display text-3xl text-ink">That's eight.</p>
        <p className="mt-2 text-ink-2">Lock them in? You'll see {partnerName}'s picks once they've played too.</p>
        <div className="mt-6 flex gap-3">
          <Button className="flex-1" size="lg" onClick={() => setPicks([])} disabled={pending}>
            Start over
          </Button>
          <Button variant="primary" className="flex-[1.4]" size="lg" loading={pending} onClick={() => submit(picks)}>
            Lock in
          </Button>
        </div>
      </div>
    );
  }

  const p = pairs[idx];
  return (
    <div>
      <p className="mb-6 text-center text-ink-2">Quick, don't overthink it.</p>
      <div className="mb-6 flex justify-center gap-1.5" aria-hidden>
        {pairs.map((_, i) => (
          <span key={i} className={cn("h-1.5 w-6 rounded-full transition-colors", i < idx ? "bg-bond" : i === idx ? "bg-ink" : "bg-line")} />
        ))}
      </div>
      <div key={p.id} className="slide-in grid grid-cols-2 gap-3">
          {([0, 1] as const).map((v) => (
            <button
              key={v}
              onClick={() => choose(v)}
              className="flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-[28px] border border-line bg-surface p-4 shadow-[var(--shadow-soft)] transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <span className="text-6xl" aria-hidden>{v === 0 ? p.emojiA : p.emojiB}</span>
              <span className="font-display text-2xl text-ink">{v === 0 ? p.a : p.b}</span>
            </button>
          ))}
      </div>
      <p className="mt-4 text-center font-mono text-xs text-ink-3">
        {idx + 1} / {pairs.length}
      </p>
      {idx > 0 && (
        <button onClick={() => setPicks(picks.slice(0, -1))} className="mx-auto mt-2 block min-h-[44px] text-sm font-medium text-ink-2">
          ← Back
        </button>
      )}
    </div>
  );
}
