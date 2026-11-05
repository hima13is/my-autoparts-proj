import { connection } from "next/server"
import { backendUrl, getBackendStatus } from "@/lib/backend"

/** Live check, run on every request (excluded from prerendering by `connection()`). */
export async function BackendStatusBadge() {
  await connection()
  const status = await getBackendStatus(backendUrl())
  const connected = status === "connected"

  return (
    <p
      data-testid="backend-status"
      data-status={status}
      className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
        // Solid fills + white text: tinted fills (e.g. bg-fit/10 + text-fit) fail AA at 4.39:1.
        connected ? "bg-fit text-white" : "bg-brick text-white"
      }`}
    >
      <span aria-hidden="true">{connected ? "✅" : "⚠️"}</span>
      Backend: {connected ? "connected" : "not reachable"}
    </p>
  )
}

export function BackendStatusFallback() {
  return (
    <p className="inline-flex w-fit items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm text-graphite">
      Checking backend…
    </p>
  )
}
