// Generates every FitGaadi logo file from one source (docs/PLAN.md §1.3):
//   lowercase "fitgaadi" in Bricolage Grotesque Bold, where the dot of the
//   "i" in "fit" becomes a check mark inside a tyre-like ring.
//
// Outputs (commit them; re-run with `pnpm --filter @autoparts/ui logo`):
//   packages/ui/src/logo/paths.ts           path data for the <Logo>/<LogoMark> components
//   packages/ui/assets/logo/*.svg           wordmark (light/dark), icon
//   apps/storefront/src/app/icon.svg        favicon (modern browsers)
//   apps/storefront/src/app/favicon.ico     16/32/48 px
//   apps/storefront/src/app/apple-icon.png  180 px
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import * as opentypeNs from "opentype.js"
import sharp from "sharp"

const opentype = opentypeNs.default ?? opentypeNs
const here = path.dirname(fileURLToPath(import.meta.url))
const ui = path.resolve(here, "..")
const storefrontApp = path.resolve(ui, "../../apps/storefront/src/app")

const C = { ink: "#0E3B43", marigold: "#F2A93B", cream: "#FAF7F2" }

const fontFile = path.join(
  ui,
  "node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff"
)
const buf = readFileSync(fontFile)
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))

// ---- Wordmark geometry -----------------------------------------------------
const SIZE = 100
const BASELINE = 100
const TEXT = "fitgaadi"
// Lay glyphs out by hand (advance width + kerning): opentype.js can't run this
// font's contextual-substitution tables, and the wordmark needs none of them.
const scale = SIZE / font.unitsPerEm
const glyphs = [...TEXT].map((ch) => font.charToGlyph(ch))
let penX = 0
const glyphPaths = glyphs.map((g, i) => {
  const p = g.getPath(penX, BASELINE, SIZE)
  const next = glyphs[i + 1]
  penX += (g.advanceWidth + (next ? font.getKerningValue(g, next) : 0)) * scale
  return p
})

/** Split an opentype Path into contours (each starts with M). */
function contours(p) {
  const out = []
  for (const cmd of p.commands) {
    if (cmd.type === "M") out.push([])
    out[out.length - 1].push(cmd)
  }
  return out
}
function bbox(cmds) {
  const xs = []
  const ys = []
  for (const c of cmds) for (const k of ["x", "x1", "x2"]) if (c[k] !== undefined) xs.push(c[k])
  for (const c of cmds) for (const k of ["y", "y1", "y2"]) if (c[k] !== undefined) ys.push(c[k])
  return { x1: Math.min(...xs), x2: Math.max(...xs), y1: Math.min(...ys), y2: Math.max(...ys) }
}
const r2 = (n) => Math.round(n * 100) / 100
function toD(cmds) {
  return cmds
    .map((c) => {
      switch (c.type) {
        case "M":
        case "L":
          return `${c.type}${r2(c.x)} ${r2(c.y)}`
        case "Q":
          return `Q${r2(c.x1)} ${r2(c.y1)} ${r2(c.x)} ${r2(c.y)}`
        case "C":
          return `C${r2(c.x1)} ${r2(c.y1)} ${r2(c.x2)} ${r2(c.y2)} ${r2(c.x)} ${r2(c.y)}`
        case "Z":
          return "Z"
        default:
          throw new Error(`unknown path command ${c.type}`)
      }
    })
    .join("")
}

// The first "i" (index 1): drop its dot = the contour that sits highest.
const iContours = contours(glyphPaths[1])
const tops = iContours.map((c) => bbox(c).y2)
const dotIndex = tops.indexOf(Math.min(...tops))
const dot = bbox(iContours[dotIndex])
const stem = bbox(iContours[dotIndex === 0 ? 1 : 0])
glyphPaths[1] = { commands: iContours.filter((_, i) => i !== dotIndex).flat() }

const lettersD = glyphPaths.map((p) => toD(p.commands)).join("")
const all = bbox(glyphPaths.flatMap((p) => p.commands))

// Check-tyre mark: centred on the stem, sitting where the dot was, a bit larger
// than the dot so the check stays legible at small sizes.
const cx = (stem.x1 + stem.x2) / 2
const markR = ((dot.x2 - dot.x1) / 2) * 1.32
const cy = dot.y2 - markR * 0.95 // keep the original gap above the stem
const ring = markR * 0.24
const check = (x, y, r) =>
  `M${r2(x - 0.42 * r)} ${r2(y + 0.02 * r)}L${r2(x - 0.12 * r)} ${r2(y + 0.32 * r)}L${r2(x + 0.44 * r)} ${r2(y - 0.3 * r)}`

const pad = 4
const vb = {
  x: r2(all.x1 - pad),
  y: r2(Math.min(all.y1, cy - markR) - pad),
  w: r2(all.x2 - all.x1 + pad * 2),
  h: r2(Math.max(all.y2, BASELINE) - Math.min(all.y1, cy - markR) + pad * 2),
}

const markSvg = (ringColor) =>
  `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(markR - ring / 2)}" fill="${C.marigold}" stroke="${ringColor}" stroke-width="${r2(ring)}"/>` +
  `<path d="${check(cx, cy, markR)}" fill="none" stroke="${C.ink}" stroke-width="${r2(markR * 0.2)}" stroke-linecap="round" stroke-linejoin="round"/>`

const wordmark = (textColor, ringColor) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" role="img" aria-label="fitgaadi">` +
  `<path d="${lettersD}" fill="${textColor}"/>${markSvg(ringColor)}</svg>\n`

// ---- App icon (512 grid) ---------------------------------------------------
const icon = (() => {
  const s = 512
  const r = 150
  const ringW = 46
  const c = s / 2
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" role="img" aria-label="FitGaadi">` +
    `<rect width="${s}" height="${s}" rx="112" fill="${C.ink}"/>` +
    `<circle cx="${c}" cy="${c}" r="${r - ringW / 2}" fill="${C.marigold}" stroke="${C.cream}" stroke-width="${ringW}"/>` +
    `<path d="${check(c, c, r)}" fill="none" stroke="${C.ink}" stroke-width="${r * 0.2}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `</svg>\n`
  )
})()

// ---- Write files -----------------------------------------------------------
const assets = path.join(ui, "assets/logo")
mkdirSync(assets, { recursive: true })
writeFileSync(path.join(assets, "fitgaadi-wordmark.svg"), wordmark(C.ink, C.ink))
writeFileSync(path.join(assets, "fitgaadi-wordmark-on-dark.svg"), wordmark(C.cream, C.cream))
writeFileSync(path.join(assets, "fitgaadi-icon.svg"), icon)

mkdirSync(path.join(ui, "src/logo"), { recursive: true })
writeFileSync(
  path.join(ui, "src/logo/paths.ts"),
  `// Generated by scripts/build-logo.mjs. Do not edit by hand.\n` +
    `export const wordmark = ${JSON.stringify(
      {
        viewBox: `${vb.x} ${vb.y} ${vb.w} ${vb.h}`,
        letters: lettersD,
        mark: { cx: r2(cx), cy: r2(cy), r: r2(markR - ring / 2), ring: r2(ring) },
        check: check(cx, cy, markR),
        checkWidth: r2(markR * 0.2),
      },
      null,
      2
    )} as const\n`
)

writeFileSync(path.join(storefrontApp, "icon.svg"), icon)
await sharp(Buffer.from(icon))
  .resize(180, 180)
  .png()
  .toFile(path.join(storefrontApp, "apple-icon.png"))

// favicon.ico: an ICO container holding PNG images (supported by all current browsers).
const sizes = [16, 32, 48]
const pngs = await Promise.all(
  sizes.map((s) => sharp(Buffer.from(icon)).resize(s, s).png().toBuffer())
)
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(sizes.length, 4)
let offset = 6 + 16 * sizes.length
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(sizes[i], 0)
  e.writeUInt8(sizes[i], 1)
  e.writeUInt16LE(1, 4) // colour planes
  e.writeUInt16LE(32, 6) // bits per pixel
  e.writeUInt32LE(png.length, 8)
  e.writeUInt32LE(offset, 12)
  offset += png.length
  return e
})
writeFileSync(path.join(storefrontApp, "favicon.ico"), Buffer.concat([header, ...entries, ...pngs]))

// Preview PNGs for the brand sheet / PR.
await sharp(Buffer.from(wordmark(C.ink, C.ink)), { density: 400 })
  .resize({ width: 1200 })
  .flatten({ background: C.cream })
  .png()
  .toFile(path.join(assets, "fitgaadi-wordmark.png"))
await sharp(Buffer.from(icon)).resize(512, 512).png().toFile(path.join(assets, "fitgaadi-icon.png"))

console.log(`logo built: viewBox ${vb.x} ${vb.y} ${vb.w} ${vb.h}, mark r=${r2(markR)}`)
