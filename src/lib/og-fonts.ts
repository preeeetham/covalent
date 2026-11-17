import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function ogFonts() {
  const dir = path.join(process.cwd(), "src/assets/fonts");
  const [regular, semibold] = await Promise.all([
    readFile(path.join(dir, "fraunces-latin-400-normal.woff")),
    readFile(path.join(dir, "fraunces-latin-600-normal.woff")),
  ]);
  return [
    { name: "Fraunces", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Fraunces", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}
