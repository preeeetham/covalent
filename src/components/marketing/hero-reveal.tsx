"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ProgressRing } from "@/components/brand/litmus";

/**
 * Scroll-driven blur → sharp: the product's core mechanic, demonstrated before signup.
 *
 * Performance: animating `filter: blur()` per scroll frame is expensive and lags the
 * compositor, which reads as jitter. Instead a pre-blurred image (rendered at build time by
 * scripts/hero-images.ts) sits under the sharp one, and scroll only drives the sharp
 * layer's opacity — a compositor-only property. No runtime blur, so the LCP paint is cheap.
 */
export function HeroReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.2"] });
  const sharp = useTransform(scrollYProgress, [0.05, 0.85], reduce ? [1, 1] : [0, 1]);
  const label = useTransform(scrollYProgress, (p) => {
    const r = Math.min(4, Math.floor((p / 0.85) * 4.999));
    return r >= 4 ? "Revealed" : `${4 - r} rounds to reveal`;
  });

  return (
    <div ref={ref} className="relative mx-auto w-full max-w-[380px]">
      <div className="absolute -inset-6 -z-10 rounded-[48px] bg-litmus opacity-20 blur-3xl [transform:translateZ(0)]" aria-hidden />
      <div className="overflow-hidden rounded-[36px] border border-line bg-surface shadow-[var(--shadow-lift)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#ffd5c2]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing/hero-blur.webp" alt="" aria-hidden width={190} height={238} fetchPriority="high" decoding="async" className="absolute inset-0 size-full object-cover" />
          <motion.img
            src="/landing/hero.webp"
            width={760}
            height={950}
            decoding="async"
            alt="An illustrated person, coming into focus"
            style={{ opacity: sharp, willChange: "opacity" }}
            className="absolute inset-0 size-full object-cover"
          />
          <motion.span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1C1524]">{label}</motion.span>
        </div>
        <div className="flex items-center gap-4 p-5">
          <ProgressRing done={2} size={52}>
            <span className="font-mono text-[10px] text-ink-2">2/4</span>
          </ProgressRing>
          <div className="min-w-0">
            <p className="font-display text-2xl text-ink">Meera, 26</p>
            <p className="truncate text-sm text-ink-2">QA Engineer · from Coimbatore · runs marathons</p>
          </div>
        </div>
        <div className="mx-5 mb-5 rounded-2xl bg-bond-soft p-4 text-sm text-ink">
          <span className="font-bold text-bond-text">Why you two · </span>You'd both take the job in another city, and you both save before you spend.
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-3">Scroll to play a round. (Illustrated demo profile.)</p>
    </div>
  );
}
