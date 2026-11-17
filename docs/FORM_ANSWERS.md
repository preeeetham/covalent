# Submission form — draft answers

Ready to paste. Numbers marked *assumption* are hypotheses to test, not data. Edit freely so it sounds like you.

---

## Project hosting link

_Paste the full Vercel URL once deployed (do not shorten)._

## Project GitHub repository link

_Paste the full GitHub URL._

---

## What is your go-to-market & scaling strategy?

**Launch dense, not wide.** A dating app lives or dies on local density and a balanced gender ratio, so Covalent opens in one city first — Bengaluru, where the most eLitmus-placed engineers work — with Hyderabad second. 5,000 active people in one city beat 50,000 spread across India.

**Zero-CAC warm start.** eLitmus already has over a million candidates from the 2020–23 batches, now 24–28 and working. We send an opt-in invite to those in the launch city: "You're already verified. Skip the fakes." Nobody is auto-enrolled; the data firewall (dating data never reaches recruiters) is stated up front because trust is the whole proposition.

**Ratio control from day one.** Sign-ups are admitted in gender-balanced cohorts; everyone else joins a city waitlist with their position shown. Each admitted woman gets three priority invite codes for friends. The founder dashboard tracks the women's share per city against a 40–60% band before a city opens wider.

**Built-in sharing loops.** Onboarding ends with your "element" (Neon, Argon, Gold…) as a story-sized card designed for Instagram and WhatsApp status. Partner cafés carry table tents ("First date here? ₹99 off with Covalent"), which turns every date into local advertising.

**Scale by unlocking cities** when waitlist density and balance cross thresholds (Hyderabad → Pune → Chennai → NCR), then open beyond eLitmus through work-email verification. Product roadmap: friends-first mode for people new to a city, small group mixers at partner venues, and Covalent+ for power users.

**North-star metric:** confirmed first dates per week — not matches, not daily active users.

---

## How do you plan on monetizing the app?

Indian users don't pay for dating subscriptions (reported ARPU is under $2.50, and ₹700–800/month plans don't sell). So Covalent never charges for hope — likes, boosts, visibility. **Everything you need to meet someone is free.** We charge at the moment of highest intent and smallest objection: **when two people have agreed to meet.**

1. **Date commitment — ₹99 each, per confirmed date.** It comes back as ₹99 off the bill at partner venues; no-shows forfeit it. It pays us, cuts no-shows, and feels fair because it's tied to a real plan. *(Built, with a mock UPI checkout.)*
2. **Venue partnerships.** Cafés pay 10–15% of the bill or ₹50–100 per date we send them, plus featured placement. The venue funds the ₹99 credit because we bring them two paying customers on a quiet weekday evening.
3. **Catalysts — sachet pricing via UPI** (₹39 each, ₹99 for three): a fourth bond slot for a week, extend a bond by 48 hours, one extra pick today. Convenience, never access. *(Built.)*
4. **Later:** Covalent+ at ₹149/month (filters, see who invited you first) and paid group mixers at ₹299–499 a seat.

*Assumption math:* 100,000 monthly active users × 15% reaching a confirmed date a month = 15,000 dates × ₹198 ≈ **₹30 lakh/month** from commitments alone, before venue commissions and catalysts. Our incentive is aligned with the user's: we only earn when they actually get a date.

---

## Your hypothesis & assumptions

**Target segment.** eLitmus's 2020–23 batches: 24–28-year-old engineers 1–5 years into IT jobs, many from tier-2/3 towns, who moved alone to Bengaluru, Hyderabad or Pune. They're past "hookup apps" but not ready for matrimony sites, price-sensitive but UPI-native, and analytical — they literally took an aptitude test to get here.

**The problem.** ~78% of dating-app users report burnout (Forbes Health survey). Photo-first swiping filters people in half a second, free matching leads to hoarding and dead "hey" chats, and fake profiles drive women away, which wrecks the ratio for everyone.

**What Covalent does differently.**
- **No swiping.** Three curated people a day, then the app tells you to go live your life.
- **Conversation before looks.** Photos start blurred and sharpen across four structured rounds — quick-fire picks, one real question each, guessing each other, drafting a date. Answers stay hidden until both have played. The blur is enforced on the server, not in CSS.
- **Fewer, better bonds.** Max three at a time; silence for 72 hours closes a bond kindly. Built-in closure instead of ghosting.
- **Verified on day one.** eLitmus already knows each candidate's real identity, college and graduation year — a trust moat Tinder can't buy.
- **We earn when you get a date,** not when you keep scrolling.

**Why we win against established apps.** Incumbents are now dropping swipes too (Bumble, Tinder events, Hinge's founder's new app), so "no swipe" alone isn't enough. Covalent's edge is the combination nobody else has: a verified, concentrated, age-matched base at near-zero acquisition cost, plus a mechanic that replaces the swipe with something to *do* together.

**Assumptions we're testing (riskiest first):**
1. People will accept a dating product linked to a hiring brand, given a hard data firewall and a separate brand.
2. A blurred-first profile doesn't kill top-of-funnel if the reveal comes within one sitting.
3. Structured rounds produce better conversations than a blank chat (metric: bonds reaching 10+ messages).
4. A ₹99 commitment raises show-up rates without suppressing dates (test ₹49 / ₹99 / first date free).
5. Verified, cohort-based admission holds a healthier gender ratio than open apps.

---

## Give a breakdown of your journey in making the application

_Template — replace with your real days and hours. See `docs/BUILD_LOG.md` for what was actually done in each session._

- **Day 1:** Read the brief; researched swipe fatigue, India's dating market, monetisation that works locally, DPDP Act/Rules and UI psychology (~x hrs). Wrote `plan.md` and the decision log; chose the "blind chemistry test" concept and the name Covalent.
- **Day 2:** Built the foundation — Next.js + Supabase schema with RLS, design system ("Warm Lab"), auth, onboarding, server-side blur pipeline (~x hrs).
- **Day 3:** Matching engine, daily batches, the four rounds, persona engine for demo partners, reveal, chat (~x hrs).
- **Day 4:** Dates, mock payments, feedback and reliability, safety tools, legal pages, founder dashboard, landing page (~x hrs).
- **Day 5:** Testing (unit + end-to-end smoke + browser walkthroughs), fixes, docs, deployment and smoke test on the live URL (~x hrs).
