// Medusa imports this file at boot and calls `register()`.
// Sentry error tracking: active only when SENTRY_DSN is set (staging/production).
// To add OpenTelemetry tracing later, see
// https://docs.medusajs.com/learn/debugging-and-testing/instrumentation
import { initSentry } from "./src/lib/sentry"

export function register() {
  initSentry()
}
