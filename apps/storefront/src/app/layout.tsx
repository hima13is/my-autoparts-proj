import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, IBM_Plex_Mono, Noto_Sans } from "next/font/google"
import { siteUrl } from "@/lib/seo"
import "./globals.css"

const heading = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] })
const body = Noto_Sans({ variable: "--font-noto", subsets: ["latin"] })
const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
})

export const metadata: Metadata = {
  // Makes the relative canonical URLs on each page absolute.
  metadataBase: new URL(siteUrl()),
  title: "FitGaadi: car accessories that fit your car",
  description:
    "Car and SUV accessories for India, matched to your exact car. Sahi fit. Seedha ghar.",
}

export const viewport: Viewport = {
  themeColor: "#0E3B43",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${heading.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream font-body text-charcoal">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-marigold focus:px-4 focus:py-2 focus:text-charcoal"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
