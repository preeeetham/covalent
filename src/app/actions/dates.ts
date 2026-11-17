"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { actionViewer, run } from "@/lib/auth";
import {
  cancelDate, completePayment, counterDate, proposeDate, respondDate,
  startCatalystPurchase, startCommitment, submitFeedback, useCatalyst,
} from "@/lib/data/dates";

const uuid = z.string().uuid();
const iso = z.string().min(10);

function refresh(bondId?: string) {
  revalidatePath("/dates");
  if (bondId) revalidatePath(`/bonds/${bondId}`);
}

export async function propose(bondId: string, venueId: string, startsAt: string, note?: string) {
  return run(async () => {
    const v = await actionViewer();
    await proposeDate(v, uuid.parse(bondId), uuid.parse(venueId), iso.parse(startsAt), z.string().max(140).optional().parse(note));
    refresh(bondId);
  });
}

export async function respondToPlan(planId: string, accept: boolean, bondId: string) {
  return run(async () => {
    const v = await actionViewer();
    await respondDate(v, uuid.parse(planId), accept);
    refresh(bondId);
  });
}

export async function counterPlan(planId: string, venueId: string, startsAt: string, bondId: string) {
  return run(async () => {
    const v = await actionViewer();
    await counterDate(v, uuid.parse(planId), uuid.parse(venueId), iso.parse(startsAt));
    refresh(bondId);
  });
}

export async function cancelPlan(planId: string, bondId: string) {
  return run(async () => {
    const v = await actionViewer();
    await cancelDate(v, uuid.parse(planId));
    refresh(bondId);
  });
}

export async function beginCommitment(planId: string) {
  return run(async () => {
    const v = await actionViewer();
    return startCommitment(v, uuid.parse(planId));
  });
}

export async function beginCatalystPurchase(pack: 1 | 3) {
  return run(async () => {
    const v = await actionViewer();
    return startCatalystPurchase(v, z.union([z.literal(1), z.literal(3)]).parse(pack));
  });
}

export async function finishPayment(paymentId: string, outcome: "success" | "failure") {
  return run(async () => {
    const v = await actionViewer();
    const r = await completePayment(v, uuid.parse(paymentId), z.enum(["success", "failure"]).parse(outcome));
    revalidatePath("/dates");
    revalidatePath("/you");
    revalidatePath("/bonds", "layout");
    return r;
  });
}

const Feedback = z.object({
  showed_up: z.boolean(),
  felt_safe: z.boolean(),
  meet_again: z.boolean(),
  note: z.string().max(300).optional(),
});

export async function leaveFeedback(planId: string, f: z.input<typeof Feedback>) {
  return run(async () => {
    const v = await actionViewer();
    await submitFeedback(v, uuid.parse(planId), Feedback.parse(f));
    refresh();
  });
}

export async function spendCatalyst(kind: "slot" | "extend" | "pick", bondId?: string) {
  return run(async () => {
    const v = await actionViewer();
    await useCatalyst(v, z.enum(["slot", "extend", "pick"]).parse(kind), bondId ? uuid.parse(bondId) : undefined);
    revalidatePath("/you");
    revalidatePath("/today");
    revalidatePath("/bonds", "layout");
  });
}
