import Link from "next/link";
import { cn } from "@/lib/utils";

/** Bond slots drawn as physical sockets: filled = in use. */
export function SlotDots({ used, limit }: { used: number; limit: number }) {
  return (
    <Link href="/bonds" className="flex flex-col items-end gap-1.5" aria-label={`${used} of ${limit} bond slots in use`}>
      <div className="flex gap-1.5">
        {Array.from({ length: limit }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-3.5 rounded-full border-2 transition-colors",
              i < used ? "border-transparent bg-litmus" : "border-line bg-surface",
              i >= 3 && "ring-2 ring-bond/30",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-[11px] text-ink-3">{used}/{limit} bonds</span>
    </Link>
  );
}
