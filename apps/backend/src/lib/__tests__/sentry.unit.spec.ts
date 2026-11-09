import { sentryOptions, withSentryReporting } from "../sentry"

describe("sentryOptions", () => {
  it("is off when SENTRY_DSN is missing or blank", () => {
    expect(sentryOptions({})).toBeNull()
    expect(sentryOptions({ SENTRY_DSN: "  " })).toBeNull()
  })

  it("uses the DSN and environment", () => {
    expect(
      sentryOptions({
        SENTRY_DSN: "https://k@o1.ingest.sentry.io/2",
        SENTRY_ENVIRONMENT: "staging",
      })
    ).toMatchObject({ dsn: "https://k@o1.ingest.sentry.io/2", environment: "staging" })
  })

  it("collects no customer data (user info, cookies, headers, bodies, SQL, variables)", () => {
    const dc = sentryOptions({ SENTRY_DSN: "https://k@o1.ingest.sentry.io/2" })?.dataCollection
    expect(dc).toMatchObject({
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
    })
  })

  it("defaults the environment to development", () => {
    expect(sentryOptions({ SENTRY_DSN: "https://k@o1.ingest.sentry.io/2" })?.environment).toBe(
      "development"
    )
  })
})

describe("withSentryReporting", () => {
  const run = async (status: number) => {
    const capture = jest.fn()
    const res = { statusCode: 200 } as any
    const core = jest.fn((_e, _q, r) => {
      r.statusCode = status
    })
    const error = new Error("boom")
    await withSentryReporting(core, capture)(error, {} as any, res, jest.fn())
    expect(core).toHaveBeenCalledTimes(1)
    return { capture, error }
  }

  it("reports errors that end as 5xx", async () => {
    const { capture, error } = await run(500)
    expect(capture).toHaveBeenCalledWith(error)
  })

  it("does not report 4xx errors", async () => {
    const { capture } = await run(404)
    expect(capture).not.toHaveBeenCalled()
  })
})
