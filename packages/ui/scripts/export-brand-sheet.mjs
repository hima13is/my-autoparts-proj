// Exports the Storybook "Brand / Brand sheet" story to docs/brand/brand-sheet.{png,pdf}.
// Run after `pnpm build:storybook`:  node scripts/export-brand-sheet.mjs
import { spawn } from "node:child_process"
import { mkdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const ui = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const out = path.resolve(ui, "../../docs/brand")
mkdirSync(out, { recursive: true })

const port = 6010
const server = spawn(process.execPath, [path.join(ui, "e2e/serve.mjs")], {
  env: { ...process.env, PORT: String(port) },
  stdio: "ignore",
})
await new Promise((r) => setTimeout(r, 800))

try {
  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1100, height: 900 },
    deviceScaleFactor: 2,
  })
  await page.goto(`http://localhost:${port}/iframe.html?id=brand-brand-sheet--sheet&viewMode=story`)
  await page.locator("#storybook-root article").waitFor()
  await page.evaluate(() => document.fonts.ready)
  await page
    .locator("#storybook-root article")
    .screenshot({ path: path.join(out, "brand-sheet.png") })
  await page.emulateMedia({ media: "screen" })
  await page.pdf({
    path: path.join(out, "brand-sheet.pdf"),
    width: "1100px",
    printBackground: true,
    margin: { top: "0", bottom: "0", left: "0", right: "0" },
  })
  await browser.close()
  console.log(`brand sheet written to ${out}`)
} finally {
  server.kill()
}
