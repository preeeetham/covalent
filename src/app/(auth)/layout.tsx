import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { BondAtoms } from "@/components/brand/atoms";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1100px] items-stretch gap-16 px-5 lg:px-8">
      <div className="hidden flex-1 flex-col justify-between py-10 lg:flex">
        <Link href="/">
          <Logo />
        </Link>
        <div>
          <BondAtoms rounds={3} className="max-w-[360px]" />
          <p className="mt-6 font-display text-5xl leading-[1.02] text-ink">
            Get to know someone <span className="text-litmus">before</span> you see them.
          </p>
        </div>
        <p className="text-xs text-ink-3">Verified by eLitmus · No swiping, ever.</p>
      </div>
      <div className="mx-auto flex w-full max-w-[420px] flex-col justify-center py-10">
        <Link href="/" className="mb-8 lg:hidden">
          <Logo />
        </Link>
        {children}
      </div>
    </div>
  );
}
