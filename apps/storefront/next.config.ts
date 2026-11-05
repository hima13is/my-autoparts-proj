import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Shared workspace package ships TypeScript source; let Next compile it.
  transpilePackages: ["@autoparts/shared"],
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
