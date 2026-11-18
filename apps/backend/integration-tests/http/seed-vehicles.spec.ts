import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { seedVehicles } from "../../src/data/seed-vehicles"
import { VEHICLES } from "../../src/data/vehicles"
import { VEHICLE_MODULE } from "../../src/modules/vehicle"
import type VehicleModuleService from "../../src/modules/vehicle/service"
import { storeHeaders } from "../helpers/auth"

jest.setTimeout(120 * 1000)

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("Launch car list seed", () => {
      it("loads every car, is safe to run again, and keeps admin edits", async () => {
        const vehicles = getContainer().resolve<VehicleModuleService>(VEHICLE_MODULE)

        const first = await seedVehicles(vehicles, VEHICLES)
        expect(first.makes).toBe(VEHICLES.length)
        expect(first.models).toBe(VEHICLES.flatMap((m) => m.models).length)

        // An admin fixes a variant name; a second run must not undo it or duplicate rows.
        const [variant] = await vehicles.listVehicleVariants({}, { take: 1 })
        await vehicles.updateVehicleVariants({ id: variant.id, name: "Edited in admin" })

        const second = await seedVehicles(vehicles, VEHICLES)
        expect(second).toEqual({ makes: 0, models: 0, generations: 0, variants: 0 })
        const [edited] = await vehicles.listVehicleVariants({ id: variant.id })
        expect(edited.name).toBe("Edited in admin")
      })

      it("serves a real car through the store API: Hyundai Creta 2021 → 2nd gen", async () => {
        await seedVehicles(getContainer().resolve<VehicleModuleService>(VEHICLE_MODULE), VEHICLES)
        const headers = await storeHeaders(getContainer())
        const res = await api.get("/store/vehicles/resolve?make=hyundai&model=creta&year=2021", {
          headers,
        })
        expect(res.data.generation).toMatchObject({ name: "2nd gen", year_from: 2020 })
      })
    })
  },
})
