"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "system" | "light" | "dark";
const KEY = "covalent-theme";
let listeners: (() => void)[] = [];

/** Light unless the person chose dark or "follow the system". */
function read(): Theme {
  try {
    const t = localStorage.getItem(KEY);
    return t === "dark" || t === "system" ? t : "light";
  } catch {
    return "light";
  }
}

function applyTheme(t: Theme) {
  try {
    if (t === "light") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, t);
  } catch {}
  const root = document.documentElement;
  if (t === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", t);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "light" as Theme);
  const opts = [
    { id: "light" as const, label: "Light", icon: Sun },
    { id: "dark" as const, label: "Dark", icon: Moon },
    { id: "system" as const, label: "System", icon: Monitor },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-surface p-1.5" role="radiogroup" aria-label="Theme">
      {opts.map((o) => (
        <button key={o.id} role="radio" aria-checked={theme === o.id} onClick={() => applyTheme(o.id)} className={cn("flex min-h-[44px] items-center justify-center gap-2 rounded-xl text-sm font-semibold", theme === o.id ? "bg-ink text-paper" : "text-ink-2")}>
          <o.icon className="size-4" /> {o.label}
        </button>
      ))}
    </div>
  );
}
