import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { VEHICLE_MODULE } from "../../src/modules/vehicle"
import type VehicleModuleService from "../../src/modules/vehicle/service"
import { storeWithChannel } from "../helpers/auth"

jest.setTimeout(90 * 1000)

/**
 * The PLAN §7 Phase 2 fixture: 20 published products with known answers (plus one draft).
 * Cars: Creta 1st gen (trim S), Creta 2nd gen (trims E, SX(O)), Swift 4th gen (trim LXi).
 */
type Rule = "universal" | { gen: string; variant?: string }
const FIXTURE: Record<string, Rule[]> = {
  U1: ["universal"],
  U2: ["universal"],
  U3: ["universal"],
  U4: ["universal"],
  C2a: [{ gen: "creta2" }],
  C2b: [{ gen: "creta2" }],
  C2c: [{ gen: "creta2" }],
  C2d: [{ gen: "creta2" }],
  C2e: [{ gen: "creta2" }],
  SX1: [{ gen: "creta2", variant: "sxo" }],
  SX2: [{ gen: "creta2", variant: "sxo" }],
  E1: [{ gen: "creta2", variant: "e" }],
  C1a: [{ gen: "creta1" }],
  C1b: [{ gen: "creta1" }],
  C1c: [{ gen: "creta1" }],
  S1: [{ gen: "swift4" }],
  S2: [{ gen: "swift4" }],
  S3: [{ gen: "swift4" }],
  M1: [{ gen: "creta2" }, { gen: "swift4" }],
  N1: [],
}

const EXPECTED = {
  "Creta 2nd gen SX(O)": [
    "U1",
    "U2",
    "U3",
    "U4",
    "C2a",
    "C2b",
    "C2c",
    "C2d",
    "C2e",
    "SX1",
    "SX2",
    "M1",
  ],
  "Creta 2nd gen E": ["U1", "U2", "U3", "U4", "C2a", "C2b", "C2c", "C2d", "C2e", "E1", "M1"],
  "Creta 2nd gen, no trim": ["U1", "U2", "U3", "U4", "C2a", "C2b", "C2c", "C2d", "C2e", "M1"],
  "Creta 1st gen S": ["U1", "U2", "U3", "U4", "C1a", "C1b", "C1c"],
  "Swift 4th gen LXi": ["U1", "U2", "U3", "U4", "S1", "S2", "S3", "M1"],
}

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("GET /store/products with a car", () => {
      let headers: Record<string, string>
      const car: Record<string, string> = {}
      const productIds: Record<string, string> = {}

      beforeEach(async () => {
        const container = getContainer()
        const store = await storeWithChannel(container)
        headers = store.headers

        const vehicles = container.resolve<VehicleModuleService>(VEHICLE_MODULE)
        const hyundai = await vehicles.createVehicleMakes({ name: "Hyundai", slug: "hyundai" })
        const maruti = await vehicles.createVehicleMakes({ name: "Maruti", slug: "maruti" })
        const [creta, swift] = await vehicles.createVehicleModels([
          { name: "Creta", slug: "creta", body_type: "suv", make_id: hyundai.id },
          { name: "Swift", slug: "swift", body_type: "hatchback", make_id: maruti.id },
        ])
        const [creta1, creta2, swift4] = await vehicles.createVehicleGenerations([
          { name: "1st gen", year_from: 2015, year_to: 2019, model_id: creta.id },
          { name: "2nd gen", year_from: 2020, year_to: null, model_id: creta.id },
          { name: "4th gen", year_from: 2024, year_to: null, model_id: swift.id },
        ])
        const [s, e, sxo, lxi] = await vehicles.createVehicleVariants([
          { name: "S", fuel: "petrol", transmission: "manual", generation_id: creta1.id },
          { name: "E", fuel: "petrol", transmission: "manual", generation_id: creta2.id },
          { name: "SX(O)", fuel: "diesel", transmission: "automatic", generation_id: creta2.id },
          { name: "LXi", fuel: "petrol", transmission: "manual", generation_id: swift4.id },
        ])
        Object.assign(car, {
          creta1: creta1.id,
          creta2: creta2.id,
          swift4: swift4.id,
          s: s.id,
          e: e.id,
          sxo: sxo.id,
          lxi: lxi.id,
        })

        const titles = [...Object.keys(FIXTURE), "DRAFT"]
        const { result } = await createProductsWorkflow(container).run({
          input: {
            products: titles.map((title) => ({
              title,
              status: title === "DRAFT" ? "draft" : "published",
              sales_channels: [{ id: store.channelId }],
              options: [{ title: "Size", values: ["One"] }],
              variants: [{ title: "One", options: { Size: "One" }, prices: [] }],
            })),
          },
        })
        for (const p of result) productIds[p.title] = p.id

        const rows = Object.entries({ ...FIXTURE, DRAFT: ["universal"] as Rule[] }).flatMap(
          ([title, rules]) =>
            rules.map((rule) => ({
              product_id: productIds[title],
              generation_id: rule === "universal" ? null : car[rule.gen],
              variant_id: rule === "universal" || !rule.variant ? null : car[rule.variant],
            }))
        )
        await vehicles.createFitments(rows)
      })

      const titles = async (query: string) => {
        const res = await api.get(`/store/products?fields=title&limit=100&${query}`, { headers })
        return (res.data.products as { title: string }[]).map((p) => p.title).sort()
      }

      it("returns all 20 published products without a car", async () => {
        expect(await titles("")).toEqual(Object.keys(FIXTURE).sort())
      })

      it.each([
        ["Creta 2nd gen SX(O)", () => `fits_variant_id=${car.sxo}`],
        ["Creta 2nd gen E", () => `fits_variant_id=${car.e}`],
        ["Creta 2nd gen, no trim", () => `fits_generation_id=${car.creta2}`],
        ["Creta 1st gen S", () => `fits_variant_id=${car.s}`],
        ["Swift 4th gen LXi", () => `fits_variant_id=${car.lxi}`],
      ] as const)("%s: only fitting + universal products", async (label, query) => {
        expect(await titles(query())).toEqual([...EXPECTED[label]].sort())
      })

      it("keeps pagination and counts correct", async () => {
        const res = await api.get(
          `/store/products?fields=title&limit=5&fits_variant_id=${car.sxo}`,
          {
            headers,
          }
        )
        expect(res.data.count).toBe(12)
        expect(res.data.products).toHaveLength(5)
      })

      it("combines with an id filter, and returns an empty list when nothing fits", async () => {
        const both = `id[]=${productIds.U1}&id[]=${productIds.S1}&fits_variant_id=${car.sxo}`
        expect(await titles(both)).toEqual(["U1"])
        expect(await titles(`id[]=${productIds.S1}&fits_variant_id=${car.sxo}`)).toEqual([])
      })

      it("rejects an unknown trim or a trim from another generation", async () => {
        const opts = { headers, validateStatus: () => true }
        expect((await api.get("/store/products?fits_variant_id=vvar_nope", opts)).status).toBe(404)
        const mismatch = `/store/products?fits_variant_id=${car.sxo}&fits_generation_id=${car.creta1}`
        expect((await api.get(mismatch, opts)).status).toBe(400)
      })
    })
  },
})
