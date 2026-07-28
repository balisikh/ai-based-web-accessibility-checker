/**
 * Capture README demo screenshots. Requires app running (npm run dev or npm run start).
 * Run: npm run screenshots
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { THEME_STORAGE_KEY } from "../src/lib/theme";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:4376").replace(/\/$/, "");
const OUT_DIR = path.resolve(process.cwd(), "..", "docs", "screenshots");

const SHOTS: { file: string; path: string; width: number; fullPage?: boolean }[] = [
  { file: "home-desktop.png", path: "/", width: 1280, fullPage: true },
  { file: "batch-desktop.png", path: "/batch", width: 1280, fullPage: true },
  { file: "results-desktop.png", path: "/fixtures/results", width: 1280, fullPage: true },
  { file: "home-mobile.png", path: "/", width: 390, fullPage: true },
];

async function waitForServer(maxMs = 60_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`App not reachable at ${BASE} — run npm run dev first`);
}

async function main(): Promise<void> {
  await waitForServer();
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  for (const shot of SHOTS) {
    const context = await browser.newContext({
      viewport: { width: shot.width, height: 900 },
    });
    const page = await context.newPage();
    await page.addInitScript(
      ({ key }) => {
        localStorage.setItem(key, "light");
        document.documentElement.setAttribute("data-theme", "light");
      },
      { key: THEME_STORAGE_KEY },
    );
    await page.goto(`${BASE}${shot.path}`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(OUT_DIR, shot.file),
      fullPage: shot.fullPage ?? false,
    });
    console.log("Wrote", shot.file);
    await context.close();
  }
  await browser.close();
  console.log("Done —", OUT_DIR);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
