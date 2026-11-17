/** Skeletons, never spinners, on primary surfaces (Doherty threshold). */
export default function Loading() {
  return (
    <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))]" aria-busy="true" aria-label="Loading">
      <div className="skeleton mb-2 h-4 w-32 rounded-full" />
      <div className="skeleton mb-6 h-10 w-44 rounded-2xl" />
      <div className="overflow-hidden rounded-[28px] border border-line bg-surface">
        <div className="skeleton aspect-[4/5]" />
        <div className="space-y-3 p-5">
          <div className="skeleton h-7 w-40 rounded-xl" />
          <div className="skeleton h-4 w-56 rounded-full" />
          <div className="skeleton h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
