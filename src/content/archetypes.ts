/**
 * Element archetypes, assigned from quiz answers at the end of onboarding.
 * Each archetype has target values on a few quiz questions; the user gets the nearest one.
 */
export type Archetype = {
  id: string;
  symbol: string;
  name: string;
  number: number;
  tagline: string;
  description: string;
  targets: Record<string, number>;
};

export const ARCHETYPES: Archetype[] = [
  { id: "neon", symbol: "Ne", name: "Neon", number: 10, tagline: "Bright, social, lights up a room.", description: "You're the reason the group chat makes plans. People feel more awake around you.", targets: { q1: 1, q9: 1, q3: 5 } },
  { id: "helium", symbol: "He", name: "Helium", number: 2, tagline: "Light, playful, lifts the mood.", description: "You don't take things too seriously, which makes everyone else breathe easier.", targets: { q1: 2, q2: 5, q8: 1 } },
  { id: "carbon", symbol: "C", name: "Carbon", number: 6, tagline: "The connector. Bonds with everyone.", description: "Steady and adaptable, you're the friend who introduces friends to friends.", targets: { q1: 3, q8: 1, q4: 4 } },
  { id: "oxygen", symbol: "O", name: "Oxygen", number: 8, tagline: "Quietly essential. Keeps people going.", description: "You notice who hasn't eaten and who's had a bad week. People lean on you.", targets: { q1: 4, q4: 4, q9: 4 } },
  { id: "gold", symbol: "Au", name: "Gold", number: 79, tagline: "Loyal, rare, values first.", description: "You know what you want and you don't trade it for convenience. Worth the wait.", targets: { q6: 1, q4: 5, q2: 2 } },
  { id: "argon", symbol: "Ar", name: "Argon", number: 18, tagline: "Calm, independent, zero drama.", description: "A noble gas. You don't react to everything, so when you do, it means something.", targets: { q1: 5, q8: 5, q9: 5 } },
  { id: "lithium", symbol: "Li", name: "Lithium", number: 3, tagline: "High energy. Charges everyone around you.", description: "Ambitious and quick. You're building something, and you'd like company on the way.", targets: { q10: 1, q2: 1, q1: 2 } },
  { id: "iron", symbol: "Fe", name: "Iron", number: 26, tagline: "Grounded, strong, family first.", description: "Rooted in where you come from. You're the person people call when it matters.", targets: { q4: 5, q5: 5, q9: 4 } },
  { id: "mercury", symbol: "Hg", name: "Mercury", number: 80, tagline: "Fluid, spontaneous, quicksilver.", description: "Plans are suggestions. You're happiest when the day surprises you.", targets: { q2: 5, q3: 5, q5: 1 } },
  { id: "silicon", symbol: "Si", name: "Silicon", number: 14, tagline: "The builder. Thoughtful and precise.", description: "You think before you speak, and you're usually right. Slow to warm, impossible to forget.", targets: { q2: 1, q10: 1, q1: 5 } },
  { id: "copper", symbol: "Cu", name: "Copper", number: 29, tagline: "A warm conductor. Says what others feel.", description: "You put feelings into words and keep the current flowing between people.", targets: { q8: 1, q1: 3, q10: 5 } },
  { id: "sodium", symbol: "Na", name: "Sodium", number: 11, tagline: "Reactive and adventurous. Sparks fly.", description: "Drop you into something new and things happen. Mostly good things.", targets: { q9: 1, q3: 5, q5: 1, q2: 5 } },
];

export const ARCHETYPE_BY_ID: Record<string, Archetype> = Object.fromEntries(ARCHETYPES.map((a) => [a.id, a]));

/** Nearest archetype by squared distance over each archetype's own target questions. */
export function archetypeFor(answers: Record<string, number>): Archetype {
  let best = ARCHETYPES[0];
  let bestScore = Infinity;
  for (const a of ARCHETYPES) {
    const keys = Object.keys(a.targets);
    const d =
      keys.reduce((sum, k) => {
        const v = answers[k] ?? 3;
        return sum + (v - a.targets[k]) ** 2;
      }, 0) / keys.length;
    if (d < bestScore) {
      bestScore = d;
      best = a;
    }
  }
  return best;
}
