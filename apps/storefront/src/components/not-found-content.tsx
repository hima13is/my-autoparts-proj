import { buttonClasses } from "@autoparts/ui"
import { CarFront } from "lucide-react"
import Link from "next/link"

/** Branded 404: say what happened and offer the main ways back in. */
export function NotFoundContent() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
      <CarFront aria-hidden className="size-12 text-ink" />
      <p className="font-mono text-sm uppercase tracking-widest text-graphite">Error 404</p>
      <h1 className="font-heading text-3xl font-bold text-ink">We couldn&apos;t find that page</h1>
      <p className="max-w-prose text-graphite">
        The link may be old, or the product may have been removed. Let&apos;s get you back on the
        road.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses({ size: "lg" })}>
          Go to the home page
        </Link>
        <Link href="/c/interior" className={buttonClasses({ size: "lg", variant: "outline" })}>
          Browse accessories
        </Link>
      </div>
    </div>
  )
}
