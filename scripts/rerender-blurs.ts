/**
 * Re-renders every stored photo's blur variants from its original, in place.
 * Run after changing BLUR_SIGMAS so existing uploads and avatars match new ones.
 *
 *   npm run photos:rerender                                       # .env.local
 *   DOTENV_CONFIG_PATH=.env.production.local npm run photos:rerender
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types";
import { renderVariants } from "../src/lib/photos/render";

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local" });
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const store = db.storage.from("photos");

async function main() {
  const { data: photos, error } = await db.from("photos").select("id, path_original, path_blur");
  if (error) throw error;
  console.log(`Re-rendering ${photos.length} photos on ${url}`);
  let done = 0;
  const queue = [...photos];
  const worker = async () => {
    for (let p = queue.shift(); p; p = queue.shift()) {
      const { data: file, error: dl } = await store.download(p.path_original);
      if (dl || !file) throw new Error(`${p.id}: ${dl?.message ?? "missing original"}`);
      const { blurs } = await renderVariants(Buffer.from(await file.arrayBuffer()));
      const ups = await Promise.all(blurs.map((b, i) => store.upload(p.path_blur[i], b, { contentType: "image/jpeg", upsert: true })));
      const bad = ups.find((u) => u.error);
      if (bad?.error) throw new Error(`${p.id}: ${bad.error.message}`);
      if (++done % 10 === 0) console.log(`  ${done}/${photos.length}`);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log(`Done: ${done} photos.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
