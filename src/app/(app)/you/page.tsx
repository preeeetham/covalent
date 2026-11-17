import type { Metadata } from "next";
import Link from "next/link";
import { Settings, ShieldCheck } from "lucide-react";
import { requireViewer } from "@/lib/auth";
import { loadPublicProfile } from "@/lib/data/profile";
import { ARCHETYPE_BY_ID } from "@/content/archetypes";
import { ArchetypeTile } from "@/components/brand/element-tile";
import { PersonHeader, PromptBlock, SharedElements } from "@/components/today/person-card";
import { BlurPreview } from "@/components/you/blur-preview";
import { Wallet } from "@/components/you/wallet";
import { PhotoManager } from "@/components/you/photo-manager";
import { listBonds } from "@/lib/data/bonds";

export const metadata: Metadata = { title: "You" };

export default async function YouPage() {
  const viewer = await requireViewer();
  const me = (await loadPublicProfile(viewer.id))!;
  const arch = viewer.archetype ? ARCHETYPE_BY_ID[viewer.archetype] : null;
  const { open } = await listBonds(viewer);
  const extendable = open.filter((b) => b.bond.status === "active").map((b) => ({ id: b.bond.id, name: b.partner.first_name }));
  const reliable = viewer.reliability >= 60;

  return (
    <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-[40px] leading-none text-ink">You</h1>
        <Link href="/you/settings" className="grid size-11 place-items-center rounded-full border border-line bg-surface text-ink" aria-label="Settings">
          <Settings className="size-5" />
        </Link>
      </header>

      {arch && (
        <section className="mb-8 grid grid-cols-[132px_1fr] items-center gap-5">
          <ArchetypeTile symbol={arch.symbol} number={arch.number} name={arch.name} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-3">Your element</p>
            <p className="mt-1 font-display text-2xl leading-tight text-ink">{arch.tagline}</p>
            <a href="/api/card" download={`covalent-${arch.id}.png`} className="mt-3 inline-flex min-h-[40px] items-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink">
              Download share card
            </a>
          </div>
        </section>
      )}

      <section className="mb-8 grid grid-cols-2 gap-3">
        <div className="rounded-[22px] border border-line bg-surface p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-3">Reliability</p>
          <p className="mt-1 font-display text-3xl text-ink">{viewer.reliability}</p>
          <p className="text-xs text-ink-2">{reliable ? "Reliable badge ✓ — you show up." : "Show up to dates to earn the badge."}</p>
        </div>
        <div className="rounded-[22px] border border-line bg-surface p-4">
          <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ink-3">
            <ShieldCheck className="size-3.5" /> Verified
          </p>
          <p className="mt-1 font-display text-3xl text-ink">{viewer.verified ? "Yes" : "Not yet"}</p>
          <p className="text-xs text-ink-2">{viewer.verified ? "via eLitmus identity" : "eLitmus SSO verification is coming soon."}</p>
        </div>
      </section>

      <Wallet catalysts={viewer.catalysts} extraSlotUntil={viewer.extra_slot_until} extendable={extendable} />

      <section className="mt-10">
        <h2 className="mb-1 font-display text-2xl text-ink">How others see you</h2>
        <p className="mb-4 text-sm text-ink-2">Slide to preview what someone sees at each round.</p>
        <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--shadow-soft)]">
          <BlurPreview photoId={me.photoIds[0] ?? null} />
          <div className="space-y-5 p-5">
            <PersonHeader person={me} />
            <SharedElements person={me} myElements={[]} />
            {me.prompts.map((p) => (
              <PromptBlock key={p.prompt_id} promptId={p.prompt_id} answer={p.answer} />
            ))}
          </div>
        </div>
      </section>

      <PhotoManager photoIds={me.photoIds} />

      {viewer.is_admin && (
        <Link href="/admin" className="mt-10 flex min-h-[52px] items-center justify-center rounded-full border border-line bg-surface font-semibold text-ink">
          Open the founder dashboard →
        </Link>
      )}
    </div>
  );
}
