import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Workspace packages ship TypeScript source; let Next compile them.
  transpilePackages: ["@autoparts/shared", "@autoparts/ui"],
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
