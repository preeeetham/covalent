# Covalent — Research and Decision Log

A short running record: what we researched, what we found, and the decision it led to.
Add a new dated entry whenever a decision is made or changed. Keep each entry to a few lines.

Research numbers come from industry press and vendor reports (Nov 2026 web research), not primary studies. Treat them as directional.

---

## 2026-11-17 — Initial research and product direction

### Product decisions

| # | What we researched | What we found | Decision | Rejected alternative |
|---|---|---|---|---|
| 1 | User sentiment on dating apps | ~78% of users report swipe burnout (Forbes Health/OnePoll); ~69% of dating apps uninstalled within a month | **No swiping.** 3 curated people a day, then the session ends | Swipe deck with daily limits (still a clone) |
| 2 | What incumbents and new apps are doing | Bumble dropping swipe, Tinder adding events, Hinge's founder building matchmaking; Known, Lamu, S'More all sell "curated matches" | "No swipe" alone is not different enough. Our difference is **what replaces it: a blind, structured chemistry test** | Pure AI matchmaker (crowded, thin to demo) |
| 3 | Why matches don't turn into dates | Photo-first judging filters people in half a second; free matching leads to hoarding and dead "hey" chats | **Photos start blurred and sharpen over 4 shared rounds**; max 3 active bonds; bonds expire after 72h silence | Open chat after match |
| 4 | Our target user (eLitmus 2020–23 batches) | Now 24–28, 1–5 years into IT jobs, many moved alone from tier-2/3 towns to 5 metro hubs; between Tinder and matrimony | Build for **serious-leaning young professionals new to a city**; include hometown and values (family, marriage timeline) in matching | Generic 18–35 audience |
| 5 | Trust and safety complaints in India | Fake profiles and safety are the top complaints; ratio is heavily male-skewed | **Verified by eLitmus on day one** is the moat; safety is a core feature (server-side blur, report/block, share date plan) | Selfie verification only (everyone has it) |
| 6 | Concept options compared | Group meetups are hard to demo and less "dating"; one-match-a-week is too thin to play with | **Blind chemistry test** chosen by owner | Small-group meetups; one match a week |
| 7 | Name | eLitmus → litmus → pH → chemistry is a natural brand line | **Covalent**: "Bonds are shared, not swiped" | Unblur, Tapri, Valence |

### Monetization decisions

| # | What we researched | What we found | Decision | Rejected alternative |
|---|---|---|---|---|
| 8 | Willingness to pay in India | ARPU under $2.50; users won't pay ₹700–800/month; low card use; foreign apps cut India spend | **No subscription at launch.** Core loop is free | Tinder-style Gold/Platinum tiers |
| 9 | What does earn money here | Micro-transactions (flutrr, Aisle), paid offline events (Zomato blind dates), paying for serious intent | **₹99 commitment fee per confirmed date**, converting to venue credit; ₹29–49 "catalyst" sachets via UPI; venue commissions | Paying for likes/boosts (charging for hope) |
| 10 | Incentive alignment | Apps that earn from keeping users swiping have no reason to get them a date | **We earn only when a date is agreed.** North-star metric: confirmed first dates per week | DAU / matches as the goal |

### Go-to-market decisions

| # | What we researched | What we found | Decision | Rejected alternative |
|---|---|---|---|---|
| 11 | Cold start in marketplaces | Dating needs local density and a balanced ratio; thin national coverage fails | **Launch in one city (Bengaluru)**, waitlist with gender-balanced cohorts, women get priority invite codes | India-wide launch to all 1M users |
| 12 | Acquisition cost | eLitmus already has a reachable base of 1M | Opt-in invite to the existing base = near-zero CAC; shareable archetype card as the viral loop | Paid ads |

### Legal decisions

| # | What we researched | What we found | Decision | Rejected alternative |
|---|---|---|---|---|
| 13 | DPDP Act 2023 and Rules 2025 | In force; core obligations phase in over ~18 months from Nov 2025; consent, purpose limitation, erasure, under-18 parental consent; penalties up to ₹250 crore | 18+ DOB gate, unbundled consent, data export and delete in Settings, grievance contact page | Collect first, comply later |
| 14 | Reusing eLitmus hiring data | Data collected for hiring cannot be silently reused for dating (purpose limitation); also a trust risk ("will recruiters see this?") | **Hard data firewall**: opt-in only, only verification status crosses over, nothing flows back to recruiters. Separate brand name | Auto-enrolling the eLitmus database |
| 15 | Sensitive data | Caste and similar fields are a legal and ethical risk | No caste field; religion only as an optional values answer | Matrimony-style filters |

### Design decisions

| # | What we researched | What we found | Decision | Rejected alternative |
|---|---|---|---|---|
| 16 | Category look | Dating apps are dark-neon "casinos" or flat pink | **"Warm Lab"**: calm paper-like light base with one vivid signature, the litmus (pH) gradient | Dark neon / dopamine maximalism |
| 17 | Psychology of engagement | Curiosity gap, goal-gradient, peak-end rule, scarcity, Hick's law, contour bias (rounded = safe) | Blur as curiosity engine; 4-segment progress ring; choreographed reveal as the peak; designed "done for today" ending; one action per screen; rounded shapes | Infinite feed and variable-reward loops (drive burnout) |
| 18 | 2026 motion trends | Shift from bouncy, decorative motion to restrained, purposeful motion | Spring-based, purposeful motion; no confetti; respects reduced-motion | Heavy decorative animation |

### Architecture decisions

| # | What we considered | Finding | Decision | Rejected alternative |
|---|---|---|---|---|
| 19 | Stack under a zero-budget rule | Need auth, relational data, realtime chat and file storage on free tiers, in one codebase | **Next.js + Supabase + Vercel**, TypeScript | MERN (more moving parts, cold starts); Firebase (NoSQL awkward for matching) |
| 20 | Where to enforce the blur | CSS blur can be bypassed from the network tab | **Server-side blur variants with sharp**, served through an authorised route with signed URLs | Client-side CSS blur |
| 21 | Data security | Dating data is sensitive; the anon key is public | **Row Level Security on every table**; state changes go through server actions | Trusting the client |
| 22 | AI usage with no budget | Free tiers have quotas and can fail | **Gemini free tier behind a wrapper, with hand-written fallbacks**; app works with no key | Paid API; no AI at all |
| 23 | Payments with no budget and no KYC | Real gateways need onboarding | **Mock payment provider** behind an interface, labelled test mode; Razorpay stub for later | Skipping payments (would hide the business model) |
| 24 | Demo with a single evaluator | A marketplace with one visitor looks dead | **Seeded demo personas that auto-respond**, clearly tagged; 4 evaluator accounts at different stages; demo controls | Empty app relying on real sign-ups |
| 25 | Seed profile photos | Using real or AI-realistic faces on fake dating profiles is ethically shaky | **CC0 illustrated avatars**, disclosed in the README | Stock photos of real people |

---

## 2026-11-17 — Decisions made during the build

| # | What we considered | Finding | Decision | Rejected alternative |
|---|---|---|---|---|
| 26 | Next.js 16 "Cache Components" (on by default) | Nearly every page is per-user and reads the auth cookie, so there's little static shell to prerender; it would force Suspense boundaries everywhere | **Turned it off**; pages render per request | Keeping it on and wrapping everything in Suspense |
| 27 | Where authorisation lives | Server actions are reachable by direct POST | **Every action verifies the session, validates with zod and checks ownership**; RLS is default-deny underneath as a second wall | Relying on RLS alone with client writes |
| 28 | Reciprocity ("no copying") | Must hold even if someone inspects responses | Partner answers are **filtered in the data layer** until both submit, and mirrored in an RLS policy | Hiding them in the UI only |
| 29 | Demo partners on serverless | `setTimeout` on the server doesn't survive on Vercel | Persona moves are **scheduled as a due time on the bond**; the waiting client (or any page load) asks the server to make the move when due | Background jobs / cron |
| 30 | Evaluator accounts going stale | 72-hour expiry would kill seeded bonds before review | **Bonds between evaluator/demo accounts don't auto-expire**; real users' bonds do. Plus a "Reset this account" control | Re-seeding before every review |
| 31 | Seed + app sharing code | The seed script runs outside Next.js | Domain logic (matching, rounds, blur, seed) is **framework-free**; only `lib/auth` touches Next | Duplicating logic in the script |
| 32 | Gemini model name | Model names change; hardcoding from memory is risky. Checked live: `gemini-2.0-flash` and `gemini-2.5-flash-lite` are retired; `gemini-3.5-flash-lite` answers in ~0.6–2.3 s with no hidden "thinking" tokens | **`GEMINI_MODEL` env var**, set to `gemini-3.5-flash-lite`; AI off unless both key and model are set | Hardcoded model id; a bigger "thinking" model (slower, can spend the token budget before writing) |
| 33 | Round 1 animation | Cards waited on JS exit animations, which stall when frames are throttled | **Pure-CSS entrance**, no exit wait — also snappier for rapid taps | Framer-style `AnimatePresence mode="wait"` |
| 34 | Matching new users | Evaluators are real accounts in the same city | Real users get a **small ranking boost** over demo personas, so new sign-ups meet evaluators and real invites happen | Showing only demo personas to new users |
| 35 | "Why you two" copy without an LLM | Raw quiz labels read badly ("both lean a lot. they matter.") | Each quiz pole has a **hand-written natural phrase** ("family having a real say") used by the template | Only relying on the LLM |

## 2026-11-17 — Scroll performance

| # | What we considered | Finding | Decision | Rejected alternative |
|---|---|---|---|---|
| 36 | Jittery scrolling reported | Main-thread frames were fine (~8 ms); the cost was compositor work repeated every scroll frame: a scroll-linked `blur()` on the hero, frosted-glass `backdrop-filter` on the fixed tab bar and sticky headers, SVG-noise grain with `mix-blend-mode` on every photo, and SVG orbit rotations forcing repaints | Hero now **crossfades opacity** over a pre-blurred layer; headers/tab bar are **solid**; grain is a **static PNG tile on its own GPU layer**, no blend modes; orbits rotate as **HTML layers** | Keeping the effects and hoping for fast GPUs |
| 37 | Mouse-wheel feel | Wheels on macOS/Windows scroll in ~100 px steps | **Lenis** smooths wheel input (eased, ~16 px/frame max); touch stays native; off for `prefers-reduced-motion`; dialogs and nested scroll areas keep native scrolling | Native stepped wheel scrolling; heavier scroll-jacking libraries |

## 2026-11-17 — Submission polish

| # | What we considered | Finding | Decision | Rejected alternative |
|---|---|---|---|---|
| 38 | Demo avatars | Random seeds gave some women male-looking illustrations ("Meera") | Pick hair and beard **per gender** from styles chosen by eye from a contact sheet of all 63; headscarf styles are never auto-assigned from a name | Random seeds; stock photos of real people |
| 39 | Free Supabase pausing after ~7 idle days | Reviewers may open the app weeks later | **Daily Vercel Cron** hits `/api/cron/keepalive` (secret-protected), which makes one real query | Asking reviewers/owner to wake the project manually |
| 40 | Seeded chats were missing | Bulk inserts send the union of columns, so rows without `kind` sent NULL into a NOT NULL column and the whole batch failed **silently** | Set `kind` explicitly and make the seed **throw on any insert error**; smoke test now asserts seeded chat exists | Ignoring insert results |
| 41 | Realtime robustness | The change stream attaches a few seconds after SUBSCRIBED (longer on hosted); a message in that gap could be missed | Await the session before subscribing, and **refresh once when the stream reports ready**; smoke test now checks live delivery locally and in production | Polling for new messages |
| 42 | Lighthouse & accessibility | Landing LCP 3.5 s (runtime blur of an inline SVG); several text colours under 4.5:1; a font file with unused axes | **Pre-rendered hero images**, contrast-checked tokens (`bond-text`, darker `ink-3`/ok/warn/react/danger, `on-accent`, a deeper gradient for text-bearing buttons), `<main>` landmarks, `robots.txt`; landing now 100/100/100/100 | Accepting the 88/97 scores |

## 2026-11-18 — Owner feedback: speed and blur

| # | What we considered | Finding | Decision | Rejected alternative |
|---|---|---|---|---|
| 43 | "Continue" in onboarding felt slow | Vercel functions ran in **Washington (iad1)** while the database is in **Mumbai (ap-south-1)**: every query crossed the globe (~200 ms), and one Continue made ~6 in sequence plus a second request for the next page | Pin functions to **Mumbai (`bom1`)** next to the database; each step saves in **one profile update** (independent writes in parallel) and **redirects from the server action**, so the next step arrives in the same response | Optimistic navigation before the save lands (could leave unsaved steps behind) |
| 44 | Blur ladder on real photos | The "How others see you" preview showed the **sharp photo at every level**: owners were always served the original. On close-up faces the old ladder (σ 34/20/11/5) also left eye positions readable at level 0 and was nearly sharp at level 3 | Owners can request any level of **their own** photo (`?level=`; everyone else still gets only what they've earned). New ladder **σ 56/34/20/11**, tuned on a close-up: colour only → shape → features hinted → soft but recognisable → reveal. Existing photos re-rendered with `npm run photos:rerender` | Client-side CSS blur (can be removed in dev tools) |
| 45 | More ways to sign in (Google, GitHub) | The owner suggested Firebase. The app's users, sessions and every security rule are keyed to **Supabase Auth**; Firebase would be a second identity system and a rework of user IDs | **Supabase's built-in Google and GitHub providers** (the Google OAuth client can come from the Firebase project). New social sign-ups land on `/welcome` for the same **18+ check and consents** as email sign-up. Buttons only render for providers switched on in Supabase, so nothing breaks before setup | Firebase Auth with Supabase trusting Firebase tokens |

---

## Open questions and risks

- Will users accept a dating product linked to a hiring brand, even with the firewall? (Riskiest assumption.)
- Does blind-first cut too much top-of-funnel? Test heavy vs. medium starting blur.
- Is ₹99 the right commitment price? Test ₹49 / ₹99 / first date free.
- Offline-meeting liability and photo moderation need legal review before a real launch.
- Trademark check on "Covalent".

---

## Sources

- [Dating-app fatigue survey (Forbes Health via GDI)](https://www.globaldatinginsights.com/featured/survey-finds-over-three-quarters-are-suffering-dating-app-fatigue/)
- [69% of dating apps uninstalled within a month](https://www.globaldatinginsights.com/featured/69-of-dating-apps-are-uninstalled-within-a-month/)
- [Dating in a swipeless world](https://www.thestar.com.my/tech/tech-news/2026/05/24/dating-in-a-swipeless-world)
- [Dating startups trading swipes for curated matches](https://www.globaldatinginsights.com/featured/dating-startups-are-trading-swipes-for-curated-matches/)
- [flutrr's Bharat bet (Inc42)](https://inc42.com/startups/flutrrs-bharat-bet-can-it-outshine-tinder-bumble-in-indias-dating-space)
- [Redseer: India dating and matrimony market](https://redseer.com/articles/whos-winning-in-indias-dating-matrimony-market-and-where-are-the-opportunities-for-platforms-and-investors/)
- [How TrulyMadly is monetising](https://www.globaldatinginsights.com/opinion/how-trulymadly-is-monetising-its-app/)
- [Investors cautious on dating apps (Storyboard18)](https://www.storyboard18.com/amp/digital/its-complicated-investors-swipe-on-dating-apps-but-with-caution-76792.htm)
- [The Web of Love (Open)](https://openthemagazine.com/feature/the-web-of-love)
- [DPDP Rules 2025 highlights (SCC Online)](https://www.scconline.com/blog/post/2025/12/26/digital-personal-data-protection-rules-2025-key-highlights/)
- [DPDP Act brought into force (Hogan Lovells)](https://www.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-)
- [UI trends 2026 (Lollypop)](https://lollypop.design/blog/2026/february/top-ui-trends-2026/?p=23519)

---

<!-- Template for new entries:

## YYYY-MM-DD — Short title

| What we researched / considered | What we found | Decision | Rejected alternative |
|---|---|---|---|
| | | | |

-->
