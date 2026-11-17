import { requireViewer } from "@/lib/auth";
import { listBonds } from "@/lib/data/bonds";
import { TabBar } from "@/components/app/tab-bar";
import { DemoControls } from "@/components/app/demo-controls";
import { Logo } from "@/components/brand/logo";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const viewer = await requireViewer();
  const { open } = await listBonds(viewer);
  const yourMove = open.filter((b) => b.myMove).length;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1100px] justify-center gap-16 lg:px-8">
      {/* Desktop-only side panel: the app itself stays phone-shaped. */}
      <aside className="sticky top-0 hidden h-dvh w-[300px] shrink-0 flex-col justify-between py-10 lg:flex">
        <Logo />
        <div>
          <p className="font-display text-4xl leading-[1.05] text-ink">
            Bonds are <span className="text-litmus">shared</span>, not swiped.
          </p>
          <p className="mt-4 text-ink-2">Three people a day. Photos sharpen as you get to know each other. Pay only when a date is agreed.</p>
        </div>
        <p className="text-xs text-ink-3">Verified by eLitmus · Your dating data never reaches recruiters.</p>
      </aside>
      <div className="relative flex min-h-dvh w-full max-w-[440px] flex-col border-line lg:border-x lg:bg-paper">
        <main className="flex-1 pb-28">{children}</main>
        <TabBar yourMove={yourMove} extra={viewer.is_evaluator ? <DemoControls /> : undefined} />
      </div>
    </div>
  );
}
