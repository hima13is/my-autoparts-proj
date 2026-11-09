import * as Sentry from "@sentry/node"
import type { MedusaErrorHandlerFunction } from "@medusajs/framework/http"

type Env = Record<string, string | undefined>

/**
 * Sentry v11 collects user info, cookies, headers, bodies, SQL data and stack
 * variables by default. Turn all of it off: error reports must never carry
 * customer data (names, phones, addresses, emails).
 */
export const PRIVATE_DATA_COLLECTION = {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],
  urlQueryParams: false,
  databaseQueryData: false,
  stackFrameVariables: false,
  graphQL: { document: false, variables: false },
  genAI: { inputs: false, outputs: false },
} satisfies Sentry.NodeOptions["dataCollection"]

/**
 * Sentry options from env, or `null` when SENTRY_DSN is unset
 * (local dev, CI and tests), so Sentry stays completely off there.
 * Errors only: tracing is left off for now.
 */
export function sentryOptions(env: Env): Sentry.NodeOptions | null {
  const dsn = env.SENTRY_DSN?.trim()
  if (!dsn) return null
  return {
    dsn,
    environment: env.SENTRY_ENVIRONMENT || "development",
    dataCollection: PRIVATE_DATA_COLLECTION,
  }
}

/** Called from `instrumentation.ts` when Medusa boots. Returns whether Sentry started. */
export function initSentry(env: Env = process.env): boolean {
  const options = sentryOptions(env)
  if (!options) return false
  Sentry.init(options)
  return true
}

/**
 * Wraps Medusa's own error handler: the response is unchanged, and any
 * error that ends as a 5xx is also sent to Sentry. 4xx (bad input,
 * not found, not logged in) are normal traffic and are not reported.
 */
export function withSentryReporting(
  coreHandler: MedusaErrorHandlerFunction,
  capture: (error: unknown) => unknown = Sentry.captureException
): MedusaErrorHandlerFunction {
  return async (error, req, res, next) => {
    await coreHandler(error, req, res, next)
    if (res.statusCode >= 500) capture(error)
  }
}
