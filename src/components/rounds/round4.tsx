"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SLOTS, type DateIdea } from "@/content/rounds";
import { submitRound } from "@/app/actions/bonds";
import { handle } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlipIn, WaitingCard, type RoundProps } from "./shared";
import Link from "next/link";

type P = { ideas: number[]; slot: string };

export function Round4({ bondId, partnerName, view, mine, theirs, ideas }: RoundProps & { ideas: DateIdea[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState<number[]>([]);
  const [slot, setSlot] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (view.state === "done" && mine && theirs) {
    const m = mine as P;
    const t = theirs as P;
    const overlap = m.ideas.filter((i) => t.ideas.includes(i));
    const slotMatch = m.slot === t.slot;
    return (
      <div>
        <p className="mb-5 text-center font-display text-3xl text-ink">{overlap.length ? "You've got a plan." : "Time to negotiate."}</p>
        <ul className="space-y-2.5">
          {ideas.map((d, i) => {
            const me = m.ideas.includes(i);
            const them = t.ideas.includes(i);
            if (!me && !them) return null;
            return (
              <li key={d.id}>
                <FlipIn i={i}>
                  <div className={cn("flex items-center gap-3 rounded-2xl border p-4", me && them ? "border-transparent bg-litmus text-white" : "border-line bg-surface text-ink")}>
                    <span className="text-2xl">{d.emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{d.title}</p>
                      <p className={cn("text-xs", me && them ? "text-white/80" : "text-ink-3")}>{me && them ? "You both picked this" : me ? "Your pick" : `${partnerName}'s pick`} · ~{d.budget} each</p>
                    </div>
                  </div>
                </FlipIn>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-center text-sm text-ink-2">
          {slotMatch ? (
            <>You both said <strong className="text-ink">{SLOTS.find((s) => s.id === m.slot)?.label.toLowerCase()}</strong>.</>
          ) : (
            <>You said {SLOTS.find((s) => s.id === m.slot)?.label.toLowerCase()}, {partnerName} said {SLOTS.find((s) => s.id === t.slot)?.label.toLowerCase()}.</>
          )}
        </p>
        <Link href={`/bonds/${bondId}`} className="mt-8 flex min-h-[56px] items-center justify-center rounded-full bg-litmus font-semibold text-white shadow-[0_10px_30px_-12px_rgb(124_77_255/0.7)]">
          Go to the reveal
        </Link>
      </div>
    );
  }
  if (view.state === "waiting") return <WaitingCard partnerName={partnerName} isDemo />;

  const toggle = (i: number) => setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : p.length < 2 ? [...p, i] : [p[1], i]));

  return (
    <div>
      <p className="mb-5 text-center text-ink-2">Pick two first dates you'd actually enjoy.</p>
      <div className="grid grid-cols-2 gap-3">
        {ideas.map((d, i) => (
          <button
            key={d.id}
            onClick={() => toggle(i)}
            aria-pressed={picked.includes(i)}
            className={cn("flex min-h-[132px] flex-col justify-between rounded-[22px] border p-4 text-left transition-all", picked.includes(i) ? "border-transparent bg-ink text-paper shadow-[var(--shadow-lift)]" : "border-line bg-surface text-ink")}
          >
            <span className="text-3xl">{d.emoji}</span>
            <span>
              <span className="block text-sm font-semibold leading-snug">{d.title}</span>
              <span className={cn("text-xs", picked.includes(i) ? "text-paper/60" : "text-ink-3")}>~{d.budget} each</span>
            </span>
          </button>
        ))}
      </div>
      <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wider text-ink-3">When works?</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Time slot">
        {SLOTS.map((s) => (
          <button key={s.id} role="radio" aria-checked={slot === s.id} onClick={() => setSlot(s.id)} className={cn("min-h-[44px] rounded-full border px-4 text-sm font-semibold", slot === s.id ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-2")}>
            {s.label}
          </button>
        ))}
      </div>
      <Button
        variant="primary"
        size="lg"
        block
        className="mt-6"
        disabled={picked.length !== 2 || !slot}
        loading={pending}
        onClick={() =>
          start(async () => {
            if (handle(await submitRound(bondId, 4, "answer", { ideas: picked, slot }))) router.refresh();
          })
        }
      >
        Lock in my picks
      </Button>
    </div>
  );
}
