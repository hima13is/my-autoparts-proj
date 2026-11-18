import { connection, NextResponse, type NextRequest } from "next/server"
import { getDeliveryEstimate, normalisePincode } from "@/lib/delivery"

/** GET /api/delivery?pincode=110001 → `{ estimate }` for the product page's delivery check. */
export async function GET(request: NextRequest) {
  await connection()
  const pincode = normalisePincode(request.nextUrl.searchParams.get("pincode"))
  if (!pincode) return NextResponse.json({ error: "Enter a 6-digit PIN code." }, { status: 400 })
  try {
    return NextResponse.json({ estimate: await getDeliveryEstimate(pincode) })
  } catch {
    return NextResponse.json(
      { error: "We couldn't check delivery right now. Please try again." },
      { status: 502 }
    )
  }
}
