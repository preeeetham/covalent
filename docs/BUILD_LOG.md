# Build log

What actually happened in each work session. Use this to fill the "journey" question truthfully.

## 2026-11-17 — Research and plan

- Web research: dating-app burnout (Forbes Health / OnePoll), India market and monetisation (Redseer, Inc42 on flutrr, TrulyMadly), DPDP Act 2023 and DPDP Rules 2025, 2026 UI trends and engagement psychology.
- Decided with the owner: concept (blind chemistry test), name (Covalent), stack (Next.js + Supabase + Vercel), AI (free-tier Gemini with fallbacks).
- Wrote `plan.md` and `docs/DECISIONS.md`.

## 2026-11-17 — Full build (one long session)

- Scaffolded Next.js 16 + local Supabase (Docker). Schema with RLS on every table; private photo bucket.
- Design system "Warm Lab": tokens, Fraunces / Plus Jakarta Sans / JetBrains Mono, litmus gradient, element tiles, bond atoms, progress ring.
- Content: values quiz, 40 elements, 12 archetypes, prompts, four round banks, venues, 36 hand-written demo personas, 4 evaluator scenarios.
- Pure logic with unit tests (42): matching score, round state machine, chemistry, blur entitlement, contact detection, 8 PM IST batch clock.
- Data layer + server actions: batches, reactions/invites, rounds with reciprocal reveal, persona engine, reveal, chat, dates, mock payments, feedback/reliability, catalysts, report/block, export, delete.
- Screens: landing, legal pages, auth, 7-step onboarding, Today, Bonds, bond home, four rounds, reveal, Dates, You, Settings, founder dashboard, trusted-contact share page, PWA manifest + service worker.
- Seed script (personas, evaluators, scenarios) and an end-to-end smoke test (full loop + RLS checks).
- Browser testing at 375 px found and fixed: landing horizontal overflow, awkward "why you two" copy, demo button overlapping the main CTA, a "use server" file exporting a constant (crashed chat), sticky chat composer covering messages, SVG gradient ids breaking the logo, share-card layout, Round 1 depending on JS animation frames.
