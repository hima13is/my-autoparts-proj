import { model } from "@medusajs/framework/utils"

/** An accessories brand, e.g. a seat-cover maker. Products link to one brand. */
export const Brand = model.define("brand", {
  id: model.id({ prefix: "brand" }).primaryKey(),
  name: model.text().searchable(),
  handle: model.text().unique(),
  description: model.text().nullable(),
  logo_url: model.text().nullable(),
})
