import { model } from "@medusajs/framework/utils"
import { VehicleModel } from "./vehicle-model"
import { VehicleVariant } from "./variant"
import { Fitment } from "./fitment"

/**
 * One body shape of a model, e.g. Swift 3rd gen (2018–2023).
 * `year_to` is null while the generation is still on sale.
 */
export const VehicleGeneration = model.define("vehicle_generation", {
  id: model.id({ prefix: "vgen" }).primaryKey(),
  name: model.text(),
  year_from: model.number(),
  year_to: model.number().nullable(),
  model: model.belongsTo(() => VehicleModel, { mappedBy: "generations" }),
  variants: model.hasMany(() => VehicleVariant, { mappedBy: "generation" }),
  fitments: model.hasMany(() => Fitment, { mappedBy: "generation" }),
})
