import "server-only";
import { admin } from "@/lib/supabase/admin";
import { ActionError } from "@/lib/errors";
import { imageFormat } from "./render";
import { storeVariants } from "./store";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const USER_FORMATS = new Set(["jpeg", "png", "webp"]);

/**
 * Server-side blur pipeline for user uploads. Variants are stored next to the original
 * in a PRIVATE bucket, so a browser can never un-blur a photo it hasn't earned.
 */
export async function processAndStorePhoto(userId: string, input: Buffer, position: number) {
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new ActionError("That photo is over 5 MB.");
  const format = await imageFormat(input);
  if (!format || !USER_FORMATS.has(format)) throw new ActionError("Use a JPG, PNG or WebP photo.");
  try {
    return await storeVariants(admin(), userId, input, position);
  } catch (e) {
    throw new ActionError((e as Error).message);
  }
}

export async function deletePhotoFiles(paths: string[]) {
  if (paths.length) await admin().storage.from("photos").remove(paths);
}
