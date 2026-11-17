"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DeepQuestion } from "@/content/rounds";
import { R2_REACTIONS, R2_THOUGHTFUL_CHARS } from "@/content/rounds";
import { reactToRoundAnswer, submitRound } from "@/app/actions/bonds";
import { handle } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FlipIn, ResultFooter, WaitingCard, type RoundProps } from "./shared";

type P = { asked?: number; answer?: string; reaction?: string; reactionNote?: string };

export function Round2({ bondId, partnerName, view, mine, theirs, nextRound, questions }: RoundProps & { questions: DeepQuestion[] }) {
  const router = useRouter();
  const [choice, setChoice] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [pending, start] = useTransition();
  const m = (mine ?? {}) as P;
  const t = (theirs ?? {}) as P;

  if (view.state === "done") {
    return <Round2Result bondId={bondId} partnerName={partnerName} questions={questions} m={m} t={t} nextRound={nextRound} />;
  }
  if (view.state === "waiting") return <WaitingCard partnerName={partnerName} isDemo />;

  if (view.state === "play" && view.step === "ask") {
    return (
      <div>
        <p className="mb-5 text-center text-ink-2">Pick the question you'd most like {partnerName} to answer.</p>
        <div className="space-y-3" role="radiogroup" aria-label="Question to ask">
          {questions.map((q, i) => (
            <button
              key={q.id}
              role="radio"
              aria-checked={choice === i}
              onClick={() => setChoice(i)}
              className={cn(
                "w-full rounded-[24px] border p-5 text-left transition-all",
                choice === i ? "border-transparent bg-ink text-paper shadow-[var(--shadow-lift)]" : "border-line bg-surface text-ink hover:-translate-y-0.5",
              )}
            >
              <span className={cn("text-xs font-bold uppercase tracking-wider", choice === i ? "text-paper/60" : "text-ink-3")}>{q.category}</span>
              <p className="mt-1 font-display text-xl leading-snug">{q.text}</p>
            </button>
          ))}
        </div>
        <Button
          variant="primary"
          size="lg"
          block
          className="mt-6"
          disabled={choice === null}
          loading={pending}
          onClick={() =>
            start(async () => {
              if (handle(await submitRound(bondId, 2, "ask", { asked: choice }))) router.refresh();
            })
          }
        >
          Ask {partnerName} this
        </Button>
      </div>
    );
  }

  // Answer the question they picked for you.
  const q = t.asked != null ? questions[t.asked] : null;
  return (
    <div>
      <p className="mb-3 text-center text-sm text-ink-2">{partnerName} picked this question for you:</p>
      <div className="rounded-[24px] bg-bond-soft p-5">
        <p className="font-display text-2xl leading-snug text-ink">{q?.text}</p>
      </div>
      <label htmlFor="r2-answer" className="sr-only">Your answer</label>
      <textarea
        id="r2-answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        maxLength={500}
        rows={6}
        placeholder="Be honest. Specific beats clever."
        className="mt-4 w-full rounded-[24px] border border-line bg-surface p-4 text-[16px] leading-relaxed text-ink outline-none focus:border-bond"
      />
      <div className="mt-1 flex justify-between px-1 text-xs text-ink-3">
        <span>{answer.trim().length >= R2_THOUGHTFUL_CHARS ? "Thoughtful answers add more chemistry ✓" : "A couple of real sentences goes a long way"}</span>
        <span className="font-mono">{answer.length}/500</span>
      </div>
      <Button
        variant="primary"
        size="lg"
        block
        className="mt-5"
        disabled={answer.trim().length < 2}
        loading={pending}
        onClick={() =>
          start(async () => {
            if (handle(await submitRound(bondId, 2, "answer", { answer }))) router.refresh();
          })
        }
      >
        Send my answer
      </Button>
    </div>
  );
}

function Round2Result({ bondId, partnerName, questions, m, t, nextRound }: { bondId: string; partnerName: string; questions: DeepQuestion[]; m: P; t: P; nextRound: number | null }) {
  const router = useRouter();
  const [emoji, setEmoji] = useState<string | null>(m.reaction ?? null);
  const [note, setNote] = useState(m.reactionNote ?? "");
  const [pending, start] = useTransition();
  const askedByMe = m.asked != null ? questions[m.asked] : null; // they answered this
  const askedByThem = t.asked != null ? questions[t.asked] : null; // I answered this

  return (
    <div className="space-y-5">
      <FlipIn>
        <div className="rounded-[24px] border border-line bg-surface p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-3">You asked</p>
          <p className="mt-1 font-display text-lg leading-snug text-ink-2">{askedByMe?.text}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-bond-text">{partnerName}</p>
          <p className="mt-1 font-display text-xl leading-snug text-ink">{t.answer}</p>
          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2 text-sm font-medium text-ink-2">React to their answer</p>
            <div className="flex flex-wrap gap-2">
              {R2_REACTIONS.map((e) => (
                <button key={e} onClick={() => setEmoji(e)} aria-pressed={emoji === e} className={cn("grid size-11 place-items-center rounded-full border text-xl", emoji === e ? "border-ink bg-surface-2" : "border-line")}>
                  {e}
                </button>
              ))}
            </div>
            <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} placeholder="One line back (optional)" className="mt-3 h-11 w-full rounded-full border border-line bg-surface px-4 text-sm text-ink outline-none focus:border-bond" aria-label="One line reaction" />
            <Button
              size="sm"
              className="mt-3"
              disabled={!emoji}
              loading={pending}
              onClick={() =>
                start(async () => {
                  if (handle(await reactToRoundAnswer(bondId, emoji!, note), "Reaction sent.")) router.refresh();
                })
              }
            >
              {m.reaction ? "Update reaction" : "Send reaction"}
            </Button>
          </div>
        </div>
      </FlipIn>
      <FlipIn i={1}>
        <div className="rounded-[24px] border border-line bg-surface p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-3">{partnerName} asked you</p>
          <p className="mt-1 font-display text-lg leading-snug text-ink-2">{askedByThem?.text}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-wider text-ink-3">You</p>
          <p className="mt-1 text-[15px] leading-relaxed text-ink">{m.answer}</p>
          {t.reaction && (
            <p className="mt-4 rounded-2xl bg-bond-soft px-4 py-3 text-sm text-ink">
              <span className="mr-2 text-lg">{t.reaction}</span>
              {t.reactionNote}
            </p>
          )}
        </div>
      </FlipIn>
      <ResultFooter bondId={bondId} nextRound={nextRound} />
    </div>
  );
}
