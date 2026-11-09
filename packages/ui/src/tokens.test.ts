import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { colors, contrast, textPairs, uiPairs } from "./tokens"

describe("brand colour contrast (WCAG 2.1 AA)", () => {
  it.each(textPairs)("text %s on %s is at least 4.5:1", (fg, bg) => {
    expect(contrast(colors[fg].hex, colors[bg].hex)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(uiPairs)("UI %s on %s is at least 3:1", (fg, bg) => {
    expect(contrast(colors[fg].hex, colors[bg].hex)).toBeGreaterThanOrEqual(3)
  })

  it("catches the known failure: Fit Green text on its own 10% tint over cream", () => {
    // `text-fit bg-fit/10` on the cream page (found in Phase 0) must stay flagged.
    const blend = (fg: string, bg: string, alpha: number) =>
      "#" +
      [1, 3, 5]
        .map((i) => {
          const f = parseInt(fg.slice(i, i + 2), 16)
          const b = parseInt(bg.slice(i, i + 2), 16)
          return Math.round(f * alpha + b * (1 - alpha))
            .toString(16)
            .padStart(2, "0")
        })
        .join("")
    const tint = blend(colors.fit.hex, colors.cream.hex, 0.1)
    expect(contrast(colors.fit.hex, tint)).toBeLessThan(4.5)
  })
})

describe("theme.css matches tokens.ts", () => {
  const css = readFileSync(path.join(__dirname, "styles/theme.css"), "utf8")
  const declared = Object.fromEntries(
    [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [
      m[1],
      m[2].toUpperCase(),
    ])
  )

  it("declares exactly the token colours", () => {
    expect(Object.keys(declared).sort()).toEqual(Object.keys(colors).sort())
  })

  it.each(Object.entries(colors))("--color-%s has the token value", (name, { hex }) => {
    expect(declared[name]).toBe(hex)
  })
})
