"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Flag, Unlink, BellRing } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { handle } from "@/components/ui/toast";
import { dissolve, sendNudge } from "@/app/actions/bonds";
import { ReportSheet } from "./report-sheet";

const DISSOLVE_REASONS = ["Not feeling the chemistry", "Met someone", "Taking a break", "Prefer not to say"];

export function BondMenu({ bondId, partnerId, partnerName, canNudge, closed }: { bondId: string; partnerId: string; partnerName: string; canNudge: boolean; closed: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "dissolve" | "report">("menu");
  const [pending, start] = useTransition();

  const close = () => {
    setOpen(false);
    setTimeout(() => setMode("menu"), 300);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full text-ink hover:bg-surface-2" aria-label="Bond options">
        <MoreHorizontal className="size-6" />
      </button>
      <Sheet open={open && mode !== "report"} onClose={close} title={mode === "dissolve" ? `Dissolve with ${partnerName}?` : partnerName}>
        {mode === "menu" ? (
          <div className="space-y-2.5">
            {canNudge && (
              <Button block onClick={() => start(async () => { if (handle(await sendNudge(bondId), "Nudge sent. Once is enough.")) { close(); router.refresh(); } })} loading={pending}>
                <BellRing className="size-4" /> Send one gentle nudge
              </Button>
            )}
            {!closed && (
              <Button block onClick={() => setMode("dissolve")}>
                <Unlink className="size-4" /> Dissolve this bond
              </Button>
            )}
            <Button block variant="danger" onClick={() => setMode("report")}>
              <Flag className="size-4" /> Report or block
            </Button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-ink-2">
              {partnerName} will see a kind note that the bond has ended, never your reason. It frees up a slot for you.
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {DISSOLVE_REASONS.map((r) => (
                <button
                  key={r}
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      if (handle(await dissolve(bondId, r), "Dissolved, kindly.")) {
                        close();
                        router.push("/bonds");
                      }
                    })
                  }
                  className="min-h-[44px] rounded-full border border-line px-4 text-sm font-medium text-ink hover:bg-surface-2"
                >
                  {r}
                </button>
              ))}
            </div>
            <Button block variant="ghost" onClick={() => setMode("menu")}>
              Keep the bond
            </Button>
          </div>
        )}
      </Sheet>
      <ReportSheet open={open && mode === "report"} onClose={close} targetId={partnerId} name={partnerName} bondId={bondId} />
    </>
  );
}

