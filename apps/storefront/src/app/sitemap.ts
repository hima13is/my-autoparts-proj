import type { MetadataRoute } from "next"
import { getCategories, listProductHandles } from "@/lib/catalogue"
import { absoluteUrl, sitemapPaths } from "@/lib/seo"
import { getVehicleCatalog } from "@/lib/vehicles"

/** Without a backend (e.g. a build in CI) every source is empty and only "/" is listed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, catalog, products] = await Promise.all([
    getCategories(),
    getVehicleCatalog(),
    listProductHandles(),
  ])
  // Slugs are optional in the UI's catalogue type; the backend always sends them.
  const cars = catalog.makes.flatMap((make) =>
    make.models.flatMap((model) =>
      make.slug && model.slug ? [{ make: make.slug, model: model.slug }] : []
    )
  )
  return sitemapPaths({ categories, cars, products }).map((path) => ({ url: absoluteUrl(path) }))
}
