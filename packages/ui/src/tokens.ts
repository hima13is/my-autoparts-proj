/**
 * FitGaadi brand tokens (docs/PLAN.md §1.3). Single source of truth for:
 * - `src/styles/theme.css` (Tailwind theme; a unit test keeps both in sync)
 * - the contrast tests and the brand sheet.
 */
export const colors = {
  ink: { hex: "#0E3B43", name: "Ink Teal", use: "Header, footer, headings, primary text" },
  "teal-600": { hex: "#1D6672", name: "Teal 600", use: "Links, hover, active filters" },
  marigold: { hex: "#F2A93B", name: "Marigold", use: "Main CTA, always with charcoal text" },
  "marigold-600": { hex: "#E0922A", name: "Marigold 600", use: "CTA hover/pressed" },
  fit: { hex: "#157A41", name: "Fit Green", use: '"Fits your car", in stock' },
  "amber-ink": { hex: "#8A5A00", name: "Amber Ink", use: '"Check fitment", low stock' },
  brick: { hex: "#B42318", name: "Brick", use: 'Errors, "Doesn\'t fit"' },
  cream: { hex: "#FAF7F2", name: "Chai Cream", use: "Page background" },
  white: { hex: "#FFFFFF", name: "White", use: "Cards, inputs" },
  sand: { hex: "#E5E0D8", name: "Sand", use: "Dividers, card borders" },
  stone: { hex: "#8C8478", name: "Stone", use: "Input borders, control outlines (3:1)" },
  charcoal: { hex: "#1A1A1A", name: "Charcoal", use: "Body text" },
  graphite: { hex: "#5C5C5C", name: "Graphite", use: "Secondary text" },
} as const

export type ColorToken = keyof typeof colors

/** Text/background pairs the components actually use. Each must pass WCAG AA (4.5:1). */
export const textPairs: ReadonlyArray<[fg: ColorToken, bg: ColorToken]> = [
  ["charcoal", "cream"],
  ["charcoal", "white"],
  ["ink", "cream"],
  ["ink", "white"],
  ["teal-600", "white"],
  ["teal-600", "cream"],
  ["graphite", "white"],
  ["graphite", "cream"],
  ["charcoal", "marigold"],
  ["charcoal", "marigold-600"],
  ["white", "ink"],
  ["cream", "ink"],
  ["white", "fit"],
  ["white", "brick"],
  ["white", "amber-ink"],
  ["white", "teal-600"],
  ["fit", "white"],
  ["brick", "white"],
  ["amber-ink", "white"],
]

/** Non-text UI pairs (borders of inputs, focus rings): WCAG 1.4.11 needs 3:1. */
export const uiPairs: ReadonlyArray<[fg: ColorToken, bg: ColorToken]> = [
  ["stone", "white"],
  ["stone", "cream"],
  ["ink", "cream"],
  ["ink", "white"],
  ["marigold", "ink"],
]

export const fonts = {
  heading: { family: "Bricolage Grotesque", use: "Headings" },
  body: { family: "Noto Sans", use: "Body and UI (has matching Devanagari)" },
  mono: { family: "IBM Plex Mono", use: "Part numbers and specs, sparingly" },
} as const

/** WCAG 2.x relative luminance of an sRGB hex colour. */
export function luminance(hex: string): number {
  const n = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio between two hex colours (1–21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
