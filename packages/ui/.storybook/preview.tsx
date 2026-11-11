import type { Preview } from "@storybook/react-vite"
import "./storybook.css"

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { matchers: { color: /(background|color)$/i } },
    // Every story is also a test (pnpm test:storybook): any axe violation fails it.
    a11y: {
      test: "error",
      options: { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } },
    },
    viewport: {
      options: {
        mobile360: { name: "Small phone (360)", styles: { width: "360px", height: "740px" } },
        mobile390: { name: "Phone (390)", styles: { width: "390px", height: "844px" } },
        tablet768: { name: "Tablet (768)", styles: { width: "768px", height: "1024px" } },
        desktop1440: { name: "Desktop (1440)", styles: { width: "1440px", height: "900px" } },
      },
    },
    options: {
      storySort: { order: ["Brand", "Foundations", "Components", "Patterns"] },
    },
  },
}

export default preview
