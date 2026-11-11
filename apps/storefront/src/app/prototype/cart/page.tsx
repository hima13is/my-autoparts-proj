import type { Metadata } from "next"
import { CartView } from "@/prototype/cart-view"

export const metadata: Metadata = { title: "Cart" }

export default function CartPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:px-6">
      <h1 className="font-heading text-3xl font-bold text-ink">Your cart</h1>
      <CartView />
    </div>
  )
}
