import { medusaIntegrationTestRunner } from "@medusajs/test-utils"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  testSuite: ({ api }) => {
    describe("Health", () => {
      it("GET /health returns 200", async () => {
        const response = await api.get("/health")
        expect(response.status).toEqual(200)
      })
    })
  },
})
