import sharp from "sharp";

/**
 * Pure image rendering shared by the app (uploads) and the seed script (avatars).
 * Blur variants are downscaled before blurring so they can't be sharpened back.
 */
export const BLUR_SIGMAS = [34, 20, 11, 5] as const; // level 0 (heaviest) … level 3 (lightest)
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
