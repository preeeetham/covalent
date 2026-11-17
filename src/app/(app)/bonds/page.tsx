import type { Metadata } from "next";
import Link from "next/link";
import { requireViewer } from "@/lib/auth";
import { listBonds, slotLimit } from "@/lib/data/bonds";
import { BlurPhoto } from "@/components/brand/blur-photo";
import { ProgressRing, LitmusStrip } from "@/components/brand/litmus";
import { hoursLeft, cn } from "@/lib/utils";
import { BondAtoms } from "@/components/brand/atoms";
import { levelFor } from "@/lib/photos/level";

export const metadata: Metadata = { title: "Bonds" };

function statusLine(b: { status: string; round: number; user_a: string }, me: string, myMove: boolean, name: string) {
  if (b.status === "invited") return `Waiting for ${name} to accept`;
  if (b.status === "revealed") return "Revealed · plan a date";
  if (b.round >= 4) return myMove ? "Your move · tap Reveal" : `Waiting for ${name} to reveal`;
  return myMove ? `Your move · Round ${b.round + 1}` : `Waiting for ${name} · Round ${b.round + 1}`;
}

const PAST_LABEL: Record<string, string> = { dissolved: "Dissolved", expired: "Expired", declined: "Declined" };

export default async function BondsPage() {
  const viewer = await requireViewer();
  const { open, past } = await listBonds(viewer);
  const limit = slotLimit(viewer);
  const empty = Math.max(0, limit - open.length);

  return (
    <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-6">
        <h1 className="font-display text-[40px] leading-none text-ink">Bonds</h1>
        <p className="mt-2 text-sm text-ink-2">
          Up to {limit} at a time, so each one gets real attention. Quiet for 72 hours and a bond dissolves on its own.
        </p>
      </header>

      <ul className="space-y-3">
        {open.map(({ bond, partner, myMove }) => (
          <li key={bond.id}>
            <Link
              href={`/bonds/${bond.id}`}
              className={cn(
                "flex items-center gap-4 rounded-[24px] border bg-surface p-3 pr-4 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.99]",
                myMove ? "border-react/40" : "border-line",
              )}
            >
              <div className="relative">
                <ProgressRing done={bond.round} size={76}>
                  <BlurPhoto photoId={partner.photoIds[0]} level={levelFor(bond)} alt={partner.first_name} sizes="size-[60px]" className="rounded-full" />
                </ProgressRing>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-display text-xl text-ink">{partner.first_name}</p>
                  {bond.status !== "revealed" && <span className="shrink-0 font-mono text-[11px] text-ink-3">{hoursLeft(bond.expires_at)}h left</span>}
                </div>
                <p className={cn("mt-0.5 text-sm", myMove ? "font-semibold text-react" : "text-ink-2")}>{statusLine(bond, viewer.id, myMove, partner.first_name)}</p>
                <LitmusStrip value={bond.chemistry} compact className="mt-2.5" />
              </div>
            </Link>
          </li>
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <li key={`empty-${i}`}>
            <Link href="/today" className="flex items-center gap-4 rounded-[24px] border-2 border-dashed border-line p-3 pr-4 text-ink-3 hover:text-ink-2">
              <span className="grid size-[76px] place-items-center rounded-full border-2 border-dashed border-line font-display text-2xl">+</span>
              <span className="text-sm">Empty slot · start a reaction from Today</span>
            </Link>
          </li>
        ))}
      </ul>

      {open.length === 0 && (
        <div className="mt-8 text-center">
          <BondAtoms rounds={0} className="mx-auto max-w-[220px]" />
          <p className="mt-2 font-display text-2xl text-ink">No reaction yet. Give it time.</p>
          <p className="mt-1 text-sm text-ink-2">Start one from today's batch.</p>
        </div>
      )}

      {past.length > 0 && (
        <details className="group mt-10">
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink-2">
            Past bonds ({past.length}) <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <ul className="mt-2 divide-y divide-line rounded-[20px] border border-line bg-surface">
            {past.map(({ bond, partner }) => (
              <li key={bond.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink">{partner.first_name}</span>
                <span className="text-ink-3">
                  {PAST_LABEL[bond.status] ?? bond.status} · after round {bond.round}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
