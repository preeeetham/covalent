import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Clock, ShieldCheck } from "lucide-react";
import { getSharedPlan } from "@/lib/data/dates";
import { formatIST } from "@/lib/time";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Shared date plan", robots: { index: false, follow: false } };

/** Read-only page for a trusted contact. First names, venue and time only. */
export default async function SharedPlan(props: PageProps<"/share/date/[token]">) {
  const { token } = await props.params;
  const shared = await getSharedPlan(token);
  if (!shared) notFound();
  const { plan, venue, names } = shared;
  return (
    <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col px-5 py-10">
      <Logo />
      <div className="mt-10 rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-soft)]">
        <p className="text-xs font-bold uppercase tracking-wider text-ink-3">Date plan shared with you</p>
        <h1 className="mt-2 font-display text-3xl text-ink">{names.join(" & ")}</h1>
        <div className="mt-5 space-y-3 text-ink">
          <p className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 text-bond-text" />
            <span>
              <strong>{venue?.name}</strong>
              <br />
              <span className="text-ink-2">{venue?.area}, {venue?.city} · {venue?.kind}</span>
            </span>
          </p>
          <p className="flex items-center gap-3">
            <Clock className="size-5 text-bond-text" /> {formatIST(plan.starts_at, { year: "numeric" })}
          </p>
        </div>
        {venue?.map_url && (
          <a href={venue.map_url} target="_blank" rel="noopener noreferrer" className="mt-6 flex min-h-[48px] items-center justify-center rounded-full bg-ink font-semibold text-paper">
            Open the area in Maps
          </a>
        )}
      </div>
      <p className="mt-6 flex gap-2 text-sm text-ink-2">
        <ShieldCheck className="size-5 shrink-0 text-ok" /> Someone you know shared this so a friend knows where they'll be. It's a public place, and both people are verified on Covalent.
      </p>
    </main>
  );
}
