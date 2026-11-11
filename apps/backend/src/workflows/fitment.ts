import { emitEventStep } from "@medusajs/medusa/core-flows"
import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { VEHICLE_MODULE } from "../modules/vehicle"
import type VehicleModuleService from "../modules/vehicle/service"

/** Emitted whenever a product's fitment changes, so search can re-index that product. */
export const FITMENT_CHANGED_EVENT = "fitment.changed"

export type CreateFitmentInput = {
  product_id: string
  generation_id: string | null
  variant_id: string | null
  notes: string | null
  position: string | null
  verified: boolean
}

const createFitmentStep = createStep(
  "create-fitment",
  async (input: CreateFitmentInput, { container }) => {
    const vehicles = container.resolve<VehicleModuleService>(VEHICLE_MODULE)
    const fitment = await vehicles.createFitments(input)
    return new StepResponse(fitment, fitment.id)
  },
  async (id, { container }) => {
    if (!id) return
    await container.resolve<VehicleModuleService>(VEHICLE_MODULE).deleteFitments([id])
  }
)

const softDeleteFitmentStep = createStep(
  "soft-delete-fitment",
  async (id: string, { container }) => {
    await container.resolve<VehicleModuleService>(VEHICLE_MODULE).softDeleteFitments([id])
    return new StepResponse(id, id)
  },
  async (id, { container }) => {
    if (!id) return
    await container.resolve<VehicleModuleService>(VEHICLE_MODULE).restoreFitments([id])
  }
)

export const createFitmentWorkflow = createWorkflow(
  "create-fitment",
  (input: CreateFitmentInput) => {
    const fitment = createFitmentStep(input)
    const eventData = transform({ input }, ({ input }) => ({ product_id: input.product_id }))
    emitEventStep({ eventName: FITMENT_CHANGED_EVENT, data: eventData })
    return new WorkflowResponse(fitment)
  }
)

export const deleteFitmentWorkflow = createWorkflow(
  "delete-fitment",
  (input: { id: string; product_id: string }) => {
    const id = transform({ input }, ({ input }) => input.id)
    softDeleteFitmentStep(id)
    const eventData = transform({ input }, ({ input }) => ({ product_id: input.product_id }))
    emitEventStep({ eventName: FITMENT_CHANGED_EVENT, data: eventData })
    return new WorkflowResponse(id)
  }
)
