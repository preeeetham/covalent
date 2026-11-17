import "server-only";
import { admin } from "@/lib/supabase/admin";
import { ActionError, type Profile } from "@/lib/errors";
import { getBondForViewer, partnerOf } from "@/lib/data/bonds";
import { detectContactInfo } from "@/lib/safety";
import { personaChatReply } from "@/lib/ai";
import { PERSONA_BY_KEY, personaChatFallback } from "@/lib/demo/persona-answers";
import { ELEMENT_BY_ID } from "@/content/elements";

export const chatOpen = (b: { status: string; round: number }) =>
  b.status === "revealed" || (b.status === "active" && b.round >= 1);

export async function sendMessage(viewer: Profile, bondId: string, body: string) {
  const text = body.trim();
  if (!text) throw new ActionError("Say something first.");
  if (text.length > 1000) throw new ActionError("That's a bit long. Keep it under 1000 characters.");
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond || !chatOpen(bond)) throw new ActionError("Chat opens after Round 1.");
  // Contact details before you've met are allowed but flagged for safety review.
  const flagged = bond.status !== "revealed" && detectContactInfo(text) !== null;
  const { data, error } = await admin()
    .from("messages")
    .insert({ bond_id: bondId, sender_id: viewer.id, body: text, flagged })
    .select("*")
    .single();
  if (error) throw new ActionError("Message didn't send. Try again.");
  await admin().from("bonds").update({ last_move_at: new Date().toISOString() }).eq("id", bondId);
  return data;
}

/** Demo persona replies to the latest human message, if it hasn't already. */
export async function personaReply(viewer: Profile, bondId: string) {
  const bond = await getBondForViewer(viewer, bondId);
  if (!bond || !chatOpen(bond)) return null;
  const partnerId = partnerOf(bond, viewer.id);
  const db = admin();
  const { data: partner } = await db.from("profiles").select("id, is_demo, first_name, persona, hometown, role, city").eq("id", partnerId).single();
  if (!partner?.is_demo) return null;
  const p = PERSONA_BY_KEY[(partner.persona as { key?: string } | null)?.key ?? ""];
  if (!p) return null;

  const { data: msgs } = await db.from("messages").select("sender_id, body, kind").eq("bond_id", bondId).eq("kind", "text").order("created_at").limit(60);
  const history = (msgs ?? []).map((m) => ({ fromPersona: m.sender_id === partnerId, body: m.body }));
  if (!history.length || history[history.length - 1].fromPersona) return null;

  const facts = `${p.age}, ${p.role} at a ${p.company} in ${p.city}, from ${p.hometown}. Likes ${p.elements.map((e) => ELEMENT_BY_ID[e]?.name).join(", ")}. ${p.prompts.map(([, a]) => a).join(" ")}`;
  const ai = await personaChatReply({ name: p.first_name, voice: p.voice, facts, history, partnerName: viewer.first_name ?? "them" });
  const body = ai ?? personaChatFallback(p, history.filter((h) => h.fromPersona).length);
  const { data } = await db.from("messages").insert({ bond_id: bondId, sender_id: partnerId, body }).select("*").single();
  return data;
}
