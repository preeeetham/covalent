import { BadgeCheck } from "lucide-react";
import { BlurPhoto } from "@/components/brand/blur-photo";
import { ElementTile } from "@/components/brand/element-tile";
import { ARCHETYPE_BY_ID } from "@/content/archetypes";
import { INTENT_LABEL } from "@/content/cities";
import { PROMPT_BY_ID } from "@/content/prompts";
import type { PublicProfile } from "@/lib/data/profile";
import { cn } from "@/lib/utils";

export function PersonHeader({ person, compact }: { person: PublicProfile; compact?: boolean }) {
  const arch = person.archetype ? ARCHETYPE_BY_ID[person.archetype] : null;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h3 className={cn("font-display leading-none text-ink", compact ? "text-2xl" : "text-[30px]")}>
          {person.first_name}
          {person.age ? <span className="text-ink-2">, {person.age}</span> : null}
        </h3>
        {person.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-bond-soft px-2 py-0.5 text-[11px] font-semibold text-bond" title="Education and identity verified through eLitmus">
            <BadgeCheck className="size-3.5" /> Verified
          </span>
        )}
        {person.is_demo && <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-ink-3">Demo profile</span>}
      </div>
      <p className="mt-1.5 text-sm text-ink-2">
        {[person.role, person.company && `at a ${person.company.toLowerCase()}`].filter(Boolean).join(" ")}
        {person.hometown && <> · from {person.hometown}</>}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs font-medium">
        {arch && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-ink">
            <span className="font-mono text-[10px] text-ink-3">{arch.number}</span>
            <span className="font-display font-semibold">{arch.symbol}</span> {arch.name}
          </span>
        )}
        {person.intent && <span className="rounded-full bg-surface-2 px-2.5 py-1 text-ink-2">{INTENT_LABEL[person.intent]}</span>}
      </div>
    </div>
  );
}

export function SharedElements({ person, myElements }: { person: PublicProfile; myElements: string[] }) {
  const sorted = [...person.elements].sort((a, b) => Number(myElements.includes(b)) - Number(myElements.includes(a)));
  const shared = person.elements.filter((e) => myElements.includes(e)).length;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-3">
        Elements {shared > 0 && <span className="normal-case tracking-normal text-bond">· {shared} in common</span>}
      </p>
      <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-2 pt-1">
        {sorted.map((id) => (
          <ElementTile key={id} id={id} size="sm" shared={myElements.includes(id)} />
        ))}
      </div>
    </div>
  );
}

export function PromptBlock({ promptId, answer }: { promptId: string; answer: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-4">
      <p className="text-xs font-semibold text-ink-2">{PROMPT_BY_ID[promptId]?.text}</p>
      <p className="mt-1 font-display text-lg leading-snug text-ink">{answer}</p>
    </div>
  );
}

export function PersonPhoto({ person, level, label, className, priority }: { person: PublicProfile; level: number | "original"; label?: string; className?: string; priority?: boolean }) {
  return <BlurPhoto photoId={person.photoIds[0]} level={level} alt={`Photo of ${person.first_name}`} label={label} className={className} priority={priority} />;
}
