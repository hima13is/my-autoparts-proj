import { cookies } from "next/headers"
import { connection, NextResponse, type NextRequest } from "next/server"
import { CAR_COOKIE, decodeCarCookie } from "@/lib/car-cookie"
import { carSearchKeys, normaliseQuery, searchSuggestions } from "@/lib/search"

/** GET /api/search?q=… → up to 6 suggestions for the header search, for the shopper's car. */
export async function GET(request: NextRequest) {
  await connection()
  const q = normaliseQuery(request.nextUrl.searchParams.get("q"))
  const car = decodeCarCookie((await cookies()).get(CAR_COOKIE)?.value)
  try {
    const suggestions = await searchSuggestions(q, carSearchKeys(car))
    return NextResponse.json({ suggestions })
  } catch {
    // Suggestions are a nice-to-have: the search page still works without them.
    return NextResponse.json({ suggestions: [] })
  }
}
