import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  testSuite: ({ api }) => {
    describe("Sentry check route", () => {
      it("GET /admin/sentry-check is not public (401 without an admin login)", async () => {
        const response = await api.get("/admin/sentry-check", { validateStatus: () => true })
        expect(response.status).toEqual(401)
      })
    })
  },
})
