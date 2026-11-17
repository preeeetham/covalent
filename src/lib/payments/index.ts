import "server-only";
import { admin } from "@/lib/supabase/admin";
import { ActionError } from "@/lib/errors";

/**
 * Payments. Default provider is MOCK: a realistic UPI-style checkout labelled "Test mode",
 * no real money moves. The Razorpay provider is a documented stub for going live.
 * See docs/DECISIONS.md (#23).
 */
export const PRICES = {
  commitment: 99,
  catalyst1: 39,
  catalyst3: 99,
} as const;

export type PaymentKind = "commitment" | "catalyst";

export interface PaymentProvider {
  name: string;
  /** Create an order with the provider; returns a client-side reference. */
  createOrder(input: { paymentId: string; amountInr: number; description: string }): Promise<{ ref: string; testMode: boolean }>;
  /** Verify a completed payment server-side (signature check for real providers). */
  verify(input: { paymentId: string; ref: string; outcome: "success" | "failure"; signature?: string }): Promise<boolean>;
}

const mockProvider: PaymentProvider = {
  name: "mock",
  async createOrder({ paymentId }) {
    return { ref: `mock_${paymentId.slice(0, 8)}`, testMode: true };
  },
  async verify({ outcome }) {
    return outcome === "success";
  },
};

/**
 * Going live needs: a Razorpay account + KYC, RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET,
 * creating orders via their Orders API, opening Checkout on the client, and verifying the
 * HMAC-SHA256 signature of `order_id|payment_id` here. Plus refund handling for cancellations.
 */
const razorpayProvider: PaymentProvider = {
  name: "razorpay",
  async createOrder() {
    throw new ActionError("Razorpay is not configured in this build.");
  },
  async verify() {
    return false;
  },
};

export function provider(): PaymentProvider {
  return process.env.PAYMENTS_PROVIDER === "razorpay" ? razorpayProvider : mockProvider;
}

export async function createPayment(input: {
  userId: string;
  kind: PaymentKind;
  amountInr: number;
  datePlanId?: string;
  meta?: Record<string, string | number>;
  description: string;
}) {
  const p = provider();
  const { data, error } = await admin()
    .from("payments")
    .insert({
      user_id: input.userId,
      kind: input.kind,
      amount_inr: input.amountInr,
      provider: p.name,
      date_plan_id: input.datePlanId ?? null,
      meta: input.meta ?? {},
    })
    .select("id")
    .single();
  if (error || !data) throw new ActionError("Couldn't start the payment.");
  const order = await p.createOrder({ paymentId: data.id, amountInr: input.amountInr, description: input.description });
  await admin().from("payments").update({ ref: order.ref }).eq("id", data.id);
  return { paymentId: data.id, ref: order.ref, testMode: order.testMode, amountInr: input.amountInr, description: input.description };
}

export type CheckoutSession = Awaited<ReturnType<typeof createPayment>>;
