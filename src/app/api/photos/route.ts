import { NextResponse, type NextRequest } from "next/server";
import { admin } from "@/lib/supabase/admin";
import { ActionError, getViewer, rateLimit } from "@/lib/auth";
import { processAndStorePhoto } from "@/lib/photos/process";

const MAX_PHOTOS = 4;

/** Upload a photo (multipart, field "photo"). The client resizes before upload. */
export async function POST(req: NextRequest) {
  const viewer = await getViewer();
  if (!viewer) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try {
    await rateLimit(`upload:${viewer.id}`, 20, 3600);
    const form = await req.formData();
    const file = form.get("photo");
    if (!(file instanceof File)) throw new ActionError("No photo attached.");
    const { count } = await admin().from("photos").select("*", { count: "exact", head: true }).eq("user_id", viewer.id);
    if ((count ?? 0) >= MAX_PHOTOS) throw new ActionError(`You can add up to ${MAX_PHOTOS} photos.`);
    const id = await processAndStorePhoto(viewer.id, Buffer.from(await file.arrayBuffer()), count ?? 0);
    return NextResponse.json({ id });
  } catch (e) {
    const msg = e instanceof ActionError ? e.message : "Upload failed. Try a different photo.";
    if (!(e instanceof ActionError)) console.error("[upload]", e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
