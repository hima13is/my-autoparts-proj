import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { formatINR } from "@autoparts/shared"
import { buttonClasses } from "@autoparts/ui"
import { BackendStatusBadge, BackendStatusFallback } from "@/components/backend-status"

export const metadata: Metadata = {
  title: "System status · FitGaadi",
  robots: { index: false, follow: false },
}

/** Build Phase 0 skeleton page, kept as a status check: storefront up, backend reachable. */
export default function StatusPage() {
  return (
    <main id="main" className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-5 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-teal-600">System status</p>

      <h1 className="font-heading text-4xl font-bold leading-tight text-ink sm:text-5xl">
        Hello fit<span className="text-teal-600">gaadi</span>
      </h1>

      <p className="max-w-prose text-lg">
        Car &amp; SUV accessories that actually fit your car. <em>Sahi fit. Seedha ghar.</em>
      </p>

      <Link href="/" className={buttonClasses({ size: "lg", className: "self-start" })}>
        Go to the shop
      </Link>

      <Suspense fallback={<BackendStatusFallback />}>
        <BackendStatusBadge />
      </Suspense>

      <section aria-labelledby="checks" className="rounded-2xl border border-sand bg-white p-6">
        <h2 id="checks" className="font-heading text-xl font-semibold text-ink">
          What this page proves
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-graphite">
          <li>The Next.js storefront builds and runs.</li>
          <li>It can reach the Medusa backend (badge above).</li>
          <li>
            Shared code works across the monorepo: <span className="font-mono">formatINR</span>{" "}
            gives <strong data-testid="price-sample">{formatINR(125000)}</strong>.
          </li>
        </ul>
      </section>
    </main>
  )
}
