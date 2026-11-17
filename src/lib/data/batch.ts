import "server-only";
import { admin } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/errors";
import { batchDateFor } from "@/lib/time";
import { isLiveCity } from "@/content/cities";
import { isEligible, pickBatch, scoreMatch } from "@/lib/matching/score";
import { blockedIds, loadMatchInputs, loadPublicProfiles, type PublicProfile } from "@/lib/data/profile";
import { whyYouTwo } from "@/lib/ai";
import { hash, rng } from "@/lib/utils";
import type { Json } from "@/lib/supabase/database.types";

export const BATCH_SIZE = 3;
const NO_REPEAT_DAYS = 14;

export type BatchItem = {
  id: string;
  status: "pending" | "reacted" | "passed";
  score: number;
  why_text: string | null;
  reasons: { kind: string; text: string }[];
  person: PublicProfile;
};

export type TodayBatch =
  | { kind: "waitlist"; city: string | null }
  | { kind: "batch"; batchDate: string; items: BatchItem[]; poolExhausted: boolean };

async function candidatePool(viewer: Profile) {
  const db = admin();
  const wants = viewer.interested_in.includes("everyone") ? ["man", "woman", "nonbinary"] : viewer.interested_in;
  const { data } = await db
    .from("profiles")
    .select("*")
    .eq("city", viewer.city!)
    .in("gender", wants)
    .neq("id", viewer.id)
    .not("onboarded_at", "is", null)
    .is("deleted_at", null);
  return data ?? [];
}

async function excludedIds(viewer: Profile) {
  const db = admin();
  const since = new Date(Date.now() - NO_REPEAT_DAYS * 86_400_000).toISOString();
  const [bonds, recent, all, blocks] = await Promise.all([
    db.from("bonds").select("user_a, user_b").or(`user_a.eq.${viewer.id},user_b.eq.${viewer.id}`),
    db.from("batch_items").select("candidate_id").eq("user_id", viewer.id).gte("created_at", since),
    db.from("batch_items").select("candidate_id").eq("user_id", viewer.id),
    blockedIds(viewer.id),
  ]);
  const bonded = new Set((bonds.data ?? []).map((b) => (b.user_a === viewer.id ? b.user_b : b.user_a)));
  return {
    hard: new Set([...bonded, ...blocks]),
    recent: new Set((recent.data ?? []).map((r) => r.candidate_id)),
    ever: new Set((all.data ?? []).map((r) => r.candidate_id)),
  };
}

async function generateItems(viewer: Profile, batchId: string, count: number, seed: string, alsoExclude: Set<string> = new Set()) {
  const pool = await candidatePool(viewer);
  const ex = await excludedIds(viewer);
  const [me] = await loadMatchInputs([viewer]);
  const inputs = await loadMatchInputs(pool.filter((p) => !ex.hard.has(p.id) && !alsoExclude.has(p.id)));
  const eligible = inputs.filter((c) => isEligible(me, c));

  // Prefer people not shown in the last 14 days; if the pool is thin, allow older passes.
  let fresh = eligible.filter((c) => !ex.recent.has(c.id));
  let poolExhausted = false;
  if (fresh.length < count) {
    const older = eligible.filter((c) => ex.recent.has(c.id) && !fresh.includes(c));
    fresh = [...fresh, ...older];
    poolExhausted = fresh.length < count;
  }

  const scored = fresh.map((c) => {
    const s = scoreMatch(me, c);
    return { id: c.id, is_demo: c.is_demo, score: s.score, reasons: s.reasons };
  });
  const picked = pickBatch(scored, count, rng(hash(seed)));
  if (!picked.length) return { inserted: 0, poolExhausted: true };

  const names = await loadPublicProfiles(picked.map((p) => p.id));
  const whys = await Promise.all(picked.map((p) => whyYouTwo(p.reasons, names.get(p.id)?.first_name ?? "them")));

  const { data: existing } = await admin().from("batch_items").select("position").eq("batch_id", batchId);
  const offset = existing?.length ?? 0;
  await admin()
    .from("batch_items")
    .insert(
      picked.map((p, i) => ({
        batch_id: batchId,
        user_id: viewer.id,
        candidate_id: p.id,
        score: p.score,
        reasons: p.reasons as unknown as NonNullable<Json>,
        why_text: whys[i],
        position: offset + i,
      })),
    );
  return { inserted: picked.length, poolExhausted };
}

/** Today's batch for the viewer, generated lazily on first open of the batch day (no cron). */
export async function getTodayBatch(viewer: Profile): Promise<TodayBatch> {
  if (!isLiveCity(viewer.city)) return { kind: "waitlist", city: viewer.city };
  const db = admin();
  const batchDate = batchDateFor();

  let { data: batch } = await db.from("batches").select("id").eq("user_id", viewer.id).eq("batch_date", batchDate).maybeSingle();
  let poolExhausted = false;
  if (!batch) {
    const { data: created, error } = await db
      .from("batches")
      .insert({ user_id: viewer.id, batch_date: batchDate })
      .select("id")
      .single();
    if (error) {
      // Lost a race with a parallel request: read the winner.
      ({ data: batch } = await db.from("batches").select("id").eq("user_id", viewer.id).eq("batch_date", batchDate).maybeSingle());
    } else {
      batch = created;
      const res = await generateItems(viewer, created.id, BATCH_SIZE, `${viewer.id}:${batchDate}`);
      poolExhausted = res.poolExhausted;
    }
  }
  if (!batch) return { kind: "batch", batchDate, items: [], poolExhausted: true };

  const { data: rows } = await db
    .from("batch_items")
    .select("id, candidate_id, status, score, why_text, reasons, position")
    .eq("batch_id", batch.id)
    .order("position");
  const people = await loadPublicProfiles((rows ?? []).map((r) => r.candidate_id));
  const items: BatchItem[] = (rows ?? [])
    .filter((r) => people.has(r.candidate_id))
    .map((r) => ({
      id: r.id,
      status: r.status as BatchItem["status"],
      score: r.score,
      why_text: r.why_text,
      reasons: (r.reasons as { kind: string; text: string }[]) ?? [],
      person: people.get(r.candidate_id)!,
    }));
  return { kind: "batch", batchDate, items, poolExhausted: poolExhausted || items.length === 0 };
}

/** Catalyst: one extra pick added to today's batch. */
export async function addExtraPick(viewer: Profile) {
  const batchDate = batchDateFor();
  const { data: batch } = await admin().from("batches").select("id").eq("user_id", viewer.id).eq("batch_date", batchDate).maybeSingle();
  if (!batch) return 0;
  const { data: current } = await admin().from("batch_items").select("candidate_id").eq("batch_id", batch.id);
  const res = await generateItems(viewer, batch.id, 1, `${viewer.id}:${batchDate}:extra:${current?.length ?? 0}`, new Set((current ?? []).map((c) => c.candidate_id)));
  return res.inserted;
}

/** Demo control: archive today's batch (keeping it as history) and generate a fresh one. */
export async function regenerateBatch(viewer: Profile) {
  const db = admin();
  const batchDate = batchDateFor();
  const { data: batch } = await db.from("batches").select("id").eq("user_id", viewer.id).eq("batch_date", batchDate).maybeSingle();
  if (batch) {
    const { data: oldest } = await db.from("batches").select("batch_date").eq("user_id", viewer.id).order("batch_date").limit(1).single();
    const d = new Date((oldest?.batch_date ?? batchDate) + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 1);
    await db.from("batches").update({ batch_date: d.toISOString().slice(0, 10) }).eq("id", batch.id);
  }
}
