"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Statement } from "@/content/rounds";
import { submitRound } from "@/app/actions/bonds";
import { handle } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlipIn, ResultFooter, WaitingCard, type RoundProps } from "./shared";

type P = { self: boolean[]; guess: boolean[] };

function YesNo({ value, onChange, label }: { value: boolean | undefined; onChange: (v: boolean) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 gap-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn("min-h-[44px] rounded-full border text-sm font-semibold transition-colors", value === v ? (v ? "border-transparent bg-ok text-on-accent" : "border-transparent bg-ink text-paper") : "border-line bg-surface text-ink-2")}
        >
          {v ? "Agree" : "Disagree"}
        </button>
      ))}
    </div>
  );
}

export function Round3({ bondId, partnerName, view, mine, theirs, nextRound, statements }: RoundProps & { statements: Statement[] }) {
  const router = useRouter();
  const [self, setSelf] = useState<(boolean | undefined)[]>(Array(statements.length).fill(undefined));
  const [guess, setGuess] = useState<(boolean | undefined)[]>(Array(statements.length).fill(undefined));
  const [pending, start] = useTransition();

  if (view.state === "done" && mine && theirs) {
    const m = mine as P;
    const t = theirs as P;
    const myAcc = m.guess.filter((g, i) => g === t.self[i]).length;
    const theirAcc = t.guess.filter((g, i) => g === m.self[i]).length;
    return (
      <div>
        <div className="mb-6 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-[24px] border border-line bg-surface p-4">
            <p className="font-display text-4xl text-ink">{myAcc}/5</p>
            <p className="text-sm text-ink-2">You read {partnerName}</p>
          </div>
          <div className="rounded-[24px] border border-line bg-surface p-4">
            <p className="font-display text-4xl text-ink">{theirAcc}/5</p>
            <p className="text-sm text-ink-2">{partnerName} read you</p>
          </div>
        </div>
        <ul className="space-y-2.5">
          {statements.map((s, i) => (
            <li key={s.id}>
              <FlipIn i={i}>
                <div className="rounded-2xl border border-line bg-surface p-4">
                  <p className="font-medium text-ink">{s.text}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <p className="text-ink-2">
                      {partnerName}: <strong className="text-ink">{t.self[i] ? "agree" : "disagree"}</strong>
                      <span className={cn("ml-1", m.guess[i] === t.self[i] ? "text-ok" : "text-acid")}>{m.guess[i] === t.self[i] ? "· you called it" : "· missed"}</span>
                    </p>
                    <p className="text-right text-ink-2">
                      You: <strong className="text-ink">{m.self[i] ? "agree" : "disagree"}</strong>
                      <span className={cn("ml-1", t.guess[i] === m.self[i] ? "text-ok" : "text-acid")}>{t.guess[i] === m.self[i] ? "· they knew" : "· surprise"}</span>
                    </p>
                  </div>
                </div>
              </FlipIn>
            </li>
          ))}
        </ul>
        <ResultFooter bondId={bondId} nextRound={nextRound} />
      </div>
    );
  }
  if (view.state === "waiting") return <WaitingCard partnerName={partnerName} isDemo />;

  const complete = self.every((x) => x !== undefined) && guess.every((x) => x !== undefined);
  return (
    <div>
      <p className="mb-5 text-center text-ink-2">For each line: what's true for you, and what you think {partnerName} said.</p>
      <ol className="space-y-4">
        {statements.map((s, i) => (
          <li key={s.id} className="rounded-[24px] border border-line bg-surface p-4 shadow-[var(--shadow-soft)]">
            <p className="font-display text-xl leading-snug text-ink">{s.text}</p>
            <p className="mb-1.5 mt-3 text-xs font-bold uppercase tracking-wider text-ink-3">You</p>
            <YesNo label={`You: ${s.text}`} value={self[i]} onChange={(v) => setSelf((xs) => xs.map((x, j) => (j === i ? v : x)))} />
            <p className="mb-1.5 mt-3 text-xs font-bold uppercase tracking-wider text-bond-text">Your guess for {partnerName}</p>
            <YesNo label={`Guess for ${partnerName}: ${s.text}`} value={guess[i]} onChange={(v) => setGuess((xs) => xs.map((x, j) => (j === i ? v : x)))} />
          </li>
        ))}
      </ol>
      <Button
        variant="primary"
        size="lg"
        block
        className="mt-6"
        disabled={!complete}
        loading={pending}
        onClick={() =>
          start(async () => {
            if (handle(await submitRound(bondId, 3, "answer", { self, guess }))) router.refresh();
          })
        }
      >
        Lock in my guesses
      </Button>
    </div>
  );
}
