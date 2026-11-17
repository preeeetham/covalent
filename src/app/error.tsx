"use client";

import { useEffect } from "react";
import { BondAtoms } from "@/components/brand/atoms";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col items-center justify-center px-6 text-center">
      <BondAtoms rounds={1} className="max-w-[220px]" />
      <h1 className="mt-4 font-display text-4xl text-ink">Unexpected reaction.</h1>
      <p className="mt-2 text-ink-2">Something went wrong on our side. Your data is safe.</p>
      <button onClick={reset} className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-ink px-6 font-semibold text-paper">
        Try again
      </button>
    </main>
  );
}
