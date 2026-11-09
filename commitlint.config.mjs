// Enforces Conventional Commits, e.g. "feat(storefront): add vehicle selector".
export default {
  extends: ["@commitlint/config-conventional"],
  // Dependabot writes "chore(deps): Bump x from 1 to 2" with long bodies; don't fail its PRs.
  ignores: [(message) => message.includes("Signed-off-by: dependabot[bot]")],
  rules: {
    "scope-enum": [
      1,
      "always",
      ["storefront", "backend", "ui", "shared", "infra", "ci", "docs", "deps", "e2e"],
    ],
  },
}
