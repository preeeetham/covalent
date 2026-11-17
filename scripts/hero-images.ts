/** Pre-renders the landing hero (sharp + pre-blurred) so the browser never blurs at runtime. */
import sharp from "sharp";
import { avatarSvg } from "../src/lib/demo/avatar";

(async () => {
  const svg = Buffer.from(avatarSvg("covalent-hero", "woman", "ffd5c2", 760).toString());
  const sharpImg = await sharp(svg).resize(760, 950, { fit: "cover", position: "top" }).webp({ quality: 82 }).toBuffer();
  await sharp(sharpImg).toFile("public/landing/hero.webp");
  // Small + heavily blurred: tiny file, and scaling it up only makes it softer.
  await sharp(sharpImg).resize(190, 238).blur(9).webp({ quality: 70 }).toFile("public/landing/hero-blur.webp");
  console.log("hero images written");
})();
