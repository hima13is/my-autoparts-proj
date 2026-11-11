import { CarFront, Droplets, Lightbulb, ShieldCheck, Sparkles, Video } from "lucide-react"
import { FitBadge } from "../components/Badge"
import { Button } from "../components/Button"
import { Logo, LogoMark } from "../logo/Logo"
import { colors, contrast, fonts, type ColorToken } from "../tokens"

const swatchOrder: ColorToken[] = [
  "ink",
  "teal-600",
  "marigold",
  "fit",
  "amber-ink",
  "brick",
  "charcoal",
  "graphite",
  "stone",
  "sand",
  "cream",
  "white",
]

function bestText(hex: string) {
  const onWhite = contrast("#FFFFFF", hex)
  const onCharcoal = contrast("#1A1A1A", hex)
  return onWhite >= onCharcoal
    ? { color: "#FFFFFF", ratio: onWhite }
    : { color: "#1A1A1A", ratio: onCharcoal }
}

/** One-page brand sheet (Storybook "Brand" page; exported to docs/brand as PNG/PDF). */
export function BrandSheet() {
  return (
    <article className="mx-auto flex max-w-5xl flex-col gap-10 bg-cream p-8 text-charcoal">
      <header className="flex flex-col gap-6 rounded-card bg-ink p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo tone="dark" className="h-14 self-start" />
          <p className="font-heading text-2xl font-semibold text-cream">Sahi fit. Seedha ghar.</p>
          <p className="max-w-md text-cream">
            Car &amp; SUV accessories for India, matched to your exact car. Warm, confident,
            helpful: a trusted neighbourhood mechanic with a great shop.
          </p>
        </div>
        <LogoMark
          className="size-28 shrink-0 rounded-[28px] ring-4 ring-white/10"
          title="App icon"
        />
      </header>

      <section aria-labelledby="bs-logo" className="grid gap-4 md:grid-cols-3">
        <h2 id="bs-logo" className="font-heading text-2xl font-bold text-ink md:col-span-3">
          Logo
        </h2>
        <div className="grid place-items-center rounded-card border border-sand bg-white p-8">
          <Logo className="h-12" />
        </div>
        <div className="grid place-items-center rounded-card bg-ink p-8">
          <Logo tone="dark" className="h-12" />
        </div>
        <div className="flex items-center justify-center gap-4 rounded-card border border-sand bg-white p-8">
          <LogoMark className="size-16" title="Icon, 64px" />
          <LogoMark className="size-8" title="Icon, 32px" />
          <LogoMark className="size-4" title="Icon, 16px" />
        </div>
        <p className="text-graphite md:col-span-3">
          The dot of the “i” in <em>fit</em> is a check inside a tyre: the fit guarantee. Keep clear
          space of one check-tyre around the wordmark. Never recolour the letters Marigold or place
          it on busy photos.
        </p>
      </section>

      <section aria-labelledby="bs-colour" className="flex flex-col gap-4">
        <h2 id="bs-colour" className="font-heading text-2xl font-bold text-ink">
          Colour
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {swatchOrder.map((key) => {
            const c = colors[key]
            const t = bestText(c.hex)
            return (
              <li key={key} className="overflow-hidden rounded-card border border-sand bg-white">
                <div
                  className="flex h-20 items-end p-3"
                  style={{ background: c.hex, color: t.color }}
                >
                  <span className="font-mono text-sm font-medium">{t.ratio.toFixed(1)}:1</span>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-ink">{c.name}</p>
                  <p className="font-mono text-sm text-graphite">
                    {c.hex} · {key}
                  </p>
                  <p className="text-sm text-graphite">{c.use}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <p className="text-graphite">
          Every text pairing used in the product passes WCAG AA (checked by an automated test).
          Marigold buttons always use Charcoal text. Badges use solid fills: a brand colour on its
          own light tint fails contrast.
        </p>
      </section>

      <section aria-labelledby="bs-type" className="flex flex-col gap-4">
        <h2 id="bs-type" className="font-heading text-2xl font-bold text-ink">
          Typography
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-sand bg-white p-5">
            <p className="font-heading text-4xl font-bold text-ink">Aa</p>
            <p className="mt-2 font-semibold">{fonts.heading.family}</p>
            <p className="text-sm text-graphite">{fonts.heading.use} · Bold 700 / Semibold 600</p>
          </div>
          <div className="rounded-card border border-sand bg-white p-5">
            <p className="font-body text-4xl text-ink">Aa</p>
            <p className="mt-2 font-semibold">{fonts.body.family}</p>
            <p className="text-sm text-graphite">
              {fonts.body.use} · 16px base, 1.5 line height, never below 14px
            </p>
          </div>
          <div className="rounded-card border border-sand bg-white p-5">
            <p className="font-mono text-4xl text-ink">Aa</p>
            <p className="mt-2 font-semibold">{fonts.mono.family}</p>
            <p className="text-sm text-graphite">{fonts.mono.use} · e.g. SKU FG-SC-CRETA-21</p>
          </div>
        </div>
        <div className="rounded-card border border-sand bg-white p-6">
          <p className="font-heading text-4xl font-bold leading-tight text-ink">
            Find accessories that fit your car
          </p>
          <p className="mt-2 font-heading text-2xl font-semibold text-ink">
            Best sellers for Creta
          </p>
          <p className="mt-3 max-w-prose">
            Custom-cut leatherette seat covers for the Hyundai Creta (2020–2024). Airbag-safe
            stitching, wipe-clean finish, installs in about 45 minutes with no drilling.
          </p>
        </div>
      </section>

      <section aria-labelledby="bs-ui" className="grid gap-4 md:grid-cols-2">
        <h2 id="bs-ui" className="font-heading text-2xl font-bold text-ink md:col-span-2">
          Key UI &amp; icons
        </h2>
        <div className="flex flex-col gap-3 rounded-card border border-sand bg-white p-5">
          <div className="flex flex-wrap gap-2">
            <Button>Add to cart</Button>
            <Button variant="secondary">Check another car</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <FitBadge status="fits" car="Creta" />
            <FitBadge status="no-fit" car="Creta" />
            <FitBadge status="unknown" />
          </div>
        </div>
        <div className="flex flex-col gap-3 rounded-card border border-sand bg-white p-5">
          <ul className="flex flex-wrap gap-4 text-ink" aria-label="Icon style examples">
            {[CarFront, Video, Lightbulb, Droplets, Sparkles, ShieldCheck].map((Icon, i) => (
              <li key={i} className="grid size-12 place-items-center rounded-full bg-sand">
                <Icon aria-hidden className="size-6" strokeWidth={2} />
              </li>
            ))}
          </ul>
          <p className="text-sm text-graphite">
            Rounded 2px line icons (Lucide). 44px minimum tap target.
          </p>
        </div>
      </section>

      <section aria-labelledby="bs-voice" className="flex flex-col gap-3">
        <h2 id="bs-voice" className="font-heading text-2xl font-bold text-ink">
          Voice
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-sand bg-white p-5">
            <p className="font-semibold text-fit">Say</p>
            <ul className="mt-1 list-disc pl-5">
              <li>“Fits your Creta 2021”</li>
              <li>“Arrives Thu, 12 Nov”</li>
              <li>“Sahi fit, guaranteed” (light Hinglish in headlines only)</li>
            </ul>
          </div>
          <div className="rounded-card border border-sand bg-white p-5">
            <p className="font-semibold text-brick">Don&apos;t say</p>
            <ul className="mt-1 list-disc pl-5">
              <li>“Universal fit for all cars!!!” (unless it really is)</li>
              <li>“Fast delivery!” (give the date)</li>
              <li>“Only 2 left!” (unless true)</li>
            </ul>
          </div>
        </div>
      </section>
    </article>
  )
}
