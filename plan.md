# Covalent — Build Plan

> **Bonds are shared, not swiped.**
> A dating app for verified young professionals where you get to know someone before you see them.

This document is the complete brief for the build agent. Read all of it before writing code. Sections 1–4 explain *why* (the evaluators grade reasoning, so the product must visibly embody it). Sections 5–12 specify *what* to build. Section 13 is the build order with cut lines. Section 14 is the definition of done.

---

## 0. Context: what this is for

This is a take-home assignment from **eLitmus** (Indian hiring-assessment company, runs the "pH Test") for a founder-type role. The brief:

- eLitmus has **1M+ users from the 2020–2023 graduating batches**. They want to monetize this base with an alternate service: a dating app.
- "End-to-end own and develop a dating app": sign-ups, revenue, legal implications.
- "**Do not make another Tinder or Hinge clone.**" They want a product builder who observes the landscape, challenges conventions, and builds something genuinely different. "We are interested in the reasoning behind your decisions, not just the features."
- Must be a **live, working web app / PWA** (not a prototype). Evaluators will log in with test user IDs and passwords and play with it.
- Source on GitHub with run instructions. Third-party templates/components must be **disclosed**.
- **No money should be spent.** Free tiers only.

The submission form asks for: hosting URL, GitHub URL, go-to-market and scaling strategy, monetization plan, hypothesis and assumptions (USPs, target segment, why we win), and a day-by-day journey.

**Decisions already made by the owner (do not revisit):**

| Decision | Choice |
|---|---|
| Concept | Blind chemistry test: no swiping, curated daily batch, photos unblur through shared "rounds", ends in a committed first date |
| Name | **Covalent** |
| Stack | Next.js + Supabase + Vercel |
| AI | Free-tier LLM with hand-written fallbacks; the app must work fully with no API key |

---

## 1. Research summary

Numbers below come from web research in Nov 2026. Most are from industry press and vendor reports, not primary research; treat them as directional and say so wherever they are quoted in the app or docs.

**Swipe fatigue is the dominant user sentiment.**
- Forbes Health/OnePoll survey: ~78% of dating-app users report burnout at least sometimes, ~79% of Gen Z.
- ~69% of dating apps are reported uninstalled within a month (Global Dating Insights).
- Incumbents are reacting: Bumble is reported to be dropping the classic swipe and adding IRL date setup (rolling out Q4 2026); Tinder is adding events; Hinge's founder launched a matchmaking-style app (Overtone). New entrants (Known, Lamu, S'More) all sell "fewer, curated matches".
- Implication: "no swipe" alone is no longer a differentiator. The differentiator has to be *what replaces it*.

**India specifics.**
- Subscriptions fail: ARPU reported under $2.50; users won't pay ₹700–800/month; low card penetration; foreign players have cut India spend over poor monetization.
- What shows traction instead: micro-transactions (flutrr, Aisle's paid invites), offline events (flutrr café meetups, Zomato blind-date events), and paying for *serious intent* and *verification*.
- Gender ratio is heavily male-skewed, which wrecks the experience for both sides (women are flooded, men get nothing).
- Growth is shifting to tier-2/3 cities (TrulyMadly tier-1 revenue share fell from ~78% to ~55%; QuackQuack reports 25%+ growth in several tier-2/3 cities).
- Trust (fake profiles, safety) is the standing complaint.

**Legal.**
- DPDP Act 2023 is in force; DPDP Rules were notified 13–14 Nov 2025 with phased rollout, core consent and security obligations landing ~18 months later (around mid-2027). Requires clear consent notices, purpose limitation, erasure rights, breach reporting, and verifiable parental consent for under-18s (so a dating app must keep minors out). Penalties up to ₹250 crore.

Sources: [Forbes Health burnout survey via GDI](https://www.globaldatinginsights.com/featured/survey-finds-over-three-quarters-are-suffering-dating-app-fatigue/) · [69% uninstalled in a month](https://www.globaldatinginsights.com/featured/69-of-dating-apps-are-uninstalled-within-a-month/) · [Dating in a swipeless world](https://www.thestar.com.my/tech/tech-news/2026/05/24/dating-in-a-swipeless-world) · [Curated-match startups](https://www.globaldatinginsights.com/featured/dating-startups-are-trading-swipes-for-curated-matches/) · [flutrr's Bharat bet, Inc42](https://inc42.com/startups/flutrrs-bharat-bet-can-it-outshine-tinder-bumble-in-indias-dating-space) · [Redseer India dating and matrimony](https://redseer.com/articles/whos-winning-in-indias-dating-matrimony-market-and-where-are-the-opportunities-for-platforms-and-investors/) · [TrulyMadly monetisation](https://www.globaldatinginsights.com/opinion/how-trulymadly-is-monetising-its-app/) · [Storyboard18 on investor caution](https://www.storyboard18.com/amp/digital/its-complicated-investors-swipe-on-dating-apps-but-with-caution-76792.htm) · [The Web of Love, Open](https://openthemagazine.com/feature/the-web-of-love) · [DPDP Rules 2025, SCC Online](https://www.scconline.com/blog/post/2025/12/26/digital-personal-data-protection-rules-2025-key-highlights/) · [Hogan Lovells on DPDP in force](https://www.hoganlovells.com/en/publications/indias-digital-personal-data-protection-act-2023-brought-into-force-)

---

## 2. Product thesis

### 2.1 Who it is for

The eLitmus 2020–2023 batches are now **24–28 years old, 1–5 years into an IT job**. A large share came from non-top colleges in tier-2/3 towns and moved alone to Bengaluru, Hyderabad, Pune, Chennai or NCR. They are:

- lonely in a new city, with a social circle limited to flatmates and teammates;
- past the "hookup app" phase, not yet ready for Shaadi.com (the gap between Tinder and matrimony is the opening);
- price-sensitive but UPI-native: they will not subscribe, but they pay ₹99 for a thing they can see;
- analytically minded: they literally sat an aptitude test to get here.

### 2.2 The problem we chose

Swiping apps optimize for *matches*; users want *dates with someone they click with*. Three failures follow from the photo-first swipe:

1. **Judgment in 0.5 seconds.** Average-looking, genuinely interesting people (most of our segment) get filtered before a word is exchanged.
2. **Matches that go nowhere.** Matching is free, so people hoard matches and conversations die at "hey".
3. **No trust.** Anyone can be anyone. Women carry the risk and leave, which collapses the ratio.

### 2.3 What Covalent does differently

| Convention | Covalent | Why |
|---|---|---|
| Infinite swipe deck | **3 curated people a day, then it ends** | Scarcity makes each one matter; a finite session removes the slot-machine loop that causes burnout |
| Photo first | **Photos start blurred and sharpen as you both engage** | Shifts the first filter from looks to conversation; the blur is also a curiosity engine |
| "Hey" in an empty chat | **4 structured rounds (the "chemistry test")** | Nobody has to be clever at a blank text box; both people always know whose turn it is |
| Unlimited matches | **Max 3 active bonds** | Forces attention; ends hoarding and most ghosting |
| Ghosting | **Bonds expire after 72h of silence; ending one is a kind, one-tap "dissolve"** | Closure is designed in |
| Pay to be seen (boosts, likes) | **Pay only when a date is actually agreed** | We earn when the user wins, so incentives align |
| Anonymous sign-up | **Verified via eLitmus identity** (education + employer already on file) | A trust moat no new competitor can copy |

### 2.4 The unfair advantage (state this everywhere)

eLitmus already knows each candidate's real name, college, graduation year and often employer. Covalent can launch with **every profile verified on day one**, in the exact age band that dates, concentrated in five cities. Tinder cannot buy that. The brand also lines up neatly: eLitmus → litmus → pH → chemistry → covalent bond.

### 2.5 Key assumptions (to be tested, and listed honestly in the form answers)

1. People will tolerate not seeing a clear photo up front if the reveal is fast (within one sitting, ~10 minutes of mutual play). *Mitigation: blurred photo still shows silhouette/colour/vibe; reveal is progressive, not all-or-nothing.*
2. Structured rounds produce better conversations than open chat. *Metric: % of bonds reaching chat with 10+ messages.*
3. A ₹99 commitment fee raises show-up rate rather than suppressing dates. *Metric: date-proposal → confirmed conversion; no-show rate.*
4. eLitmus users will accept a dating invite from a hiring brand if the data firewall is explicit. *This is the riskiest assumption; see §10.*
5. Verified status and a capped, balanced intake will hold a healthier gender ratio than open apps.

---

## 3. The core loop (build exactly this)

```
Sign up → Onboarding (find your element) → Daily batch of 3
   → Start a reaction (bond) → Round 1 → Round 2 → Round 3 → Round 4
   (photo sharpens each round; chat opens after Round 1)
   → Full reveal → Plan a date → both commit ₹99 → date → feedback
   → reliability badge → better batches
```

### 3.1 Vocabulary (use consistently in UI and code)

| Term | Meaning |
|---|---|
| **Batch** | Today's 3 curated people |
| **Reaction** | The act of starting with someone ("Start a reaction") |
| **Bond** | An active pairing between two people |
| **Rounds** | The 4 structured steps of a bond |
| **Chemistry** | The 0–100 score on a bond, shown as a litmus strip |
| **Elements** | Interest/trait tags styled as periodic-table tiles |
| **Reveal** | Photos becoming fully sharp |
| **Dissolve** | Ending a bond kindly |
| **Catalyst** | The in-app credit used for small paid extras |

### 3.2 Onboarding (target: under 4 minutes, one question per screen)

1. **Account**: email + password (Supabase Auth). Production path is "Continue with eLitmus ID"; in this build show that button disabled with a "coming with eLitmus SSO" note, and give seed accounts a "Verified via eLitmus" badge.
2. **18+ gate**: date of birth, hard block under 18. Explicit consent checkboxes: Terms, Privacy, and a separate plain-language line: "Covalent data is never shared with eLitmus recruiters or employers."
3. **Basics**: first name, gender, interested in, city (Bengaluru, Hyderabad, Pune, Chennai, Delhi NCR, Mumbai, Other), what you do (role + company optional), hometown (optional; powerful for this segment).
4. **Intent**: "Something serious", "Dating to see where it goes", "New in the city, open to friends first".
5. **Values quiz** (10 questions, 5-point or this/that; this is the matching signal). Examples: "Saturday night: house party or one friend and long talk?", "Money: save for the future or spend on experiences?", "How close are you to family decisions about your partner?", "Career move to another city: go or stay?", "Marriage timeline?", "Religion in daily life?", "Arguments: talk now or cool off first?".
6. **Elements**: pick 5–8 interest tiles (cricket, filter coffee, anime, trekking, indie music, gym, DSA grind, biryani, stand-up, K-drama, etc.).
7. **Prompts**: answer 3 of ~15 (e.g. "The most tier-2 thing about me", "A hill I will die on", "My Sunday looks like").
8. **Photos**: 1–4. Explain right there: "Your photos stay blurred until you both finish the rounds."
9. **Result screen (peak moment)**: "You are **Neon (Ne)**: bright, social, lights up a room." Assign one of ~12 element archetypes from quiz answers. Offer a **shareable card** (downloadable PNG) → this is the free viral loop.

### 3.3 Daily batch

- 3 people per day, generated lazily on first open of the day (no cron). Resets at 8 PM local (evening is when people use dating apps); show a countdown to the next batch.
- Each card: blurred photo, first name, age, city, role, element archetype, 3 shared element tiles, and **"Why you two"**: three specific reasons (LLM-phrased, template fallback).
- Actions: **Start a reaction** or **Not for me** (with optional one-tap reason that feeds matching). No undo, no feed, no "see more".
- Incoming reactions from others appear above the batch as **invites** and do not consume batch slots.
- When all three are handled: an intentional end state. "That's today's batch. Go live your life. Next one in 5h 12m." This screen is a feature, design it with care.

### 3.4 Bonds and the four rounds

A bond is created when A starts a reaction and B accepts the invite (demo personas auto-accept). Max 3 active bonds per user. Rounds are **asynchronous**: each person answers independently, and answers are revealed only when both have answered (prevents copying, creates anticipation).

| Round | Mechanic | Unblur after | Chemistry effect |
|---|---|---|---|
| **1. Quick fire** | 8 this-or-that taps (chai/coffee, mountains/beach, text/call, plan/wing it…). Reveal shows overlaps side by side. | Level 1 (heavy → medium) | + overlap ratio |
| **2. Ask** | Each picks 1 of 3 deeper questions *to ask the other*, then answers the one they receive. Each reacts to the other's answer with an emoji + one line. | Level 2 | + both answered thoughtfully (length threshold) |
| **3. Guess** | "How well do you read them?" Predict the other's answer on 5 statements; reveal scores each other's accuracy. Playful, produces teasing. | Level 3 (light blur) | + accuracy |
| **4. First date draft** | Each picks 2 of 6 date ideas and one free slot type (weekday evening / weekend morning / weekend evening). Overlap becomes a suggested plan. | **Full reveal** (both tap "Reveal") | + overlap |

- **Chat** opens after Round 1 (text only, realtime). Rounds remain the spine; chat is the connective tissue.
- **Turn indicator** on every bond: "Your move" / "Waiting for Asha". Goal-gradient: a 4-segment progress ring that is also the unblur meter.
- **Expiry**: 72h without a move from either side → bond expires with a gentle notice. One nudge allowed per bond.
- **Dissolve**: one tap + optional reason (private). Other person sees a kind, non-blaming message. Frees the slot.
- After full reveal either person can **Plan a date**.

### 3.5 Date planning and the commitment fee

1. Propose: pick a venue from a curated city list (seed 6–8 cafés/public places per city, clearly demo data) + a date and time.
2. Other person accepts or counters.
3. Both pay a **₹99 commitment** to confirm. Copy: "₹99 each. It turns into ₹99 off your bill at the venue. No-shows forfeit it."
4. Confirmed date card: venue, time, map link, **Share plan with a trusted contact** (generates a read-only share link with venue + time + first name of date; no auth needed to view).
5. After the date time passes: **feedback** for both: "Did they show up?", "Did you feel safe?", "Would you meet again?" (private). Showing up builds a **Reliable** badge that improves batch quality. A "felt unsafe" answer opens the report flow and flags the account for review.

**Payments in this build**: implement a `PaymentProvider` interface with a **mock provider** as default (a realistic checkout sheet labelled "Test mode: no real money moves", UPI-style, succeeds after a short delay; a "simulate failure" link for testing). Leave a stubbed `razorpay` provider behind an env flag with a comment on what going live needs. Record every transaction in `payments`.

### 3.6 Safety and trust (first-class, not a settings page)

- Verified badge (eLitmus) on profiles.
- Report and block from every profile, bond and chat. Block is immediate and mutual-invisible.
- Blur is **enforced server-side** (see §6.4). Never ship the sharp image to a client that hasn't earned it.
- Basic message hygiene: client + server check that flags phone numbers / payment handles shared before reveal, with a soft warning ("Keep it on Covalent until you've met").
- Public venues only for first dates; safety tips screen before the first confirmed date.
- Account deletion and data export in Settings (DPDP).

### 3.7 Demo mode (critical: evaluators arrive alone)

A marketplace demo with one visitor is dead. Solve it explicitly:

- **Seed ~36 demo personas** across Bengaluru and Hyderabad (balanced genders, varied hometowns, roles, intents), each with full quiz answers, elements, prompts, and **pre-authored answers for all four rounds**. Mark `is_demo = true` and show a small "Demo profile" tag (honesty; also avoids fake-profile optics).
- Demo personas **auto-respond**: accept invites instantly; submit their round answers 3–8 seconds after the human does (show a "typing/thinking" state); reply in chat via the LLM with a persona system prompt, falling back to a canned reply bank if no key or quota.
- **Persona photos**: use CC0 illustrated avatars (e.g. DiceBear styles, generated at seed time and stored in Supabase Storage). Do **not** use stock or AI photos of realistic human faces on fake dating profiles. The blur pipeline must still run on them so the mechanic is visible. Disclose the avatar source in the README.
- **4 evaluator accounts** pre-onboarded (2 men, 2 women), at different stages: one fresh (full batch waiting), one mid-rounds, one at reveal with chat history, one with a confirmed date and one pending feedback. Two of them are bonded **to each other** so evaluators can open two browsers and feel realtime. Password comes from `DEMO_PASSWORD` env at seed time; list emails in the README.
- **Demo controls** (visible only to `is_evaluator` accounts, a small floating flask button): "New batch now", "Skip partner wait", "Reset this account". Lets an evaluator see the whole loop in five minutes.
- New sign-ups also work end to end and get batches from demo personas.

### 3.8 Founder dashboard (`/admin`, evaluator accounts with `is_admin`)

Shows the builder owns the business, not just the code. One page: sign-ups, gender ratio by city, funnel (onboarded → reaction started → round 4 → reveal → date proposed → date confirmed), revenue from mock payments, open reports queue with resolve action, waitlist counts by city. Computed from an `events` table and live tables.

### 3.9 Landing page (`/`)

Public marketing page for logged-out visitors: hero with the blur-to-sharp effect on scroll, the three-line pitch, how it works in 4 steps, the "verified by eLitmus" trust block, the data-firewall promise, city **waitlist form** (email, city, gender; stored in `waitlist`), links to Privacy / Terms / Community Guidelines / Safety. Logged-in users go straight to `/today`.

---

## 4. Monetization, GTM, legal (must be reflected in product and in `docs/FORM_ANSWERS.md`)

### 4.1 Monetization: "we earn when you get a date"

Principle: never charge for hope (likes, boosts, visibility). Everything needed to meet someone is free. Charge at the moment of highest intent and smallest objection.

| Stream | Price | Who pays | In this build |
|---|---|---|---|
| **Date commitment** | ₹99 each per confirmed date, converts to venue credit | Both users | Built (mock payments) |
| **Venue partnerships** | 10–15% of bill or flat ₹50–100 per covers delivered; featured placement | Cafés, not users | Seed venues carry a `partner` flag and "₹99 off" offer; shown in admin revenue model |
| **Catalysts** (sachet pricing) | ₹29–49 each via UPI: a 4th active bond slot for a week, extend an expiring bond 48h, one extra batch pick | Users, occasional | Built: catalyst wallet, 3 purchasable uses, mock checkout |
| **Covalent+** (later) | ₹149/month: advanced filters, see who invited you first, priority support | Power users | Not built; shown as "coming soon" row in Settings |
| **Events** (later) | ₹299–499 per seat, group "mixers" at partner venues | Users | Not built; mentioned in docs |

Illustrative unit math for the docs (label as assumptions): 100k active users in year 1 → 15% reach a confirmed date per month → 15k dates × ₹198 = ~₹30L/month gross from commitments, plus venue commission, plus catalysts. Women are not charged differently; safety is the women-side value proposition, not discounts.

### 4.2 Go-to-market and scaling

1. **Launch dense, not wide.** One city first (Bengaluru: highest concentration of eLitmus hires). A dating app with 5,000 users in one city beats 50,000 across India.
2. **Warm start from the eLitmus base**: opt-in email/WhatsApp invite to 2020–2023 batches in that city: "You're already verified. Skip the fakes." Zero CAC channel.
3. **Waitlist with ratio control**: admit in gender-balanced cohorts; excess joins the waitlist with position shown. Each admitted woman gets 3 priority invite codes for friends (non-eLitmus allowed, verified by work email/LinkedIn later).
4. **Built-in share loop**: the element archetype card from onboarding and the "chemistry report" after a completed bond are designed to be posted on Instagram stories/WhatsApp status.
5. **Offline hooks**: partner cafés carry table tents ("First date here? ₹99 off with Covalent"); company and alumni WhatsApp groups via ambassador users.
6. **Scale by unlocking cities** when waitlist density and ratio cross thresholds (Hyderabad → Pune → Chennai → NCR), then open beyond eLitmus through employer-email verification. Later product lines: friends mode for new-in-city, group mixers, Covalent+.
7. **North-star metric**: confirmed first dates per week (not matches, not DAU).

### 4.3 Legal and risk checklist (build the ✅ items; document the rest)

- ✅ 18+ only: DOB gate at sign-up; under-18 blocked.
- ✅ Consent: separate, unbundled consent for Terms, Privacy, and marketing. Plain-language privacy notice listing what is collected and why (DPDP).
- ✅ **Purpose limitation and data firewall**: eLitmus assessment data was collected for hiring. It cannot be silently reused for dating. Users must opt in; only verification status crosses over; dating data never flows back to recruiters or employers. State it at sign-up and on the landing page.
- ✅ Right to erasure and data export in Settings; account deletion cascades.
- ✅ Grievance officer contact and report mechanism on a public page (IT Rules 2021 intermediary obligations).
- ✅ Report / block / moderation queue; community guidelines page.
- ✅ Minimal sensitive data: no caste field at all; religion only as an optional values answer; orientation limited to "interested in".
- ✅ No card data stored; payments via provider.
- 📄 Document only: breach notification process, data localisation stance, photo-moderation plan (nudity/minor detection before scale), retention policy, payment refund terms, liability disclaimers for offline meetings, trademark check on the name "Covalent" before launch.
- Privacy, Terms, Guidelines pages must carry a banner: "Draft for demonstration; not legal advice."

---

## 5. Design system: "Warm Lab"

The design must look like nothing else in the category. Dating apps are either dark-neon casinos or flat pink. Covalent is a **calm, warm, paper-like space with one vivid signature: the litmus gradient.**

### 5.1 Psychology principles to apply (each maps to a concrete UI decision)

| Principle | Where it is applied |
|---|---|
| **Curiosity gap** (Loewenstein): people are pulled to close a visible gap in knowledge | The blurred photo that sharpens. Always show *something* (colour, silhouette), never a blank placeholder |
| **Goal-gradient effect**: effort increases near a goal | 4-segment bond ring; "1 round to reveal" labels |
| **Endowed progress** | New bond starts with the ring's first tick pre-lit ("You matched on 3 elements") |
| **Peak-end rule**: experiences are remembered by their peak and their end | Reveal is the choreographed peak; every session ends on a designed "done for today" screen, never a dead end |
| **Scarcity** | "3 today", countdown to next batch, 3 bond slots shown as physical slots |
| **Hick's law** | One primary action per screen; onboarding is one question per screen |
| **Von Restorff / isolation effect** | Exactly one gradient element per screen; everything else is quiet |
| **Aesthetic-usability effect** | Typographic polish and motion quality are functional requirements here |
| **Contour bias** (rounded shapes read as safe/friendly) | Large radii, circular atoms, no sharp corners on interactive elements |
| **Doherty threshold** (<400ms feedback) | Optimistic UI on every tap; skeletons, never spinners on primary surfaces |
| **Zeigarnik effect** (unfinished tasks stay in mind) | "Your move" chips on bonds; used gently, max one notification-style nudge per bond |
| **Reciprocity** | Answers are revealed only when both have answered |
| **Ethical guardrail** | No infinite feeds, no fake urgency, no variable-reward loops with no end. The app tells you to leave when you're done |

### 5.2 Visual language

- **Mode**: light, warm "paper" base by default. Dark mode supported through the same tokens (follow system; toggle in Settings). Build light first; dark is a cut-line item.
- **Signature**: the **litmus gradient**, the actual pH scale: acid coral → magenta → violet → indigo-blue. Used for the chemistry strip, the bond ring, primary CTA, and the reveal moment. Nowhere else.
- **Motif 1, element tiles**: interests and archetypes rendered as periodic-table tiles (small atomic number top-left in mono, big 1–2 letter symbol, name beneath). e.g. `Fc` Filter Coffee, `Tk` Trekking, `Cr` Cricket.
- **Motif 2, the bond**: two circles (atoms) joined by shared electrons. Each completed round adds an orbiting electron pair. This is the bond-progress visual and the logo mark (two overlapping circles with a shared dot).
- **Motif 3, blur as material**: blurred photos have a soft grain overlay and a frosted label ("2 rounds to reveal"), so blur looks intentional, not broken.
- **Shape**: radii 20–28px on cards, full pills for buttons/chips, soft layered shadows (low-opacity, warm-tinted), 1px hairline borders.
- **Texture**: very subtle paper grain on the background (CSS noise SVG, ~3% opacity).

### 5.3 Tokens (starting values; tune for WCAG AA contrast)

```
--paper:        #FBF7F1   /* app background */
--surface:      #FFFFFF
--surface-2:    #F4EEE6
--ink:          #1C1524   /* primary text, deep aubergine-black */
--ink-2:        #5E5568   /* secondary text */
--line:         #E9E1D6
--acid:         #FF5A4F   /* coral red, pH 1 */
--react:        #E0409A   /* magenta */
--bond:         #7C4DFF   /* violet, brand primary */
--base:         #3B6BFF   /* blue, pH 14 */
--litmus:       linear-gradient(100deg, #FF5A4F 0%, #E0409A 35%, #7C4DFF 68%, #3B6BFF 100%)
--ok:           #1F9D6B
--warn:         #D98A00
--danger:       #D4352C

Dark: --paper #120E18, --surface #1B1623, --surface-2 #251E30, --ink #F5EFF8, --ink-2 #A99FB5, --line #322A3F
```

- **Type**: display **Fraunces** (variable serif, soft, slightly quirky; headlines, archetype names, big numbers) + UI **Geist** or **Plus Jakarta Sans** (body, controls) + **Geist Mono / JetBrains Mono** (element numbers, countdowns). Load via `next/font`. Scale: 12 / 14 / 16 / 20 / 28 / 40 / 56. Headlines tight (-0.02em), generous line height on body.
- **Spacing**: 4px base; screens use 20px side gutters; cards 20–24px padding.

### 5.4 Motion (use `motion`, formerly Framer Motion)

- Springs, not eases (stiffness ~260, damping ~24). Durations 180–320ms for UI, up to 1200ms for the reveal.
- **Reveal choreography** (the peak): ring completes → litmus gradient sweeps across the card → photo goes blur → sharp with a slight scale-in (1.06 → 1) → name and a line of copy fade up → soft haptic (`navigator.vibrate` where supported). No confetti.
- Round result reveals flip both answers in simultaneously.
- Card exit on "Not for me" is a calm fade-down, deliberately **not** a swipe gesture.
- Electrons orbit slowly on bond cards (CSS animation, GPU-cheap).
- Respect `prefers-reduced-motion`: replace with opacity fades.

### 5.5 Layout

- Mobile-first. On desktop, the app renders in a centered phone-width column (max ~440px) on the paper background with the logo and a short tagline beside it; the landing page and `/admin` are full-width responsive.
- Bottom tab bar with 4 tabs: **Today** (batch), **Bonds**, **Dates**, **You**. Active bond count badge on Bonds when it's "your move".
- Empty states are illustrated with the atom motif and always say what happens next.

### 5.6 Copy voice

Warm, witty, a little nerdy, Indian-English natural (no forced Hinglish). Short sentences. Chemistry wordplay used sparingly (once per screen at most). Examples: "No reaction yet. Give it time." / "That's today's batch. Go touch grass." / "You two agree on 6 of 8. Suspicious."

---

## 6. Technical architecture

### 6.1 Stack

- **Next.js** (latest stable, App Router, TypeScript strict, Server Components + Server Actions), deployed on **Vercel** free tier.
- **Supabase** free tier: Auth (email/password; disable email confirmation for demo convenience), Postgres with **Row Level Security on every table**, Realtime (chat, bond updates), Storage (photos).
- **Tailwind CSS v4** with the tokens above as CSS variables; **shadcn/ui** primitives restyled to the design system (disclose in README); **lucide-react** icons; **motion** for animation.
- **zod** for all input validation; **sharp** for image processing (server-side blur variants).
- **LLM**: Google Gemini free tier through the official SDK, behind `lib/ai.ts`. Model name from `GEMINI_MODEL` env (check current docs for the free-tier flash model at build time; do not hardcode from memory). Every AI function has a deterministic fallback and a timeout (~4s). App must be fully functional with `GEMINI_API_KEY` unset.
- **PWA**: web manifest, icons (generate from the logo mark), theme colour, installable; a minimal service worker for app-shell caching. No push notifications.
- Tests: **Vitest** unit tests for matching score, chemistry score, round state machine, blur-level authorization. One Playwright smoke test of the main loop if time allows.

### 6.2 Project structure (suggested)

```
app/
  (marketing)/page.tsx, privacy, terms, guidelines, safety
  (auth)/login, signup
  onboarding/[step]
  (app)/today, bonds, bonds/[id], bonds/[id]/round/[n], dates, dates/[id], you, you/settings
  share/date/[token]            # public trusted-contact view
  admin/
  api/photos/[photoId]          # authorised image serving
components/  ui/, brand/ (Logo, ElementTile, BondAtoms, LitmusStrip, BlurPhoto, ProgressRing), features/
lib/  supabase/ (server, client, admin), matching/, rounds/, ai/, payments/, demo/, validation/
supabase/  migrations/*.sql, seed/ (personas.json, venues.json, questions.json, seed.ts)
docs/  FORM_ANSWERS.md, DECISIONS.md, BUILD_LOG.md
```

### 6.3 Data model (Postgres; add indexes and FKs sensibly)

- `profiles` (id = auth uid, first_name, dob, gender, interested_in[], city, hometown, role, company, intent, archetype, bio, verified, is_demo, is_evaluator, is_admin, reliability_score, catalysts int, onboarded_at, last_active_at, deleted_at)
- `photos` (id, user_id, position, storage_path_original, path_blur_1..3)  — originals in a **private** bucket
- `quiz_questions`, `quiz_answers` (user_id, question_id, value)
- `elements` (id, symbol, name, number, category), `user_elements`
- `prompts`, `user_prompts`
- `batches` (user_id, batch_date, created_at), `batch_items` (batch_id, candidate_id, score, reasons jsonb, why_text, status: pending|reacted|passed, pass_reason)
- `bonds` (id, user_a, user_b, status: invited|active|revealed|dissolved|expired, round int 0–4, chemistry int, reveal_a bool, reveal_b bool, last_move_at, expires_at, dissolved_by, dissolve_reason)
- `round_content` (round, key, payload jsonb) — question banks
- `round_responses` (bond_id, round, user_id, payload jsonb, submitted_at) — unique per (bond, round, user)
- `messages` (bond_id, sender_id, body, flagged, created_at)
- `venues` (city, name, area, kind, map_url, partner bool, offer_text)
- `date_plans` (bond_id, proposed_by, venue_id, starts_at, status: proposed|countered|confirmed|completed|cancelled, share_token)
- `payments` (user_id, kind: commitment|catalyst, amount_inr, provider, status, ref, date_plan_id)
- `date_feedback` (date_plan_id, user_id, showed_up, felt_safe, meet_again, note)
- `reports` (reporter_id, target_id, bond_id, reason, detail, status), `blocks` (blocker_id, blocked_id)
- `waitlist` (email, city, gender, created_at)
- `events` (user_id, name, props jsonb, created_at) — funnel analytics

**RLS rules of thumb**: a user reads/writes only their own rows; reads another profile only through a restricted view when that person is in their batch or bond; reads `round_responses` of the partner **only when both have submitted** that round (enforce in a `security definer` function or policy with an exists-check); reads messages only for bonds they belong to; blocked pairs see nothing. State-changing transitions (accept bond, advance round, compute chemistry, confirm date) go through server actions using validated input, never direct client table writes. The service-role key is server-only.

### 6.4 Server-side blur (must be real)

- On upload: validate type/size (≤5MB, jpeg/png/webp), strip EXIF, resize to max 1200px, and generate with `sharp` three blurred variants (sigma roughly 40 / 22 / 10, plus slight downscale so they cannot be sharpened back). Store all in the private bucket.
- `GET /api/photos/[photoId]`: resolve the viewer's entitlement from the bond (`round` → blur level; `revealed` → original; own photos → original; batch card → level 0 heaviest), then redirect to a short-lived signed URL for that variant. No client ever receives a URL for a level it hasn't earned.
- Unit-test the entitlement function.

### 6.5 Matching (`lib/matching`)

1. **Hard filters**: mutual gender preference, same city, age within ±6 years (configurable), not self, not blocked, no existing/previous bond, not shown in the last 14 days, not deleted.
2. **Score (0–100)**, reciprocal by construction:
   - 40% values: weighted similarity across quiz answers (dealbreaker-type questions such as marriage timeline and family involvement weighted 2×)
   - 20% intent alignment (matrix: serious↔serious 1.0, serious↔see-where 0.6, friends-first↔serious 0.2…)
   - 15% element overlap (Jaccard)
   - 10% hometown/language affinity bonus
   - 10% recency of activity
   - 5% reliability score
3. Pick top 3 with a little randomness among the top ~10 (exploration, avoids everyone getting the same people). Prefer real users over demo personas when real users exist.
4. Store top contributing factors in `reasons`; produce `why_text` via LLM ("You both would take the job in another city, both rate family input highly, and you share Filter Coffee and Trekking.") with a template fallback. Cache; never regenerate on view.

### 6.6 Chemistry score

Starts at the match score scaled to 40–70. Each round adds per §3.4. Clamp 0–100. Render on the litmus strip with a marker; label bands playfully (Inert / Warming / Reactive / Covalent).

### 6.7 AI surface (`lib/ai`), all optional

`whyYouTwo(reasons)`, `personaChatReply(persona, history)`, `roundReaction(answer)` (a one-line playful summary on round reveal, e.g. "Two planners. Someone book the table."), `dateIdea(overlap, city)`. Guardrails: system prompt forbids personal data requests and off-platform contact; output length capped; strip anything that looks like a URL or phone number.

### 6.8 Environment

```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY (optional), GEMINI_MODEL
PAYMENTS_PROVIDER=mock
DEMO_PASSWORD
NEXT_PUBLIC_SITE_URL
```
Commit `.env.example`; never commit real keys. `npm run db:migrate` and `npm run db:seed` scripts must be idempotent.

---

## 7. Screen inventory

| Route | Purpose | Notes |
|---|---|---|
| `/` | Landing + waitlist | Scroll-driven blur-to-sharp hero |
| `/login`, `/signup` | Auth | eLitmus SSO button shown as "coming soon" |
| `/onboarding/*` | 9 steps, progress bar | Resume where left off |
| `/today` | Invites + batch of 3 + done state + countdown | Home tab |
| `/bonds` | 3 slots (filled or empty), your-move chips, past bonds collapsed | Slots drawn as physical sockets |
| `/bonds/[id]` | Bond home: atoms visual, ring, litmus strip, round list, chat | Chat locked until Round 1 complete |
| `/bonds/[id]/round/[n]` | Play a round → waiting → reveal | Full-screen, focused |
| `/bonds/[id]/reveal` | The reveal moment | Choreographed |
| `/dates`, `/dates/[id]` | Proposals, confirmed dates, checkout sheet, share link, feedback | |
| `/share/date/[token]` | Public trusted-contact card | No PII beyond first name, venue, time |
| `/you` | Own profile as others see it (with blur preview toggle), archetype card, catalysts wallet | |
| `/you/settings` | Edit profile, preferences, theme, blocked list, export data, delete account, legal links | |
| `/admin` | Founder dashboard | Evaluator admins only |
| `/privacy`, `/terms`, `/guidelines`, `/safety` | Legal and safety | "Draft" banner |

---

## 8. Seed content to author (quality matters; this is what evaluators read)

- 36 personas with distinct voices: e.g. a Kanpur-born backend dev at a Bengaluru fintech who misses home food; a Coimbatore QA engineer who runs marathons; a Bhubaneswar data analyst into stand-up. Balanced gender, intents, hometowns across North/South/East/West. Each with 3 prompt answers, quiz answers, 6 elements, and answers for all four rounds.
- ~40 elements with symbols; 12 archetypes with a 2-line description each and quiz-to-archetype mapping.
- 15 profile prompts; 10 quiz questions; Round 1 bank (24 pairs, 8 drawn per bond); Round 2 bank (18 questions); Round 3 bank (20 statements); Round 4 date ideas (12, city-agnostic, mostly ₹300–800 budget).
- 6–8 venues per seeded city, fictional names clearly marked as demo.
- Canned chat reply bank per persona tone (fallback when no LLM).

---

## 9. Non-functional requirements

- Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95 on `/today` and `/`.
- All interactive elements keyboard reachable, visible focus rings, alt text, AA contrast, 44px touch targets.
- Works on a 360px-wide Android Chrome viewport (the real audience's device).
- No secrets in client bundles; RLS verified by attempting cross-user reads in a test.
- Rate-limit auth, waitlist and report endpoints (simple per-IP/user window).
- Graceful errors: every server action returns typed errors shown as toasts; no raw stack traces.

---

## 10. Honest risks to document in `docs/DECISIONS.md`

1. **Brand conflict**: a hiring-assessment company running a dating app can feel creepy ("will recruiters see this?"). Mitigation: separate brand (Covalent, "verified by eLitmus" in small print), hard data firewall, opt-in only. Open question whether to spin out entirely.
2. **Cold start and ratio**: handled by single-city launch, waitlist cohorts, women-first invites. Still the main execution risk.
3. **Blind-first may reduce top-of-funnel**: some users will bounce without photos. Accepted trade for higher intent; test heavy vs. medium initial blur.
4. **Commitment fee friction**: test ₹49 / ₹99 / free-for-first-date.
5. **Safety liability for offline meetings**: public partner venues, share-plan feature, feedback loop, moderation; needs proper legal review before launch.
6. **Free-tier limits**: Supabase pauses inactive projects after a week; LLM quota. Note in README how to wake the project before the evaluation.

---

## 11. Docs the agent must produce

- **`README.md`**: what Covalent is (5 lines), screenshots, live URL placeholder, demo account emails (password via the submission form), local setup (Supabase project, env, migrate, seed, run), architecture overview, **third-party disclosure** (Next.js, Supabase, Tailwind, shadcn/ui, motion, lucide, sharp, avatar source, fonts, Gemini, AI coding assistance), known limitations.
- **`docs/FORM_ANSWERS.md`**: ready-to-paste drafts for the form: go-to-market and scaling (§4.2), monetization (§4.1), hypothesis and assumptions (§2), each 200–350 words, plain language, numbers labelled as assumptions. Leave the "journey" answer as a template with a note that the owner must fill in the real days and hours.
- **`docs/DECISIONS.md`**: **already exists** — a short running log of research → finding → decision → rejected alternative. Do not rewrite it. **Append a dated entry (using the template at the bottom of the file) every time you make or change a product, design or architecture decision during the build**, including any deviation from this plan and why. Keep entries to a few lines. This is what gets discussed in the in-person round.
- **`docs/BUILD_LOG.md`**: append a dated entry per work session with what was actually done, so the journey answer is truthful.

---

## 12. What the owner must provide (ask once at the start, then proceed)

1. A Supabase project (URL, anon key, service-role key) — or permission to create one via the Supabase CLI if logged in.
2. A Gemini API key from Google AI Studio free tier (optional; build proceeds without it).
3. A GitHub repo and a Vercel account connection for deployment (the agent prepares everything; pushing and deploying happen with the owner's go-ahead).
4. A value for `DEMO_PASSWORD`.

If any are missing, build against a local Supabase (`supabase start`) and leave deployment as the final step.

---

## 13. Build order and cut lines

Work top to bottom. Each phase ends in a runnable app. Commit at the end of each phase.

**Phase 1 — Foundation**
Scaffold, Tailwind tokens, fonts, brand components (Logo, ElementTile, BondAtoms, LitmusStrip, ProgressRing, BlurPhoto), app shell + tab bar, Supabase clients, full schema migration with RLS, auth pages.

**Phase 2 — Onboarding and profile**
All 9 steps, photo upload with server-side blur pipeline and authorised serving, archetype result + shareable card, `/you`.

**Phase 3 — Seed and matching**
Seed content, seed script, matching engine with tests, `/today` with batch, why-you-two (template first), pass/react, done state, countdown.

**Phase 4 — Bonds and rounds** *(the heart; spend the most care here)*
Bond lifecycle, all four rounds with async reveal, chemistry score, progressive unblur, demo persona auto-response, reveal choreography, realtime chat, expiry and dissolve.

**Phase 5 — Dates and money**
Venues, propose/counter/confirm, mock checkout, commitment payment, share link, feedback, reliability, catalysts wallet.

**Phase 6 — Trust, admin, marketing**
Report/block, message flagging, settings (export, delete), legal pages, landing page with waitlist, `/admin`, events tracking, demo controls, evaluator account states.

**Phase 7 — Polish and ship**
LLM integration with fallbacks, motion pass, empty/loading/error states, PWA manifest and icons, accessibility and Lighthouse pass, 360px QA, tests green, docs, deploy, smoke test on the live URL with each evaluator account.

**Cut lines if time runs short (drop in this order):** dark mode → Playwright test → catalysts purchases (keep wallet display) → Round 3 (go to three rounds) → data export → service worker. **Never cut:** server-side blur, the four-screen core loop, demo personas, mock commitment payment, report/block, landing page, docs.

---

## 14. Definition of done

- [ ] A stranger can open the live URL, understand the idea from the landing page in 10 seconds, sign up, finish onboarding, get a batch, complete all rounds with a demo persona, see the reveal, plan and "pay" for a date, and leave feedback, on a phone, without help.
- [ ] Two evaluator accounts in two browsers see each other's round submissions and chat messages in realtime.
- [ ] A sharp photo URL is unobtainable from the network tab before reveal.
- [ ] The app works with no LLM key.
- [ ] The daily batch ends, and the end screen feels intentional.
- [ ] Report, block, delete account all work.
- [ ] `/admin` shows a live funnel and mock revenue.
- [ ] No swipe gesture anywhere in the product.
- [ ] README, FORM_ANSWERS, DECISIONS, BUILD_LOG exist and are accurate; third-party usage is disclosed.
- [ ] Unit tests pass; no TypeScript or lint errors; no secrets in the repo.
