import type { NextConfig } from "next";

/** Standalone output is for Docker only; Vercel uses its own Next.js deploy pipeline. */
const isVercel = Boolean(process.env.VERCEL);

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: "standalone" }),
  ...(isVercel
    ? {}
    : {
        // Low-RAM machines: use 1 worker for static generation (avoids build OOM).
        experimental: { cpus: 1 },
      }),
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
