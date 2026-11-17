import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { getUserId } from "@/lib/auth";
import { ownerPreviewLevel, photoEntitlement } from "@/lib/photos/entitlement";
import { batchDateFor } from "@/lib/time";

/**
 * Authorised image server. For anyone else's photo the client's `?level=` is ignored:
 * entitlement is recomputed from the database on every request, and only the variant
 * the viewer has earned is streamed. Originals never leave the private bucket otherwise.
 *
 * Owners are entitled to every version of their own photo, so for them `?level=` picks
 * which one (that's how "see how others see you" previews each round's blur).
 */
export async function GET(req: NextRequest, ctx: RouteContext<"/api/photos/[photoId]">) {
  const { photoId } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(photoId)) return new NextResponse(null, { status: 404 });
  const viewerId = await getUserId();
  if (!viewerId) return new NextResponse(null, { status: 401 });

  const db = admin();
  const { data: photo } = await db.from("photos").select("*").eq("id", photoId).maybeSingle();
  if (!photo) return new NextResponse(null, { status: 404 });
  const ownerId = photo.user_id;

  let level: ReturnType<typeof photoEntitlement> = ownerPreviewLevel(req.nextUrl.searchParams.get("level"));
  if (ownerId !== viewerId) {
    const [bond, block, viewer, inBatch] = await Promise.all([
      db
        .from("bonds")
        .select("status, round, user_a, user_b")
        .or(`and(user_a.eq.${viewerId},user_b.eq.${ownerId}),and(user_a.eq.${ownerId},user_b.eq.${viewerId})`)
        .maybeSingle(),
      db.from("blocks").select("blocker_id").or(`and(blocker_id.eq.${viewerId},blocked_id.eq.${ownerId}),and(blocker_id.eq.${ownerId},blocked_id.eq.${viewerId})`).limit(1),
      db.from("profiles").select("is_admin").eq("id", viewerId).single(),
      db
        .from("batch_items")
        .select("id, batches!inner(batch_date)")
        .eq("user_id", viewerId)
        .eq("candidate_id", ownerId)
        .gte("batches.batch_date", batchDateFor(new Date(Date.now() - 86_400_000)))
        .limit(1),
    ]);
    // Moderators see originals only for people who have an open report against them.
    let moderator = false;
    if (viewer.data?.is_admin) {
      const { count } = await db.from("reports").select("*", { count: "exact", head: true }).eq("target_id", ownerId).eq("status", "open");
      moderator = (count ?? 0) > 0;
    }
    level = photoEntitlement({
      viewerId,
      ownerId,
      bond: bond.data ? { status: bond.data.status, round: bond.data.round } : null,
      inBatchOrInvite: (inBatch.data?.length ?? 0) > 0,
      blocked: (block.data?.length ?? 0) > 0,
      isModerator: moderator,
    });
  }
  if (level === "none") return new NextResponse(null, { status: 403 });

  const path = level === "original" ? photo.path_original : photo.path_blur[level];
  const { data: file, error } = await db.storage.from("photos").download(path);
  if (error || !file) return new NextResponse(null, { status: 404 });

  return new NextResponse(file.stream(), {
    headers: {
      "Content-Type": "image/jpeg",
      // Private, short cache. The URL's ?level= changes when the level changes.
      "Cache-Control": "private, max-age=300",
      "X-Blur-Level": String(level),
    },
  });
}

