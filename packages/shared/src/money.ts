const wholeRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
})

const withPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/**
 * Formats a rupee amount the Indian way: ₹1,25,000 (lakh grouping).
 * Medusa v2 stores prices in major units (rupees), so `3499` → "₹3,499"
 * and `3499.5` → "₹3,499.50". Paise are only shown when present.
 */
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) {
    throw new RangeError(`formatINR: expected a finite number, got ${amount}`)
  }
  const isWhole = Math.round(amount * 100) % 100 === 0
  return (isWhole ? wholeRupees : withPaise).format(amount)
}

/** Percentage saved versus MRP, rounded down (never overstate a discount). */
export function discountPercent(mrp: number, price: number): number {
  if (mrp <= 0 || price >= mrp) return 0
  return Math.floor(((mrp - price) / mrp) * 100)
}
