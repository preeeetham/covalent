import sharp from "sharp";

/**
 * Pure image rendering shared by the app (uploads) and the seed script (avatars).
 * Blur variants are downscaled before blurring so they can't be sharpened back.
 */
// Level 0 (heaviest, batch cards) … level 3 (after round 3). Tuned on close-up faces so level 0 shows
// only colour and mood, each round reveals a visible step, and the reveal is still a real jump.
export const BLUR_SIGMAS = [56, 34, 20, 11] as const;
const BLUR_WIDTH = 520;
const MAX_ORIGINAL = 1200;
export const ACCEPTED_FORMATS = new Set(["jpeg", "png", "webp", "svg"]);

export async function renderVariants(input: Buffer) {
  // .rotate() applies EXIF orientation; sharp drops all metadata (GPS etc.) on output by default.
  const original = await sharp(input, { density: 300 })
    .rotate()
    .resize({ width: MAX_ORIGINAL, height: MAX_ORIGINAL, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  const blurs = await Promise.all(
    BLUR_SIGMAS.map((sigma) =>
      sharp(original).resize({ width: BLUR_WIDTH }).blur(sigma).modulate({ saturation: 1.1 }).jpeg({ quality: 70 }).toBuffer(),
    ),
  );
  return { original, blurs };
}

export async function imageFormat(input: Buffer) {
  try {
    return (await sharp(input).metadata()).format ?? null;
  } catch {
    return null;
  }
}
