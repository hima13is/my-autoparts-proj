import { readFileSync } from "node:fs"
import path from "node:path"
import { expect, test } from "@playwright/test"

// One screenshot per Storybook story, taken from the built Storybook's own index,
// so new stories are covered automatically.
interface IndexEntry {
  id: string
  type: "story" | "docs"
  title: string
  name: string
}

const index = JSON.parse(
  readFileSync(path.join(__dirname, "../storybook-static/index.json"), "utf8")
) as { entries: Record<string, IndexEntry> }

const stories = Object.values(index.entries).filter((e) => e.type === "story")

test("the Storybook index has stories", () => {
  expect(stories.length).toBeGreaterThan(40)
})

for (const story of stories) {
  test(`${story.title} › ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`)
    await page.locator("#storybook-root").waitFor()
    await page.evaluate(() => document.fonts.ready)
    // Let play functions (interaction tests) finish before the screenshot.
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true })
  })
}
