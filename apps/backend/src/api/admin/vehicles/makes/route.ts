import { LEVELS, listAndCreate } from "../crud"

const handlers = listAndCreate(LEVELS.makes)

export const GET = handlers.GET
export const POST = handlers.POST
