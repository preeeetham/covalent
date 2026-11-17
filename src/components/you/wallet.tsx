"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, PlusCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { handle, toast } from "@/components/ui/toast";
import { Checkout, type CheckoutSession } from "@/components/payments/checkout";
import { beginCatalystPurchase, spendCatalyst } from "@/app/actions/dates";

/**
 * Catalysts: sachet-priced extras (₹39 each / ₹99 for three). Nothing needed to meet
 * someone is behind a paywall — these only add convenience. See docs/DECISIONS.md (#9).
 */
export function Wallet({ catalysts, extraSlotUntil, extendable }: { catalysts: number; extraSlotUntil: string | null; extendable: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [buy, setBuy] = useState(false);
  const [extend, setExtend] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutSession | null>(null);
  const slotActive = extraSlotUntil && new Date(extraSlotUntil) > new Date();

  const use = (kind: "slot" | "extend" | "pick", bondId?: string, ok?: string) =>
    start(async () => {
      if (handle(await spendCatalyst(kind, bondId), ok)) {
        setExtend(false);
        router.refresh();
      }
    });

  const purchase = (pack: 1 | 3) =>
    start(async () => {
      const res = await beginCatalystPurchase(pack);
      if (handle(res) && res.data) {
        setBuy(false);
        setCheckout(res.data);
      }
    });

  return (
    <section className="rounded-[24px] border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink-3">Catalysts</p>
          <p className="mt-1 flex items-center gap-2 font-display text-3xl text-ink">
            <Zap className="size-6 text-bond" /> {catalysts}
          </p>
        </div>
        <Button size="sm" variant="ink" onClick={() => setBuy(true)}>
          Get more
        </Button>
      </div>
      <p className="mt-2 text-sm text-ink-2">Small boosts for when life gets busy. Never needed to meet someone.</p>
      <div className="mt-4 space-y-2">
        <Button block size="sm" disabled={catalysts < 1 || !!slotActive} loading={pending} onClick={() => use("slot", undefined, "Fourth bond slot open for 7 days.")}>
          <PlusCircle className="size-4" /> {slotActive ? "Extra slot active" : "4th bond slot for a week · 1"}
        </Button>
        <Button block size="sm" disabled={catalysts < 1 || !extendable.length} onClick={() => setExtend(true)}>
          <Clock className="size-4" /> Extend a bond by 48h · 1
        </Button>
        <Button block size="sm" disabled={catalysts < 1} loading={pending} onClick={() => use("pick", undefined, "One more person added to today's batch.")}>
          <Sparkles className="size-4" /> One extra pick today · 1
        </Button>
      </div>

      <Sheet open={buy} onClose={() => setBuy(false)} title="Get catalysts">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => purchase(1)} disabled={pending} className="rounded-[22px] border border-line p-4 text-left hover:bg-surface-2">
            <p className="font-display text-3xl text-ink">1</p>
            <p className="text-sm text-ink-2">catalyst</p>
            <p className="mt-3 font-semibold text-ink">₹39</p>
          </button>
          <button onClick={() => purchase(3)} disabled={pending} className="relative rounded-[22px] border-2 border-bond p-4 text-left hover:bg-bond-soft">
            <span className="absolute -top-2.5 right-3 rounded-full bg-bond px-2 py-0.5 text-[10px] font-bold text-white">BEST VALUE</span>
            <p className="font-display text-3xl text-ink">3</p>
            <p className="text-sm text-ink-2">catalysts</p>
            <p className="mt-3 font-semibold text-ink">₹99</p>
          </button>
        </div>
        <p className="mt-4 text-xs text-ink-3">UPI-friendly sachet pricing. No subscriptions, no auto-renew.</p>
      </Sheet>

      <Sheet open={extend} onClose={() => setExtend(false)} title="Extend which bond?">
        <div className="space-y-2">
          {extendable.map((b) => (
            <Button key={b.id} block onClick={() => use("extend", b.id, `${b.name}'s bond extended by 48 hours.`)} loading={pending}>
              {b.name}
            </Button>
          ))}
        </div>
      </Sheet>

      <Checkout
        session={checkout}
        onClose={() => setCheckout(null)}
        onPaid={() => {
          setCheckout(null);
          toast.ok("Catalysts added.");
          router.refresh();
        }}
      />
    </section>
  );
}
