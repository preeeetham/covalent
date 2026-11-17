"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicProfile } from "@/lib/data/profile";
import { answerInvite } from "@/app/actions/bonds";
import { Button } from "@/components/ui/button";
import { handle } from "@/components/ui/toast";
import { PersonHeader, PersonPhoto, SharedElements } from "./person-card";

type Invite = { id: string; why_text: string | null; person: PublicProfile };

export function InviteList({ invites, myElements }: { invites: Invite[]; myElements: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  const respond = (id: string, accept: boolean) =>
    start(async () => {
      setBusy(id + accept);
      const ok = handle(await answerInvite(id, accept), accept ? "Bond started. Round 1 is open." : "Declined, kindly.");
      setBusy(null);
      if (ok && accept) router.push(`/bonds/${id}`);
      else router.refresh();
    });

  return (
    <section aria-label="Invites" className="mb-8">
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-react">
        {invites.length} {invites.length === 1 ? "person wants" : "people want"} to start a reaction with you
      </h2>
      <div className="space-y-4">
        {invites.map((inv) => (
          <article key={inv.id} className="overflow-hidden rounded-[28px] border-2 border-react/30 bg-surface shadow-[var(--shadow-soft)]">
            <div className="flex gap-4 p-4">
              <PersonPhoto person={inv.person} level={0} className="w-28 shrink-0 rounded-2xl" />
              <div className="min-w-0 flex-1">
                <PersonHeader person={inv.person} compact />
              </div>
            </div>
            <div className="space-y-4 px-4 pb-4">
              {inv.why_text && <p className="text-sm leading-relaxed text-ink-2">{inv.why_text}</p>}
              <SharedElements person={inv.person} myElements={myElements} />
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => respond(inv.id, false)} loading={busy === inv.id + "false"} disabled={pending}>
                  Decline
                </Button>
                <Button variant="primary" className="flex-[1.4]" onClick={() => respond(inv.id, true)} loading={busy === inv.id + "true"} disabled={pending}>
                  Accept the reaction
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
