"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { admin } from "@/lib/supabase/admin";
import { ActionError, actionViewer, run } from "@/lib/auth";
import { CITY_IDS } from "@/content/cities";
import { QUIZ } from "@/content/quiz";
import { ELEMENT_BY_ID } from "@/content/elements";
import { PROMPT_BY_ID } from "@/content/prompts";
import { archetypeFor } from "@/content/archetypes";
import { track } from "@/lib/events";
import { deletePhotoFiles } from "@/lib/photos/process";

const pre = () => actionViewer({ onboarded: false });
const advance = (id: string, step: number, current: number) =>
  admin().from("profiles").update({ onboarding_step: Math.max(step, current) }).eq("id", id);

const Basics = z.object({
  first_name: z.string().trim().min(1, "Tell us your first name.").max(30),
  gender: z.enum(["woman", "man", "nonbinary"]),
  interested_in: z.array(z.enum(["woman", "man", "nonbinary", "everyone"])).min(1, "Pick who you'd like to meet."),
  city: z.enum(CITY_IDS),
  hometown: z.string().trim().max(40).optional().default(""),
  role: z.string().trim().min(1, "What do you do?").max(50),
  company: z.string().trim().max(50).optional().default(""),
});

export async function saveBasics(input: z.input<typeof Basics>) {
  return run(async () => {
    const v = await pre();
    const b = Basics.parse(input);
    await admin()
      .from("profiles")
      .update({ ...b, hometown: b.hometown || null, company: b.company || null, first_name: b.first_name.replace(/\s+/g, " ") })
      .eq("id", v.id);
    await advance(v.id, 2, v.onboarding_step);
  });
}

export async function saveIntent(intent: string) {
  return run(async () => {
    const v = await pre();
    const i = z.enum(["serious", "see", "friends"]).parse(intent);
    await admin().from("profiles").update({ intent: i }).eq("id", v.id);
    await advance(v.id, 3, v.onboarding_step);
  });
}

export async function saveQuiz(answers: Record<string, number>) {
  return run(async () => {
    const v = await pre();
    const parsed = z.record(z.string(), z.number().int().min(1).max(5)).parse(answers);
    const rows = QUIZ.map((q) => {
      if (parsed[q.id] == null) throw new ActionError("Answer every question.");
      return { user_id: v.id, question_id: q.id, value: parsed[q.id] };
    });
    await admin().from("quiz_answers").upsert(rows, { onConflict: "user_id,question_id" });
    await admin().from("profiles").update({ archetype: archetypeFor(parsed).id }).eq("id", v.id);
    await advance(v.id, 4, v.onboarding_step);
  });
}

export async function saveElements(ids: string[]) {
  return run(async () => {
    const v = await pre();
    const list = z.array(z.string()).min(5, "Pick at least 5.").max(8, "Pick up to 8.").parse([...new Set(ids)]);
    if (list.some((id) => !ELEMENT_BY_ID[id])) throw new ActionError("Unknown element.");
    await admin().from("user_elements").delete().eq("user_id", v.id);
    await admin().from("user_elements").insert(list.map((element_id) => ({ user_id: v.id, element_id })));
    await advance(v.id, 5, v.onboarding_step);
  });
}

const PromptAnswers = z
  .array(z.object({ prompt_id: z.string(), answer: z.string().trim().min(2, "Write a little more.").max(220) }))
  .length(3, "Answer three prompts.");

export async function savePrompts(answers: z.input<typeof PromptAnswers>) {
  return run(async () => {
    const v = await pre();
    const list = PromptAnswers.parse(answers);
    if (list.some((a) => !PROMPT_BY_ID[a.prompt_id]) || new Set(list.map((a) => a.prompt_id)).size !== 3)
      throw new ActionError("Pick three different prompts.");
    await admin().from("user_prompts").delete().eq("user_id", v.id);
    await admin().from("user_prompts").insert(list.map((a, i) => ({ user_id: v.id, prompt_id: a.prompt_id, answer: a.answer, position: i })));
    await advance(v.id, 6, v.onboarding_step);
    revalidatePath("/you");
  });
}

export async function finishPhotos() {
  return run(async () => {
    const v = await pre();
    const { count } = await admin().from("photos").select("*", { count: "exact", head: true }).eq("user_id", v.id);
    if (!count) throw new ActionError("Add at least one photo.");
    await advance(v.id, 7, v.onboarding_step);
  });
}

export async function completeOnboarding() {
  return run(async () => {
    const v = await pre();
    if (v.onboarding_step < 7) throw new ActionError("A few steps are still left.");
    if (!v.onboarded_at) {
      await admin().from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", v.id);
      await track(v.id, "onboarded", { city: v.city ?? "", gender: v.gender ?? "" });
    }
  });
}

export async function deletePhoto(photoId: string) {
  return run(async () => {
    const v = await pre();
    const { data: photo } = await admin().from("photos").select("*").eq("id", photoId).eq("user_id", v.id).maybeSingle();
    if (!photo) throw new ActionError("Photo not found.");
    const { count } = await admin().from("photos").select("*", { count: "exact", head: true }).eq("user_id", v.id);
    if (v.onboarded_at && (count ?? 0) <= 1) throw new ActionError("Keep at least one photo.");
    await admin().from("photos").delete().eq("id", photoId);
    await deletePhotoFiles([photo.path_original, ...photo.path_blur]);
    revalidatePath("/you");
  });
}
