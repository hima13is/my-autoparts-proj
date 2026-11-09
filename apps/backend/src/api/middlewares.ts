import { configureStoreSearch, defineMiddlewares, errorHandler } from "@medusajs/framework/http"
import { withSentryReporting } from "../lib/sentry"

export default defineMiddlewares({
  // Medusa's default error responses, plus 5xx errors reported to Sentry.
  errorHandler: withSentryReporting(errorHandler()),
  routes: [
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
