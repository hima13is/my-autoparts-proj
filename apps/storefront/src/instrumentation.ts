import * as Sentry from "@sentry/nextjs"
import { sentryOptions } from "@/lib/sentry-options"

// Runs once per server instance (Node and Edge runtimes).
export function register() {
  Sentry.init(
    sentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN, process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT)
  )
}

// Reports errors thrown in Server Components, route handlers and server actions.
export const onRequestError = Sentry.captureRequestError
