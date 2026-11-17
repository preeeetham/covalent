"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarCheck2, MapPin, Share2, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { handle, toast } from "@/components/ui/toast";
import { Checkout, type CheckoutSession } from "@/components/payments/checkout";
import { beginCommitment, cancelPlan, counterPlan, propose, respondToPlan } from "@/app/actions/dates";
import { formatIST } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Plan = Database["public"]["Tables"]["date_plans"]["Row"];
type Venue = Database["public"]["Tables"]["venues"]["Row"];

const TIMES = ["08:00", "10:00", "12:30", "16:00", "17:30", "18:30", "19:30", "20:30"];

function istDateInput(offsetDays: number) {
  const d = new Date(Date.now() + 330 * 60_000 + offsetDays * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function DatePlanner({ bondId, viewerId, iAmA, partnerName, plan, venue, venues }: { bondId: string; viewerId: string; iAmA: boolean; partnerName: string; plan: Plan | null; venue: Venue | null; venues: Venue[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<"propose" | "counter" | null>(null);
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const [tips, setTips] = useState(false);

  const live = plan && ["proposed", "accepted", "confirmed", "completed"].includes(plan.status) ? plan : null;
  const myPaid = live ? (iAmA ? live.paid_a : live.paid_b) : false;
  const theirPaid = live ? (iAmA ? live.paid_b : live.paid_a) : false;

  const startCommit = () => {
    try {
      if (!localStorage.getItem("covalent-safety-tips")) {
        setTips(true);
        return;
      }
    } catch {}
    commit();
  };
  const commit = () =>
    start(async () => {
      const res = await beginCommitment(live!.id);
      if (handle(res) && res.data) setCheckout(res.data);
    });

  const shareUrl = live ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/date/${live.share_token}` : "";
  const share = async () => {
    const text = `I'm meeting ${partnerName} from Covalent at ${venue?.name}, ${venue?.area} — ${formatIST(live!.starts_at)}. Plan: ${shareUrl}`;
    try {
      if (navigator.share) await navigator.share({ title: "My date plan", text, url: shareUrl });
      else {
        await navigator.clipboard.writeText(text);
        toast.ok("Plan copied. Send it to a friend you trust.");
      }
    } catch {}
  };

  return (
    <section id="plan" aria-label="First date" className="mt-6 scroll-mt-20">
      <div className="rounded-[24px] border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
        <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
          <CalendarCheck2 className="size-5 text-bond-text" /> First date
        </h2>

        {!live && (
          <>
            <p className="mt-2 text-sm text-ink-2">
              Pick a public place and a time. If {partnerName} agrees, you each commit ₹99 — it becomes ₹99 off your bill at partner venues. No-shows forfeit it.
            </p>
            <Button variant="primary" size="lg" block className="mt-4" onClick={() => setForm("propose")}>
              Plan a date with {partnerName}
            </Button>
          </>
        )}

        {live && (
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl bg-surface-2 p-4">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <MapPin className="size-4 text-ink-2" /> {venue?.name}
              </p>
              <p className="ml-6 text-sm text-ink-2">{venue?.area} · {venue?.kind}</p>
              <p className="mt-2 flex items-center gap-2 font-semibold text-ink">
                <Clock className="size-4 text-ink-2" /> {formatIST(live.starts_at)}
              </p>
              {venue?.partner && <p className="ml-6 mt-1 text-xs font-semibold text-ok">Partner venue · ₹99 off the bill</p>}
            </div>

            {live.status === "proposed" && live.proposed_by === viewerId && (
              <>
                <p className="text-sm text-ink-2">Waiting for {partnerName} to accept or suggest another time.</p>
                <Button block variant="ghost" loading={pending} onClick={() => start(async () => { if (handle(await cancelPlan(live.id, bondId))) router.refresh(); })}>
                  Withdraw this plan
                </Button>
              </>
            )}

            {live.status === "proposed" && live.proposed_by !== viewerId && (
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" onClick={() => start(async () => { if (handle(await respondToPlan(live.id, false, bondId))) router.refresh(); })} disabled={pending}>
                  Decline
                </Button>
                <Button size="sm" onClick={() => setForm("counter")} disabled={pending}>
                  Suggest other
                </Button>
                <Button size="sm" variant="ink" loading={pending} onClick={() => start(async () => { if (handle(await respondToPlan(live.id, true, bondId), "Accepted. Now commit to lock it in.")) router.refresh(); })}>
                  Accept
                </Button>
              </div>
            )}

            {live.status === "accepted" && (
              <>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className={cn("rounded-xl px-3 py-2 text-center font-semibold", myPaid ? "bg-ok-soft text-ok" : "bg-surface-2 text-ink-2")}>You {myPaid ? "✓ committed" : "· not yet"}</p>
                  <p className={cn("rounded-xl px-3 py-2 text-center font-semibold", theirPaid ? "bg-ok-soft text-ok" : "bg-surface-2 text-ink-2")}>{partnerName} {theirPaid ? "✓ committed" : "· not yet"}</p>
                </div>
                {!myPaid ? (
                  <Button variant="primary" size="lg" block loading={pending} onClick={startCommit}>
                    Commit ₹99 to confirm
                  </Button>
                ) : (
                  <p className="text-center text-sm text-ink-2">Waiting for {partnerName} to commit.</p>
                )}
                <p className="text-center text-xs text-ink-3">Why pay? A small commitment from both sides makes no-shows rare. It comes back as ₹99 off at the venue.</p>
              </>
            )}

            {live.status === "confirmed" && (
              <>
                <p className="rounded-2xl bg-ok-soft p-3 text-center text-sm font-semibold text-ok">Confirmed. You're both committed.</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" onClick={share}>
                    <Share2 className="size-4" /> Share with a friend
                  </Button>
                  <Link href="/safety" className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold text-ink">
                    <ShieldCheck className="size-4" /> Safety tips
                  </Link>
                </div>
                {new Date(live.starts_at) < new Date() ? (
                  <Link href="/dates" className="flex min-h-[48px] items-center justify-center rounded-full bg-ink font-semibold text-paper">
                    How did it go? Leave feedback
                  </Link>
                ) : (
                  <Button block variant="ghost" size="sm" loading={pending} onClick={() => start(async () => { if (handle(await cancelPlan(live.id, bondId), "Cancelled. Commitments refunded.")) router.refresh(); })}>
                    Cancel the date (refunds both)
                  </Button>
                )}
              </>
            )}

            {live.status === "completed" && <p className="text-center text-sm text-ink-2">This date is done. Thanks for the feedback — it keeps Covalent honest.</p>}
          </div>
        )}
      </div>

      <PlanForm
        open={form !== null}
        title={form === "counter" ? "Suggest another plan" : `Plan a date with ${partnerName}`}
        venues={venues}
        defaultVenue={form === "counter" ? live?.venue_id : undefined}
        pending={pending}
        onClose={() => setForm(null)}
        onSubmit={(venueId, iso, note) =>
          start(async () => {
            const res = form === "counter" && live ? await counterPlan(live.id, venueId, iso, bondId) : await propose(bondId, venueId, iso, note);
            if (handle(res, "Plan sent.")) {
              setForm(null);
              router.refresh();
            }
          })
        }
      />

      <Sheet open={tips} onClose={() => setTips(false)} title="Before your first date">
        <ul className="space-y-3 text-[15px] text-ink">
          <li>🏙️ Meet somewhere public. Every Covalent venue is.</li>
          <li>📍 Share your plan with a friend — one tap from the date card.</li>
          <li>🚕 Get there and back on your own.</li>
          <li>🍹 Keep an eye on your drink, and leave whenever you want.</li>
          <li>🚩 Anything feels off? Report it after. We read every one.</li>
        </ul>
        <Button
          variant="ink"
          size="lg"
          block
          className="mt-5"
          onClick={() => {
            try {
              localStorage.setItem("covalent-safety-tips", "1");
            } catch {}
            setTips(false);
            commit();
          }}
        >
          Got it, continue to commit
        </Button>
      </Sheet>

      <Checkout
        session={checkout}
        onClose={() => setCheckout(null)}
        onPaid={(r) => {
          setCheckout(null);
          toast.ok(r.confirmed ? "Date confirmed! Share the plan with a friend." : "Committed. Waiting for the other half.");
          router.refresh();
        }}
      />
    </section>
  );
}

function PlanForm({ open, title, venues, defaultVenue, pending, onClose, onSubmit }: { open: boolean; title: string; venues: Venue[]; defaultVenue?: string; pending: boolean; onClose: () => void; onSubmit: (venueId: string, iso: string, note?: string) => void }) {
  const [venueId, setVenueId] = useState<string | null>(defaultVenue ?? null);
  const [day, setDay] = useState(istDateInput(2));
  const [time, setTime] = useState("18:30");
  const [note, setNote] = useState("");
  const min = useMemo(() => istDateInput(0), []);
  const max = useMemo(() => istDateInput(29), []);

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-3">Where (public places only)</p>
      <div className="max-h-64 space-y-2 overflow-y-auto pr-1" role="radiogroup" aria-label="Venue">
        {venues.map((v) => (
          <button key={v.id} role="radio" aria-checked={venueId === v.id} onClick={() => setVenueId(v.id)} className={cn("w-full rounded-2xl border p-3 text-left", venueId === v.id ? "border-ink bg-surface-2" : "border-line")}>
            <p className="flex items-center justify-between gap-2 font-semibold text-ink">
              {v.name}
              {v.partner && <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[10px] font-bold text-ok">₹99 OFF</span>}
            </p>
            <p className="text-xs text-ink-2">
              {v.area} · {v.kind} · {v.price_band}
            </p>
            <p className="mt-0.5 text-xs text-ink-3">{v.blurb}</p>
          </button>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-ink-3">Demo venues: names are fictional, neighbourhoods are real.</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-ink-3">
          Day
          <input type="date" value={day} min={min} max={max} onChange={(e) => setDay(e.target.value)} className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-surface px-3 text-[15px] font-normal normal-case tracking-normal text-ink" />
        </label>
        <label className="text-xs font-bold uppercase tracking-wider text-ink-3">
          Time (IST)
          <select value={time} onChange={(e) => setTime(e.target.value)} className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-surface px-3 text-[15px] font-normal normal-case tracking-normal text-ink">
            {TIMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={140} placeholder="Add a note (optional)" aria-label="Note" className="mt-3 h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[15px] text-ink" />
      <Button variant="primary" size="lg" block className="mt-5" disabled={!venueId} loading={pending} onClick={() => venueId && onSubmit(venueId, `${day}T${time}:00+05:30`, note || undefined)}>
        Send the plan
      </Button>
    </Sheet>
  );
}
