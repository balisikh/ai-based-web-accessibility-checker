import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
