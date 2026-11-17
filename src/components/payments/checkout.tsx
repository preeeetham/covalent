"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck, Smartphone, AtSign, Check } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { finishPayment } from "@/app/actions/dates";
import { toast } from "@/components/ui/toast";
import { cn, formatINR } from "@/lib/utils";

export type CheckoutSession = { paymentId: string; ref: string; testMode: boolean; amountInr: number; description: string };

const METHODS = [
  { id: "upi-app", label: "UPI app", icon: Smartphone },
  { id: "upi-id", label: "UPI ID", icon: AtSign },
  { id: "card", label: "Card", icon: CreditCard },
];

/**
 * Mock checkout, deliberately labelled TEST MODE. It never asks for real payment details.
 * Server verifies through the PaymentProvider interface (lib/payments).
 */
export function Checkout({ session, onClose, onPaid }: { session: CheckoutSession | null; onClose: () => void; onPaid: (r: { confirmed?: boolean }) => void }) {
  const [method, setMethod] = useState("upi-app");
  const [state, setState] = useState<"idle" | "paying" | "done">("idle");

  const pay = async (outcome: "success" | "failure") => {
    if (!session) return;
    setState("paying");
    await new Promise((r) => setTimeout(r, 1300));
    const res = await finishPayment(session.paymentId, outcome);
    if (!res.ok) {
      setState("idle");
      toast.error(res.error);
      onClose();
      return;
    }
    setState("done");
    await new Promise((r) => setTimeout(r, 900));
    setState("idle");
    onPaid(res.data ?? {});
  };

  return (
    <Sheet open={!!session} onClose={() => state === "idle" && onClose()} title="Checkout" dismissable={state === "idle"}>
      {session && (
        <div>
          <div className="mb-4 rounded-2xl border border-dashed border-warn/60 bg-warn/10 px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-warn">
            Test mode · no real money moves
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-ink-2">{session.description}</p>
            <p className="font-display text-3xl text-ink">{formatINR(session.amountInr)}</p>
          </div>
          <p className="mt-1 font-mono text-[11px] text-ink-3">order {session.ref}</p>

          <div className="mt-5 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
            {METHODS.map((m) => (
              <button key={m.id} role="radio" aria-checked={method === m.id} onClick={() => setMethod(m.id)} className={cn("flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border text-xs font-semibold", method === m.id ? "border-ink bg-surface-2 text-ink" : "border-line text-ink-2")}>
                <m.icon className="size-5" />
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-3">In test mode no payment details are collected. Going live uses Razorpay's hosted checkout.</p>

          <Button variant="ink" size="lg" block className="mt-5" onClick={() => pay("success")} loading={state === "paying"} disabled={state !== "idle"}>
            {state === "done" ? (
              <>
                <Check className="size-5" /> Paid
              </>
            ) : (
              `Pay ${formatINR(session.amountInr)}`
            )}
          </Button>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-ink-3">
              <ShieldCheck className="size-3.5" /> Secured by provider
            </span>
            <button onClick={() => pay("failure")} disabled={state !== "idle"} className="min-h-[44px] font-semibold text-ink-2 underline-offset-2 hover:underline">
              Simulate a failed payment
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
