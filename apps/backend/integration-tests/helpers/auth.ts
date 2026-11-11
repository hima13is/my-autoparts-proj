import type { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type Api = {
  post: (url: string, body?: unknown, config?: unknown) => Promise<{ data: any }>
}

/** Headers for store routes: a fresh publishable API key. */
export async function storeHeaders(container: MedusaContainer) {
  const [key] = await container
    .resolve(Modules.API_KEY)
    .createApiKeys([{ title: "test", type: "publishable", created_by: "test" }])
  return { "x-publishable-api-key": key.token }
}

/**
 * Headers for admin routes. Uses the real email/password flow:
 * register an auth identity, create the admin user, link the two, then log in.
 */
export async function adminHeaders(container: MedusaContainer, api: Api) {
  const email = `admin-${Date.now()}@fitgaadi.test`
  const password = "test-password-123"

  await api.post("/auth/user/emailpass/register", { email, password })
  const user = await container.resolve(Modules.USER).createUsers({ email })

  const auth = container.resolve(Modules.AUTH)
  const [identity] = await auth.listAuthIdentities({ provider_identities: { entity_id: email } })
  await auth.updateAuthIdentities({ id: identity.id, app_metadata: { user_id: user.id } })

  const { data } = await api.post("/auth/user/emailpass", { email, password })
  return { authorization: `Bearer ${data.token}` }
}

/** A "Website" sales channel plus a publishable key linked to it (what core product routes need). */
export async function storeWithChannel(container: MedusaContainer) {
  const { createSalesChannelsWorkflow, linkSalesChannelsToApiKeyWorkflow } =
    await import("@medusajs/medusa/core-flows")
  const {
    result: [channel],
  } = await createSalesChannelsWorkflow(container).run({
    input: { salesChannelsData: [{ name: "Website" }] },
  })
  const [key] = await container
    .resolve(Modules.API_KEY)
    .createApiKeys([{ title: "store", type: "publishable", created_by: "test" }])
  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: key.id, add: [channel.id] },
  })
  return { headers: { "x-publishable-api-key": key.token }, channelId: channel.id }
}
