import {
  allowFields,
  configureStoreSearch,
  defineMiddlewares,
  errorHandler,
} from "@medusajs/framework/http"
import { withSentryReporting } from "../lib/sentry"
import { vehicleFitFilter } from "./store/products/vehicle-filter"

export default defineMiddlewares({
  // Medusa's default error responses, plus 5xx errors reported to Sentry.
  errorHandler: withSentryReporting(errorHandler()),
  routes: [
    {
      // Let the storefront ask for a product's brand on the core routes with
      // `?fields=+brand.name,+brand.handle` (`*brand` is silently dropped: list fields explicitly).
      matcher: "/store/products*",
      middlewares: [allowFields("brand.id", "brand.name", "brand.handle", "brand.logo_url")],
    },
    {
      // "Fits my car" filter on the core product list (see vehicle-filter.ts). No `method`
      // on purpose: method-less middlewares run before the core route's strict query
      // validation, which would otherwise reject the extra parameters.
      matcher: "/store/products",
      middlewares: [vehicleFitFilter],
    },
    {
      // The product index declares filterable `status` and `sales_channel_ids`, so
      // the route narrows it to published products in the key's sales channels.
      method: ["POST"],
      matcher: "/store/search",
      middlewares: [
        configureStoreSearch({
          allowed_indexes: {
            product: true,
          },
        }),
      ],
    },
  ],
})
