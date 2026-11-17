"use client";

import { motion } from "motion/react";
import { chemistryBand } from "@/lib/rounds/logic";
import { cn } from "@/lib/utils";

/** The chemistry score drawn on a litmus (pH) strip with a marker. */
export function LitmusStrip({ value, compact, className }: { value: number; compact?: boolean; className?: string }) {
  const band = chemistryBand(value);
  return (
    <div className={cn("w-full", className)}>
      {!compact && (
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-medium text-ink-2">Chemistry</span>
          <span>
            <span className="font-display text-lg font-semibold text-ink">{value}</span>
            <span className="ml-1.5 text-ink-2">· {band.label}</span>
          </span>
        </div>
      )}
      <div className="relative h-2.5 rounded-full bg-litmus" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} aria-label={`Chemistry ${value}, ${band.label}`}>
        <motion.div
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface bg-ink shadow-md"
          initial={false}
          animate={{ left: `${value}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </div>
  );
}

/** 4-segment ring: rounds completed. Doubles as the unblur meter. */
export function ProgressRing({ done, size = 56, children }: { done: number; size?: number; children?: React.ReactNode }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const seg = c / 4;
  const gap = 5;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={4}
            strokeLinecap="round"
            stroke={i < done ? "url(#ring-litmus)" : "var(--line)"}
            strokeDasharray={`${seg - gap} ${c - seg + gap}`}
            strokeDashoffset={-i * seg}
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
      <span className="sr-only">{done} of 4 rounds complete</span>
    </div>
  );
}
