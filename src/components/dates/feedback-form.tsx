"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { handle } from "@/components/ui/toast";
import { leaveFeedback } from "@/app/actions/dates";
import { cn } from "@/lib/utils";

function Q({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink">{label}</p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={label}>
        {[true, false].map((v) => (
          <button key={String(v)} role="radio" aria-checked={value === v} onClick={() => onChange(v)} className={cn("min-h-[44px] rounded-full border text-sm font-semibold", value === v ? "border-ink bg-ink text-paper" : "border-line text-ink-2")}>
            {v ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Private feedback. "Felt unsafe" automatically opens a report for the safety team. */
export function FeedbackForm({ planId, partnerName }: { planId: string; partnerName: string }) {
  const router = useRouter();
  const [showed, setShowed] = useState<boolean | null>(null);
  const [safe, setSafe] = useState<boolean | null>(null);
  const [again, setAgain] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  return (
    <div className="mt-4 space-y-4">
      <Q label={`Did ${partnerName} show up?`} value={showed} onChange={setShowed} />
      <Q label="Did you feel safe?" value={safe} onChange={setSafe} />
      {safe === false && <p className="rounded-2xl bg-acid-soft p-3 text-sm text-ink">We're sorry. This goes straight to our safety team as a report, and {partnerName} won't know it came from you.</p>}
      <Q label="Would you meet again?" value={again} onChange={setAgain} />
      <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2} placeholder="Anything we should know? (private)" aria-label="Private note" className="w-full rounded-2xl border border-line bg-surface p-3 text-[15px] text-ink" />
      <Button
        variant="ink"
        size="lg"
        block
        disabled={showed === null || safe === null || again === null}
        loading={pending}
        onClick={() =>
          start(async () => {
            if (handle(await leaveFeedback(planId, { showed_up: showed!, felt_safe: safe!, meet_again: again!, note: note || undefined }), "Thanks. That's private, and it makes Covalent better.")) router.refresh();
          })
        }
      >
        Send private feedback
      </Button>
      <p className="text-center text-xs text-ink-3">Only "showed up" affects {partnerName}'s reliability score. The rest stays with us.</p>
    </div>
  );
}
