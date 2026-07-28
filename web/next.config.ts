import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "@axe-core/playwright",
    "axe-core",
    "pg",
    "@electric-sql/pglite",
  ],
};

export default nextConfig;
