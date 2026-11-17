"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { unblock } from "@/app/actions/safety";
import { handle } from "@/components/ui/toast";

export function BlockedList({ people }: { people: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!people.length) return <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-2">You haven't blocked anyone.</p>;
  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {people.map((p) => (
        <li key={p.id} className="flex min-h-[48px] items-center justify-between px-4">
          <span className="text-ink">{p.name}</span>
          <button disabled={pending} onClick={() => start(async () => { if (handle(await unblock(p.id), "Unblocked.")) router.refresh(); })} className="min-h-[44px] text-sm font-semibold text-bond">
            Unblock
          </button>
        </li>
      ))}
    </ul>
  );
}
