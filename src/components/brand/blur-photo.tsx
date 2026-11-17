import { cn } from "@/lib/utils";
import { photoUrl } from "@/lib/photos/url";

/**
 * Shows a photo at the blur level the SERVER decided. The URL carries the level only as a
 * cache key; /api/photos re-checks entitlement on every request.
 */
export function BlurPhoto({
  photoId,
  level,
  alt,
  label,
  className,
  sizes = "aspect-[4/5]",
  priority,
}: {
  photoId: string | null | undefined;
  level: number | "original";
  alt: string;
  label?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const blurred = level !== "original";
  return (
    <div className={cn("relative overflow-hidden bg-surface-2", sizes, className)}>
      {photoId ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl(photoId, level)}
          alt={blurred ? `${alt}, blurred until you finish the rounds` : alt}
          className={cn("absolute inset-0 size-full object-cover", blurred && "scale-110")}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          draggable={false}
        />
      ) : (
        <div className="absolute inset-0 bg-litmus opacity-30" />
      )}
      {blurred && (
        <>
          {/* Grain over the blur so it reads as a deliberate material, not a broken image. */}
          <div className="pointer-events-none absolute inset-0 bg-[url(/noise.png)] opacity-[0.07]" />
          {label && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#1C1524]">
              {label}
            </span>
          )}
        </>
      )}
    </div>
  );
}
