"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function StepShell({
  eyebrow,
  title,
  sub,
  children,
  cta = "Continue",
  canNext,
  loading,
  onNext,
  onBack,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
  cta?: string;
  canNext: boolean;
  loading?: boolean;
  onNext: () => void;
  onBack?: () => void;
}) {
  return (
    <motion.div key={title} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} className="flex flex-1 flex-col">
      {eyebrow && <p className="mb-2 font-mono text-xs uppercase tracking-widest text-ink-3">{eyebrow}</p>}
      <h1 className="font-display text-[34px] leading-[1.08] text-ink">{title}</h1>
      {sub && <p className="mt-2 text-ink-2">{sub}</p>}
      <div className="mt-7 flex-1">{children}</div>
      <div className="sticky bottom-0 -mx-5 mt-8 flex gap-3 bg-gradient-to-t from-paper via-paper to-transparent px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-6">
        {onBack && (
          <Button size="lg" onClick={onBack} className="px-5" aria-label="Back">
            ←
          </Button>
        )}
        <Button variant="primary" size="lg" block onClick={onNext} disabled={!canNext} loading={loading}>
          {cta}
        </Button>
      </div>
    </motion.div>
  );
}
