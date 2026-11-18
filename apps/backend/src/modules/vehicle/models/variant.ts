import { model } from "@medusajs/framework/utils"
import { VehicleGeneration } from "./generation"
import { Fitment } from "./fitment"

export const FUEL_TYPES = ["petrol", "diesel", "cng", "electric", "hybrid"] as const
export const TRANSMISSIONS = ["manual", "automatic"] as const

/** A trim of a generation, e.g. "VXi Petrol Manual". */
export const VehicleVariant = model.define("vehicle_variant", {
  id: model.id({ prefix: "vvar" }).primaryKey(),
  name: model.text(),
  fuel: model.enum([...FUEL_TYPES]),
  transmission: model.enum([...TRANSMISSIONS]),
  seats: model.number().nullable(),
  generation: model.belongsTo(() => VehicleGeneration, { mappedBy: "variants" }),
  fitments: model.hasMany(() => Fitment, { mappedBy: "variant" }),
})
