/**
 * Values quiz — the main matching signal.
 * Each answer is 1..5 where 1 = the left pole and 5 = the right pole.
 * `weight` doubles questions that behave like dealbreakers.
 */
export type QuizQuestion = {
  id: string;
  prompt: string;
  left: string;
  right: string;
  weight: number;
  topic: string;
  /** Natural phrases for "why you two" copy. */
  leftPhrase: string;
  rightPhrase: string;
};

export const QUIZ: QuizQuestion[] = [
  { id: "q1", prompt: "Saturday night?", left: "House party, everyone's invited", right: "One friend, one long talk", weight: 1, topic: "how you spend a Saturday night", leftPhrase: "big Saturday-night plans", rightPhrase: "quiet one-on-one evenings" },
  { id: "q2", prompt: "A free weekend is best when it's…", left: "Planned to the hour", right: "Completely winged", weight: 1, topic: "planning vs winging it", leftPhrase: "planning things properly", rightPhrase: "winging it" },
  { id: "q3", prompt: "A surprise ₹10,000 lands in your account.", left: "Straight into savings", right: "Spent on an experience", weight: 1, topic: "money", leftPhrase: "saving before spending", rightPhrase: "spending on experiences" },
  { id: "q4", prompt: "How much say does family have in who you date?", left: "None. My call.", right: "A lot. They matter.", weight: 2, topic: "family's role in your relationships", leftPhrase: "making your own calls on love", rightPhrase: "family having a real say" },
  { id: "q5", prompt: "Your dream job opens up in another city.", left: "Packing tonight", right: "Staying near my people", weight: 1, topic: "moving for work", leftPhrase: "moving cities for the right job", rightPhrase: "staying close to your people" },
  { id: "q6", prompt: "Marriage, honestly?", left: "In the next 2–3 years", right: "Not on my mind yet", weight: 2, topic: "where marriage sits on your timeline", leftPhrase: "marriage in the next few years", rightPhrase: "no rush on marriage" },
  { id: "q7", prompt: "Faith in your daily life?", left: "Central to who I am", right: "Not really part of it", weight: 1.5, topic: "faith", leftPhrase: "faith at the centre of life", rightPhrase: "a mostly secular life" },
  { id: "q8", prompt: "In the middle of an argument you…", left: "Talk it out right now", right: "Cool off first", weight: 1, topic: "handling arguments", leftPhrase: "talking things out straight away", rightPhrase: "cooling off before talking" },
  { id: "q9", prompt: "The ideal Sunday is…", left: "Out exploring the city", right: "Home, slow, cooking", weight: 1, topic: "Sundays", leftPhrase: "Sundays out exploring", rightPhrase: "slow Sundays at home" },
  { id: "q10", prompt: "Right now, career is…", left: "My top priority", right: "One part of a balanced life", weight: 1, topic: "career right now", leftPhrase: "career first, for now", rightPhrase: "balance over a big career push" },
];

export const QUIZ_BY_ID = Object.fromEntries(QUIZ.map((q) => [q.id, q]));

/** Natural phrase for an answer, or null when it sits in the middle. */
export function phraseFor(q: QuizQuestion, value: number): string | null {
  if (value <= 2) return q.leftPhrase;
  if (value >= 4) return q.rightPhrase;
  return null;
}
