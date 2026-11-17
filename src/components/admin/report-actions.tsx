"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { handle } from "@/components/ui/toast";
import { resolveReport } from "@/app/actions/account";

export function ReportActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const go = (o: "resolved" | "actioned") => start(async () => { if (handle(await resolveReport(id, o), o === "actioned" ? "Marked as actioned." : "Resolved, no action.")) router.refresh(); });
  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => go("resolved")} disabled={pending}>
        No action
      </Button>
      <Button size="sm" variant="ink" onClick={() => go("actioned")} disabled={pending}>
        Action taken
      </Button>
    </div>
  );
}
