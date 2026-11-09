import type { BrowserOptions } from "@sentry/nextjs"

/**
 * Sentry v11 collects user info, cookies, headers, bodies and stack variables
 * by default. Turn all of it off: error reports must never carry customer data.
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
} satisfies BrowserOptions["dataCollection"]

/**
 * Sentry options shared by the browser, Node and Edge runtimes.
 * Callers pass `process.env.NEXT_PUBLIC_*` literally so Next can inline them
 * into the browser bundle. With no DSN (local dev, CI, tests) Sentry stays off.
 * Errors only: tracing is left off for now.
 */
export function sentryOptions(dsn: string | undefined, environment: string | undefined) {
  const trimmed = dsn?.trim() || undefined
  return {
    dsn: trimmed,
    enabled: Boolean(trimmed),
    environment: environment || "development",
    dataCollection: PRIVATE_DATA_COLLECTION,
  }
}
