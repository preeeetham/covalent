/**
 * End-to-end smoke test of the core loop against a real database, using the same data
 * layer the app's server actions call. Creates a throwaway user, plays the whole loop
 * with a demo persona, then deletes the user.
 *
 *   npm run smoke          (needs `npx supabase start` + `npm run db:seed` first)
 */
import { config } from "dotenv";
config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env.local" });

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

async function main() {
  const { admin } = await import("../src/lib/supabase/admin");
  const { getTodayBatch } = await import("../src/lib/data/batch");
  const bonds = await import("../src/lib/data/bonds");
  const dates = await import("../src/lib/data/dates");
  const chat = await import("../src/lib/data/chat");
  const logic = await import("../src/lib/rounds/logic");
  const { photoEntitlement } = await import("../src/lib/photos/entitlement");
  const { QUIZ } = await import("../src/content/quiz");

  const db = admin();
  const email = `smoke-${randomBytes(4).toString("hex")}@covalent.test`;
  const password = randomBytes(12).toString("hex");
  const { data: created, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !created.user) throw error;
  const id = created.user.id;
  const step = (s: string) => console.log(`  ✓ ${s}`);

  try {
    await db.from("profiles").insert({
      id, email, first_name: "Smoke", dob: "1999-05-05", gender: "woman", interested_in: ["man"], city: "Bengaluru",
      role: "Tester", intent: "serious", archetype: "carbon", onboarding_step: 7, onboarded_at: new Date().toISOString(),
      consent_terms_at: new Date().toISOString(), consent_privacy_at: new Date().toISOString(),
    });
    await db.from("quiz_answers").insert(QUIZ.map((q) => ({ user_id: id, question_id: q.id, value: 3 })));
    await db.from("user_elements").insert(["chai", "books", "cricket", "trekking", "podcasts"].map((element_id) => ({ user_id: id, element_id })));
    const viewer = async () => (await db.from("profiles").select("*").eq("id", id).single()).data!;
    step("created onboarded test user");

    // ---- batch
    const batch = await getTodayBatch(await viewer());
    assert.equal(batch.kind, "batch");
    if (batch.kind !== "batch") return;
    assert.equal(batch.items.length, 3, "batch has 3 people");
    assert.ok(batch.items.every((i) => i.why_text), "every card has a why-you-two line");
    const again = await getTodayBatch(await viewer());
    assert.deepEqual(again.kind === "batch" && again.items.map((i) => i.id), batch.items.map((i) => i.id), "batch is stable within the day");
    step(`batch of 3: ${batch.items.map((i) => i.person.first_name).join(", ")}`);

    // ---- reaction (demo persona auto-accepts)
    const item = batch.items.find((i) => i.person.is_demo)!;
    const bondId = await bonds.startReaction(await viewer(), item.id);
    let bond = (await db.from("bonds").select("*").eq("id", bondId).single()).data!;
    assert.equal(bond.status, "active");
    assert.equal(photoEntitlement({ viewerId: id, ownerId: item.person.id, bond, inBatchOrInvite: true, blocked: false }), 0);
    step(`reaction with ${item.person.first_name} → active bond, photo at blur level 0`);

    await assert.rejects(bonds.submitRoundStep(await viewer(), bondId, 2, "ask", { asked: 0 }), "can't skip ahead");
    step("can't play round 2 before round 1");

    // ---- rounds, with the persona answering after each move
    const tick = async () => assert.ok(await bonds.tickPersona(bondId, true), "persona moved");
    await bonds.submitRoundStep(await viewer(), bondId, 1, "answer", { picks: [0, 1, 0, 1, 0, 1, 0, 1] });
    let detail = await bonds.getBondDetail(await viewer(), bondId);
    assert.equal(detail!.rounds[0].view.state, "waiting");
    await tick();
    detail = await bonds.getBondDetail(await viewer(), bondId);
    assert.equal(detail!.bond.round, 1);
    assert.ok(detail!.responses.find((r) => r.round === 1 && r.user_id !== id)?.payload, "partner R1 visible after both answered");
    step(`round 1 done · chemistry ${detail!.bond.chemistry}`);

    await bonds.submitRoundStep(await viewer(), bondId, 2, "ask", { asked: 1 });
    detail = await bonds.getBondDetail(await viewer(), bondId);
    assert.deepEqual(detail!.rounds[1].view, { state: "waiting", reason: "partner-ask" });
    await tick();
    detail = await bonds.getBondDetail(await viewer(), bondId);
    const theirs = detail!.responses.find((r) => r.round === 2 && r.user_id !== id)!;
    assert.ok((theirs.payload as { asked?: number }).asked != null, "their question visible");
    assert.equal((theirs.payload as { answer?: string }).answer, undefined, "their answer hidden until I answer");
    step("round 2: reciprocity holds (their answer hidden until I answer)");
    await bonds.submitRoundStep(await viewer(), bondId, 2, "answer", { answer: "Making chai for the whole floor at 4 PM. Small, but people remember." });
    detail = await bonds.getBondDetail(await viewer(), bondId);
    assert.equal(detail!.bond.round, 2);
    step(`round 2 done · chemistry ${detail!.bond.chemistry}`);

    const st = logic.drawRound3(bondId);
    await bonds.submitRoundStep(await viewer(), bondId, 3, "answer", { self: st.map(() => true), guess: st.map(() => false) });
    await tick();
    detail = await bonds.getBondDetail(await viewer(), bondId);
    assert.equal(detail!.bond.round, 3);
    step(`round 3 done · chemistry ${detail!.bond.chemistry}`);

    await bonds.submitRoundStep(await viewer(), bondId, 4, "answer", { ideas: [0, 1], slot: "weekend-evening" });
    await tick();
    bond = (await db.from("bonds").select("*").eq("id", bondId).single()).data!;
    assert.equal(bond.round, 4);
    assert.equal(photoEntitlement({ viewerId: id, ownerId: item.person.id, bond, inBatchOrInvite: false, blocked: false }), 3, "still blurred before reveal");
    step(`round 4 done · chemistry ${bond.chemistry} · photo still blurred (level 3)`);

    // ---- reveal
    await bonds.tapReveal(await viewer(), bondId);
    await tick();
    bond = (await db.from("bonds").select("*").eq("id", bondId).single()).data!;
    assert.equal(bond.status, "revealed");
    assert.equal(photoEntitlement({ viewerId: id, ownerId: item.person.id, bond, inBatchOrInvite: false, blocked: false }), "original");
    step("both tapped reveal → original photo unlocked");

    // ---- chat with persona
    await chat.sendMessage(await viewer(), bondId, "Okay, that reveal was fun. Coffee this weekend?");
    const reply = await chat.personaReply(await viewer(), bondId);
    assert.ok(reply?.body);
    step(`chat: persona replied "${reply!.body.slice(0, 50)}…"`);

    // ---- date
    const venues = await dates.venuesFor("Bengaluru");
    const when = new Date(Date.now() + 3 * 86_400_000).toISOString();
    await dates.proposeDate(await viewer(), bondId, venues[0].id, when);
    let plan = (await dates.latestPlanForBond(bondId))!.plan;
    assert.equal(plan.status, "accepted", "persona accepted and committed");
    const checkout = await dates.startCommitment(await viewer(), plan.id);
    await assert.rejects(dates.completePayment(await viewer(), checkout.paymentId, "failure"));
    const retry = await dates.startCommitment(await viewer(), plan.id);
    const paid = await dates.completePayment(await viewer(), retry.paymentId, "success");
    assert.equal(paid.confirmed, true);
    plan = (await dates.latestPlanForBond(bondId))!.plan;
    assert.equal(plan.status, "confirmed");
    const shared = await dates.getSharedPlan(plan.share_token);
    assert.ok(shared?.venue?.name);
    step(`date confirmed at ${venues[0].name} after one failed + one successful mock payment; share link works`);

    // Fast-forward the date into the past and leave feedback.
    await db.from("date_plans").update({ starts_at: new Date(Date.now() - 3600_000).toISOString() }).eq("id", plan.id);
    const before = (await db.from("profiles").select("reliability").eq("id", item.person.id).single()).data!.reliability;
    await dates.submitFeedback(await viewer(), plan.id, { showed_up: true, felt_safe: true, meet_again: true });
    const after = (await db.from("profiles").select("reliability").eq("id", item.person.id).single()).data!.reliability;
    assert.equal(after, Math.min(100, before + 5));
    step(`feedback recorded → ${item.person.first_name}'s reliability ${before} → ${after}`);
    // restore persona reliability so the smoke test leaves no trace
    await db.from("profiles").update({ reliability: before }).eq("id", item.person.id);

    // ---- RLS: what a browser holding the public anon key + this user's session can read
    const { createClient } = await import("@supabase/supabase-js");
    const asUser = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
    const { error: signInErr } = await asUser.auth.signInWithPassword({ email, password });
    assert.ifError(signInErr);
    const ownProfiles = await asUser.from("profiles").select("id");
    assert.deepEqual(ownProfiles.data?.map((p) => p.id), [id], "only own profile readable");
    const quiz = await asUser.from("quiz_answers").select("user_id");
    assert.ok(quiz.data?.every((q) => q.user_id === id), "only own quiz answers");
    const { data: otherBond } = await db.from("bonds").select("id").neq("user_a", id).neq("user_b", id).limit(1).single();
    const foreignMsgs = await asUser.from("messages").select("id").eq("bond_id", otherBond!.id);
    assert.equal(foreignMsgs.data?.length, 0, "can't read other people's chats");
    const foreignRounds = await asUser.from("round_responses").select("id").eq("bond_id", otherBond!.id);
    assert.equal(foreignRounds.data?.length, 0, "can't read other people's round answers");
    const ownMsgs = await asUser.from("messages").select("id").eq("bond_id", bondId);
    assert.ok((ownMsgs.data?.length ?? 0) > 0, "can read own bond's chat (needed for realtime)");
    const writeAttempt = await asUser.from("profiles").update({ is_admin: true }).eq("id", id).select();
    assert.equal(writeAttempt.data?.length ?? 0, 0, "no direct client writes");
    const reports = await asUser.from("reports").select("id");
    assert.equal(reports.data?.length ?? 0, 0, "reports are server-only");
    const { data: photo } = await db.from("photos").select("path_original").eq("user_id", item.person.id).limit(1).single();
    const direct = await asUser.storage.from("photos").download(photo!.path_original);
    assert.ok(direct.error, "private bucket: originals can't be downloaded directly");
    step("RLS: own rows only, no foreign chats/answers, no client writes, private photo bucket");

    // ---- slots
    const used = await bonds.slotsUsed(id);
    assert.equal(used, 1);
    await bonds.dissolveBond(await viewer(), bondId, "Taking a break");
    assert.equal(await bonds.slotsUsed(id), 0);
    step("dissolving frees the slot");

    console.log("\nSmoke test passed.");
  } finally {
    await db.auth.admin.deleteUser(id);
  }
}

main().catch((e) => {
  console.error("\nSmoke test FAILED:", e);
  process.exit(1);
});
