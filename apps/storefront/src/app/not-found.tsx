import type { Metadata } from "next"
import { NotFoundContent } from "@/components/not-found-content"

export const metadata: Metadata = { title: "Page not found · FitGaadi" }

/** Unknown URLs anywhere on the site. */
export default function NotFound() {
  return (
    <main id="main" className="flex-1">
      <NotFoundContent />
    </main>
  )
}
