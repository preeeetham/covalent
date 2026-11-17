"use client";

import { useState } from "react";
import { BlurPhoto } from "@/components/brand/blur-photo";

const STEPS = [
  { level: 0 as const, label: "In a batch" },
  { level: 1 as const, label: "After round 1" },
  { level: 2 as const, label: "After round 2" },
  { level: 3 as const, label: "After round 3" },
  { level: "original" as const, label: "Revealed" },
];

/** Lets you see your own photo at each blur level (you're entitled to all of them). */
export function BlurPreview({ photoId }: { photoId: string | null }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <BlurPhoto photoId={photoId} level={STEPS[i].level} alt="Your photo" label={STEPS[i].label} />
      <div className="px-5 pt-4">
        <label htmlFor="blur-preview" className="sr-only">Preview blur level</label>
        <input id="blur-preview" type="range" min={0} max={4} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} className="w-full accent-[var(--bond)]" />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-3">
          <span>blurred</span>
          <span>revealed</span>
        </div>
      </div>
    </div>
  );
}
