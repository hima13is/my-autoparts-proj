import { model } from "@medusajs/framework/utils"
import { VehicleGeneration } from "./generation"
import { VehicleVariant } from "./variant"

/**
 * Says that a product fits a car.
 * - generation set, variant null → fits every variant of that generation
 * - generation and variant set   → fits only that variant
 * - both null                    → universal (fits every car)
 * `product_id` is a plain ID: products live in Medusa's product module.
 */
export const Fitment = model
  .define("fitment", {
    id: model.id({ prefix: "fit" }).primaryKey(),
    product_id: model.text().index(),
    notes: model.text().nullable(),
    position: model.text().nullable(),
    verified: model.boolean().default(false),
    generation: model.belongsTo(() => VehicleGeneration, { mappedBy: "fitments" }).nullable(),
    variant: model.belongsTo(() => VehicleVariant, { mappedBy: "fitments" }).nullable(),
  })
  .indexes([{ on: ["generation_id"] }, { on: ["variant_id"] }])
