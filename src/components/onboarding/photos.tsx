"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { EyeOff } from "lucide-react";
import { StepShell } from "./step-shell";
import { handle } from "@/components/ui/toast";
import { finishPhotos } from "@/app/actions/onboarding";
import { PhotoGrid } from "@/components/you/photo-manager";

export function PhotosStep({ photoIds }: { photoIds: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <StepShell
      eyebrow="Photos"
      title="Add 1 to 4 photos."
      sub="Clear photos of you. Faces visible, no group shots for the first one."
      canNext={photoIds.length > 0}
      loading={pending}
      onBack={() => router.push("/onboarding/5")}
      onNext={() => start(async () => { if (handle(await finishPhotos())) router.push("/onboarding/7"); })}
    >
      <div className="mb-5 flex gap-3 rounded-2xl bg-bond-soft p-4 text-sm text-ink">
        <EyeOff className="size-5 shrink-0 text-bond-text" />
        <p>
          <strong>Your photos stay blurred</strong> until you and someone finish the rounds together. They sharpen a little each round. The blurring happens on our
          server, so nobody can peek early.
        </p>
      </div>
      <PhotoGrid photoIds={photoIds} onChange={() => router.refresh()} />
    </StepShell>
  );
}
