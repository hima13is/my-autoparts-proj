import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"
import storybook from "eslint-plugin-storybook"

// eslint-config-next brings react, react-hooks and jsx-a11y rules; the Next-only
// rules below don't apply to a component library.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  ...storybook.configs["flat/recommended"],
  {
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  globalIgnores(["storybook-static/**", "test-results/**", "playwright-report/**"]),
])
