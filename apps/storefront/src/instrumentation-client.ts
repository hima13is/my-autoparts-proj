import * as Sentry from "@sentry/nextjs"
import { sentryOptions } from "@/lib/sentry-options"

// Runs in the browser before the app becomes interactive.
Sentry.init(
  sentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN, process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT)
)

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
