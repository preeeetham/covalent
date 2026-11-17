import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/signup", "/login", "/privacy", "/terms", "/guidelines", "/safety"].map((p) => ({ url: `${site}${p}` }));
}
