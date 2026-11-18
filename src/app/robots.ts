import type { MetadataRoute } from "next";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/privacy", "/terms", "/guidelines", "/safety"], disallow: ["/today", "/bonds", "/dates", "/you", "/admin", "/onboarding", "/api", "/share", "/welcome", "/auth"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
