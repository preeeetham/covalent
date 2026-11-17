import { cn } from "@/lib/utils";
import { ELEMENT_BY_ID, type ElementCategory } from "@/content/elements";

const CAT_STYLE: Record<ElementCategory, string> = {
  food: "bg-[#fff1e6] text-[#9a4a12] dark:bg-[#3a2616] dark:text-[#ffc59a]",
  active: "bg-[#e7f6ee] text-[#17663f] dark:bg-[#15302a] dark:text-[#9fe3c0]",
  culture: "bg-[#f3ecff] text-[#5a2fc4] dark:bg-[#2a2140] dark:text-[#cbb6ff]",
  mind: "bg-[#e9f0ff] text-[#2847b0] dark:bg-[#1b2440] dark:text-[#b3c7ff]",
  life: "bg-[#ffe9f3] text-[#a3245f] dark:bg-[#3a1a2a] dark:text-[#ffb3d2]",
};

/** An interest rendered as a periodic-table tile. */
export function ElementTile({
  id,
  size = "md",
  shared,
  selected,
  className,
}: {
  id: string;
  size?: "sm" | "md" | "lg";
  shared?: boolean;
  selected?: boolean;
  className?: string;
}) {
  const e = ELEMENT_BY_ID[id];
  if (!e) return null;
  const dims = size === "sm" ? "w-[64px] h-[64px] p-1.5" : size === "lg" ? "w-[92px] h-[92px] p-2.5" : "w-[76px] h-[76px] p-2";
  return (
    <div
      className={cn(
        "relative flex shrink-0 flex-col justify-between rounded-2xl transition-shadow",
        CAT_STYLE[e.category],
        dims,
        shared && "ring-2 ring-bond ring-offset-2 ring-offset-paper",
        selected && "ring-2 ring-ink ring-offset-2 ring-offset-paper",
        className,
      )}
      title={e.name}
    >
      <span className="font-mono text-[10px] leading-none opacity-70">{e.number}</span>
      <span className={cn("font-display font-semibold leading-none", size === "sm" ? "text-xl" : size === "lg" ? "text-[34px]" : "text-[26px]")}>{e.symbol}</span>
      <span className={cn("truncate font-medium leading-tight", size === "sm" ? "text-[9px]" : "text-[10.5px]")}>{e.name}</span>
    </div>
  );
}

/** Archetype tile — bigger, gradient-edged. */
export function ArchetypeTile({ symbol, number, name, className }: { symbol: string; number: number; name: string; className?: string }) {
  return (
    <div className={cn("relative rounded-[28px] bg-litmus p-[2px]", className)}>
      <div className="flex aspect-square flex-col justify-between rounded-[26px] bg-surface p-4">
        <span className="font-mono text-sm text-ink-2">{number}</span>
        <span className="font-display text-7xl font-semibold leading-none text-ink">{symbol}</span>
        <span className="font-medium text-ink-2">{name}</span>
      </div>
    </div>
  );
}
