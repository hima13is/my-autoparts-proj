import { describe, expect, it } from "vitest"
import { sentryOptions } from "../sentry-options"

describe("sentryOptions", () => {
  it("is disabled without a DSN", () => {
    expect(sentryOptions(undefined, undefined)).toMatchObject({ enabled: false, dsn: undefined })
    expect(sentryOptions("  ", "staging").enabled).toBe(false)
  })

  it("is enabled with a DSN and environment", () => {
    expect(sentryOptions("https://k@o1.ingest.sentry.io/2", "staging")).toMatchObject({
      dsn: "https://k@o1.ingest.sentry.io/2",
      enabled: true,
      environment: "staging",
    })
  })

  it("collects no customer data (user info, cookies, headers, bodies, variables)", () => {
    expect(
      sentryOptions("https://k@o1.ingest.sentry.io/2", "staging").dataCollection
    ).toMatchObject({
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
    })
  })

  it("defaults the environment to development", () => {
    expect(sentryOptions("https://k@o1.ingest.sentry.io/2", "").environment).toBe("development")
  })
})
