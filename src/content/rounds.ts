/**
 * The four rounds of the chemistry test. Both people in a bond see the same draw,
 * picked deterministically from the bond id (see lib/rounds/draw.ts).
 */

export const ROUND_META = [
  { n: 1, name: "Quick fire", blurb: "Eight this-or-thats. Don't overthink it.", reveals: "Photo sharpens a little" },
  { n: 2, name: "Ask", blurb: "Pick a question for them. Answer the one they pick for you.", reveals: "Photo sharpens more" },
  { n: 3, name: "Guess", blurb: "How well do you read them? Predict their answers.", reveals: "Almost there" },
  { n: 4, name: "First date draft", blurb: "Pick what you'd actually enjoy. We'll find the overlap.", reveals: "Full reveal" },
] as const;

// ---------------------------------------------------------------- Round 1: this or that
export type Pair = { id: string; a: string; b: string; emojiA: string; emojiB: string };
export const R1_PAIRS: Pair[] = [
  { id: "r1-1", a: "Chai", b: "Coffee", emojiA: "🫖", emojiB: "☕" },
  { id: "r1-2", a: "Mountains", b: "Beaches", emojiA: "🏔️", emojiB: "🏖️" },
  { id: "r1-3", a: "Text", b: "Call", emojiA: "💬", emojiB: "📞" },
  { id: "r1-4", a: "Plan it", b: "Wing it", emojiA: "🗓️", emojiB: "🎲" },
  { id: "r1-5", a: "Early bird", b: "Night owl", emojiA: "🌅", emojiB: "🦉" },
  { id: "r1-6", a: "Dogs", b: "Cats", emojiA: "🐕", emojiB: "🐈" },
  { id: "r1-7", a: "Books", b: "Movies", emojiA: "📚", emojiB: "🎬" },
  { id: "r1-8", a: "Biryani", b: "Dosa", emojiA: "🍛", emojiB: "🥞" },
  { id: "r1-9", a: "Window seat", b: "Aisle seat", emojiA: "🪟", emojiB: "🚶" },
  { id: "r1-10", a: "Cook at home", b: "Order in", emojiA: "🍳", emojiB: "🛵" },
  { id: "r1-11", a: "Sunrise", b: "Sunset", emojiA: "🌄", emojiB: "🌇" },
  { id: "r1-12", a: "Metro", b: "Auto", emojiA: "🚇", emojiB: "🛺" },
  { id: "r1-13", a: "Voice note", b: "Long text", emojiA: "🎙️", emojiB: "📝" },
  { id: "r1-14", a: "Gym", b: "Long walks", emojiA: "🏋️", emojiB: "🚶‍♀️" },
  { id: "r1-15", a: "Bollywood", b: "Hollywood", emojiA: "🎞️", emojiB: "🍿" },
  { id: "r1-16", a: "Extra spicy", b: "Mild please", emojiA: "🌶️", emojiB: "🥛" },
  { id: "r1-17", a: "Monsoon", b: "Winter", emojiA: "🌧️", emojiB: "🧣" },
  { id: "r1-18", a: "Road trip", b: "Flight", emojiA: "🚗", emojiB: "✈️" },
  { id: "r1-19", a: "Concert", b: "Comedy show", emojiA: "🎸", emojiB: "🎤" },
  { id: "r1-20", a: "Small group", b: "Big party", emojiA: "👥", emojiB: "🎉" },
  { id: "r1-21", a: "Save", b: "Splurge", emojiA: "🐖", emojiB: "🛍️" },
  { id: "r1-22", a: "Sweet", b: "Savoury", emojiA: "🍮", emojiB: "🥟" },
  { id: "r1-23", a: "Old songs", b: "New songs", emojiA: "📻", emojiB: "🎧" },
  { id: "r1-24", a: "Wedding dance floor", b: "Wedding food counter", emojiA: "💃", emojiB: "🍽️" },
];
export const R1_COUNT = 8;

// ---------------------------------------------------------------- Round 2: ask
export type DeepCategory = "family" | "work" | "love" | "self";
export type DeepQuestion = { id: string; text: string; category: DeepCategory };
export const R2_QUESTIONS: DeepQuestion[] = [
  { id: "r2-1", text: "What's one thing your parents got right that you'd keep?", category: "family" },
  { id: "r2-2", text: "What does 'home' mean to you now that you live away from it?", category: "family" },
  { id: "r2-3", text: "Which festival feels the most like you, and why?", category: "family" },
  { id: "r2-4", text: "What's a family rule you'll never follow?", category: "family" },
  { id: "r2-5", text: "What would you do for work if salary didn't matter?", category: "work" },
  { id: "r2-6", text: "What's been the hardest part of your first few years at work?", category: "work" },
  { id: "r2-7", text: "What's something you built or fixed that you're proud of?", category: "work" },
  { id: "r2-8", text: "Where do you want to be living in five years?", category: "work" },
  { id: "r2-9", text: "What does a good partner do when you're having a bad day?", category: "love" },
  { id: "r2-10", text: "What's something small that makes you feel cared for?", category: "love" },
  { id: "r2-11", text: "What's a relationship green flag you learned the hard way?", category: "love" },
  { id: "r2-12", text: "How do you like to make up after an argument?", category: "love" },
  { id: "r2-13", text: "What's your idea of a perfect lazy date?", category: "love" },
  { id: "r2-14", text: "What's a belief you changed your mind about recently?", category: "self" },
  { id: "r2-15", text: "What are you secretly proud of?", category: "self" },
  { id: "r2-16", text: "When do you feel the most like yourself?", category: "self" },
  { id: "r2-17", text: "What's something you're trying to get better at?", category: "self" },
  { id: "r2-18", text: "What would your 18-year-old self be surprised by?", category: "self" },
];
export const R2_OPTIONS = 3;
export const R2_THOUGHTFUL_CHARS = 60;
export const R2_REACTIONS = ["😂", "🥹", "🤝", "🔥", "🤔", "💯"] as const;

// ---------------------------------------------------------------- Round 3: guess
/**
 * `trait` links a statement to a quiz answer so demo personas answer consistently:
 * agree when quiz[q] is on the `agreeWhen` side.
 */
export type Statement = { id: string; text: string; trait?: { q: string; agreeWhen: "low" | "high" } };
export const R3_STATEMENTS: Statement[] = [
  { id: "r3-1", text: "I'd rather plan a trip than wing it.", trait: { q: "q2", agreeWhen: "low" } },
  { id: "r3-2", text: "I recharge alone, not in a crowd.", trait: { q: "q1", agreeWhen: "high" } },
  { id: "r3-3", text: "I'd move cities for the right role.", trait: { q: "q5", agreeWhen: "low" } },
  { id: "r3-4", text: "I reply to texts within the hour." },
  { id: "r3-5", text: "My parents' opinion of my partner matters to me.", trait: { q: "q4", agreeWhen: "high" } },
  { id: "r3-6", text: "I'd spend a bonus on travel before saving it.", trait: { q: "q3", agreeWhen: "high" } },
  { id: "r3-7", text: "I'd like to be married in the next three years.", trait: { q: "q6", agreeWhen: "low" } },
  { id: "r3-8", text: "I need to talk an argument out the same day.", trait: { q: "q8", agreeWhen: "low" } },
  { id: "r3-9", text: "A good Sunday involves leaving the house.", trait: { q: "q9", agreeWhen: "low" } },
  { id: "r3-10", text: "Career is my top priority right now.", trait: { q: "q10", agreeWhen: "low" } },
  { id: "r3-11", text: "I've cried at a movie this year." },
  { id: "r3-12", text: "I can cook at least one dish properly." },
  { id: "r3-13", text: "I'd pick a concert over a stand-up show." },
  { id: "r3-14", text: "I believe in astrology, at least a little." },
  { id: "r3-15", text: "I'd go to a wedding just for the food." },
  { id: "r3-16", text: "I still wear my college hoodie." },
  { id: "r3-17", text: "I'm the planner in my friend group.", trait: { q: "q2", agreeWhen: "low" } },
  { id: "r3-18", text: "I prefer one deep friendship to many casual ones.", trait: { q: "q1", agreeWhen: "high" } },
  { id: "r3-19", text: "I keep a monthly budget.", trait: { q: "q3", agreeWhen: "low" } },
  { id: "r3-20", text: "I'd move back to my hometown someday.", trait: { q: "q5", agreeWhen: "high" } },
];
export const R3_COUNT = 5;

// ---------------------------------------------------------------- Round 4: first date draft
export type DateIdea = { id: string; title: string; emoji: string; budget: string; tags: string[] };
export const R4_IDEAS: DateIdea[] = [
  { id: "r4-1", title: "Filter coffee + a bookstore wander", emoji: "📚", budget: "₹300", tags: ["calm", "talk"] },
  { id: "r4-2", title: "Sunset at a rooftop café", emoji: "🌇", budget: "₹800", tags: ["evening"] },
  { id: "r4-3", title: "Street-food crawl, winner picks dessert", emoji: "🥟", budget: "₹400", tags: ["food", "playful"] },
  { id: "r4-4", title: "Board game café, loser buys chai", emoji: "🎲", budget: "₹500", tags: ["playful"] },
  { id: "r4-5", title: "Morning park walk + idli breakfast", emoji: "🌳", budget: "₹250", tags: ["morning", "calm"] },
  { id: "r4-6", title: "Pottery or sketching workshop", emoji: "🎨", budget: "₹900", tags: ["creative"] },
  { id: "r4-7", title: "Stand-up comedy night", emoji: "🎤", budget: "₹700", tags: ["evening", "playful"] },
  { id: "r4-8", title: "Lakeside cycle ride", emoji: "🚲", budget: "₹300", tags: ["morning", "active"] },
  { id: "r4-9", title: "Museum or art gallery afternoon", emoji: "🖼️", budget: "₹300", tags: ["calm", "creative"] },
  { id: "r4-10", title: "Live music at a small venue", emoji: "🎸", budget: "₹800", tags: ["evening"] },
  { id: "r4-11", title: "Biryani face-off: two places, one verdict", emoji: "🍛", budget: "₹600", tags: ["food", "playful"] },
  { id: "r4-12", title: "Bowling or an arcade", emoji: "🎳", budget: "₹700", tags: ["playful", "active"] },
];
export const R4_OPTIONS = 6;
export const R4_PICKS = 2;
export const SLOTS = [
  { id: "weekday-evening", label: "Weekday evening" },
  { id: "weekend-morning", label: "Weekend morning" },
  { id: "weekend-evening", label: "Weekend evening" },
] as const;
export type SlotId = (typeof SLOTS)[number]["id"];
