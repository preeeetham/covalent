import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, CalendarHeart, EyeOff, Lock, ShieldCheck, Sparkles, Timer, Wallet } from "lucide-react";
import { getUserId } from "@/lib/auth";
import { HeroReveal } from "@/components/marketing/hero-reveal";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { ElementTile } from "@/components/brand/element-tile";
import { BondAtoms } from "@/components/brand/atoms";

export default async function Landing(props: PageProps<"/">) {
  if (await getUserId()) redirect("/today");
  const sp = await props.searchParams;

  return (
    <main className="overflow-x-clip">
      {sp.deleted && (
        <p className="mx-auto mt-4 max-w-md rounded-2xl bg-ok-soft px-4 py-3 text-center text-sm text-ink">Your account and data have been deleted. Take care.</p>
      )}

      {/* ---------------------------------------------------------------- hero */}
      <section className="mx-auto grid max-w-[1100px] grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-2">
            <span className="size-2 rounded-full bg-ok" /> Live in Bengaluru & Hyderabad
          </p>
          <h1 className="font-display text-[clamp(44px,8vw,80px)] leading-[0.98] tracking-tight text-ink">
            Get to know someone <span className="text-litmus">before</span> you see them.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-2">
            Covalent sends you three verified people a day. No swiping. Photos start blurred and sharpen as you play four short rounds together. Then you plan a real date.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex min-h-[56px] items-center rounded-full bg-litmus-strong px-8 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgb(124_77_255/0.8)]">
              Find your element
            </Link>
            <Link href="#how" className="inline-flex min-h-[56px] items-center rounded-full border border-line bg-surface px-6 font-semibold text-ink">
              How it works
            </Link>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-ink-3">
            <BadgeCheck className="size-4 text-bond-text" /> Every profile verified through eLitmus.
          </p>
        </div>
        <HeroReveal />
      </section>

      {/* ---------------------------------------------------------------- problem */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-[1100px] gap-8 px-5 py-14 sm:grid-cols-3">
          {[
            { n: "78%", t: "of dating-app users say they feel burnt out, at least sometimes.", s: "Forbes Health / OnePoll survey" },
            { n: "0.5s", t: "is roughly how long a swipe takes. Most interesting people lose that contest.", s: "The photo-first problem" },
            { n: "69%", t: "of dating apps are uninstalled within a month of download.", s: "Industry data via Global Dating Insights" },
          ].map((x) => (
            <div key={x.n}>
              <p className="font-display text-6xl text-ink">{x.n}</p>
              <p className="mt-2 text-ink-2">{x.t}</p>
              <p className="mt-2 text-xs text-ink-3">{x.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- how */}
      <section id="how" className="mx-auto max-w-[1100px] scroll-mt-20 px-5 py-20">
        <h2 className="max-w-[18ch] font-display text-5xl leading-[1.02] text-ink">Four steps. No swiping anywhere.</h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Sparkles, t: "Three a day", d: "Every evening at 8, three people picked for your values, not just your type. Then the app tells you to go live your life." },
            { icon: EyeOff, t: "Four rounds", d: "Quick-fire picks, one real question each, a guessing game, a first-date draft. No blank 'hey'." },
            { icon: Timer, t: "Photos sharpen", d: "Each round you finish together brings the photo into focus. Full reveal when you both say so." },
            { icon: CalendarHeart, t: "A real date", d: "Pick a public spot. Both commit ₹99, which comes back as ₹99 off your bill. No-shows forfeit it." },
          ].map((s, i) => (
            <div key={s.t} className="rounded-[28px] border border-line bg-surface p-6 shadow-[var(--shadow-soft)]">
              <p className="font-mono text-xs text-ink-3">0{i + 1}</p>
              <s.icon className="mt-4 size-6 text-bond-text" />
              <h3 className="mt-3 font-display text-2xl text-ink">{s.t}</h3>
              <p className="mt-2 text-ink-2">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- different */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-[1100px] gap-12 px-5 py-20 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-5xl leading-[1.02]">Built the other way round.</h2>
            <p className="mt-5 max-w-[42ch] text-lg text-paper/70">
              Swipe apps make money when you keep swiping. We only make money when two people actually agree to meet. So that's what everything here is designed for.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {["filter-coffee", "trekking", "cricket", "k-drama", "biryani", "indie-music"].map((id) => (
                <ElementTile key={id} id={id} size="sm" />
              ))}
            </div>
          </div>
          <dl className="divide-y divide-paper/15 rounded-[28px] border border-paper/15">
            {[
              ["Infinite deck", "Three people, then done for the day"],
              ["Photo first", "Conversation first, photo sharpens"],
              ["Unlimited matches", "Three bonds at a time"],
              ["Ghosting", "Bonds close kindly after 72h quiet"],
              ["Pay to be seen", "Pay only when a date is agreed"],
              ["Anyone can be anyone", "Verified through eLitmus"],
            ].map(([a, b]) => (
              <div key={a} className="grid grid-cols-2 gap-4 px-5 py-4">
                <dt className="text-paper/70 line-through decoration-paper/40">{a}</dt>
                <dd className="font-semibold">{b}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ---------------------------------------------------------------- trust */}
      <section className="mx-auto grid max-w-[1100px] items-center gap-12 px-5 py-20 lg:grid-cols-2">
        <BondAtoms rounds={4} className="mx-auto max-w-[420px]" labels={["You", "Them"]} />
        <div>
          <h2 className="font-display text-5xl leading-[1.02] text-ink">Verified, and walled off.</h2>
          <ul className="mt-6 space-y-4 text-ink-2">
            <li className="flex gap-3">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-bond-text" />
              <span>
                <strong className="text-ink">Real people only.</strong> Covalent opens to people eLitmus has already verified — real names, real colleges, real jobs.
              </span>
            </li>
            <li className="flex gap-3">
              <Lock className="mt-0.5 size-5 shrink-0 text-bond-text" />
              <span>
                <strong className="text-ink">A hard data firewall.</strong> Your dating life never reaches recruiters or employers. Only your verification status crosses over, and only if you opt in.
              </span>
            </li>
            <li className="flex gap-3">
              <EyeOff className="mt-0.5 size-5 shrink-0 text-bond-text" />
              <span>
                <strong className="text-ink">Blur that can't be hacked.</strong> Photos are blurred on our servers. Nobody can un-blur yours early, however clever they are with browser tools.
              </span>
            </li>
            <li className="flex gap-3">
              <Wallet className="mt-0.5 size-5 shrink-0 text-bond-text" />
              <span>
                <strong className="text-ink">Free to meet people.</strong> ₹99 only when a date is agreed — and it comes back as ₹99 off the bill at partner cafés.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------------- waitlist */}
      <section id="waitlist" className="mx-auto max-w-[1100px] px-5 pb-24">
        <div className="grid items-center gap-10 rounded-[36px] bg-litmus-strong p-[2px]">
          <div className="grid gap-10 rounded-[34px] bg-surface p-8 sm:p-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl leading-tight text-ink">Not in Bengaluru or Hyderabad yet?</h2>
              <p className="mt-3 text-ink-2">We open cities one at a time, when there are enough verified people for batches worth opening. Join your city's waitlist.</p>
            </div>
            <WaitlistForm />
          </div>
        </div>
      </section>
    </main>
  );
}
