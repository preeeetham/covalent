import { cn } from "@/lib/utils";

/**
 * Two atoms (you and them) joined by shared electron pairs — one pair per completed round.
 *
 * The orbit rings rotate as separate HTML layers (not SVG groups), so the rotation runs on
 * the GPU compositor and never forces a repaint while the page scrolls.
 */
export function BondAtoms({ rounds, className, labels }: { rounds: number; className?: string; labels?: [string, string] }) {
  const pairs = Math.min(4, Math.max(0, rounds));
  return (
    <div className={cn("relative aspect-[2/1] w-full", className)} role="img" aria-label={`Bond with ${pairs} shared electron pair${pairs === 1 ? "" : "s"}`}>
      <Orbit cx={85} rotate={-25} className="orbit-slow" />
      <Orbit cx={155} rotate={25} className="orbit" />
      <svg viewBox="0 0 240 120" className="absolute inset-0 size-full" aria-hidden>
        <circle cx="85" cy="60" r="30" fill="url(#atom-a)" opacity="0.92" />
        <circle cx="155" cy="60" r="30" fill="url(#atom-b)" opacity="0.92" />
        {labels && (
          <>
            <text x="85" y="66" textAnchor="middle" className="fill-white font-display" fontSize="18" fontWeight="600">{labels[0]}</text>
            <text x="155" y="66" textAnchor="middle" className="fill-white font-display" fontSize="18" fontWeight="600">{labels[1]}</text>
          </>
        )}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = 33 + i * 18;
          const on = i < pairs;
          return (
            <g key={i} opacity={on ? 1 : 0.25}>
              <circle cx="114" cy={y} r="4.5" fill={on ? "var(--ink)" : "var(--ink-3)"} />
              <circle cx="126" cy={y} r="4.5" fill={on ? "var(--ink)" : "var(--ink-3)"} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** One orbit ring, positioned in the same 240×120 coordinate space, spinning on its own layer. */
function Orbit({ cx, rotate, className }: { cx: number; rotate: number; className: string }) {
  // Ring box: 104×104 viewBox units centred on (cx, 60), expressed as percentages.
  const size = 116;
  return (
    <div
      aria-hidden
      className={cn("absolute will-change-transform", className)}
      style={{ left: `${((cx - size / 2) / 240) * 100}%`, top: `${((60 - size / 2) / 120) * 100}%`, width: `${(size / 240) * 100}%`, height: `${(size / 120) * 100}%` }}
    >
      <svg viewBox="0 0 116 116" className="size-full">
        <ellipse cx="58" cy="58" rx="52" ry="22" fill="none" stroke="var(--line)" strokeWidth="1.5" transform={`rotate(${rotate} 58 58)`} />
      </svg>
    </div>
  );
}
