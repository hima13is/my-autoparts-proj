import type { MetadataRoute } from "next"
import { indexingAllowed, siteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  if (!indexingAllowed()) return { rules: { userAgent: "*", disallow: "/" } }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/search", "/garage", "/status", "/prototype"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
