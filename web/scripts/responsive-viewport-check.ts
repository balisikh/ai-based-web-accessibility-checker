/**
 * Check home and batch for document-level horizontal overflow at standard viewport widths.
 * Requires running app: npm run build && npm run start (or dev)
 * Run: npm run test:responsive
 */
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL ?? "http://127.0.0.1:4376").replace(/\/$/, "");
const WIDTHS = [320, 390, 768, 1024, 1280] as const;
const PATHS = ["/", "/batch"] as const;

async function waitForServer(maxMs = 90_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return;
    } catch {
      /* server starting */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Server not ready at ${BASE} — run npm run start first`);
}

async function main(): Promise<void> {
  await waitForServer();

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });

  let failures = 0;

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
    });
    const page = await context.newPage();

    for (const path of PATHS) {
      await page.goto(`${BASE}${path}`, {
        waitUntil: "networkidle",
        timeout: 60_000,
      });

      const sizes = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      if (sizes.scrollWidth > sizes.clientWidth + 2) {
        console.error(
          `FAIL ${width}px ${path}: horizontal overflow (scroll ${sizes.scrollWidth} > client ${sizes.clientWidth})`,
        );
        failures += 1;
      } else {
        console.log(`OK ${width}px ${path}`);
      }
    }

    await context.close();
  }

  await browser.close();

  if (failures > 0) {
    process.exit(1);
  }

  console.log(`responsive-viewport OK — ${WIDTHS.length} widths × ${PATHS.length} routes`);
}

main().catch((error) => {
  console.error("responsive-viewport FAIL:", error instanceof Error ? error.message : error);
  process.exit(1);
});
