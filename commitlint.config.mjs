// Enforces Conventional Commits, e.g. "feat(storefront): add vehicle selector".
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [
      1,
      "always",
      ["storefront", "backend", "ui", "shared", "infra", "ci", "docs", "deps", "e2e"],
    ],
  },
}
