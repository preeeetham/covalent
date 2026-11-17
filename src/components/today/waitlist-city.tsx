import Link from "next/link";
import { MapPin } from "lucide-react";
import { LIVE_CITIES } from "@/content/cities";

export function WaitlistCity({ city }: { city: string | null }) {
  return (
    <div className="rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-soft)]">
      <MapPin className="mb-3 size-6 text-bond" />
      <h2 className="font-display text-3xl leading-tight text-ink">{city === "Other" || !city ? "Your city" : city} isn't live yet.</h2>
      <p className="mt-3 text-ink-2">
        We launch one city at a time so there are enough people for good batches. Covalent is live in{" "}
        <strong className="text-ink">{LIVE_CITIES.join(" and ")}</strong>. You're on the {city ?? "city"} waitlist, and we'll open your city when
        enough verified people join.
      </p>
      <p className="mt-3 text-ink-2">Moved recently, or here for work? You can switch your city any time.</p>
      <Link href="/you/settings" className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-ink px-5 font-semibold text-paper">
        Change city
      </Link>
    </div>
  );
}
