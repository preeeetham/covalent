import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";

/**
 * Illustrated demo avatars (DiceBear Notionists, CC0). Hair and beard are chosen per gender
 * so a profile's picture matches the person; everything else stays seeded and varied.
 * Hair variants were picked by eye from a contact sheet of all 63 styles.
 */
const HAIR = {
  woman: ["variant02", "variant04", "variant08", "variant10", "variant23", "variant28", "variant36", "variant37", "variant39", "variant41", "variant45", "variant46", "variant47", "variant48", "variant57", "variant58"],
  man: ["variant01", "variant05", "variant06", "variant07", "variant13", "variant15", "variant16", "variant21", "variant24", "variant25", "variant27", "variant31", "variant33", "variant34", "variant35", "variant38", "variant43", "variant49", "variant52", "variant53", "variant54", "variant55", "variant56"],
} as const;

type Hair = (typeof HAIR)[keyof typeof HAIR][number];

export function avatarSvg(seed: string, gender: "man" | "woman", background: string, size = 512) {
  return createAvatar(notionists, {
    seed,
    size,
    backgroundColor: [background],
    hair: [...HAIR[gender]] as Hair[],
    beardProbability: gender === "man" ? 35 : 0,
    gestureProbability: 0,
  });
}
