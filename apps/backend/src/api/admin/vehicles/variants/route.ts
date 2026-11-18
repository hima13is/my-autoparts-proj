import { LEVELS, listAndCreate } from "../crud"

const handlers = listAndCreate(LEVELS.variants)

export const GET = handlers.GET
export const POST = handlers.POST
