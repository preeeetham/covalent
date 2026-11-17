import type { Metadata } from "next";
import { requireViewer } from "@/lib/auth";
import { getTodayBatch } from "@/lib/data/batch";
import { getInvites, slotLimit, slotsUsed } from "@/lib/data/bonds";
import { admin } from "@/lib/supabase/admin";
import { nextResetAt } from "@/lib/time";
import { track } from "@/lib/events";
import { BatchView } from "@/components/today/batch-view";
import { InviteList } from "@/components/today/invites";
import { WaitlistCity } from "@/components/today/waitlist-city";
import { SlotDots } from "@/components/today/slot-dots";

export const metadata: Metadata = { title: "Today" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false }).format(new Date()));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function TodayPage() {
  const viewer = await requireViewer();
  const [batch, invites, used, myElements] = await Promise.all([
    getTodayBatch(viewer),
    getInvites(viewer),
    slotsUsed(viewer.id),
    admin().from("user_elements").select("element_id").eq("user_id", viewer.id),
  ]);
  void track(viewer.id, "batch_viewed");
  const limit = slotLimit(viewer);

  return (
    <div className="px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-2">{greeting()}, {viewer.first_name}</p>
          <h1 className="font-display text-[40px] leading-none text-ink">Today</h1>
        </div>
        <SlotDots used={used} limit={limit} />
      </header>

      {invites.length > 0 && <InviteList invites={invites} myElements={(myElements.data ?? []).map((e) => e.element_id)} />}

      {batch.kind === "waitlist" ? (
        <WaitlistCity city={batch.city} />
      ) : (
        <BatchView
          items={batch.items}
          myElements={(myElements.data ?? []).map((e) => e.element_id)}
          nextReset={nextResetAt().toISOString()}
          poolExhausted={batch.poolExhausted}
          slotsFull={used >= limit}
          catalysts={viewer.catalysts}
        />
      )}
    </div>
  );
}
