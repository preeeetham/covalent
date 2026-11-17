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

## 2026-11-17 — AI and deployment

- Wired Gemini (`gemini-3.5-flash-lite`, checked live; older models are retired) into match explanations, round quips and persona chat, keeping hand-written fallbacks.
- Applied the schema to hosted Supabase, seeded it, and ran the end-to-end smoke test (full loop + RLS) against the hosted database: passed.
- Created the public GitHub repo, linked Vercel, set production env vars, deployed to https://covalent-nine.vercel.app and checked public, protected and API routes over HTTP.

## 2026-11-17 — Submission polish

- Demo avatars now match each person's gender (hair/beard chosen per gender); production re-seeded.
- Daily keep-alive cron so the free Supabase project never pauses before review.
- Realtime tested with two accounts: messages arrive live in ~0.1–0.5 s. Hardened the subscription and closed the "stream attaching" gap; the smoke test now checks realtime in local and production.
- Found and fixed a silent seed bug: evaluator chat histories were never inserted.
- Lighthouse (mobile): landing 100/100/100/100 (was 88 perf, 97 a11y); signed-in pages 86–100 performance, 100 accessibility. Dark mode reviewed on every main screen.

## 2026-11-18 — Owner feedback: speed and blur

- Onboarding "Continue" was slow on the live app: functions ran in the US while the database is in Mumbai. Moved functions to Mumbai and cut each step to one save plus a same-response redirect (about 100 ms per step locally).
- Uploaded a real photo and found the blur preview always showed it sharp; fixed, and made the blur ladder stronger and more even. Re-rendered every stored photo locally and in production.
