import { LEVELS, updateAndDelete } from "../../crud"

const handlers = updateAndDelete(LEVELS.generations)

export const GET = handlers.GET
export const POST = handlers.POST
export const DELETE = handlers.DELETE
