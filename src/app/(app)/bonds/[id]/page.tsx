import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Lock, Check, Hourglass, Play, Sparkles } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { getBondDetail, tickPersona } from "@/lib/data/bonds";
import { latestPlanForBond, venuesFor } from "@/lib/data/dates";
import { ROUND_META } from "@/content/rounds";
import { levelFor, roundsToReveal } from "@/lib/photos/level";
import { hoursLeft, cn } from "@/lib/utils";
import { BlurPhoto } from "@/components/brand/blur-photo";
import { BondAtoms } from "@/components/brand/atoms";
import { LitmusStrip } from "@/components/brand/litmus";
import { Chat } from "@/components/bond/chat";
import { BondMenu } from "@/components/bond/bond-menu";
import { BondLive } from "@/components/bond/bond-live";
import { RevealCta } from "@/components/bond/reveal-cta";
import { DatePlanner } from "@/components/bond/date-planner";
import { PersonHeader, PromptBlock, SharedElements } from "@/components/today/person-card";
import { admin } from "@/lib/supabase/admin";
import { chatOpen } from "@/lib/data/chat";

export default async function BondPage(props: PageProps<"/bonds/[id]">) {
  const { id } = await props.params;
  const viewer = await requireViewer();
  let detail = await getBondDetail(viewer, id);
  if (!detail) notFound();
  // If a demo partner's move is due, make it before rendering.
  if (detail.partner.is_demo && detail.bond.status === "active" && (await tickPersona(id))) detail = (await getBondDetail(viewer, id))!;

  const { bond, partner, rounds, messages, iAmA } = detail;
  const level = levelFor(bond);
  const left = roundsToReveal(bond.round);
  const [plan, venues, mine] = await Promise.all([
    bond.status === "revealed" ? latestPlanForBond(id) : null,
    bond.status === "revealed" ? venuesFor(viewer.city) : [],
    admin().from("user_elements").select("element_id").eq("user_id", viewer.id),
  ]);
  const myRevealTapped = iAmA ? bond.reveal_a : bond.reveal_b;
  const closed = !["invited", "active", "revealed"].includes(bond.status);
  const waitingOnPersona = partner.is_demo && bond.status === "active" && rounds.some((r) => r.view.state === "waiting");

  return (
    <div className="pb-6">
      <BondLive bondId={id} personaDueAt={waitingOnPersona ? bond.persona_due_at ?? new Date().toISOString() : null} />
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line/60 bg-paper px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <Link href="/bonds" className="grid size-11 place-items-center rounded-full text-ink hover:bg-surface-2" aria-label="Back to bonds">
          <ChevronLeft className="size-6" />
        </Link>
        <p className="font-display text-xl text-ink">{partner.first_name}</p>
        <BondMenu bondId={id} partnerId={partner.id} partnerName={partner.first_name} canNudge={bond.status === "active" && !detail.myMove && bond.nudged_by !== viewer.id && !partner.is_demo} closed={closed} />
      </header>

      <div className="px-5 pt-4">
        <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--shadow-soft)]">
          <BlurPhoto
            photoId={partner.photoIds[0]}
            level={level}
            alt={`Photo of ${partner.first_name}`}
            label={level === "original" ? null : left > 0 ? `${left} round${left > 1 ? "s" : ""} to reveal` : "Ready to reveal"}
            priority
          />
          <div className="space-y-4 p-5">
            <PersonHeader person={partner} />
            <BondAtoms rounds={bond.round} labels={[viewer.first_name?.[0] ?? "Y", partner.first_name[0]]} className="mx-auto max-w-[260px]" />
            <LitmusStrip value={bond.chemistry} />
            {bond.status !== "revealed" && !closed && (
              <p className="text-center font-mono text-xs text-ink-3">dissolves in {hoursLeft(bond.expires_at)}h without a move</p>
            )}
          </div>
        </div>

        {closed && (
          <div className="mt-5 rounded-2xl border border-line bg-surface p-5 text-center">
            <p className="font-display text-2xl text-ink">This bond has ended.</p>
            <p className="mt-1 text-sm text-ink-2">
              {bond.status === "expired" ? "It went quiet for 72 hours. No hard feelings." : bond.status === "declined" ? "They passed this time. Plenty more chemistry out there." : "It was dissolved. That's okay — closure is a feature here."}
            </p>
          </div>
        )}

        {bond.status === "invited" && (
          <div className="mt-5 rounded-2xl border border-line bg-surface p-5 text-center text-ink-2">
            Waiting for {partner.first_name} to accept your reaction.
          </div>
        )}

        {(bond.status === "active" || bond.status === "revealed") && (
          <section aria-label="Rounds" className="mt-6">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-3">The chemistry test</h2>
            <ol className="space-y-2.5">
              {rounds.map(({ n, view }) => {
                const meta = ROUND_META[n - 1];
                const icon =
                  view.state === "done" ? <Check className="size-4" /> : view.state === "play" ? <Play className="size-4" /> : view.state === "waiting" ? <Hourglass className="size-4" /> : <Lock className="size-4" />;
                const sub =
                  view.state === "done" ? "See results" : view.state === "play" ? "Your move" : view.state === "waiting" ? `Waiting for ${partner.first_name}` : meta.reveals;
                const linkable = view.state !== "locked";
                const inner = (
                  <div
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border p-4",
                      view.state === "play" ? "border-transparent bg-litmus text-white shadow-[0_10px_30px_-12px_rgb(124_77_255/0.7)]" : "border-line bg-surface",
                      view.state === "locked" && "opacity-60",
                    )}
                  >
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", view.state === "play" ? "bg-white/20" : view.state === "done" ? "bg-ok-soft text-ok" : "bg-surface-2 text-ink-2")}>{icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("font-semibold", view.state === "play" ? "text-white" : "text-ink")}>
                        <span className="font-mono text-xs opacity-70">0{n}</span> {meta.name}
                      </p>
                      <p className={cn("text-sm", view.state === "play" ? "text-white/85" : "text-ink-2")}>{sub}</p>
                    </div>
                  </div>
                );
                return <li key={n}>{linkable ? <Link href={`/bonds/${id}/round/${n}`}>{inner}</Link> : inner}</li>;
              })}
            </ol>
          </section>
        )}

        {bond.status === "active" && bond.round >= 4 && (
          <RevealCta bondId={id} tapped={myRevealTapped} partnerName={partner.first_name} />
        )}

        {bond.status === "revealed" && (
          <DatePlanner
            bondId={id}
            viewerId={viewer.id}
            iAmA={iAmA}
            partnerName={partner.first_name}
            plan={plan?.plan ?? null}
            venue={plan?.venue ?? null}
            venues={venues}
          />
        )}

        {bond.why_text && bond.status !== "revealed" && (
          <div className="mt-6 rounded-2xl bg-bond-soft p-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-bond">
              <Sparkles className="size-3.5" /> Why you two
            </p>
            <p className="text-[15px] leading-relaxed text-ink">{bond.why_text}</p>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <SharedElements person={partner} myElements={(mine.data ?? []).map((e) => e.element_id)} />
          {partner.prompts.map((p) => (
            <PromptBlock key={p.prompt_id} promptId={p.prompt_id} answer={p.answer} />
          ))}
        </div>

        <section aria-label="Chat" className="mt-8">
          <Chat
            bondId={id}
            viewerId={viewer.id}
            partnerName={partner.first_name}
            partnerIsDemo={partner.is_demo}
            open={chatOpen(bond) && !closed}
            revealed={bond.status === "revealed"}
            initial={messages}
          />
        </section>
      </div>
    </div>
  );
}
