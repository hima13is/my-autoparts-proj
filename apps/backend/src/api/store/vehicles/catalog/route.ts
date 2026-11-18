import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { generationForYear, yearsForModel } from "../../../../lib/fitment"
import { currentYear, vehicleService } from "../helpers"

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

/**
 * GET /store/vehicles/catalog: the whole make → model → year → variant tree in one response,
 * in the shape the storefront's vehicle selector uses. Each year names the generation on sale
 * that year, so a shopper who skips the variant still gets a generation to filter by.
 * Small enough to send whole (≈35 models) and changes rarely, so the storefront caches it.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const now = currentYear()
  const makes = await vehicleService(req).listVehicleMakes(
    {},
    {
      select: [
        "id",
        "name",
        "slug",
        "models.id",
        "models.name",
        "models.slug",
        "models.generations.id",
        "models.generations.year_from",
        "models.generations.year_to",
        "models.generations.variants.id",
        "models.generations.variants.name",
      ],
      relations: ["models", "models.generations", "models.generations.variants"],
      take: null,
    }
  )

  const catalog = makes.sort(byName).map((make) => ({
    id: make.id,
    name: make.name,
    slug: make.slug,
    models: [...make.models].sort(byName).map((model) => ({
      id: model.id,
      name: model.name,
      slug: model.slug,
      years: yearsForModel(model.generations, now).map((year) => {
        const generation = generationForYear(model.generations, year, now)!
        return {
          year,
          generationId: generation.id,
          variants: [...generation.variants].sort(byName).map((v) => ({ id: v.id, name: v.name })),
        }
      }),
    })),
  }))

  res.setHeader("Cache-Control", "public, max-age=300")
  res.json({ makes: catalog })
}
