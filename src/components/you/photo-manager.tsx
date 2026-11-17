"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2, Loader2 } from "lucide-react";
import { BlurPhoto } from "@/components/brand/blur-photo";
import { handle, toast } from "@/components/ui/toast";
import { deletePhoto } from "@/app/actions/onboarding";

/** Downscale in the browser before upload: faster on mobile data, under hosting body limits. */
export async function downscale(file: File, max = 1600): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise((res) => canvas.toBlob((b) => res(b ?? file), "image/jpeg", 0.88));
  } catch {
    return file;
  }
}

export async function uploadPhoto(file: File): Promise<string | null> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    toast.error("Use a JPG, PNG or WebP photo.");
    return null;
  }
  const blob = await downscale(file);
  const fd = new FormData();
  fd.append("photo", blob, "photo.jpg");
  const res = await fetch("/api/photos", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    toast.error(json.error ?? "Upload failed.");
    return null;
  }
  return json.id as string;
}

export function PhotoGrid({ photoIds, onChange, max = 4 }: { photoIds: string[]; onChange: () => void; max?: number }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    for (const f of Array.from(files).slice(0, max - photoIds.length)) await uploadPhoto(f);
    setUploading(false);
    onChange();
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {photoIds.map((id) => (
        <div key={id} className="relative">
          <BlurPhoto photoId={id} level="original" alt="Your photo" className="rounded-[22px]" />
          <button
            onClick={() => start(async () => { if (handle(await deletePhoto(id))) onChange(); })}
            disabled={pending}
            className="absolute right-2 top-2 grid size-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur"
            aria-label="Remove photo"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      {photoIds.length < max && (
        <button
          onClick={() => input.current?.click()}
          disabled={uploading}
          className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-line text-ink-2 hover:border-bond hover:text-bond"
        >
          {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
          <span className="text-sm font-semibold">{uploading ? "Blurring…" : "Add photo"}</span>
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}

export function PhotoManager({ photoIds }: { photoIds: string[] }) {
  const router = useRouter();
  return (
    <section className="mt-10">
      <h2 className="mb-1 font-display text-2xl text-ink">Your photos</h2>
      <p className="mb-4 text-sm text-ink-2">Up to 4. Blurred versions are made on our server, so nobody can un-blur them early.</p>
      <PhotoGrid photoIds={photoIds} onChange={() => router.refresh()} />
    </section>
  );
}
