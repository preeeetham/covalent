# Covalent — development guide

How to run, test and deploy Covalent, and what it's built with. For how the app works from a user's point of view, see the [README](../README.md). For why it's built this way, see [DECISIONS.md](DECISIONS.md).

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
npm run smoke        # end-to-end loop, realtime and RLS checks against the local database
npm run typecheck && npm run lint
```

## Deploy (free tiers)

1. Create a Supabase project. Push the schema: `npx supabase db push --db-url "<connection string>"`.
2. Seed it: `DOTENV_CONFIG_PATH=.env.production.local npm run db:seed` (an env file pointing at the hosted project).
3. Import the repo in Vercel and set the env vars from `.env.example` (`NEXT_PUBLIC_SITE_URL` = the Vercel URL).
4. Optional social login: in Supabase → Authentication → Sign In / Providers, enable **Google** and/or **GitHub** with your OAuth client ID and secret (callback URL `https://<project-ref>.supabase.co/auth/v1/callback`). Under URL Configuration set the Site URL to your Vercel URL and add `http://localhost:3000/**` to Redirect URLs. The buttons appear automatically once a provider is on.
5. Set `CRON_SECRET` in Vercel. `vercel.json` schedules a daily keep-alive (`/api/cron/keepalive`) so the free Supabase project doesn't pause from inactivity.
6. Keep functions next to the database: `vercel.json` pins them to `bom1` (Mumbai) because the Supabase project is in `ap-south-1`. Change both together.
7. After changing the blur strengths in `src/lib/photos/render.ts`, re-render stored photos: `DOTENV_CONFIG_PATH=.env.production.local npm run photos:rerender`.

## Quality checks

Lighthouse (mobile, Nov 2026): landing page **100 / 100 / 100 / 100** (performance / accessibility / best practices / SEO); signed-in screens score 86–100 for performance and **100** for accessibility. Text colours are checked against WCAG AA (4.5:1) in both light and dark themes.

## Third-party disclosure

Built from scratch for this assignment; no app template was used. Libraries and assets:

- [Next.js](https://nextjs.org), [React](https://react.dev), [Supabase](https://supabase.com) (+ `@supabase/ssr`), [Tailwind CSS](https://tailwindcss.com), [motion](https://motion.dev), [lucide-react](https://lucide.dev) icons, [zod](https://zod.dev), [sharp](https://sharp.pixelplumbing.com), [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge), [Vitest](https://vitest.dev), [tsx](https://tsx.is), [dotenv](https://github.com/motdotla/dotenv).
- Demo avatars: [DiceBear](https://www.dicebear.com) **Notionists** style (CC0 1.0), generated at seed time. No photos of real people are used for fictional profiles.
- Fonts: Fraunces, Plus Jakarta Sans, JetBrains Mono (SIL Open Font License) via Google Fonts / `@fontsource/fraunces`.
- Optional AI: Google Gemini API (free tier) for copy garnish, always with hand-written fallbacks.
- Smooth wheel scrolling: [Lenis](https://lenis.darkroom.engineering) (MIT).
- Development used AI coding assistance (Claude Code). Product decisions, research and trade-offs are documented in [DECISIONS.md](DECISIONS.md).

## Known limitations

- Payments run on a **mock provider** (test mode); a Razorpay provider is stubbed with notes on going live.
- "Continue with eLitmus ID" is shown but disabled; verification is simulated for seeded accounts.
- Venue names are fictional (real neighbourhoods). Legal pages are drafts, not legal advice.
- No push notifications; the batch and "your move" badges are pull-based.
- Without a Gemini key, demo personas chat from a canned reply bank.
