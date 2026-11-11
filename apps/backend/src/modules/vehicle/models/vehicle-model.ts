import { model } from "@medusajs/framework/utils"
import { VehicleMake } from "./make"
import { VehicleGeneration } from "./generation"

export const BODY_TYPES = [
  "hatchback",
  "sedan",
  "suv",
  "compact_suv",
  "muv",
  "pickup",
  "coupe",
] as const

/** A car model within a make, e.g. "Swift". Slug is unique per make. */
export const VehicleModel = model
  .define("vehicle_model", {
    id: model.id({ prefix: "vmodel" }).primaryKey(),
    name: model.text().searchable(),
    slug: model.text(),
    body_type: model.enum([...BODY_TYPES]),
    make: model.belongsTo(() => VehicleMake, { mappedBy: "models" }),
    generations: model.hasMany(() => VehicleGeneration, { mappedBy: "model" }),
  })
  .indexes([{ on: ["make_id", "slug"], unique: true }])
