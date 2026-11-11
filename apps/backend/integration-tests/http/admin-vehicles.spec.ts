import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { adminHeaders } from "../helpers/auth"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Admin vehicle API", () => {
      let headers: Record<string, string>
      const call = (method: "get" | "post" | "delete", url: string, body?: unknown) =>
        method === "post"
          ? api.post(url, body, { headers, validateStatus: () => true })
          : api[method](url, { headers, validateStatus: () => true })

      beforeEach(async () => {
        headers = await adminHeaders(getContainer(), api)
      })

      it("is not public", async () => {
        const res = await api.get("/admin/vehicles/makes", { validateStatus: () => true })
        expect(res.status).toBe(401)
      })

      it("builds a make → model → generation → variant tree, filling slugs from names", async () => {
        const make = await call("post", "/admin/vehicles/makes", { name: "Maruti Suzuki" })
        expect(make.status).toBe(201)
        expect(make.data.make.slug).toBe("maruti-suzuki")

        const model = await call("post", "/admin/vehicles/models", {
          name: "Grand Vitara",
          body_type: "suv",
          make_id: make.data.make.id,
        })
        expect(model.status).toBe(201)
        expect(model.data.model.slug).toBe("grand-vitara")

        const gen = await call("post", "/admin/vehicles/generations", {
          name: "2nd gen",
          year_from: 2022,
          model_id: model.data.model.id,
        })
        expect(gen.status).toBe(201)
        expect(gen.data.generation.year_to).toBeNull()

        const variant = await call("post", "/admin/vehicles/variants", {
          name: "Alpha+ Hybrid",
          fuel: "hybrid",
          transmission: "automatic",
          seats: 5,
          generation_id: gen.data.generation.id,
        })
        expect(variant.status).toBe(201)

        const list = await call("get", `/admin/vehicles/models?make_id=${make.data.make.id}`)
        expect(list.data.models.map((m: { name: string }) => m.name)).toEqual(["Grand Vitara"])
      })

      it("validates input with clear messages", async () => {
        const make = await call("post", "/admin/vehicles/makes", { name: "Tata" })
        const model = await call("post", "/admin/vehicles/models", {
          name: "Nexon",
          body_type: "spaceship",
          make_id: make.data.make.id,
        })
        expect(model.status).toBe(400)
        expect(model.data.message).toMatch(/body_type/)

        const badSlug = await call("post", "/admin/vehicles/makes", {
          name: "Kia",
          slug: "Kia Motors",
        })
        expect(badSlug.status).toBe(400)

        const ok = await call("post", "/admin/vehicles/models", {
          name: "Nexon",
          body_type: "compact_suv",
          make_id: make.data.make.id,
        })
        const years = await call("post", "/admin/vehicles/generations", {
          name: "Facelift",
          year_from: 2024,
          year_to: 2020,
          model_id: ok.data.model.id,
        })
        expect(years.status).toBe(400)
        expect(years.data.message).toMatch(/year_to/)
      })

      it("404s an unknown parent and rejects a duplicate slug", async () => {
        const orphan = await call("post", "/admin/vehicles/models", {
          name: "Ghost",
          body_type: "sedan",
          make_id: "vmake_missing",
        })
        expect(orphan.status).toBe(404)

        await call("post", "/admin/vehicles/makes", { name: "Honda" })
        const dupe = await call("post", "/admin/vehicles/makes", { name: "Honda" })
        expect(dupe.status).toBe(422) // Medusa maps DUPLICATE_ERROR to 422
        expect(dupe.data.message).toMatch(/already exists/)
      })

      it("updates a row and refuses to delete a make that still has models", async () => {
        const make = await call("post", "/admin/vehicles/makes", { name: "Mahindra" })
        const id = make.data.make.id
        const model = await call("post", "/admin/vehicles/models", {
          name: "Thar",
          body_type: "suv",
          make_id: id,
        })

        const renamed = await call("post", `/admin/vehicles/makes/${id}`, {
          logo_url: "https://cdn.example.com/m.svg",
        })
        expect(renamed.status).toBe(200)
        expect(renamed.data.make.logo_url).toBe("https://cdn.example.com/m.svg")

        expect((await call("delete", `/admin/vehicles/makes/${id}`)).status).toBe(400)
        expect((await call("delete", `/admin/vehicles/models/${model.data.model.id}`)).status).toBe(
          200
        )
        expect((await call("delete", `/admin/vehicles/makes/${id}`)).status).toBe(200)
        expect((await call("get", `/admin/vehicles/makes/${id}`)).status).toBe(404)
      })
    })
  },
})
