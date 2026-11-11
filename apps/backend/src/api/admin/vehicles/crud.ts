import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "@medusajs/framework/zod"
import { slugify } from "../../../lib/fitment"
import { VEHICLE_MODULE } from "../../../modules/vehicle"
import type VehicleModuleService from "../../../modules/vehicle/service"
import { BODY_TYPES } from "../../../modules/vehicle/models/vehicle-model"
import { FUEL_TYPES, TRANSMISSIONS } from "../../../modules/vehicle/models/variant"

/**
 * Admin CRUD for the car tree. Every level gets the same five handlers, so they are
 * generated from one config per level instead of being written out four times.
 */

const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes.")
const year = z.number().int().min(1950).max(2100)

const withYearCheck = <T extends z.ZodType<{ year_from?: number; year_to?: number | null }>>(
  s: T
) =>
  s.refine((g) => g.year_to == null || g.year_from == null || g.year_to >= g.year_from, {
    message: "`year_to` must be on or after `year_from`.",
    path: ["year_to"],
  })

type Level = {
  /** Response key, e.g. "make" / "makes". */
  one: string
  many: string
  /** Service method suffix, e.g. "VehicleMakes". */
  entity: string
  create: z.ZodType<Record<string, unknown>>
  update: z.ZodType<Record<string, unknown>>
  /** Query param that filters the list by parent, e.g. `make_id`. */
  parentKey?: string
  /** Parent level, checked on create so a bad ID is a 404, not a database error. */
  parent?: { entity: string; label: string }
  /** Child level that blocks deletion while rows exist. */
  child?: { entity: string; key: string; label: string }
  /** Fill derived fields (slug from name) before saving. */
  prepare?: (data: Record<string, unknown>) => Record<string, unknown>
}

const makeFields = {
  name: z.string().trim().min(1),
  slug: slug.optional(),
  logo_url: z.url().nullish(),
}
const modelFields = {
  name: z.string().trim().min(1),
  slug: slug.optional(),
  body_type: z.enum(BODY_TYPES),
}
const generationFields = {
  name: z.string().trim().min(1),
  year_from: year,
  year_to: year.nullish(),
}
const variantFields = {
  name: z.string().trim().min(1),
  fuel: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  seats: z.number().int().min(1).max(12).nullish(),
}

const fillSlug = (data: Record<string, unknown>) =>
  typeof data.name === "string" && !data.slug ? { ...data, slug: slugify(data.name) } : data

export const LEVELS = {
  makes: {
    one: "make",
    many: "makes",
    entity: "VehicleMakes",
    create: z.object(makeFields).strict(),
    update: z.object(makeFields).partial().strict(),
    child: { entity: "VehicleModels", key: "make_id", label: "models" },
    prepare: fillSlug,
  },
  models: {
    one: "model",
    many: "models",
    entity: "VehicleModels",
    parentKey: "make_id",
    parent: { entity: "VehicleMakes", label: "make" },
    create: z.object({ ...modelFields, make_id: z.string().min(1) }).strict(),
    update: z.object(modelFields).partial().strict(),
    child: { entity: "VehicleGenerations", key: "model_id", label: "generations" },
    prepare: fillSlug,
  },
  generations: {
    one: "generation",
    many: "generations",
    entity: "VehicleGenerations",
    parentKey: "model_id",
    parent: { entity: "VehicleModels", label: "model" },
    create: withYearCheck(z.object({ ...generationFields, model_id: z.string().min(1) }).strict()),
    update: withYearCheck(z.object(generationFields).partial().strict()),
    child: { entity: "VehicleVariants", key: "generation_id", label: "variants" },
  },
  variants: {
    one: "variant",
    many: "variants",
    entity: "VehicleVariants",
    parentKey: "generation_id",
    parent: { entity: "VehicleGenerations", label: "generation" },
    create: z.object({ ...variantFields, generation_id: z.string().min(1) }).strict(),
    update: z.object(variantFields).partial().strict(),
  },
} satisfies Record<string, Level>

// The generated MedusaService methods share one shape per entity; index them by name.
type AnyService = Record<string, (...args: unknown[]) => Promise<any>>
const service = (req: MedusaRequest) =>
  req.scope.resolve<VehicleModuleService>(VEHICLE_MODULE) as unknown as AnyService

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body ?? {})
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const where = issue.path.length ? `${issue.path.join(".")}: ` : ""
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `${where}${issue.message}`)
  }
  return parsed.data
}

async function retrieveOr404(svc: AnyService, level: Level, id: string) {
  const [row] = await svc[`list${level.entity}`]({ id })
  if (!row) throw new MedusaError(MedusaError.Types.NOT_FOUND, `The ${level.one} was not found.`)
  return row
}

/** Turn a unique-index clash into a clear 422 (Medusa's duplicate status) instead of a 500. */
async function saving<T>(level: Level, work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (e) {
    const message = String((e as Error)?.message ?? "")
    if (/already exists|unique/i.test(message)) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        `A ${level.one} with this slug already exists.`
      )
    }
    throw e
  }
}

export function listAndCreate(level: Level) {
  return {
    GET: async (req: MedusaRequest, res: MedusaResponse) => {
      const filters: Record<string, unknown> = {}
      const parentId = level.parentKey ? req.query[level.parentKey] : undefined
      if (typeof parentId === "string") filters[level.parentKey!] = parentId
      const rows = await service(req)[`list${level.entity}`](filters, { order: { name: "ASC" } })
      res.json({ [level.many]: rows })
    },
    POST: async (req: MedusaRequest, res: MedusaResponse) => {
      let data = parseBody(level.create, req.body)
      data = level.prepare?.(data) ?? data
      const svc = service(req)
      if (level.parent) {
        const [parent] = await svc[`list${level.parent.entity}`]({ id: data[level.parentKey!] })
        if (!parent) {
          throw new MedusaError(
            MedusaError.Types.NOT_FOUND,
            `The ${level.parent.label} was not found.`
          )
        }
      }
      const row = await saving(level, () => svc[`create${level.entity}`](data))
      res.status(201).json({ [level.one]: row })
    },
  }
}

export function updateAndDelete(level: Level) {
  return {
    GET: async (req: MedusaRequest, res: MedusaResponse) => {
      res.json({ [level.one]: await retrieveOr404(service(req), level, req.params.id) })
    },
    POST: async (req: MedusaRequest, res: MedusaResponse) => {
      const svc = service(req)
      await retrieveOr404(svc, level, req.params.id)
      const data = parseBody(level.update, req.body)
      const row = await saving(level, () =>
        svc[`update${level.entity}`]({ id: req.params.id, ...data })
      )
      res.json({ [level.one]: row })
    },
    DELETE: async (req: MedusaRequest, res: MedusaResponse) => {
      const svc = service(req)
      await retrieveOr404(svc, level, req.params.id)
      if (level.child) {
        const children = await svc[`list${level.child.entity}`](
          { [level.child.key]: req.params.id },
          { take: 1, select: ["id"] }
        )
        if (children.length) {
          throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            `Delete this ${level.one}'s ${level.child.label} first.`
          )
        }
      }
      await svc[`softDelete${level.entity}`]([req.params.id])
      res.json({ id: req.params.id, object: level.one, deleted: true })
    },
  }
}
