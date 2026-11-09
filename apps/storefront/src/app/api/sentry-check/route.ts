import { connection, type NextRequest } from "next/server"

/**
 * GET /api/sentry-check?token=…: throws on purpose so we can confirm errors reach Sentry.
 * Returns 404 unless SENTRY_CHECK_TOKEN is set and matches, so the public can't trigger it.
 */
export async function GET(request: NextRequest) {
  // Always run at request time: without this, a build with no token set would
  // prerender the 404 and the token would never be checked.
  await connection()
  const expected = process.env.SENTRY_CHECK_TOKEN
  if (!expected || request.nextUrl.searchParams.get("token") !== expected) {
    return new Response("Not found", { status: 404 })
  }
  throw new Error("Sentry check: deliberate storefront error")
}
