import type { BackendStatus } from "@autoparts/shared"

/** Server-only: where the storefront reaches the Medusa backend. */
export function backendUrl(): string {
  return process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000"
}

/**
 * Pings Medusa's built-in `GET /health` endpoint.
 * Never throws: any error, timeout or non-2xx response counts as "unreachable".
 */
export async function getBackendStatus(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 3000
): Promise<BackendStatus> {
  try {
    const res = await fetchImpl(new URL("/health", baseUrl), {
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    })
    return res.ok ? "connected" : "unreachable"
  } catch {
    return "unreachable"
  }
}
