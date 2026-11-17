"use client";

import { useSyncExternalStore } from "react";

// One shared 1-second clock for every countdown on the page.
let listeners: (() => void)[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
function subscribe(cb: () => void) {
  listeners.push(cb);
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 1000);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
    if (!listeners.length && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
const nowSecond = () => Math.floor(Date.now() / 1000);

export function Countdown({ to, className }: { to: string; className?: string }) {
  const now = useSyncExternalStore(subscribe, nowSecond, () => null);
  if (now === null) return <span className={className}>--h --m</span>;
  const ms = Math.max(0, new Date(to).getTime() - now * 1000);
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return (
    <span className={className}>
      {h}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s
    </span>
  );
}
