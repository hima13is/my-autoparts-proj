import { describe, expect, it, vi } from "vitest"
import { getBackendStatus } from "../backend"

describe("getBackendStatus", () => {
  it("is 'connected' when /health returns 200", async () => {
    const okFetch = vi.fn(async () => new Response("OK", { status: 200 }))
    await expect(getBackendStatus("http://api.test", okFetch)).resolves.toBe("connected")
    expect(okFetch).toHaveBeenCalledWith(new URL("http://api.test/health"), expect.anything())
  })

  it("is 'unreachable' on a non-2xx response", async () => {
    const fail = vi.fn(async () => new Response("down", { status: 503 }))
    await expect(getBackendStatus("http://api.test", fail)).resolves.toBe("unreachable")
  })

  it("is 'unreachable' when the network call throws", async () => {
    const boom = vi.fn(async (): Promise<Response> => {
      throw new TypeError("fetch failed")
    })
    await expect(getBackendStatus("http://api.test", boom)).resolves.toBe("unreachable")
  })
})
