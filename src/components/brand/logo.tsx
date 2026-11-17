import { cn } from "@/lib/utils";

/** Two atoms sharing an electron pair — a covalent bond. */
export function LogoMark({ className, mono }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 48 32" className={cn("h-7 w-auto", className)} aria-hidden>
      <circle cx="16" cy="16" r="12" fill="none" stroke={mono ? "currentColor" : "url(#lg-litmus)"} strokeWidth="3" />
      <circle cx="32" cy="16" r="12" fill="none" stroke={mono ? "currentColor" : "url(#lg-litmus)"} strokeWidth="3" />
      <circle cx="24" cy="12.5" r="2.4" fill={mono ? "currentColor" : "#7C4DFF"} />
      <circle cx="24" cy="19.5" r="2.4" fill={mono ? "currentColor" : "#E0409A"} />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <LogoMark />
      <span className="font-display text-[22px] font-semibold tracking-tight">Covalent</span>
    </span>
  );
}
