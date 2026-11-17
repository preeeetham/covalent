import type { Metadata } from "next";
import Link from "next/link";
import { CalendarHeart, MapPin } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { listDates } from "@/lib/data/dates";
import { formatIST } from "@/lib/time";
import { BlurPhoto } from "@/components/brand/blur-photo";
import { FeedbackForm } from "@/components/dates/feedback-form";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dates" };

const LABEL: Record<string, string> = {
  proposed: "Proposed",
  accepted: "Waiting for commitments",
  confirmed: "Confirmed",
  completed: "Done",
  cancelled: "Cancelled",
  declined: "Declined",
};

export default async function DatesPage() {
  const viewer = await requireViewer();
  const rows = await listDates(viewer);
  // Server component rendered per request, so reading the clock here is intended.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const needsFeedback = rows.filter((r) => r.plan.status === "confirmed" && new Date(r.plan.starts_at).getTime() < now && !r.myFeedback);
  const upcoming = rows.filter((r) => ["proposed", "accepted", "confirmed"].includes(r.plan.status) && new Date(r.plan.starts_at).getTime() >= now).reverse();
  const past = rows.filter((r) => !needsFeedback.includes(r) && !upcoming.includes(r));

  return (
    <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-6">
        <h1 className="font-display text-[40px] leading-none text-ink">Dates</h1>
        <p className="mt-2 text-sm text-ink-2">Real plans, in public places. Showing up builds your Reliable badge and better batches.</p>
      </header>

      {needsFeedback.map((r) => (
        <section key={r.plan.id} className="mb-6 rounded-[24px] border-2 border-bond/30 bg-surface p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-bold uppercase tracking-wider text-bond">How did it go?</p>
          <p className="mt-1 font-display text-2xl text-ink">You and {r.partner.first_name} at {r.venue?.name}</p>
          <p className="text-sm text-ink-2">{formatIST(r.plan.starts_at)}</p>
          <FeedbackForm planId={r.plan.id} partnerName={r.partner.first_name} />
        </section>
      ))}

      {upcoming.length > 0 && <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-3">Coming up</h2>}
      <ul className="space-y-3">
        {upcoming.map((r) => (
          <DateCard key={r.plan.id} r={r} />
        ))}
      </ul>

      {past.length > 0 && <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wider text-ink-3">Past</h2>}
      <ul className="space-y-3">
        {past.map((r) => (
          <DateCard key={r.plan.id} r={r} muted />
        ))}
      </ul>

      {rows.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-[28px] border border-line bg-surface px-6 py-12 text-center shadow-[var(--shadow-soft)]">
          <CalendarHeart className="mb-3 size-8 text-bond" />
          <p className="font-display text-3xl text-ink">No dates yet.</p>
          <p className="mt-2 max-w-[30ch] text-ink-2">Finish the four rounds with someone, reveal, and plan something real. That's the whole point.</p>
          <Link href="/bonds" className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-ink px-5 font-semibold text-paper">
            Go to your bonds
          </Link>
        </div>
      )}
    </div>
  );
}

function DateCard({ r, muted }: { r: Awaited<ReturnType<typeof listDates>>[number]; muted?: boolean }) {
  return (
    <li>
      <Link href={`/bonds/${r.bondId}#plan`} className={cn("flex items-center gap-4 rounded-[24px] border border-line bg-surface p-3 pr-4 shadow-[var(--shadow-soft)]", muted && "opacity-75")}>
        <BlurPhoto photoId={r.partner.photoId} level="original" alt={r.partner.first_name} sizes="size-16" className="rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-display text-xl text-ink">{r.partner.first_name}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", r.plan.status === "confirmed" ? "bg-ok-soft text-ok" : "bg-surface-2 text-ink-2")}>{LABEL[r.plan.status] ?? r.plan.status}</span>
          </div>
          <p className="flex items-center gap-1 text-sm text-ink-2">
            <MapPin className="size-3.5" /> {r.venue?.name}, {r.venue?.area}
          </p>
          <p className="text-sm text-ink-2">{formatIST(r.plan.starts_at)}</p>
        </div>
      </Link>
    </li>
  );
}
