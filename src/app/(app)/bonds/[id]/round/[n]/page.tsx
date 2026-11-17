import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { X } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { getBondDetail, tickPersona } from "@/lib/data/bonds";
import { drawRound1, drawRound2, drawRound3, drawRound4 } from "@/lib/rounds/logic";
import { ROUND_META } from "@/content/rounds";
import { ProgressRing } from "@/components/brand/litmus";
import { BondLive } from "@/components/bond/bond-live";
import { Round1 } from "@/components/rounds/round1";
import { Round2 } from "@/components/rounds/round2";
import { Round3 } from "@/components/rounds/round3";
import { Round4 } from "@/components/rounds/round4";
import { WaitingCard } from "@/components/rounds/waiting";

export default async function RoundPage(props: PageProps<"/bonds/[id]/round/[n]">) {
  const { id, n: nStr } = await props.params;
  const n = Number(nStr);
  if (![1, 2, 3, 4].includes(n)) notFound();
  const viewer = await requireViewer();
  let detail = await getBondDetail(viewer, id);
  if (!detail) notFound();
  if (detail.partner.is_demo && detail.bond.status === "active" && (await tickPersona(id))) detail = (await getBondDetail(viewer, id))!;

  const { bond, partner, responses } = detail;
  const view = detail.rounds[n - 1].view;
  if (view.state === "locked" || !["active", "revealed"].includes(bond.status)) redirect(`/bonds/${id}`);

  const mine = responses.find((r) => r.round === n && r.user_id === viewer.id)?.payload ?? null;
  const theirs = responses.find((r) => r.round === n && r.user_id !== viewer.id)?.payload ?? null;
  const meta = ROUND_META[n - 1];
  const waitingOnPersona = partner.is_demo && view.state === "waiting";
  const common = { bondId: id, partnerName: partner.first_name, view, mine, theirs, nextRound: n < 4 ? n + 1 : null };

  return (
    <div className="flex min-h-dvh flex-col">
      <BondLive bondId={id} personaDueAt={waitingOnPersona ? bond.persona_due_at ?? new Date().toISOString() : null} />
      <header className="flex items-center justify-between px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link href={`/bonds/${id}`} className="grid size-11 place-items-center rounded-full text-ink hover:bg-surface-2" aria-label="Close round">
          <X className="size-6" />
        </Link>
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-3">Round {n} of 4 · with {partner.first_name}</p>
          <h1 className="font-display text-2xl text-ink">{meta.name}</h1>
        </div>
        <ProgressRing done={bond.round} size={44}>
          <span className="font-mono text-[11px] text-ink-2">{bond.round}/4</span>
        </ProgressRing>
      </header>

      <div className="flex-1 px-5 pb-10 pt-2">
        {view.state === "waiting" && view.reason === "partner-ask" ? (
          <WaitingCard partnerName={partner.first_name} isDemo={partner.is_demo} text={`${partner.first_name} is picking a question for you.`} />
        ) : n === 1 ? (
          <Round1 {...common} pairs={drawRound1(id)} />
        ) : n === 2 ? (
          <Round2 {...common} questions={drawRound2(id)} />
        ) : n === 3 ? (
          <Round3 {...common} statements={drawRound3(id)} />
        ) : (
          <Round4 {...common} ideas={drawRound4(id)} />
        )}
      </div>
    </div>
  );
}
