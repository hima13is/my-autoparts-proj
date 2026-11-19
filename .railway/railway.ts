import { defineRailway, github, project, service } from "railway/iac"
// This repository manages only its own resources in the environment. Other
// repositories export their own partial name.
// See https://docs.railway.com/infrastructure-as-code#multi-repo-projects
export const partial = "backend"
export default defineRailway(() => {
  const backend = service("backend", {
    source: github("hima13is/my-autoparts-proj", { branch: "main", checkSuites: false }),
    build: {
      buildCommand: "pnpm --filter @autoparts/backend build",
      buildEnvironment: "V3",
      builder: "RAILPACK",
      watchPatterns: ["apps/backend/**", "packages/shared/**", "pnpm-lock.yaml"],
    },
    start: "pnpm --filter @autoparts/backend start:prod",
    healthcheck: "/health",
    healthcheckTimeout: 300,
    deploy: { restartPolicyType: "ON_FAILURE", restartPolicyMaxRetries: 5 },
    replicas: { "asia-southeast1-eqsg3a": 1 },
  })

  return project("fitgaadi-staging", {
    variables: { managed: false },
    resources: [backend],
  })
})
