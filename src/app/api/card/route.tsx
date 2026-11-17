import { ImageResponse } from "next/og";
import { getViewer } from "@/lib/auth";
import { ARCHETYPE_BY_ID } from "@/content/archetypes";
import { ogFonts } from "@/lib/og-fonts";

/**
 * Shareable archetype card (1080×1920, story-sized). The free viral loop: no photo,
 * no surname, no employer — just your element and the Covalent mark.
 */
export async function GET() {
  const v = await getViewer();
  if (!v?.archetype) return new Response("Not found", { status: 404 });
  const a = ARCHETYPE_BY_ID[v.archetype];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#FBF7F1", padding: 96, fontFamily: "Fraunces", color: "#1C1524" }}>
        <div style={{ display: "flex", fontSize: 40, color: "#5E5568" }}>{`${v.first_name} is`}</div>
        <div
          style={{
            marginTop: 64,
            display: "flex",
            padding: 8,
            borderRadius: 72,
            background: "linear-gradient(100deg, #FF5A4F 0%, #E0409A 35%, #7C4DFF 68%, #3B6BFF 100%)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 872, height: 872, borderRadius: 64, background: "#FFFFFF", padding: 64 }}>
            <div style={{ display: "flex", fontSize: 56, color: "#5E5568" }}>{a.number}</div>
            <div style={{ display: "flex", fontSize: 400, fontWeight: 600, lineHeight: 1 }}>{a.symbol}</div>
            <div style={{ display: "flex", fontSize: 72, color: "#5E5568" }}>{a.name}</div>
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 72, fontSize: 76, fontWeight: 600, lineHeight: 1.1 }}>{a.tagline}</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 40, color: "#5E5568", lineHeight: 1.35 }}>{a.description}</div>
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 44 }}>
          <div style={{ display: "flex", fontWeight: 600 }}>Covalent</div>
          <div style={{ display: "flex", color: "#5E5568" }}>Find your element</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: await ogFonts(), headers: { "Cache-Control": "private, max-age=3600" } },
  );
}
