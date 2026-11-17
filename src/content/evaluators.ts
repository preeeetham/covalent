/**
 * Evaluator accounts, pre-onboarded at different points of the journey so a reviewer
 * can feel each stage in minutes. Shaped like personas so the same answer generators
 * can fill in their round history. Emails use the reserved .test TLD.
 */
import type { Persona } from "./personas";

export type EvaluatorSpec = Persona & { email: string; stage: string };

export const EVALUATORS: EvaluatorSpec[] = [
  {
    key: "eval-aarohi", email: "aarohi@covalent.test", stage: "Fresh: a full batch is waiting",
    first_name: "Aarohi", gender: "woman", interested_in: ["man"], age: 25, city: "Bengaluru", hometown: "Nagpur",
    role: "Software Engineer", company: "Product company", intent: "serious",
    quiz: [3, 2, 2, 4, 3, 2, 3, 2, 3, 3],
    elements: ["chai", "books", "trekking", "cricket", "street-food", "podcasts"],
    prompts: [["p1", "I ask for 'one cutting' at Starbucks. Every time."], ["p13", "A food walk where we only eat things neither of us has tried."], ["p6", "You're nice to people who can do nothing for you."]],
    deep: { family: "My parents never missed a parent-teacher meeting, even when it meant a half-day's pay. I noticed.", work: "I'd teach coding to school kids in small towns. That's where I learned.", love: "On a bad day: no advice, just snacks and a stupid video.", self: "My 18-year-old self would be surprised I asked for a raise and got it." },
    voice: "", replies: [], bg: "ffe3c7",
  },
  {
    key: "eval-kabir", email: "kabir@covalent.test", stage: "Mid-rounds: two bonds, one with Naina (another evaluator)",
    first_name: "Kabir", gender: "man", interested_in: ["woman"], age: 26, city: "Bengaluru", hometown: "Lucknow",
    role: "Backend Engineer", company: "Fintech startup", intent: "see",
    quiz: [3, 3, 3, 3, 2, 3, 4, 2, 2, 3],
    elements: ["stand-up", "football", "biryani", "indie-music", "travel", "gaming"],
    prompts: [["p10", "Tunday kebabs > every kebab in Bengaluru. I've done the research."], ["p4", "Making friends with every auto driver in Koramangala."], ["p9", "You laugh at your own jokes before you finish them."]],
    deep: { family: "Eid at my nani's: forty people, one courtyard, sevaiyan till we can't move.", work: "I fixed a bug that was double-charging users for three weeks. Quietly the best day of my job.", love: "Make up after a fight with a walk and a kulfi. Hard to stay angry with kulfi.", self: "I feel most myself at an open mic, in the audience, laughing too loud." },
    voice: "", replies: [], bg: "d7e4ff",
  },
  {
    key: "eval-naina", email: "naina@covalent.test", stage: "At the reveal: chat history with Arjun, can plan a date",
    first_name: "Naina", gender: "woman", interested_in: ["man"], age: 25, city: "Bengaluru", hometown: "Patna",
    role: "Data Analyst", company: "E-commerce company", intent: "serious",
    quiz: [4, 2, 2, 4, 4, 2, 3, 2, 4, 3],
    elements: ["chai", "books", "biryani", "cricket", "plants", "bollywood"],
    prompts: [["p7", "Chhath ghats at dawn and thekua from my mother's kitchen."], ["p5", "Remember my chai order without asking twice."], ["p14", "Calm until someone says Patna isn't a real city."]],
    deep: { family: "My mother taught me to be soft with people and hard on problems.", work: "In five years: a small house with a balcony full of plants, somewhere I can see sunsets.", love: "Small thing: someone texting 'reached?' every single time.", self: "I'm secretly proud I learnt SQL from YouTube on a 2G connection." },
    voice: "", replies: [], bg: "f7d7e6",
  },
  {
    key: "eval-dhruv", email: "dhruv@covalent.test", stage: "Dates: one confirmed date coming up, one past date waiting for feedback",
    first_name: "Dhruv", gender: "man", interested_in: ["woman"], age: 27, city: "Bengaluru", hometown: "Indore",
    role: "Mobile Developer", company: "Healthtech startup", intent: "serious",
    quiz: [3, 1, 2, 3, 2, 2, 3, 2, 2, 2],
    elements: ["running", "filter-coffee", "personal-finance", "travel", "street-food", "podcasts"],
    prompts: [["p2", "Indore's poha-jalebi is a complete breakfast and a personality."], ["p3", "Long run, longer breakfast, call with my parents, meal prep."], ["p6", "You're on time, or you text before you're late."]],
    deep: { family: "My father ran a sweet shop for 30 years without one day off. Showing up is the family business.", work: "Proud of an app feature that reminds diabetic patients to check sugar. My uncle uses it.", love: "Green flag: someone who's consistent. Same person on day 1 and day 100.", self: "Trying to get better at taking real holidays. Laptop stays home." },
    voice: "", replies: [], bg: "d6f0dc",
  },
];
