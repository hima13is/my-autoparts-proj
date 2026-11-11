import { backendUrl } from "./backend"

/** Server-side GET to a Medusa store route, with the publishable key. Throws on non-2xx. */
export async function storeGet<T>(
  path: string,
  params: Record<string, string | string[] | number | undefined> = {},
  fetchImpl: typeof fetch = fetch
): Promise<T> {
  const url = new URL(path, backendUrl())
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue
    for (const v of Array.isArray(value) ? value : [value]) url.searchParams.append(key, String(v))
  }
  const res = await fetchImpl(url, {
    headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "" },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) throw new Error(`Medusa ${path} answered ${res.status}`)
  return (await res.json()) as T
}
