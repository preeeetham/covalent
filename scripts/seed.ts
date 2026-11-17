/**
 * Seeds venues, 36 demo personas, 4 evaluator accounts and their scenarios.
 * Idempotent: safe to run again (evaluator scenarios are rebuilt from scratch).
 *
 *   npm run db:seed                  # uses .env.local
 *   DOTENV_CONFIG_PATH=.env.production.local npm run db:seed
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/database.types";
import { upsertVenues, seedPersonas, seedEvaluators, resetAllEvaluators } from "../src/lib/demo/seed-core";
import { EVALUATORS } from "../src/content/evaluators";

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD;
if (!url || !key || !password) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or DEMO_PASSWORD");
  process.exit(1);
}

const db = createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

async function main() {
  console.log(`Seeding ${url}`);
  console.log("• venues");
  await upsertVenues(db);
  console.log("• personas");
  await seedPersonas(db, console.log);
  console.log("• evaluators");
  await seedEvaluators(db, password!, console.log);
  console.log("• evaluator scenarios");
  await resetAllEvaluators(db);
  console.log("\nDone. Evaluator logins (password = DEMO_PASSWORD):");
  for (const e of EVALUATORS) console.log(`  ${e.email.padEnd(24)} ${e.stage}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
