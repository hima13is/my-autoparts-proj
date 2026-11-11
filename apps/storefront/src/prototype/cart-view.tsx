"use client"

import { formatINR } from "@autoparts/shared"
import {
  Button,
  buttonClasses,
  Card,
  EmptyState,
  FitBadge,
  Input,
  Select,
  useToast,
} from "@autoparts/ui"
import { demoProducts, productImage } from "@autoparts/ui/fixtures"
import { ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"
import { P, useCar } from "./shell"
import { prototypeActions, usePrototypeState } from "./store"

const FREE_SHIPPING_FROM = 499
const SHIPPING_FEE = 49

export function CartView() {
  const { cart } = usePrototypeState()
  const { short } = useCar()
  const toast = useToast()

  const lines = cart
    .map((l) => ({ ...l, product: demoProducts.find((p) => p.slug === l.slug) }))
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => Boolean(l.product))

  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart />}
        title="Your cart is empty"
        action={
          <Link href={`${P}/c/seat-covers`} className={buttonClasses()}>
            Shop accessories for your car
          </Link>
        }
      >
        Pick your car and we&apos;ll show you accessories that fit it.
      </EmptyState>
    )
  }

  const items = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0)
  const mrpTotal = lines.reduce((sum, l) => sum + (l.product.mrp ?? l.product.price) * l.qty, 0)
  const shipping = items >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE
  const total = items + shipping
  const anyNoFit = short && lines.some((l) => l.product.fit === "no-fit")

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="items-title" className="flex flex-col gap-3">
        <h2 id="items-title" className="sr-only">
          Items
        </h2>
        {anyNoFit && (
          <p role="note" className="rounded-xl bg-amber-ink px-4 py-3 font-medium text-white">
            One item doesn&apos;t fit your {short}. You can still buy it, but check before you pay.
          </p>
        )}
        <ul className="flex flex-col gap-3">
          {lines.map((l) => (
            <li key={`${l.slug}-${l.colour ?? ""}`}>
              <Card className="flex gap-3">
                <img
                  src={productImage(l.product.kind)}
                  alt=""
                  className="size-24 shrink-0 rounded-xl"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Link
                    href={`${P}/p/${l.slug}`}
                    className="font-semibold leading-snug text-charcoal hover:underline"
                  >
                    {l.product.title}
                  </Link>
                  {l.colour && <p className="text-sm text-graphite">Colour: {l.colour}</p>}
                  <FitBadge status={short ? l.product.fit : "unknown"} car={short} />
                  <div className="mt-1 flex flex-wrap items-end gap-3">
                    <Select
                      className="w-32"
                      label={`Quantity for ${l.product.title}`}
                      hideLabel
                      value={String(l.qty)}
                      onChange={(e) =>
                        prototypeActions.setQty(l.slug, l.colour, Number(e.target.value))
                      }
                      options={[1, 2, 3, 4, 5].map((n) => ({
                        value: String(n),
                        label: `Qty ${n}`,
                      }))}
                    />
                    <Button
                      variant="ghost"
                      leadingIcon={<Trash2 className="size-5" />}
                      onClick={() => {
                        prototypeActions.remove(l.slug, l.colour)
                        toast.show("Removed from cart", { tone: "info" })
                      }}
                    >
                      Remove<span className="sr-only"> {l.product.title}</span>
                    </Button>
                    <p className="ml-auto font-bold">{formatINR(l.product.price * l.qty)}</p>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <aside
        aria-labelledby="summary-title"
        className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start"
      >
        <Card padding="lg" className="flex flex-col gap-4">
          <h2 id="summary-title" className="font-heading text-xl font-bold text-ink">
            Price details
          </h2>
          <dl className="grid grid-cols-[1fr_auto] gap-y-2">
            <dt>MRP</dt>
            <dd className="text-right">{formatINR(mrpTotal)}</dd>
            {mrpTotal > items && (
              <>
                <dt>Discount</dt>
                <dd className="text-right font-semibold text-fit">
                  −{formatINR(mrpTotal - items)}
                </dd>
              </>
            )}
            <dt>Shipping</dt>
            <dd className="text-right">{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
            <dt className="border-t border-sand pt-2 text-lg font-bold">Total</dt>
            <dd className="border-t border-sand pt-2 text-right text-lg font-bold">
              {formatINR(total)}
            </dd>
          </dl>
          <p className="text-sm text-graphite">
            Prices include GST. A GST invoice comes with every order.
          </p>
          <form
            className="flex items-start gap-2"
            aria-label="Apply coupon"
            onSubmit={(e) => {
              e.preventDefault()
              toast.show("Coupons arrive in Build Phase 3", { tone: "info" })
            }}
          >
            <Input className="flex-1" label="Coupon code" autoCapitalize="characters" />
            <Button type="submit" variant="outline" className="mt-7">
              Apply
            </Button>
          </form>
        </Card>
        <Button
          size="lg"
          fullWidth
          onClick={() => toast.show("Checkout arrives in Build Phase 3", { tone: "info" })}
        >
          Proceed to checkout
        </Button>
      </aside>
    </div>
  )
}
