import { MedusaService } from "@medusajs/framework/utils"
import { VehicleMake } from "./models/make"
import { VehicleModel } from "./models/vehicle-model"
import { VehicleGeneration } from "./models/generation"
import { VehicleVariant } from "./models/variant"
import { Fitment } from "./models/fitment"

class VehicleModuleService extends MedusaService({
  VehicleMake,
  VehicleModel,
  VehicleGeneration,
  VehicleVariant,
  Fitment,
}) {}

export default VehicleModuleService
