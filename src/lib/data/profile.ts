import "server-only";
import { admin } from "@/lib/supabase/admin";
import { ageFromDob } from "@/lib/utils";
import type { MatchInput } from "@/lib/matching/score";
import type { Profile } from "@/lib/errors";

/** What another person is allowed to see about someone. No quiz answers, no email, no DOB. */
export type PublicProfile = {
  id: string;
  first_name: string;
  age: number | null;
  city: string | null;
  hometown: string | null;
  role: string | null;
  company: string | null;
  intent: string | null;
  archetype: string | null;
  verified: boolean;
  is_demo: boolean;
  reliability: number;
  elements: string[];
  prompts: { prompt_id: string; answer: string }[];
  photoIds: string[];
};

export async function loadPublicProfiles(ids: string[]): Promise<Map<string, PublicProfile>> {
  const out = new Map<string, PublicProfile>();
  if (!ids.length) return out;
  const db = admin();
  const [profiles, elements, prompts, photos] = await Promise.all([
    db.from("profiles").select("id, first_name, dob, city, hometown, role, company, intent, archetype, verified, is_demo, reliability, deleted_at").in("id", ids),
    db.from("user_elements").select("user_id, element_id").in("user_id", ids),
    db.from("user_prompts").select("user_id, prompt_id, answer, position").in("user_id", ids).order("position"),
    db.from("photos").select("id, user_id, position").in("user_id", ids).order("position"),
  ]);
  for (const p of profiles.data ?? []) {
    if (p.deleted_at) continue;
    out.set(p.id, {
      id: p.id,
      first_name: p.first_name ?? "Someone",
      age: ageFromDob(p.dob),
      city: p.city,
      hometown: p.hometown,
      role: p.role,
      company: p.company,
      intent: p.intent,
      archetype: p.archetype,
      verified: p.verified,
      is_demo: p.is_demo,
      reliability: p.reliability,
      elements: (elements.data ?? []).filter((e) => e.user_id === p.id).map((e) => e.element_id),
      prompts: (prompts.data ?? []).filter((x) => x.user_id === p.id).map((x) => ({ prompt_id: x.prompt_id, answer: x.answer })),
      photoIds: (photos.data ?? []).filter((x) => x.user_id === p.id).map((x) => x.id),
    });
  }
  return out;
}

export async function loadPublicProfile(id: string) {
  return (await loadPublicProfiles([id])).get(id) ?? null;
}

/** Matching inputs for many users at once. */
export async function loadMatchInputs(profiles: Profile[]): Promise<MatchInput[]> {
  const ids = profiles.map((p) => p.id);
  if (!ids.length) return [];
  const db = admin();
  const [quiz, elements] = await Promise.all([
    db.from("quiz_answers").select("user_id, question_id, value").in("user_id", ids),
    db.from("user_elements").select("user_id, element_id").in("user_id", ids),
  ]);
  return profiles.map((p) => ({
    id: p.id,
    gender: p.gender,
    interested_in: p.interested_in,
    city: p.city,
    age: ageFromDob(p.dob),
    hometown: p.hometown,
    intent: p.intent,
    quiz: Object.fromEntries((quiz.data ?? []).filter((q) => q.user_id === p.id).map((q) => [q.question_id, q.value])),
    elements: (elements.data ?? []).filter((e) => e.user_id === p.id).map((e) => e.element_id),
    last_active_at: p.last_active_at,
    reliability: p.reliability,
    is_demo: p.is_demo,
  }));
}

export async function blockedIds(userId: string): Promise<Set<string>> {
  const { data } = await admin()
    .from("blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
  return new Set((data ?? []).map((b) => (b.blocker_id === userId ? b.blocked_id : b.blocker_id)));
}

export { photoUrl } from "@/lib/photos/url";
