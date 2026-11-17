import { cn } from "@/lib/utils";

/**
 * Two atoms (you and them) joined by shared electron pairs — one pair per completed round.
 * The orbiting electrons are a slow CSS animation.
 */
export function BondAtoms({ rounds, className, labels }: { rounds: number; className?: string; labels?: [string, string] }) {
  const pairs = Math.min(4, Math.max(0, rounds));
  return (
    <svg viewBox="0 0 240 120" className={cn("w-full", className)} role="img" aria-label={`Bond with ${pairs} shared electron pair${pairs === 1 ? "" : "s"}`}>
      <g className="orbit-slow">
        <ellipse cx="85" cy="60" rx="52" ry="22" fill="none" stroke="var(--line)" strokeWidth="1.5" transform="rotate(-25 85 60)" />
      </g>
      <g className="orbit">
        <ellipse cx="155" cy="60" rx="52" ry="22" fill="none" stroke="var(--line)" strokeWidth="1.5" transform="rotate(25 155 60)" />
      </g>
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
  );
}
