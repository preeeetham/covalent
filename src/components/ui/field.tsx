import { cn } from "@/lib/utils";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "h-12 w-full rounded-2xl border border-line bg-surface px-4 text-[16px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-bond";

export function Chip({ active, onClick, children, role = "checkbox" }: { active: boolean; onClick: () => void; children: React.ReactNode; role?: "checkbox" | "radio" }) {
  return (
    <button
      type="button"
      role={role}
      aria-checked={active}
      onClick={onClick}
      className={cn("min-h-[44px] rounded-full border px-4 text-sm font-semibold transition-colors", active ? "border-ink bg-ink text-paper" : "border-line bg-surface text-ink-2 hover:text-ink")}
    >
      {children}
    </button>
  );
}
