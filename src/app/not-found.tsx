import Link from "next/link";
import { BondAtoms } from "@/components/brand/atoms";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[440px] flex-col items-center justify-center px-6 text-center">
      <BondAtoms rounds={0} className="max-w-[220px]" />
      <h1 className="mt-4 font-display text-4xl text-ink">No reaction here.</h1>
      <p className="mt-2 text-ink-2">This page doesn't exist, or it's not yours to see.</p>
      <Link href="/" className="mt-6 inline-flex min-h-[48px] items-center rounded-full bg-ink px-6 font-semibold text-paper">
        Back to Covalent
      </Link>
    </main>
  );
}
