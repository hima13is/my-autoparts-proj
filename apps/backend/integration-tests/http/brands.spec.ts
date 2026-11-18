import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import {
  createProductsWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"
import { adminHeaders } from "../helpers/auth"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Brands", () => {
      let admin: Record<string, string>
      let store: Record<string, string>
      let productId: string
      const opts = (headers: Record<string, string>) => ({ headers, validateStatus: () => true })

      beforeEach(async () => {
        const container = getContainer()
        admin = await adminHeaders(container, api)

        const {
          result: [channel],
        } = await createSalesChannelsWorkflow(container).run({
          input: { salesChannelsData: [{ name: "Website" }] },
        })
        const [key] = await container
          .resolve(Modules.API_KEY)
          .createApiKeys([{ title: "store", type: "publishable", created_by: "test" }])
        await linkSalesChannelsToApiKeyWorkflow(container).run({
          input: { id: key.id, add: [channel.id] },
        })
        store = { "x-publishable-api-key": key.token }

        const {
          result: [product],
        } = await createProductsWorkflow(container).run({
          input: {
            products: [
              {
                title: "Dashcam",
                status: "published",
                sales_channels: [{ id: channel.id }],
                options: [{ title: "Colour", values: ["Black"] }],
                variants: [{ title: "Black", options: { Colour: "Black" }, prices: [] }],
              },
            ],
          },
        })
        productId = product.id
      })

      it("creates brands, rejects duplicates and lists them A–Z", async () => {
        const created = await api.post("/admin/brands", { name: "Road Saathi" }, opts(admin))
        expect(created.status).toBe(201)
        expect(created.data.brand.handle).toBe("road-saathi")

        expect((await api.post("/admin/brands", { name: "Road Saathi" }, opts(admin))).status).toBe(
          422
        )
        await api.post("/admin/brands", { name: "Kavach" }, opts(admin))

        const list = await api.get("/store/brands", opts(store))
        expect(list.data.brands.map((b: { name: string }) => b.name)).toEqual([
          "Kavach",
          "Road Saathi",
        ])
      })

      it("sets, changes and clears a product's brand, visible on /store/products", async () => {
        const a = (await api.post("/admin/brands", { name: "Kavach" }, opts(admin))).data.brand
        const b = (await api.post("/admin/brands", { name: "LumaDrive" }, opts(admin))).data.brand
        const brandOf = async () =>
          (
            await api.get(
              `/store/products/${productId}?fields=+brand.name,+brand.handle`,
              opts(store)
            )
          ).data.product.brand

        await api.post(`/admin/products/${productId}/brand`, { brand_id: a.id }, opts(admin))
        expect((await brandOf())?.name).toBe("Kavach")

        // Changing brand replaces the link instead of adding a second one.
        await api.post(`/admin/products/${productId}/brand`, { brand_id: b.id }, opts(admin))
        expect((await brandOf())?.name).toBe("LumaDrive")

        await api.post(`/admin/products/${productId}/brand`, { brand_id: null }, opts(admin))
        expect(await brandOf()).toBeFalsy()
      })

      it("404s an unknown brand or product, and is admin-only", async () => {
        const url = `/admin/products/${productId}/brand`
        expect((await api.post(url, { brand_id: "brand_missing" }, opts(admin))).status).toBe(404)
        expect(
          (await api.post("/admin/products/prod_missing/brand", { brand_id: null }, opts(admin)))
            .status
        ).toBe(404)
        expect(
          (await api.post("/admin/brands", { name: "X" }, { validateStatus: () => true })).status
        ).toBe(401)
      })
    })
  },
})
