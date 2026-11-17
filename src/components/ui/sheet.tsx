"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

/** Bottom sheet on phones, centred dialog on wider screens. Focus-trapped via <dialog>. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  dismissable = true,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  dismissable?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        if (dismissable) onClose();
      }}
      onClick={(e) => {
        if (dismissable && e.target === ref.current) onClose();
      }}
      className="m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      <AnimatePresence>
        {open && (
          <div className="pointer-events-none flex h-full items-end justify-center sm:items-center">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="pointer-events-auto max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[28px] border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink shadow-[var(--shadow-lift)] sm:rounded-[28px]"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl leading-tight">{title}</h2>
                {dismissable && (
                  <button onClick={onClose} aria-label="Close" className="-m-2 grid size-11 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-surface-2">
                    <X className="size-5" />
                  </button>
                )}
              </div>
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
