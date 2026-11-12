import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { VEHICLE_MODULE } from "../../src/modules/vehicle"
import type VehicleModuleService from "../../src/modules/vehicle/service"
import { adminHeaders, storeHeaders } from "../helpers/auth"

jest.setTimeout(60 * 1000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Product fitment", () => {
      let admin: Record<string, string>
      let store: Record<string, string>
      const ids: Record<string, string> = {}
      const opts = (headers: Record<string, string>) => ({ headers, validateStatus: () => true })

      beforeEach(async () => {
        const container = getContainer()
        admin = await adminHeaders(container, api)
        store = await storeHeaders(container)

        const vehicles = container.resolve<VehicleModuleService>(VEHICLE_MODULE)
        const make = await vehicles.createVehicleMakes({ name: "Hyundai", slug: "hyundai" })
        const model = await vehicles.createVehicleModels({
          name: "Creta",
          slug: "creta",
          body_type: "suv",
          make_id: make.id,
        })
        const [gen1, gen2] = await vehicles.createVehicleGenerations([
          { name: "1st gen", year_from: 2015, year_to: 2019, model_id: model.id },
          { name: "2nd gen", year_from: 2020, year_to: null, model_id: model.id },
        ])
        const [sx, e, old] = await vehicles.createVehicleVariants([
          { name: "SX(O)", fuel: "diesel", transmission: "automatic", generation_id: gen2.id },
          { name: "E", fuel: "petrol", transmission: "manual", generation_id: gen2.id },
          { name: "S", fuel: "petrol", transmission: "manual", generation_id: gen1.id },
        ])

        const [seatCover, sunshade, perfume, draft] = await container
          .resolve(Modules.PRODUCT)
          .createProducts([
            { title: "Creta seat cover", status: "published" },
            { title: "SX(O) sunshade", status: "published" },
            { title: "Car perfume", status: "published" },
            { title: "Unreleased mat", status: "draft" },
          ])

        Object.assign(ids, {
          gen1: gen1.id,
          gen2: gen2.id,
          sx: sx.id,
          e: e.id,
          old: old.id,
          seatCover: seatCover.id,
          sunshade: sunshade.id,
          perfume: perfume.id,
          draft: draft.id,
        })
      })

      const addRule = (productId: string, body: Record<string, unknown>) =>
        api.post(`/admin/products/${productId}/fitment`, body, opts(admin))
      const fits = (productId: string, query: string) =>
        api.get(`/store/products/${productId}/fitment?${query}`, opts(store))

      it("maps products to cars and answers 'does it fit?'", async () => {
        expect(
          (await addRule(ids.seatCover, { generation_id: ids.gen2, notes: "Front and rear" }))
            .status
        ).toBe(201)
        expect(
          (await addRule(ids.sunshade, { generation_id: ids.gen2, variant_id: ids.sx })).status
        ).toBe(201)
        expect((await addRule(ids.perfume, {})).status).toBe(201)

        // Generation-wide: fits every 2nd-gen trim, with notes; not the 1st gen.
        const seatOnE = await fits(ids.seatCover, `variant_id=${ids.e}`)
        expect(seatOnE.data).toMatchObject({
          fits: true,
          universal: false,
          notes: ["Front and rear"],
        })
        expect((await fits(ids.seatCover, `variant_id=${ids.old}`)).data.fits).toBe(false)

        // Variant-specific: only the SX(O).
        expect((await fits(ids.sunshade, `variant_id=${ids.sx}`)).data.fits).toBe(true)
        expect((await fits(ids.sunshade, `variant_id=${ids.e}`)).data.fits).toBe(false)
        expect((await fits(ids.sunshade, `generation_id=${ids.gen2}`)).data.fits).toBe(false)

        // Universal: fits any car.
        expect((await fits(ids.perfume, `variant_id=${ids.old}`)).data).toMatchObject({
          fits: true,
          universal: true,
        })
      })

      it("lists and deletes a product's fitment rules", async () => {
        const created = await addRule(ids.seatCover, { generation_id: ids.gen2 })
        const list = await api.get(`/admin/products/${ids.seatCover}/fitment`, opts(admin))
        expect(list.data.fitments).toHaveLength(1)
        expect(list.data.fitments[0].generation.name).toBe("2nd gen")

        const fitmentId = created.data.fitment.id
        const del = await api.delete(
          `/admin/products/${ids.seatCover}/fitment/${fitmentId}`,
          opts(admin)
        )
        expect(del.status).toBe(200)
        expect((await fits(ids.seatCover, `generation_id=${ids.gen2}`)).data.fits).toBe(false)
      })

      it("rejects invalid rules", async () => {
        // Variant without its generation, and a variant from another generation.
        expect((await addRule(ids.seatCover, { variant_id: ids.sx })).status).toBe(400)
        expect(
          (await addRule(ids.seatCover, { generation_id: ids.gen1, variant_id: ids.sx })).status
        ).toBe(400)
        // Unknown product and unknown generation.
        expect((await addRule("prod_missing", { generation_id: ids.gen2 })).status).toBe(404)
        expect((await addRule(ids.seatCover, { generation_id: "vgen_missing" })).status).toBe(404)
        // Same rule twice.
        await addRule(ids.seatCover, { generation_id: ids.gen2 })
        expect((await addRule(ids.seatCover, { generation_id: ids.gen2 })).status).toBe(422)
      })

      it("lists the cars a product fits when no car is given", async () => {
        await addRule(ids.seatCover, { generation_id: ids.gen2, notes: "Front and rear" })
        await addRule(ids.sunshade, { generation_id: ids.gen2, variant_id: ids.sx })
        await addRule(ids.perfume, {})
        const seat = (await fits(ids.seatCover, "")).data
        expect(seat).toMatchObject({ universal: false })
        expect(seat.cars).toEqual([
          expect.objectContaining({
            make: "Hyundai",
            model_slug: "creta",
            generation: "2nd gen",
            year_from: 2020,
            year_to: null,
            variant: null,
            notes: "Front and rear",
          }),
        ])
        expect((await fits(ids.sunshade, "")).data.cars[0].variant).toBe("SX(O)")
        expect((await fits(ids.perfume, "")).data).toMatchObject({ universal: true, cars: [] })
      })

      it("store check only answers for published products", async () => {
        expect((await fits(ids.draft, `variant_id=${ids.e}`)).status).toBe(404)
        expect(
          (await fits(ids.seatCover, `generation_id=${ids.gen1}&variant_id=${ids.sx}`)).status
        ).toBe(400)
      })

      it("admin fitment routes are not public", async () => {
        const res = await api.get(`/admin/products/${ids.seatCover}/fitment`, {
          validateStatus: () => true,
        })
        expect(res.status).toBe(401)
      })

      it("summarises badge states for a grid in one call", async () => {
        await addRule(ids.seatCover, { generation_id: ids.gen2 })
        await addRule(ids.sunshade, { generation_id: ids.gen2, variant_id: ids.sx })
        await addRule(ids.perfume, {})
        const list = [ids.seatCover, ids.sunshade, ids.perfume]
          .map((id) => `product_id[]=${id}`)
          .join("&")
        const summary = async (car: string) =>
          (await api.get(`/store/fitment/summary?${list}${car}`, opts(store))).data.fitment

        expect(await summary(`&variant_id=${ids.e}`)).toEqual({
          [ids.seatCover]: "fits",
          [ids.sunshade]: "no-fit",
          [ids.perfume]: "universal",
        })
        expect(await summary(`&generation_id=${ids.gen1}`)).toMatchObject({
          [ids.seatCover]: "no-fit",
          [ids.perfume]: "universal",
        })
        expect(await summary("")).toEqual({
          [ids.seatCover]: "unknown",
          [ids.sunshade]: "unknown",
          [ids.perfume]: "universal",
        })
        expect((await api.get("/store/fitment/summary", opts(store))).status).toBe(400)
      })
    })
  },
})
