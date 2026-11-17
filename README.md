# Covalent

> **Bonds are shared, not swiped.**

Covalent is a dating app for verified young professionals in India, built as an eLitmus product. Instead of an endless swipe deck you get **three people a day**. Photos start **blurred** and sharpen as the two of you play **four short rounds** together. After a mutual **reveal**, you plan a real first date — and that's the only moment money changes hands: **₹99 each, returned as ₹99 off the bill** at partner cafés.

- **Live app:** https://covalent-nine.vercel.app
- **Source:** https://github.com/preeeetham/covalent
- **Why it's built this way:** [`docs/DECISIONS.md`](docs/DECISIONS.md) (research → finding → decision → rejected alternative)
- **Submission answers:** [`docs/FORM_ANSWERS.md`](docs/FORM_ANSWERS.md)
- **Build journey:** [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md)
- **Original product brief:** [`plan.md`](plan.md)

## Try it as an evaluator

Four accounts are pre-seeded at different points in the journey (the password is shared in the submission form). Each has a **Demo** button in the tab bar with *New batch now*, *Skip partner wait* and *Reset this account*.

| Email | What you'll see |
|---|---|
| `aarohi@covalent.test` | Fresh account — a full batch of three is waiting |
| `kabir@covalent.test` | Mid-rounds: one bond with **Naina** (another evaluator — open both in two browsers to see realtime) and one with a demo persona |
| `naina@covalent.test` | Revealed bond with Arjun and chat history — plan a date and try the mock checkout |
| `dhruv@covalent.test` | One confirmed date coming up and one past date waiting for feedback. Also has the founder dashboard at `/admin` |

All evaluator accounts can open `/admin`. You can also sign up a fresh account — new users get batches immediately in Bengaluru or Hyderabad.

The 36 other people you'll meet are **demo personas**: fictional, tagged "Demo profile", with illustrated avatars. They accept reactions instantly and answer each round 3–8 seconds after you do.

## What's in the product

- **Daily batch of 3** with a values-based match score and a "why you two" line; ends with a deliberate *"That's today's batch"* screen and a countdown to 8 PM IST.
- **Four rounds**: quick-fire this-or-that, ask one real question each, guess each other's answers, draft a first date. Answers stay hidden until **both** have played.
- **Server-side blur**: four blur levels rendered with `sharp`; `/api/photos/[id]` re-checks entitlement on every request, so a sharp photo can't be pulled from the network tab.
- **Chemistry score** on a litmus strip; **3 bond slots**; bonds close after **72 h** of silence; kind one-tap **dissolve**.
- **Realtime chat** (after Round 1) with off-platform contact detection.
- **Dates**: public venues only, propose/counter/accept, **₹99 commitment** via a mock UPI-style checkout (clearly marked test mode), trusted-contact **share link**, private post-date **feedback** feeding a reliability score.
- **Catalysts**: sachet-priced extras (₹39 / ₹99 for three): 4th slot, extend a bond, one extra pick.
- **Safety & legal**: 18+ gate, unbundled consents including the eLitmus data firewall, report/block everywhere, moderation queue, data export, account deletion, privacy/terms/guidelines/safety pages (DPDP Act 2023 / IT Rules 2021 aware, marked as drafts).
- **Founder dashboard** (`/admin`): funnel, gender balance by city, revenue, reports queue, city waitlists.
- **PWA**: installable, app-shell service worker; light and dark themes.

## Stack

Next.js 16 (App Router, Server Actions, TypeScript) · Supabase (Postgres + RLS, Auth, Realtime, Storage) · Tailwind CSS v4 · `motion` · `sharp` · `zod` · optional Google Gemini. Hosted on Vercel + Supabase free tiers.

```
src/
  app/            routes: (marketing) landing + legal, (auth), onboarding, (app) today/bonds/dates/you, admin, api
  app/actions/    server actions — every one verifies the session and validates with zod
  components/     brand (logo, element tiles, atoms, litmus strip, blur photo), feature UI
  content/        quiz, elements, archetypes, prompts, round banks, venues, 36 personas, evaluators
  lib/            matching, rounds logic, photo entitlement + blur pipeline, data layer, payments, AI
supabase/migrations/   schema + RLS policies
scripts/          seed.ts (demo data), smoke.ts (end-to-end test against a real DB)
tests/            unit tests (matching, rounds, entitlement, safety, clock)
```

**Security model:** RLS is enabled on every table with default-deny. Browsers only get narrow, member-scoped `SELECT` policies (needed for realtime). All writes go through server actions using the service role after authorisation checks. Photos live in a private bucket.

## Run it locally

Prerequisites: Node 20+, Docker (for local Supabase).

```bash
npm install
npx supabase start -x edge-runtime,vector,logflare,imgproxy
npx supabase status -o env      # copy API_URL, ANON_KEY, SERVICE_ROLE_KEY into .env.local
cp .env.example .env.local      # then fill in the values above and set DEMO_PASSWORD
npm run db:seed                 # venues, 36 personas, 4 evaluators + scenarios
npm run dev                     # http://localhost:3000
```

Checks:

```bash
npm test             # unit tests
npm run smoke        # end-to-end loop + RLS checks against the local database
npm run typecheck && npm run lint
```

## Deploy (free tiers)

1. Create a Supabase project. Push the schema: `npx supabase db push --db-url "<connection string>"`.
2. Seed it: `DOTENV_CONFIG_PATH=.env.production.local npm run db:seed` (an env file pointing at the hosted project).
3. Import the repo in Vercel and set the env vars from `.env.example` (`NEXT_PUBLIC_SITE_URL` = the Vercel URL).
4. Supabase pauses free projects after a week of inactivity — open the dashboard and restore it before an evaluation.

## Third-party disclosure

Built from scratch for this assignment; no app template was used. Libraries and assets:

- [Next.js](https://nextjs.org), [React](https://react.dev), [Supabase](https://supabase.com) (+ `@supabase/ssr`), [Tailwind CSS](https://tailwindcss.com), [motion](https://motion.dev), [lucide-react](https://lucide.dev) icons, [zod](https://zod.dev), [sharp](https://sharp.pixelplumbing.com), [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge), [Vitest](https://vitest.dev), [tsx](https://tsx.is), [dotenv](https://github.com/motdotla/dotenv).
- Demo avatars: [DiceBear](https://www.dicebear.com) **Notionists** style (CC0 1.0), generated at seed time. No photos of real people are used for fictional profiles.
- Fonts: Fraunces, Plus Jakarta Sans, JetBrains Mono (SIL Open Font License) via Google Fonts / `@fontsource/fraunces`.
- Optional AI: Google Gemini API (free tier) for copy garnish, always with hand-written fallbacks.
- Development used AI coding assistance (Claude Code). Product decisions, research and trade-offs are documented in `docs/DECISIONS.md`.

## Known limitations

- Payments run on a **mock provider** (test mode); a Razorpay provider is stubbed with notes on going live.
- "Continue with eLitmus ID" is shown but disabled; verification is simulated for seeded accounts.
- Venue names are fictional (real neighbourhoods). Legal pages are drafts, not legal advice.
- No push notifications; the batch and "your move" badges are pull-based.
- Without a Gemini key, demo personas chat from a canned reply bank.
