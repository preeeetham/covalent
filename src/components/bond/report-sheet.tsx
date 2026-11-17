"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { handle } from "@/components/ui/toast";
import { block, report } from "@/app/actions/safety";
import { cn } from "@/lib/utils";

const REASONS = [
  { id: "fake", label: "Fake or impersonating someone" },
  { id: "harassment", label: "Harassment or hateful messages" },
  { id: "inappropriate", label: "Inappropriate photos or content" },
  { id: "money", label: "Asked for money or contact details" },
  { id: "underage", label: "Might be under 18" },
  { id: "unsafe", label: "Made me feel unsafe" },
  { id: "other", label: "Something else" },
];

export function ReportSheet({ open, onClose, targetId, name, bondId }: { open: boolean; onClose: () => void; targetId: string; name: string; bondId?: string }) {
  const router = useRouter();
  const [reason, setReason] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      if (!reason) return;
      if (!handle(await report(targetId, reason, detail || undefined, bondId))) return;
      if (alsoBlock) {
        if (!handle(await block(targetId))) return;
      }
      handle({ ok: true }, alsoBlock ? `Reported and blocked. ${name} can't see you any more.` : "Report sent. Our team reviews every one.");
      onClose();
      if (alsoBlock) router.push("/bonds");
    });

  const blockOnly = () =>
    start(async () => {
      if (handle(await block(targetId), `Blocked. You and ${name} won't see each other again.`)) {
        onClose();
        router.push("/bonds");
      }
    });

  return (
    <Sheet open={open} onClose={onClose} title={`Report ${name}`}>
      <p className="mb-3 text-sm text-ink-2">Reports are confidential. {name} won't know it was you.</p>
      <div className="space-y-2" role="radiogroup" aria-label="Reason">
        {REASONS.map((r) => (
          <button
            key={r.id}
            role="radio"
            aria-checked={reason === r.id}
            onClick={() => setReason(r.id)}
            className={cn("flex min-h-[48px] w-full items-center rounded-2xl border px-4 text-left text-sm font-medium", reason === r.id ? "border-ink bg-surface-2 text-ink" : "border-line text-ink-2 hover:bg-surface-2")}
          >
            {r.label}
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-medium text-ink-2">
        Anything else? (optional)
        <textarea value={detail} onChange={(e) => setDetail(e.target.value)} maxLength={500} rows={3} className="mt-1.5 w-full rounded-2xl border border-line bg-surface p-3 text-ink outline-none focus:border-bond" />
      </label>
      <label className="mt-3 flex min-h-[44px] items-center gap-3 text-sm text-ink">
        <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} className="size-5 accent-[var(--bond)]" />
        Also block {name}
      </label>
      <Button variant="ink" block size="lg" className="mt-4" disabled={!reason} loading={pending} onClick={submit}>
        Send report
      </Button>
      <Button variant="ghost" block className="mt-2" onClick={blockOnly} disabled={pending}>
        <Ban className="size-4" /> Just block, no report
      </Button>
    </Sheet>
  );
}
