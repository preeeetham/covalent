"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { realtimeClient } from "@/lib/supabase/client";
import { tickBond } from "@/app/actions/bonds";

/**
 * Keeps a bond screen live:
 *  - realtime: refresh when the bond row or its date plans change (RLS-scoped subscription)
 *  - demo partners: when their scheduled move is due, ask the server to make it, then refresh
 */
export function BondLive({ bondId, personaDueAt }: { bondId: string; personaDueAt: string | null }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    realtimeClient().then((sb) => {
      if (cancelled) return;
      const ch = sb
        .channel(`bond:${bondId}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bonds", filter: `id=eq.${bondId}` }, () => router.refresh())
        .on("postgres_changes", { event: "*", schema: "public", table: "date_plans", filter: `bond_id=eq.${bondId}` }, () => router.refresh())
        .subscribe();
      cleanup = () => sb.removeChannel(ch);
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [bondId, router]);

  useEffect(() => {
    if (!personaDueAt) return;
    let cancelled = false;
    const wait = Math.max(600, new Date(personaDueAt).getTime() - Date.now() + 300);
    const t = setTimeout(async () => {
      const res = await tickBond(bondId);
      if (!cancelled && res.ok) router.refresh();
    }, wait);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [bondId, personaDueAt, router]);

  return null;
}
