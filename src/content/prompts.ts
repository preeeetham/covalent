export type Prompt = { id: string; text: string; placeholder: string };

export const PROMPTS: Prompt[] = [
  { id: "p1", text: "The most tier-2 thing about me", placeholder: "I still carry a steel tiffin to office…" },
  { id: "p2", text: "A hill I will die on", placeholder: "Idli is not boring. You are." },
  { id: "p3", text: "My Sunday looks like", placeholder: "Late breakfast, a long call with home, one ambitious recipe…" },
  { id: "p4", text: "I'm weirdly good at", placeholder: "Guessing the song from the first two seconds" },
  { id: "p5", text: "The way to win me over is", placeholder: "Remember the small thing I mentioned once" },
  { id: "p6", text: "A green flag I look for", placeholder: "Kind to waiters, calls their mum back" },
  { id: "p7", text: "What I miss most about home", placeholder: "The 6 PM chai on the terrace" },
  { id: "p8", text: "A random fact I love", placeholder: "Octopuses have three hearts" },
  { id: "p9", text: "I'll fall for you if", placeholder: "You send me a voice note singing badly" },
  { id: "p10", text: "My most controversial food opinion", placeholder: "Pineapple belongs on pizza and in rasam" },
  { id: "p11", text: "Two truths and a lie", placeholder: "I've met a cricketer, I can juggle, I hate mangoes" },
  { id: "p12", text: "I'm currently learning", placeholder: "Kannada, one auto driver at a time" },
  { id: "p13", text: "A first date idea that isn't coffee", placeholder: "Street-food crawl, winner picks dessert" },
  { id: "p14", text: "My friends would describe me as", placeholder: "The one who remembers birthdays" },
  { id: "p15", text: "The best ₹200 I ever spent", placeholder: "A second-hand Murakami from Blossoms" },
];

export const PROMPT_BY_ID: Record<string, Prompt> = Object.fromEntries(PROMPTS.map((p) => [p.id, p]));
