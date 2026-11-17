"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { handle } from "@/components/ui/toast";
import { reveal } from "@/app/actions/bonds";

export function RevealCta({ bondId, tapped, partnerName }: { bondId: string; tapped: boolean; partnerName: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="mt-6 rounded-[24px] border border-line bg-surface p-5 text-center shadow-[var(--shadow-soft)]">
      <p className="font-display text-2xl text-ink">All four rounds done.</p>
      <p className="mt-1 text-sm text-ink-2">
        {tapped ? `You're ready. Waiting for ${partnerName} to tap reveal too.` : "Photos go fully sharp when you both tap reveal."}
      </p>
      {!tapped && (
        <Button
          variant="primary"
          size="lg"
          block
          className="mt-4"
          loading={pending}
          onClick={() =>
            start(async () => {
              if (handle(await reveal(bondId))) router.push(`/bonds/${bondId}/reveal`);
            })
          }
        >
          <Eye className="size-5" /> Reveal
        </Button>
      )}
    </div>
  );
}
