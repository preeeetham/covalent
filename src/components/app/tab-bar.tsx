"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Atom, CalendarHeart, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/today", label: "Today", icon: Sparkles },
  { href: "/bonds", label: "Bonds", icon: Atom },
  { href: "/dates", label: "Dates", icon: CalendarHeart },
  { href: "/you", label: "You", icon: UserRound },
];

export function TabBar({ yourMove, extra }: { yourMove: number; extra?: React.ReactNode }) {
  const path = usePathname();
  // Rounds and the reveal are focused, full-screen moments.
  if (/^\/bonds\/[^/]+\/(round|reveal)/.test(path)) return null;
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[440px] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around rounded-[26px] border border-line bg-surface px-2 py-1.5 shadow-[var(--shadow-lift)]">
        {TABS.map((t) => {
          const active = path === t.href || path.startsWith(t.href + "/");
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={cn("relative flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl px-3 text-[11px] font-semibold transition-colors", active ? "text-ink" : "text-ink-3 hover:text-ink-2")}
            >
              {active && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-2xl bg-surface-2" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <Icon className="relative size-[22px]" strokeWidth={active ? 2.3 : 1.9} aria-hidden />
              <span className="relative">{t.label}</span>
              {t.href === "/bonds" && yourMove > 0 && (
                <span className="absolute right-2.5 top-1.5 grid min-w-[18px] place-items-center rounded-full bg-react px-1 text-[10px] font-bold leading-[18px] text-on-accent" aria-label={`${yourMove} waiting on you`}>
                  {yourMove}
                </span>
              )}
            </Link>
          );
        })}
        {extra}
      </div>
    </nav>
  );
}
