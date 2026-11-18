import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import BrandModule from "../modules/brand"

/** Each product has one brand; a brand has many products. */
export default defineLink(
  { linkable: ProductModule.linkable.product, isList: true },
  BrandModule.linkable.brand
)
