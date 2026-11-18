import type { MedusaRequest } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { VEHICLE_MODULE } from "../../../modules/vehicle"
import type VehicleModuleService from "../../../modules/vehicle/service"

export const vehicleService = (req: MedusaRequest) =>
  req.scope.resolve<VehicleModuleService>(VEHICLE_MODULE)

export const currentYear = () => new Date().getFullYear()

const yearSchema = z.coerce.number().int().min(1950).max(2100)

/** Parse a `year` query parameter, or throw a 400 with a clear message. */
export function parseYear(value: unknown): number {
  const parsed = yearSchema.safeParse(value)
  if (!parsed.success) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "`year` must be a 4-digit year.")
  }
  return parsed.data
}

export function requireParam(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `\`${name}\` is required.`)
  }
  return value.trim()
}

export function notFound(what: string): never {
  throw new MedusaError(MedusaError.Types.NOT_FOUND, `${what} not found.`)
}

export const MAKE_FIELDS = ["id", "name", "slug", "logo_url"]
export const MODEL_FIELDS = ["id", "name", "slug", "body_type", "make_id"]
export const GENERATION_FIELDS = ["id", "name", "year_from", "year_to", "model_id"]
export const VARIANT_FIELDS = ["id", "name", "fuel", "transmission", "seats", "generation_id"]
