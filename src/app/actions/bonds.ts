"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { actionViewer, rateLimit, run, ActionError } from "@/lib/auth";
import {
  dissolveBond, getBondForViewer, nudge, passItem, reactToAnswer, respondInvite,
  startReaction, submitRoundStep, tapReveal, tickPersona,
} from "@/lib/data/bonds";
import { personaReply, sendMessage } from "@/lib/data/chat";
import { R1Payload, R2AnswerPayload, R2AskPayload, R3Payload, R4Payload } from "@/lib/rounds/logic";
import { R2_REACTIONS } from "@/content/rounds";

const uuid = z.string().uuid();

export async function reactToPerson(batchItemId: string) {
  return run(async () => {
    const v = await actionViewer();
    const bondId = await startReaction(v, uuid.parse(batchItemId));
    revalidatePath("/today");
    revalidatePath("/bonds");
    return bondId;
  });
}

export async function passPerson(batchItemId: string, reason?: string) {
  return run(async () => {
    const v = await actionViewer();
    await passItem(v, uuid.parse(batchItemId), z.string().max(40).optional().parse(reason));
    revalidatePath("/today");
  });
}

export async function answerInvite(bondId: string, accept: boolean) {
  return run(async () => {
    const v = await actionViewer();
    await respondInvite(v, uuid.parse(bondId), accept);
    revalidatePath("/today");
    revalidatePath("/bonds");
  });
}

const SCHEMAS: Record<string, z.ZodTypeAny> = {
  "1:answer": R1Payload,
  "2:ask": R2AskPayload,
  "2:answer": R2AnswerPayload,
  "3:answer": R3Payload,
  "4:answer": R4Payload,
};

export async function submitRound(bondId: string, round: number, step: "answer" | "ask", payload: unknown) {
  return run(async () => {
    const v = await actionViewer();
    const schema = SCHEMAS[`${round}:${step}`];
    if (!schema) throw new ActionError("Unknown round step.");
    await submitRoundStep(v, uuid.parse(bondId), round, step, schema.parse(payload));
    revalidatePath(`/bonds/${bondId}`);
  });
}

export async function reactToRoundAnswer(bondId: string, reaction: string, note: string) {
  return run(async () => {
    const v = await actionViewer();
    const r = z.enum(R2_REACTIONS).parse(reaction);
    await reactToAnswer(v, uuid.parse(bondId), r, z.string().max(120).parse(note));
    revalidatePath(`/bonds/${bondId}`);
  });
}

export async function reveal(bondId: string) {
  return run(async () => {
    const v = await actionViewer();
    await tapReveal(v, uuid.parse(bondId));
    revalidatePath(`/bonds/${bondId}`);
  });
}

export async function dissolve(bondId: string, reason?: string) {
  return run(async () => {
    const v = await actionViewer();
    await dissolveBond(v, uuid.parse(bondId), z.string().max(60).optional().parse(reason));
    revalidatePath("/bonds");
  });
}

export async function sendNudge(bondId: string) {
  return run(async () => {
    const v = await actionViewer();
    await nudge(v, uuid.parse(bondId));
    revalidatePath(`/bonds/${bondId}`);
  });
}

/** Lets a waiting client ask a demo partner to take its scheduled move. */
export async function tickBond(bondId: string, force = false) {
  return run(async () => {
    const v = await actionViewer();
    const bond = await getBondForViewer(v, uuid.parse(bondId));
    if (!bond) throw new ActionError("Bond not found.");
    if (force && !v.is_evaluator) throw new ActionError("Demo controls are for evaluator accounts.");
    const acted = await tickPersona(bond.id, force);
    if (acted) revalidatePath(`/bonds/${bondId}`);
    return acted;
  });
}

export async function postMessage(bondId: string, body: string) {
  return run(async () => {
    const v = await actionViewer();
    await rateLimit(`msg:${v.id}`, 40, 60);
    return sendMessage(v, uuid.parse(bondId), z.string().parse(body));
  });
}

export async function requestPersonaReply(bondId: string) {
  return run(async () => {
    const v = await actionViewer();
    return personaReply(v, uuid.parse(bondId));
  });
}
