import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { renderVariants } from "./render";
import type { Database } from "@/lib/supabase/database.types";

/** Render + upload original and blur variants to the private bucket, then record the photo. */
export async function storeVariants(db: SupabaseClient<Database>, userId: string, input: Buffer, position: number) {
  const { original, blurs } = await renderVariants(input);
  const photoId = randomUUID();
  const base = `${userId}/${photoId}`;
  const store = db.storage.from("photos");
  const results = await Promise.all([
    store.upload(`${base}/original.jpg`, original, { contentType: "image/jpeg", upsert: true }),
    ...blurs.map((b, i) => store.upload(`${base}/blur${i}.jpg`, b, { contentType: "image/jpeg", upsert: true })),
  ]);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(`Upload failed: ${failed.error.message}`);
  const { error } = await db.from("photos").insert({
    id: photoId,
    user_id: userId,
    position,
    path_original: `${base}/original.jpg`,
    path_blur: blurs.map((_, i) => `${base}/blur${i}.jpg`),
  });
  if (error) throw new Error(`Couldn't save the photo: ${error.message}`);
  return photoId;
}
