import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line/60 bg-paper">
        <nav className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5" aria-label="Site">
          <Link href="/" aria-label="Covalent home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden min-h-[44px] items-center rounded-full px-4 text-sm font-semibold text-ink-2 hover:text-ink sm:inline-flex">
              Log in
            </Link>
            <Link href="/signup" className="inline-flex min-h-[44px] items-center rounded-full bg-ink px-5 text-sm font-semibold text-paper">
              Join
            </Link>
          </div>
        </nav>
      </header>
      {children}
      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-[1100px] gap-8 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-[36ch] text-sm text-ink-2">Bonds are shared, not swiped. A dating app for verified young professionals in India, from the team behind eLitmus.</p>
            <p className="mt-4 text-xs text-ink-3">Demo build for evaluation. Venue names and demo profiles are fictional.</p>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-ink">Product</p>
            <Link href="/signup" className="block text-ink-2 hover:text-ink">Join</Link>
            <Link href="/login" className="block text-ink-2 hover:text-ink">Log in</Link>
            <Link href="/#how" className="block text-ink-2 hover:text-ink">How it works</Link>
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-ink">Trust</p>
            <Link href="/privacy" className="block text-ink-2 hover:text-ink">Privacy</Link>
            <Link href="/terms" className="block text-ink-2 hover:text-ink">Terms</Link>
            <Link href="/guidelines" className="block text-ink-2 hover:text-ink">Community guidelines</Link>
            <Link href="/safety" className="block text-ink-2 hover:text-ink">Safety & grievances</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
