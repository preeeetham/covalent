/** Interests rendered as periodic-table tiles. Symbols are Covalent's own, not real chemistry. */
export type ElementCategory = "food" | "active" | "culture" | "mind" | "life";

export type Element = {
  id: string;
  symbol: string;
  name: string;
  number: number;
  category: ElementCategory;
};

const raw: [string, string, string, ElementCategory][] = [
  ["filter-coffee", "Fc", "Filter Coffee", "food"],
  ["chai", "Ch", "Chai", "food"],
  ["biryani", "By", "Biryani", "food"],
  ["street-food", "Sf", "Street Food", "food"],
  ["baking", "Bk", "Baking", "food"],
  ["momos", "Mo", "Momos", "food"],
  ["trekking", "Tk", "Trekking", "active"],
  ["gym", "Gy", "Gym", "active"],
  ["running", "Rn", "Running", "active"],
  ["cycling", "Cy", "Cycling", "active"],
  ["yoga", "Yg", "Yoga", "active"],
  ["badminton", "Bd", "Badminton", "active"],
  ["cricket", "Cr", "Cricket", "active"],
  ["football", "Fb", "Football", "active"],
  ["swimming", "Sw", "Swimming", "active"],
  ["indie-music", "Im", "Indie Music", "culture"],
  ["bollywood", "Bw", "Bollywood", "culture"],
  ["k-drama", "Kd", "K-Drama", "culture"],
  ["anime", "An", "Anime", "culture"],
  ["stand-up", "Su", "Stand-up", "culture"],
  ["theatre", "Th", "Theatre", "culture"],
  ["books", "Bo", "Books", "culture"],
  ["poetry", "Po", "Poetry", "culture"],
  ["podcasts", "Pd", "Podcasts", "culture"],
  ["classical-music", "Cl", "Classical Music", "culture"],
  ["dance", "Dn", "Dance", "culture"],
  ["photography", "Ph", "Photography", "culture"],
  ["sketching", "Sk", "Sketching", "culture"],
  ["dsa-grind", "Ds", "DSA Grind", "mind"],
  ["gaming", "Gm", "Gaming", "mind"],
  ["side-projects", "Sp", "Side Projects", "mind"],
  ["chess", "Cs", "Chess", "mind"],
  ["personal-finance", "Pf", "Personal Finance", "mind"],
  ["travel", "Tr", "Travel", "life"],
  ["pets", "Pt", "Pets", "life"],
  ["plants", "Pl", "Plants", "life"],
  ["volunteering", "Vo", "Volunteering", "life"],
  ["formula-1", "F1", "Formula 1", "life"],
  ["movies", "Mv", "Movies", "life"],
  ["long-drives", "Ld", "Long Drives", "life"],
];

export const ELEMENTS: Element[] = raw.map(([id, symbol, name, category], i) => ({
  id,
  symbol,
  name,
  category,
  number: i + 1,
}));

export const ELEMENT_BY_ID: Record<string, Element> = Object.fromEntries(ELEMENTS.map((e) => [e.id, e]));

export const CATEGORY_LABEL: Record<ElementCategory, string> = {
  food: "Food",
  active: "Active",
  culture: "Culture",
  mind: "Mind",
  life: "Life",
};
