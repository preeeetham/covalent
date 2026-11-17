import { NextResponse } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { getViewer } from "@/lib/auth";

/** DPDP: let people download everything Covalent holds about them, as JSON. */
export async function GET() {
  const v = await getViewer();
  if (!v) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const db = admin();
  const [quiz, elements, prompts, photos, bonds, responses, messages, payments, feedback, reports, blocks] = await Promise.all([
    db.from("quiz_answers").select("question_id, value").eq("user_id", v.id),
    db.from("user_elements").select("element_id").eq("user_id", v.id),
    db.from("user_prompts").select("prompt_id, answer").eq("user_id", v.id),
    db.from("photos").select("id, position, created_at").eq("user_id", v.id),
    db.from("bonds").select("id, status, round, chemistry, created_at").or(`user_a.eq.${v.id},user_b.eq.${v.id}`),
    db.from("round_responses").select("bond_id, round, payload, submitted_at").eq("user_id", v.id),
    db.from("messages").select("bond_id, body, created_at").eq("sender_id", v.id),
    db.from("payments").select("kind, amount_inr, status, created_at").eq("user_id", v.id),
    db.from("date_feedback").select("date_plan_id, showed_up, felt_safe, meet_again, note, created_at").eq("user_id", v.id),
    db.from("reports").select("reason, detail, created_at").eq("reporter_id", v.id),
    db.from("blocks").select("blocked_id, created_at").eq("blocker_id", v.id),
  ]);
  // Remove internal-only fields.
  const { persona: _persona, is_admin: _a, is_evaluator: _e, ...profile } = v;
  void _persona; void _a; void _e;
  const body = {
    exported_at: new Date().toISOString(),
    note: "Everything Covalent stores about you. Photos are listed by id; download them from your profile.",
    profile,
    quiz_answers: quiz.data,
    elements: elements.data,
    prompts: prompts.data,
    photos: photos.data,
    bonds: bonds.data,
    your_round_answers: responses.data,
    your_messages: messages.data,
    payments: payments.data,
    date_feedback: feedback.data,
    reports_you_made: reports.data,
    people_you_blocked: blocks.data,
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="covalent-data-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
