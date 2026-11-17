"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { photoUrl } from "@/lib/photos/url";
import { ProgressRing } from "@/components/brand/litmus";
import { chemistryBand } from "@/lib/rounds/logic";

/**
 * The peak moment (peak-end rule). Choreography:
 * ring completes → litmus sweep → photo goes blur → sharp with a slight scale-in →
 * name and a line fade up → soft haptic. No confetti.
 */
export function RevealMoment({ bondId, partnerName, photoId, chemistry, line }: { bondId: string; partnerName: string; photoId: string | null; chemistry: number; line: string | null }) {
  const reduce = useReducedMotion();
  const [animStage, setStage] = useState(0);
  const stage = reduce ? 3 : animStage;

  useEffect(() => {
    if (reduce) return;
    const t1 = setTimeout(() => setStage(1), 700); // ring complete → sweep
    const t2 = setTimeout(() => setStage(2), 1300); // photo sharpens
    const t3 = setTimeout(() => {
      setStage(3);
      try {
        navigator.vibrate?.([18, 40, 28]);
      } catch {}
    }, 2500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [reduce]);

  const band = chemistryBand(chemistry);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-litmus"
        initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.9 }}
        animate={stage >= 1 ? { clipPath: "inset(0 0% 0 0)", opacity: stage >= 2 ? 0.12 : 0.9 } : {}}
        transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      />

      <div className="relative mb-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
          <ProgressRing done={4} size={280}>
            <div className="relative size-[248px] overflow-hidden rounded-full bg-surface-2">
              {photoId && (
                <>
                  {/* Heaviest blur underneath, original fades in over it. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl(photoId, 3)} alt="" className="absolute inset-0 size-full scale-110 object-cover" />
                  <motion.img
                    src={photoUrl(photoId, "original")}
                    alt={`${partnerName}, revealed`}
                    className="absolute inset-0 size-full object-cover"
                    initial={{ opacity: 0, scale: 1.06, filter: "blur(18px)" }}
                    animate={stage >= 2 ? { opacity: 1, scale: 1, filter: "blur(0px)" } : {}}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </>
              )}
            </div>
          </ProgressRing>
        </motion.div>
      </div>

      <motion.div className="relative text-center" initial={{ opacity: 0, y: 14 }} animate={stage >= 3 ? { opacity: 1, y: 0 } : {}} transition={{ type: "spring", stiffness: 160, damping: 20 }}>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-2">Bond formed · chemistry {chemistry} · {band.label}</p>
        <h1 className="mt-2 font-display text-6xl leading-none text-ink">{partnerName}</h1>
        {line && <p className="mx-auto mt-4 max-w-[30ch] font-display text-lg leading-snug text-ink-2">"{line}"</p>}
        <p className="mx-auto mt-6 max-w-[32ch] text-ink-2">You got here on conversation, not a photo. Now make it real.</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href={`/bonds/${bondId}#plan`} className="flex min-h-[56px] items-center justify-center rounded-full bg-ink px-8 font-semibold text-paper">
            Plan a first date
          </Link>
          <Link href={`/bonds/${bondId}`} className="flex min-h-[44px] items-center justify-center text-sm font-semibold text-ink-2">
            Keep chatting first
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
