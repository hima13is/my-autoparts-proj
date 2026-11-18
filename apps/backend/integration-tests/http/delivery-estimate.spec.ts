import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"

jest.setTimeout(60 * 1000)

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("GET /store/delivery-estimate", () => {
      let headers: Record<string, string>

      beforeEach(async () => {
        const [key] = await getContainer()
          .resolve(Modules.API_KEY)
          .createApiKeys([{ title: "test", type: "publishable", created_by: "test" }])
        headers = { "x-publishable-api-key": key.token }
      })

      it("gives a delivery window for a served PIN code", async () => {
        const res = await api.get("/store/delivery-estimate?pincode=110001", { headers })
        expect(res.status).toBe(200)
        const { estimate } = res.data
        expect(estimate).toMatchObject({
          pincode: "110001",
          serviceable: true,
          cod: true,
          min_days: 3,
          max_days: 5,
        })
        expect(estimate.earliest).toMatch(ISO_DATE)
        expect(estimate.latest).toMatch(ISO_DATE)
        expect(estimate.latest >= estimate.earliest).toBe(true)
      })

      it("says when we don't deliver to a PIN code", async () => {
        const res = await api.get("/store/delivery-estimate?pincode=000000", { headers })
        expect(res.status).toBe(200)
        expect(res.data.estimate).toEqual({ pincode: "000000", serviceable: false })
      })

      it.each(["", "11001", "abcdef"])("rejects %p as a PIN code", async (pin) => {
        const err = await api
          .get(`/store/delivery-estimate?pincode=${pin}`, { headers })
          .catch((e) => e)
        expect(err.response.status).toBe(400)
        expect(err.response.data.message).toBe("Enter a 6-digit PIN code.")
      })

      it("needs a publishable key", async () => {
        const err = await api.get("/store/delivery-estimate?pincode=110001").catch((e) => e)
        expect(err.response.status).toBe(400)
      })
    })
  },
})
