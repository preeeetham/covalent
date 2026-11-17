"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ARCHETYPE_BY_ID } from "@/content/archetypes";
import { ArchetypeTile } from "@/components/brand/element-tile";
import { Button } from "@/components/ui/button";
import { handle } from "@/components/ui/toast";
import { completeOnboarding } from "@/app/actions/onboarding";

/** Onboarding's peak moment: your element. Shareable — the free viral loop. */
export function ResultStep({ archetypeId, name }: { archetypeId: string; name: string }) {
  const a = ARCHETYPE_BY_ID[archetypeId];
  const router = useRouter();
  const [pending, start] = useTransition();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-3">{name}, you are</p>
      <motion.div initial={{ scale: 0.6, rotate: -8, opacity: 0 }} animate={show ? { scale: 1, rotate: 0, opacity: 1 } : {}} transition={{ type: "spring", stiffness: 180, damping: 14 }} className="mt-6 w-56">
        <ArchetypeTile symbol={a.symbol} number={a.number} name={a.name} />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={show ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.35 }}>
        <h1 className="mt-8 font-display text-4xl leading-tight text-ink">{a.tagline}</h1>
        <p className="mx-auto mt-3 max-w-[34ch] text-ink-2">{a.description}</p>
      </motion.div>
      <div className="mt-auto w-full space-y-3 pt-10">
        <a href="/api/card" download={`covalent-${a.id}.png`} className="flex min-h-[52px] w-full items-center justify-center rounded-full border border-line bg-surface font-semibold text-ink">
          Download my element card
        </a>
        <Button
          variant="primary"
          size="lg"
          block
          loading={pending}
          onClick={() =>
            start(async () => {
              if (handle(await completeOnboarding())) router.push("/today");
            })
          }
        >
          See today's batch
        </Button>
      </div>
    </div>
  );
}
