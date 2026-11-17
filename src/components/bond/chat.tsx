"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Lock, SendHorizonal, ShieldAlert } from "lucide-react";
import { browserClient } from "@/lib/supabase/client";
import { postMessage, requestPersonaReply } from "@/app/actions/bonds";
import { detectContactInfo } from "@/lib/safety";
import { toast } from "@/components/ui/toast";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/database.types";

type Msg = Database["public"]["Tables"]["messages"]["Row"];

export function Chat({
  bondId,
  viewerId,
  partnerName,
  partnerIsDemo,
  open,
  revealed,
  initial,
}: {
  bondId: string;
  viewerId: string;
  partnerName: string;
  partnerIsDemo: boolean;
  open: boolean;
  revealed: boolean;
  initial: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Adopt fresh server messages after a refresh (React's "adjust state during render" pattern).
  const [seenInitial, setSeenInitial] = useState(initial);
  if (initial !== seenInitial) {
    setSeenInitial(initial);
    setMessages((xs) => {
      const ids = new Set(initial.map((m) => m.id));
      const extra = xs.filter((m) => !ids.has(m.id));
      return [...initial, ...extra].sort((a, b) => a.created_at.localeCompare(b.created_at));
    });
  }

  // Realtime: new messages in this bond (RLS ensures only members receive them).
  useEffect(() => {
    const sb = browserClient();
    const ch = sb
      .channel(`chat:${bondId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `bond_id=eq.${bondId}` }, (payload) => {
        const m = payload.new as Msg;
        setMessages((xs) => (xs.some((x) => x.id === m.id) ? xs : [...xs, m]));
        if (m.sender_id !== viewerId) setTyping(false);
      })
      .subscribe();
    return () => {
      sb.removeChannel(ch);
    };
  }, [bondId, viewerId]);

  // Keep the newest message and the composer in view (above the tab bar) as the chat grows.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  const send = (body: string) =>
    start(async () => {
      setWarn(null);
      const temp: Msg = { id: `temp-${Date.now()}`, bond_id: bondId, sender_id: viewerId, body, kind: "text", flagged: false, created_at: new Date().toISOString() };
      setMessages((xs) => [...xs, temp]);
      setText("");
      const res = await postMessage(bondId, body);
      if (!res.ok) {
        setMessages((xs) => xs.filter((m) => m.id !== temp.id));
        setText(body);
        toast.error(res.error);
        return;
      }
      setMessages((xs) => {
        const without = xs.filter((m) => m.id !== temp.id);
        return res.data && !without.some((m) => m.id === res.data!.id) ? [...without, res.data] : without;
      });
      if (partnerIsDemo) {
        setTyping(true);
        await new Promise((r) => setTimeout(r, 1400 + Math.random() * 1800));
        const reply = await requestPersonaReply(bondId);
        setTyping(false);
        if (reply.ok && reply.data) setMessages((xs) => (xs.some((m) => m.id === reply.data!.id) ? xs : [...xs, reply.data!]));
      }
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || pending) return;
    if (!revealed && detectContactInfo(body)) {
      setWarn(body);
      return;
    }
    send(body);
  };

  if (!open) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line p-4 text-sm text-ink-2">
        <Lock className="size-4 shrink-0" /> Chat opens after Round 1. No blank "hey" — the rounds give you something to talk about.
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-3">Chat</h2>
      <div className="space-y-2" aria-live="polite">
        {messages.length === 0 && <p className="py-6 text-center text-sm text-ink-3">Say something about Round 1. That's what it's for.</p>}
        {messages.map((m) =>
          m.kind === "system" ? (
            <p key={m.id} className="mx-auto my-3 max-w-[90%] rounded-full bg-surface-2 px-3 py-1.5 text-center text-xs font-medium text-ink-2">
              {m.body}
            </p>
          ) : (
            <div key={m.id} className={cn("flex", m.sender_id === viewerId ? "justify-end" : "justify-start")}>
              <p
                className={cn(
                  "max-w-[80%] whitespace-pre-wrap break-words rounded-[20px] px-4 py-2.5 text-[15px] leading-snug",
                  m.sender_id === viewerId ? "rounded-br-md bg-ink text-paper" : "rounded-bl-md border border-line bg-surface text-ink",
                  m.id.startsWith("temp-") && "opacity-60",
                )}
              >
                {m.body}
              </p>
            </div>
          ),
        )}
        {typing && (
          <div className="flex justify-start" aria-label={`${partnerName} is typing`}>
            <span className="flex gap-1 rounded-[20px] rounded-bl-md border border-line bg-surface px-4 py-3.5">
              <span className="typing-dot size-1.5 rounded-full bg-ink-3" />
              <span className="typing-dot size-1.5 rounded-full bg-ink-3" />
              <span className="typing-dot size-1.5 rounded-full bg-ink-3" />
            </span>
          </div>
        )}
      </div>
      <form ref={formRef} onSubmit={submit} className="mt-4 flex scroll-mb-32 items-end gap-2 rounded-[26px] border border-line bg-surface p-1.5 shadow-[var(--shadow-soft)]">
        <label className="sr-only" htmlFor="chat-input">Message {partnerName}</label>
        <textarea
          id="chat-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder={`Message ${partnerName}…`}
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] text-ink outline-none placeholder:text-ink-3"
        />
        <button type="submit" disabled={!text.trim() || pending} aria-label="Send" className="grid size-11 shrink-0 place-items-center rounded-full bg-litmus text-white disabled:opacity-40">
          <SendHorizonal className="size-5" />
        </button>
      </form>
      <Sheet open={!!warn} onClose={() => setWarn(null)} title="Keep it on Covalent for now?">
        <div className="flex gap-3 rounded-2xl bg-acid-soft p-4 text-sm text-ink">
          <ShieldAlert className="size-5 shrink-0 text-acid" />
          <p>That looks like a phone number, payment ID or social handle. Most scams start by moving people off-platform. We suggest sharing contact details after you've met.</p>
        </div>
        <div className="mt-4 flex gap-3">
          <Button className="flex-1" onClick={() => { setText(warn ?? ""); setWarn(null); }}>
            Edit message
          </Button>
          <Button variant="ink" className="flex-1" onClick={() => { const b = warn!; setWarn(null); send(b); }}>
            Send anyway
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
