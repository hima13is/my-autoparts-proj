import { expect, test } from "@playwright/test"
import { E2E_SENTRY_CHECK_TOKEN } from "./constants"

test.describe("Sentry check route", () => {
  test("is hidden without the right token", async ({ request }) => {
    expect((await request.get("/api/sentry-check")).status()).toBe(404)
    expect((await request.get("/api/sentry-check?token=wrong")).status()).toBe(404)
  })

  test("throws a server error with the right token", async ({ request }) => {
    test.skip(!!process.env.E2E_BASE_URL, "Token is only known for the locally started server")
    const res = await request.get(`/api/sentry-check?token=${E2E_SENTRY_CHECK_TOKEN}`)
    expect(res.status()).toBe(500)
  })
})
