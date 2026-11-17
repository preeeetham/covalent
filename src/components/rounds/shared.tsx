"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BondAtoms } from "@/components/brand/atoms";
import type { RoundView } from "@/lib/rounds/logic";

export type RoundProps = {
  bondId: string;
  partnerName: string;
  view: RoundView;
  mine: unknown;
  theirs: unknown;
  nextRound: number | null;
};

export function WaitingCard({ partnerName, isDemo, text }: { partnerName: string; isDemo?: boolean; text?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col items-center rounded-[28px] border border-line bg-surface px-6 py-10 text-center shadow-[var(--shadow-soft)]">
      <BondAtoms rounds={1} className="mb-2 max-w-[220px]" />
      <h2 className="font-display text-3xl text-ink">Your answers are in.</h2>
      <p className="mt-2 max-w-[32ch] text-ink-2">{text ?? `Waiting for ${partnerName}. Answers stay hidden until you've both played — no copying.`}</p>
      {isDemo && (
        <p className="mt-4 flex items-center gap-2 text-sm text-ink-3">
          <span className="flex gap-1">
            <span className="typing-dot size-1.5 rounded-full bg-ink-3" />
            <span className="typing-dot size-1.5 rounded-full bg-ink-3" />
            <span className="typing-dot size-1.5 rounded-full bg-ink-3" />
          </span>
          {partnerName} is thinking
        </p>
      )}
    </motion.div>
  );
}

export function ResultFooter({ bondId, nextRound, children }: { bondId: string; nextRound: number | null; children?: React.ReactNode }) {
  return (
    <div className="mt-8 space-y-3">
      {children}
      {nextRound ? (
        <Link href={`/bonds/${bondId}/round/${nextRound}`} className="flex min-h-[56px] items-center justify-center rounded-full bg-litmus font-semibold text-white shadow-[0_10px_30px_-12px_rgb(124_77_255/0.7)]">
          On to Round {nextRound}
        </Link>
      ) : (
        <Link href={`/bonds/${bondId}`} className="flex min-h-[56px] items-center justify-center rounded-full bg-litmus font-semibold text-white">
          Back to the bond
        </Link>
      )}
      <Link href={`/bonds/${bondId}`} className="flex min-h-[44px] items-center justify-center text-sm font-semibold text-ink-2">
        Go to chat
      </Link>
    </div>
  );
}

/** Two answers flipping in at the same moment. */
export function FlipIn({ i = 0, children }: { i?: number; children: React.ReactNode }) {
  return (
    <motion.div initial={{ rotateX: -80, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 220, damping: 22, delay: i * 0.06 }} style={{ transformPerspective: 600 }}>
      {children}
    </motion.div>
  );
}
