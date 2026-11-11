import { model } from "@medusajs/framework/utils"
import { VehicleModel } from "./vehicle-model"

/** A car manufacturer, e.g. "Maruti Suzuki". */
export const VehicleMake = model.define("vehicle_make", {
  id: model.id({ prefix: "vmake" }).primaryKey(),
  name: model.text().searchable(),
  slug: model.text().unique(),
  logo_url: model.text().nullable(),
  models: model.hasMany(() => VehicleModel, { mappedBy: "make" }),
})
