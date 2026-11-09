import type { Metadata } from "next"
import { PrototypeShell } from "@/prototype/shell"

export const metadata: Metadata = {
  title: { default: "Prototype · FitGaadi", template: "%s · FitGaadi prototype" },
  description: "Clickable FitGaadi prototype with demo data (Build Phase 1).",
  // Demo data: keep it out of search engines.
  robots: { index: false, follow: false },
}

export default function PrototypeLayout({ children }: LayoutProps<"/prototype">) {
  return <PrototypeShell>{children}</PrototypeShell>
}
