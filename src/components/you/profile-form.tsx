"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Chip, Field, inputCls } from "@/components/ui/field";
import { handle } from "@/components/ui/toast";
import { updateProfile } from "@/app/actions/account";
import { CITIES, INTENTS, type CityId } from "@/content/cities";

type Form = {
  first_name: string;
  city: string;
  hometown: string;
  role: string;
  company: string;
  intent: "serious" | "see" | "friends";
  interested_in: ("woman" | "man" | "nonbinary" | "everyone")[];
};

export function ProfileForm({ initial }: { initial: Form }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [pending, start] = useTransition();
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));
  const toggleInterest = (g: "woman" | "man" | "nonbinary") =>
    set("interested_in", f.interested_in.includes(g) ? f.interested_in.filter((x) => x !== g) : [...f.interested_in.filter((x) => x !== "everyone"), g]);

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-surface p-4">
      <Field label="First name">
        <input className={inputCls} value={f.first_name} onChange={(e) => set("first_name", e.target.value)} maxLength={30} />
      </Field>
      <Field label="City" hint="Live now: Bengaluru and Hyderabad. Others join the waitlist.">
        <select className={inputCls} value={f.city} onChange={(e) => set("city", e.target.value)}>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}
              {c.live ? "" : " (waitlist)"}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="What you do">
          <input className={inputCls} value={f.role} onChange={(e) => set("role", e.target.value)} maxLength={50} />
        </Field>
        <Field label="Company type">
          <input className={inputCls} value={f.company} onChange={(e) => set("company", e.target.value)} maxLength={50} placeholder="Optional" />
        </Field>
      </div>
      <Field label="Hometown">
        <input className={inputCls} value={f.hometown} onChange={(e) => set("hometown", e.target.value)} maxLength={40} placeholder="Optional" />
      </Field>
      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink">Looking for</p>
        <div className="flex flex-wrap gap-2">
          {INTENTS.map((i) => (
            <Chip key={i.id} role="radio" active={f.intent === i.id} onClick={() => set("intent", i.id)}>
              {i.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-sm font-semibold text-ink">Interested in</p>
        <div className="flex flex-wrap gap-2">
          {(["woman", "man", "nonbinary"] as const).map((g) => (
            <Chip key={g} active={f.interested_in.includes(g)} onClick={() => toggleInterest(g)}>
              {g === "woman" ? "Women" : g === "man" ? "Men" : "Non-binary people"}
            </Chip>
          ))}
        </div>
      </div>
      <Button
        variant="ink"
        block
        loading={pending}
        disabled={!f.first_name.trim() || !f.role.trim() || !f.interested_in.length}
        onClick={() => start(async () => { if (handle(await updateProfile({ ...f, city: f.city as CityId }), "Saved.")) router.refresh(); })}
      >
        Save changes
      </Button>
    </div>
  );
}
