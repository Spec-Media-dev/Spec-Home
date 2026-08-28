import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin must never be indexed; /search is a query surface, not a page.
        disallow: [
          "/dashboard-admin",
          "/dashboard-admin/",
          "/search",
          "/ar/search",
          "/api/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
