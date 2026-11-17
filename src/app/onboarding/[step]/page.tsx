import { notFound, redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { admin } from "@/lib/supabase/admin";
import { ARCHETYPE_BY_ID } from "@/content/archetypes";
import { Logo } from "@/components/brand/logo";
import { BasicsStep } from "@/components/onboarding/basics";
import { IntentStep } from "@/components/onboarding/intent";
import { QuizStep } from "@/components/onboarding/quiz";
import { ElementsStep } from "@/components/onboarding/elements";
import { PromptsStep } from "@/components/onboarding/prompts";
import { PhotosStep } from "@/components/onboarding/photos";
import { ResultStep } from "@/components/onboarding/result";

const TOTAL = 7;

export default async function OnboardingStep(props: PageProps<"/onboarding/[step]">) {
  const { step: s } = await props.params;
  const step = Number(s);
  if (!Number.isInteger(step) || step < 1 || step > TOTAL) notFound();
  const v = await getViewer();
  if (!v) redirect("/login");
  if (v.onboarded_at) redirect("/today");
  const reached = Math.max(1, v.onboarding_step);
  if (step > reached) redirect(`/onboarding/${reached}`);

  const db = admin();
  let body: React.ReactNode = null;
  if (step === 1)
    body = <BasicsStep initial={{ first_name: v.first_name ?? "", gender: v.gender, interested_in: v.interested_in, city: v.city, role: v.role ?? "", company: v.company ?? "", hometown: v.hometown ?? "" }} />;
  else if (step === 2) body = <IntentStep initial={v.intent} />;
  else if (step === 3) {
    const { data } = await db.from("quiz_answers").select("question_id, value").eq("user_id", v.id);
    body = <QuizStep initial={Object.fromEntries((data ?? []).map((a) => [a.question_id, a.value]))} />;
  } else if (step === 4) {
    const { data } = await db.from("user_elements").select("element_id").eq("user_id", v.id);
    body = <ElementsStep initial={(data ?? []).map((e) => e.element_id)} />;
  } else if (step === 5) {
    const { data } = await db.from("user_prompts").select("prompt_id, answer").eq("user_id", v.id).order("position");
    body = <PromptsStep initial={data ?? []} />;
  } else if (step === 6) {
    const { data } = await db.from("photos").select("id").eq("user_id", v.id).order("position");
    body = <PhotosStep photoIds={(data ?? []).map((p) => p.id)} />;
  } else {
    const arch = v.archetype ? ARCHETYPE_BY_ID[v.archetype] : null;
    body = arch ? <ResultStep archetypeId={arch.id} name={v.first_name ?? "You"} /> : redirect("/onboarding/3");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mb-6 flex items-center justify-between">
        <Logo className="scale-90" />
        <span className="font-mono text-xs text-ink-3">
          {Math.min(step, TOTAL - 1)}/{TOTAL - 1}
        </span>
      </div>
      {step < TOTAL && (
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL - 1} aria-valuenow={step}>
          <div className="h-full rounded-full bg-litmus transition-[width] duration-500" style={{ width: `${(step / (TOTAL - 1)) * 100}%` }} />
        </div>
      )}
      <div className="flex flex-1 flex-col">{body}</div>
    </div>
  );
}
