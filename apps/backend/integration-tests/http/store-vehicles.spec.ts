import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { VEHICLE_MODULE } from "../../src/modules/vehicle"
import type VehicleModuleService from "../../src/modules/vehicle/service"

jest.setTimeout(60 * 1000)

const THIS_YEAR = new Date().getFullYear()

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Store vehicle API", () => {
      let headers: Record<string, string>
      const ids: Record<string, string> = {}

      beforeEach(async () => {
        const container = getContainer()
        const [key] = await container
          .resolve(Modules.API_KEY)
          .createApiKeys([{ title: "test", type: "publishable", created_by: "test" }])
        headers = { "x-publishable-api-key": key.token }

        const vehicles = container.resolve<VehicleModuleService>(VEHICLE_MODULE)
        const [hyundai, maruti] = await vehicles.createVehicleMakes([
          { name: "Hyundai", slug: "hyundai" },
          { name: "Maruti Suzuki", slug: "maruti-suzuki" },
        ])
        const [creta, venue] = await vehicles.createVehicleModels([
          { name: "Creta", slug: "creta", body_type: "suv", make_id: hyundai.id },
          { name: "Venue", slug: "venue", body_type: "compact_suv", make_id: hyundai.id },
          { name: "Swift", slug: "swift", body_type: "hatchback", make_id: maruti.id },
        ])
        const [gen1, gen2] = await vehicles.createVehicleGenerations([
          { name: "1st gen", year_from: 2015, year_to: 2019, model_id: creta.id },
          { name: "2nd gen", year_from: 2020, year_to: null, model_id: creta.id },
        ])
        await vehicles.createVehicleVariants([
          { name: "SX", fuel: "petrol", transmission: "manual", seats: 5, generation_id: gen2.id },
          { name: "E", fuel: "diesel", transmission: "manual", seats: 5, generation_id: gen2.id },
          { name: "SX(O)", fuel: "diesel", transmission: "automatic", generation_id: gen2.id },
          { name: "S", fuel: "petrol", transmission: "manual", generation_id: gen1.id },
        ])
        Object.assign(ids, {
          hyundai: hyundai.id,
          creta: creta.id,
          venue: venue.id,
          gen1: gen1.id,
          gen2: gen2.id,
        })
      })

      const get = (url: string) => api.get(url, { headers, validateStatus: () => true })

      it("needs a publishable API key", async () => {
        const res = await api.get("/store/vehicles/makes", { validateStatus: () => true })
        expect(res.status).toBe(400)
      })

      it("lists makes A–Z", async () => {
        const res = await get("/store/vehicles/makes")
        expect(res.status).toBe(200)
        expect(res.data.makes.map((m: { slug: string }) => m.slug)).toEqual([
          "hyundai",
          "maruti-suzuki",
        ])
      })

      it("lists only the make's own models", async () => {
        const res = await get(`/store/vehicles/makes/${ids.hyundai}/models`)
        expect(res.status).toBe(200)
        expect(res.data.models.map((m: { name: string }) => m.name)).toEqual(["Creta", "Venue"])
      })

      it("returns 404 for an unknown make", async () => {
        expect((await get("/store/vehicles/makes/vmake_nope/models")).status).toBe(404)
      })

      it("lists every year a model was on sale, newest first", async () => {
        const res = await get(`/store/vehicles/models/${ids.creta}/years`)
        expect(res.status).toBe(200)
        expect(res.data.years[0]).toBe(THIS_YEAR)
        expect(res.data.years.at(-1)).toBe(2015)
        expect(res.data.years).toHaveLength(THIS_YEAR - 2015 + 1)
      })

      it("returns an empty year list for a model with no generations", async () => {
        const res = await get(`/store/vehicles/models/${ids.venue}/years`)
        expect(res.data.years).toEqual([])
      })

      it("resolves 2021 to the 2nd generation and returns only its variants", async () => {
        const res = await get(`/store/vehicles/models/${ids.creta}/variants?year=2021`)
        expect(res.status).toBe(200)
        expect(res.data.generation.id).toBe(ids.gen2)
        expect(res.data.variants.map((v: { name: string }) => v.name)).toEqual(["E", "SX", "SX(O)"])
      })

      it("resolves 2017 to the 1st generation", async () => {
        const res = await get(`/store/vehicles/models/${ids.creta}/variants?year=2017`)
        expect(res.data.generation.id).toBe(ids.gen1)
        expect(res.data.variants).toHaveLength(1)
      })

      it("rejects a missing or bad year and 404s a year with no generation", async () => {
        expect((await get(`/store/vehicles/models/${ids.creta}/variants`)).status).toBe(400)
        expect((await get(`/store/vehicles/models/${ids.creta}/variants?year=abc`)).status).toBe(
          400
        )
        expect((await get(`/store/vehicles/models/${ids.creta}/variants?year=2010`)).status).toBe(
          404
        )
      })

      it("resolves slugs to IDs for a car landing page", async () => {
        const res = await get("/store/vehicles/resolve?make=hyundai&model=creta&year=2021")
        expect(res.status).toBe(200)
        expect(res.data.make.id).toBe(ids.hyundai)
        expect(res.data.model.id).toBe(ids.creta)
        expect(res.data.generation.id).toBe(ids.gen2)
      })

      it("returns every generation, newest first, when no year is given", async () => {
        const res = await get("/store/vehicles/resolve?make=Hyundai&model=creta")
        expect(res.data.generations.map((g: { id: string }) => g.id)).toEqual([ids.gen2, ids.gen1])
      })

      it("does not resolve a model under the wrong make", async () => {
        expect((await get("/store/vehicles/resolve?make=maruti-suzuki&model=creta")).status).toBe(
          404
        )
        expect((await get("/store/vehicles/resolve?make=hyundai")).status).toBe(400)
      })
    })
  },
})
