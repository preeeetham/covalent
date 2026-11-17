export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[720px] px-5 py-14">
      <p className="mb-6 rounded-2xl border border-dashed border-warn/60 bg-warn/10 px-4 py-3 text-sm font-semibold text-ink">
        Draft for demonstration; not legal advice. A real launch needs review by Indian counsel.
      </p>
      <h1 className="font-display text-5xl leading-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-3">Last updated {updated}</p>
      <div className="mt-8 space-y-6 text-[16px] leading-relaxed text-ink-2 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink [&_ul]:space-y-2">
        {children}
      </div>
    </main>
  );
}
