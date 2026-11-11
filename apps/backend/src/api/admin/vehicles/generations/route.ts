import { LEVELS, listAndCreate } from "../crud"

const handlers = listAndCreate(LEVELS.generations)

export const GET = handlers.GET
export const POST = handlers.POST
