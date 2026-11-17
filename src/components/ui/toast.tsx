"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck } from "lucide-react";

type Toast = { id: number; text: string; kind: "ok" | "error" };
let push: ((t: Omit<Toast, "id">) => void) | null = null;

export const toast = {
  ok: (text: string) => push?.({ text, kind: "ok" }),
  error: (text: string) => push?.({ text, kind: "error" }),
};

/** Show the error from an ActionResult, or run onOk. Returns true on success. */
export function handle<T>(res: { ok: true; data?: T } | { ok: false; error: string }, okText?: string): res is { ok: true; data?: T } {
  if (!res.ok) {
    toast.error(res.error);
    return false;
  }
  if (okText) toast.ok(okText);
  return true;
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    push = (t) => {
      const id = Date.now() + Math.random();
      setItems((xs) => [...xs.slice(-2), { ...t, id }]);
      setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4200);
    };
    return () => {
      push = null;
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            role={t.kind === "error" ? "alert" : "status"}
            className="pointer-events-auto flex max-w-sm items-start gap-2 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink shadow-[var(--shadow-lift)]"
          >
            {t.kind === "error" ? <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" /> : <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" />}
            <span>{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
