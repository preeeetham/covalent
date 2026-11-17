/**
 * GTM decision: launch dense, not wide. Only "live" cities get daily batches;
 * everyone else can sign up but sees a waitlist state. See docs/DECISIONS.md (#11).
 */
export const CITIES = [
  { id: "Bengaluru", live: true },
  { id: "Hyderabad", live: true },
  { id: "Pune", live: false },
  { id: "Chennai", live: false },
  { id: "Delhi NCR", live: false },
  { id: "Mumbai", live: false },
  { id: "Other", live: false },
] as const;

export type CityId = (typeof CITIES)[number]["id"];
export const CITY_IDS = CITIES.map((c) => c.id) as [CityId, ...CityId[]];
export const LIVE_CITIES = CITIES.filter((c) => c.live).map((c) => c.id) as string[];
export const isLiveCity = (city: string | null | undefined) => !!city && LIVE_CITIES.includes(city);

export const INTENTS = [
  { id: "serious", label: "Something serious", hint: "Looking for a partner, not a pen pal." },
  { id: "see", label: "Dating to see where it goes", hint: "Open, intentional, no fixed timeline." },
  { id: "friends", label: "New in the city, friends first", hint: "Happy to start as friends and see." },
] as const;
export type IntentId = (typeof INTENTS)[number]["id"];
export const INTENT_LABEL: Record<string, string> = Object.fromEntries(INTENTS.map((i) => [i.id, i.label]));

export const GENDERS = [
  { id: "woman", label: "Woman", plural: "Women" },
  { id: "man", label: "Man", plural: "Men" },
  { id: "nonbinary", label: "Non-binary", plural: "Non-binary people" },
] as const;
export type GenderId = (typeof GENDERS)[number]["id"];
