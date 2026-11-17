import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { admin } from "@/lib/supabase/admin";
import { formatINR, relativeTime } from "@/lib/utils";
import { ReportActions } from "@/components/admin/report-actions";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Founder dashboard" };

const FUNNEL = [
  { key: "onboarded", label: "Onboarded" },
  { key: "reaction_started", label: "Started a reaction" },
  { key: "round4", label: "Finished all 4 rounds" },
  { key: "revealed", label: "Revealed" },
  { key: "date_proposed", label: "Proposed a date" },
  { key: "date_confirmed", label: "Confirmed a date" },
];

export default async function AdminPage() {
  const v = await requireViewer();
  if (!v.is_admin) redirect("/today");
  const db = admin();

  const [profiles, events, payments, reports, waitlist, flagged] = await Promise.all([
    db.from("profiles").select("id, gender, city, is_demo, onboarded_at, created_at").is("deleted_at", null),
    db.from("events").select("user_id, name, props").limit(20000),
    db.from("payments").select("kind, amount_inr, status"),
    db.from("reports").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("waitlist").select("city, gender"),
    db.from("messages").select("*", { count: "exact", head: true }).eq("flagged", true),
  ]);

  const people = profiles.data ?? [];
  const demoIds = new Set(people.filter((p) => p.is_demo).map((p) => p.id));
  const real = people.filter((p) => !p.is_demo);
  const onboardedReal = real.filter((p) => p.onboarded_at);

  // Funnel: distinct real (non-demo) users who reached each step.
  const reached: Record<string, Set<string>> = Object.fromEntries(FUNNEL.map((f) => [f.key, new Set<string>()]));
  for (const p of onboardedReal) reached.onboarded.add(p.id);
  for (const e of events.data ?? []) {
    if (!e.user_id || demoIds.has(e.user_id)) continue;
    if (e.name === "round_completed" && (e.props as { round?: number }).round === 4) reached.round4.add(e.user_id);
    else if (reached[e.name]) reached[e.name].add(e.user_id);
  }
  const funnel = FUNNEL.map((f) => ({ ...f, n: reached[f.key].size }));
  const top = Math.max(1, funnel[0].n);

  const paid = (payments.data ?? []).filter((p) => p.status === "paid");
  const revenue = paid.reduce((s, p) => s + p.amount_inr, 0);
  const commitRev = paid.filter((p) => p.kind === "commitment").reduce((s, p) => s + p.amount_inr, 0);
  const catalystRev = revenue - commitRev;
  const refunded = (payments.data ?? []).filter((p) => p.status === "refunded").reduce((s, p) => s + p.amount_inr, 0);

  const cities = [...new Set(onboardedReal.map((p) => p.city ?? "Unknown"))];
  const ratio = cities.map((c) => {
    const inCity = onboardedReal.filter((p) => p.city === c);
    const w = inCity.filter((p) => p.gender === "woman").length;
    const m = inCity.filter((p) => p.gender === "man").length;
    const nb = inCity.length - w - m;
    return { city: c, w, m, nb, total: inCity.length, share: inCity.length ? w / inCity.length : 0 };
  });

  const wl = Object.entries(
    (waitlist.data ?? []).reduce<Record<string, { total: number; women: number }>>((acc, r) => {
      acc[r.city] ??= { total: 0, women: 0 };
      acc[r.city].total++;
      if (r.gender === "woman") acc[r.city].women++;
      return acc;
    }, {}),
  ).sort((a, b) => b[1].total - a[1].total);

  const openReports = (reports.data ?? []).filter((r) => r.status === "open");
  const reportNames = new Map(
    ((await db.from("profiles").select("id, first_name").in("id", [...new Set((reports.data ?? []).flatMap((r) => [r.reporter_id, r.target_id]).filter(Boolean) as string[])])).data ?? []).map((p) => [p.id, p.first_name]),
  );

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/you" className="grid size-11 place-items-center rounded-full text-ink hover:bg-surface-2" aria-label="Back to app">
            <ChevronLeft className="size-6" />
          </Link>
          <div>
            <Logo />
            <h1 className="mt-1 font-display text-3xl text-ink">Founder dashboard</h1>
          </div>
        </div>
        <p className="max-w-[44ch] text-sm text-ink-2">Live data from this instance. Funnel and ratios count real accounts only (evaluators and new sign-ups); the 36 demo personas are excluded.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Real accounts" value={String(real.length)} sub={`${onboardedReal.length} onboarded`} />
        <Tile label="Confirmed dates (users)" value={String(funnel[5].n)} sub="North-star: dates, not matches" />
        <Tile label="Revenue (test mode)" value={formatINR(revenue)} sub={`${formatINR(commitRev)} commitments · ${formatINR(catalystRev)} catalysts`} />
        <Tile label="Safety" value={String(openReports.length)} sub={`open reports · ${flagged.count ?? 0} flagged messages`} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="font-display text-2xl text-ink">Funnel</h2>
          <p className="mb-5 text-sm text-ink-2">Distinct users reaching each step.</p>
          <ol className="space-y-3">
            {funnel.map((f, i) => {
              const pct = Math.round((f.n / top) * 100);
              const conv = i > 0 && funnel[i - 1].n ? Math.round((f.n / funnel[i - 1].n) * 100) : null;
              return (
                <li key={f.key} title={`${f.label}: ${f.n} users${conv !== null ? ` (${conv}% of previous step)` : ""}`}>
                  <div className="mb-1 flex items-baseline justify-between text-sm">
                    <span className="text-ink">{f.label}</span>
                    <span className="font-mono text-ink">
                      {f.n}
                      {conv !== null && <span className="ml-2 text-ink-3">{conv}%</span>}
                    </span>
                  </div>
                  <div className="h-3 rounded-[4px] bg-surface-2">
                    <div className="h-full rounded-[4px] bg-bond" style={{ width: `${Math.max(pct, f.n ? 2 : 0)}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="font-display text-2xl text-ink">Gender balance</h2>
          <p className="mb-5 text-sm text-ink-2">Share of women among onboarded real users. Target band 40–60% before opening a city wider.</p>
          {ratio.length === 0 && <p className="text-sm text-ink-3">No real users yet.</p>}
          <ul className="space-y-4">
            {ratio.map((r) => (
              <li key={r.city} title={`${r.city}: ${r.w} women, ${r.m} men, ${r.nb} non-binary`}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="text-ink">{r.city}</span>
                  <span className="font-mono text-ink-2">
                    {r.w}W · {r.m}M{r.nb ? ` · ${r.nb}NB` : ""}
                  </span>
                </div>
                <div className="relative h-3 rounded-[4px] bg-surface-2">
                  <div className="h-full rounded-[4px] bg-bond" style={{ width: `${Math.round(r.share * 100)}%` }} />
                  <div className="absolute inset-y-[-3px] left-[40%] w-px bg-ink-3" aria-hidden />
                  <div className="absolute inset-y-[-3px] left-[60%] w-px bg-ink-3" aria-hidden />
                </div>
                <p className="mt-1 text-xs text-ink-3">{Math.round(r.share * 100)}% women</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="font-display text-2xl text-ink">Reports queue</h2>
          <p className="mb-4 text-sm text-ink-2">Every report gets a human look. Moderators can see the reported person's photos unblurred while a report is open.</p>
          {openReports.length === 0 ? (
            <p className="rounded-2xl bg-ok-soft px-4 py-3 text-sm text-ink">Queue is clear.</p>
          ) : (
            <ul className="divide-y divide-line">
              {openReports.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      {reportNames.get(r.target_id ?? "") ?? "Unknown"} <span className="font-normal text-ink-2">· {r.reason}</span>
                    </p>
                    <p className="text-xs text-ink-3">
                      by {reportNames.get(r.reporter_id ?? "") ?? "Unknown"} · {r.source} · {relativeTime(r.created_at)}
                    </p>
                    {r.detail && <p className="mt-1 text-sm text-ink-2">“{r.detail}”</p>}
                  </div>
                  <ReportActions id={r.id} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[24px] border border-line bg-surface p-6">
          <h2 className="font-display text-2xl text-ink">City waitlists</h2>
          <p className="mb-4 text-sm text-ink-2">Unlock a city when demand and balance are both there.</p>
          {wl.length === 0 ? (
            <p className="text-sm text-ink-3">No waitlist sign-ups yet. Try the form on the landing page.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-3">
                  <th className="pb-2 font-semibold">City</th>
                  <th className="pb-2 text-right font-semibold">Sign-ups</th>
                  <th className="pb-2 text-right font-semibold">Women</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {wl.map(([city, x]) => (
                  <tr key={city}>
                    <td className="py-2 text-ink">{city}</td>
                    <td className="py-2 text-right font-mono text-ink">{x.total}</td>
                    <td className="py-2 text-right font-mono text-ink-2">{x.women}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {refunded > 0 && <p className="mt-4 text-xs text-ink-3">{formatINR(refunded)} refunded on cancelled dates.</p>}
        </section>
      </div>

      <section className="mt-6 rounded-[24px] border border-dashed border-line p-6">
        <h2 className="font-display text-2xl text-ink">Revenue model at scale (assumptions)</h2>
        <p className="mt-2 max-w-[80ch] text-sm text-ink-2">
          100k monthly active users in year one × 15% reaching a confirmed date each month = 15,000 dates × ₹198 (both commitments) ≈ <strong className="text-ink">₹29.7L / month</strong> gross,
          before venue commissions (10–15% of bill or ₹50–100 per cover) and catalysts. Every figure here is an assumption to test, not a forecast.
        </p>
      </section>
    </main>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-surface p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{label}</p>
      <p className="mt-2 font-display text-4xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-2">{sub}</p>
    </div>
  );
}
