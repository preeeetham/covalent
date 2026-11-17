"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles, Moon, Zap } from "lucide-react";
import type { BatchItem } from "@/lib/data/batch";
import { passPerson, reactToPerson } from "@/app/actions/bonds";
import { spendCatalyst } from "@/app/actions/dates";
import { Button } from "@/components/ui/button";
import { handle, toast } from "@/components/ui/toast";
import { Sheet } from "@/components/ui/sheet";
import { Countdown } from "./countdown";
import { PersonHeader, PersonPhoto, PromptBlock, SharedElements } from "./person-card";
import { BondAtoms } from "@/components/brand/atoms";

const PASS_REASONS = ["Not my type", "Different values", "Too far apart", "Just not feeling it"];

export function BatchView({
  items,
  myElements,
  nextReset,
  poolExhausted,
  slotsFull,
  catalysts,
}: {
  items: BatchItem[];
  myElements: string[];
  nextReset: string;
  poolExhausted: boolean;
  slotsFull: boolean;
  catalysts: number;
}) {
  const router = useRouter();
  const [decided, setDecided] = useState<Record<string, "reacted" | "passed">>({});
  const [passing, setPassing] = useState<BatchItem | null>(null);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const pendingItems = items.filter((i) => i.status === "pending" && !decided[i.id]);
  const handledCount = items.length - pendingItems.length;

  const react = (item: BatchItem) =>
    start(async () => {
      setBusy(item.id);
      const res = await reactToPerson(item.id);
      setBusy(null);
      if (!handle(res)) return;
      setDecided((d) => ({ ...d, [item.id]: "reacted" }));
      if (item.person.is_demo && res.data) {
        toast.ok(`${item.person.first_name} accepted. Round 1 is open.`);
        router.push(`/bonds/${res.data}`);
      } else {
        toast.ok(`Reaction sent. We'll let you know when ${item.person.first_name} responds.`);
        router.refresh();
      }
    });

  const pass = (item: BatchItem, reason?: string) =>
    start(async () => {
      setPassing(null);
      setDecided((d) => ({ ...d, [item.id]: "passed" }));
      const res = await passPerson(item.id, reason);
      if (!res.ok) {
        setDecided(({ [item.id]: _, ...rest }) => rest);
        toast.error(res.error);
      }
    });

  const extraPick = () =>
    start(async () => {
      if (handle(await spendCatalyst("pick"), "One more person added to today's batch.")) router.refresh();
    });

  if (!items.length && poolExhausted) {
    return (
      <EmptyState
        title="You've met everyone here, for now."
        body="New people join every week. Your next batch arrives in"
        nextReset={nextReset}
      />
    );
  }

  return (
    <section aria-label="Today's batch">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-2">
          <span className="font-semibold text-ink">{pendingItems.length}</span> of {items.length} left today
        </p>
        <p className="font-mono text-xs text-ink-3">
          next batch <Countdown to={nextReset} />
        </p>
      </div>

      {slotsFull && pendingItems.length > 0 && (
        <div className="mb-4 rounded-2xl border border-line bg-surface p-4 text-sm text-ink-2">
          All your bond slots are full. <Link href="/bonds" className="font-semibold text-bond-text underline-offset-2 hover:underline">Finish or dissolve one</Link> to start a new reaction.
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence initial={false} mode="popLayout">
          {pendingItems.map((item, idx) => (
            <motion.article
              key={item.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24, scale: 0.97, transition: { duration: 0.28 } }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--shadow-soft)]"
            >
              <PersonPhoto person={item.person} level={0} label="Sharpens as you play · 4 rounds to reveal" priority={idx === 0} />
              <div className="space-y-5 p-5">
                <PersonHeader person={item.person} />
                {item.why_text && (
                  <div className="relative rounded-2xl bg-bond-soft p-4">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-bond-text">
                      <Sparkles className="size-3.5" /> Why you two
                    </p>
                    <p className="text-[15px] leading-relaxed text-ink">{item.why_text}</p>
                  </div>
                )}
                <SharedElements person={item.person} myElements={myElements} />
                {item.person.prompts[0] && <PromptBlock promptId={item.person.prompts[0].prompt_id} answer={item.person.prompts[0].answer} />}
                <div className="flex gap-3 pt-1">
                  <Button variant="secondary" size="lg" className="flex-1" onClick={() => setPassing(item)} disabled={pending}>
                    Not for me
                  </Button>
                  <Button variant="primary" size="lg" className="flex-[1.4]" onClick={() => react(item)} loading={busy === item.id} disabled={pending || slotsFull}>
                    Start a reaction
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {pendingItems.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <EmptyState
            title="That's today's batch."
            body={handledCount ? "Go live your life. Seriously — the best people are offline right now too. Next batch in" : "Next batch in"}
            nextReset={nextReset}
          >
            {catalysts > 0 && (
              <Button variant="secondary" size="sm" className="mt-5" onClick={extraPick} loading={pending}>
                <Zap className="size-4 text-bond-text" /> Use a catalyst for one more pick
              </Button>
            )}
          </EmptyState>
        </motion.div>
      )}

      <Sheet open={!!passing} onClose={() => setPassing(null)} title={`Not ${passing?.person.first_name}?`}>
        <p className="mb-4 text-sm text-ink-2">Optional: tell us why. It quietly improves tomorrow's batch. {passing?.person.first_name} never finds out.</p>
        <div className="flex flex-wrap gap-2">
          {PASS_REASONS.map((r) => (
            <button key={r} onClick={() => passing && pass(passing, r)} className="min-h-[44px] rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink hover:bg-surface-2">
              {r}
            </button>
          ))}
        </div>
        <Button variant="ink" block size="lg" className="mt-5" onClick={() => passing && pass(passing)}>
          Skip without a reason
        </Button>
      </Sheet>
    </section>
  );
}

function EmptyState({ title, body, nextReset, children }: { title: string; body: string; nextReset: string; children?: React.ReactNode }) {
  return (
    <div className="mt-2 flex flex-col items-center rounded-[28px] border border-line bg-surface px-6 py-10 text-center shadow-[var(--shadow-soft)]">
      <BondAtoms rounds={2} className="mb-4 max-w-[200px]" />
      <Moon className="mb-3 size-5 text-ink-3" aria-hidden />
      <h2 className="font-display text-3xl leading-tight text-ink">{title}</h2>
      <p className="mt-2 max-w-[30ch] text-ink-2">{body}</p>
      <p className="mt-3 font-mono text-2xl text-ink">
        <Countdown to={nextReset} />
      </p>
      {children}
      <Link href="/bonds" className="mt-6 text-sm font-semibold text-bond-text underline-offset-4 hover:underline">
        Check your bonds →
      </Link>
    </div>
  );
}
