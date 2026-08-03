import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Low-RAM machines: use 1 worker for static generation (avoids build OOM).
  experimental: {
    cpus: 1,
  },
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
