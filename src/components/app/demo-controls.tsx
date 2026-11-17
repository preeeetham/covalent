"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, RefreshCw, FastForward, RotateCcw } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { handle } from "@/components/ui/toast";
import { demoNewBatch, demoReset, demoSkipWaits } from "@/app/actions/account";

/** Floating flask: evaluator-only shortcuts to see the whole loop in minutes. */
export function DemoControls() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [which, setWhich] = useState<string | null>(null);
  const router = useRouter();

  const go = (key: string, fn: () => Promise<{ ok: true; data?: unknown } | { ok: false; error: string }>, ok: string, href?: string) =>
    start(async () => {
      setWhich(key);
      if (handle(await fn(), ok)) {
        setOpen(false);
        if (href) router.push(href);
        router.refresh();
      }
      setWhich(null);
    });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative flex min-h-[52px] min-w-[48px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 text-[11px] font-semibold text-bond-text"
        aria-label="Demo controls"
      >
        <FlaskConical className="size-[22px]" strokeWidth={2} />
        <span>Demo</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Demo controls">
        <p className="mb-4 text-sm text-ink-2">Only evaluator accounts see this. It compresses a few days of real use into a few minutes.</p>
        <div className="space-y-2.5">
          <Button block variant="secondary" loading={pending && which === "batch"} onClick={() => go("batch", demoNewBatch, "Fresh batch ready.", "/today")}>
            <RefreshCw className="size-4" /> New batch now
          </Button>
          <Button block variant="secondary" loading={pending && which === "skip"} onClick={() => go("skip", demoSkipWaits, "Demo partners have made their moves.")}>
            <FastForward className="size-4" /> Skip partner wait
          </Button>
          <Button block variant="danger" loading={pending && which === "reset"} onClick={() => go("reset", demoReset, "Account reset to its starting scenario.", "/today")}>
            <RotateCcw className="size-4" /> Reset this account
          </Button>
          <p className="pt-1 text-xs text-ink-3">Reset also rebuilds any bond you share with another evaluator account.</p>
        </div>
      </Sheet>
    </>
  );
}
