/**
 * Crop top viewport from existing README screenshots for the portfolio PDF.
 * Does not need the app running — reads docs/screenshots/*.png.
 * Run: npm run screenshots:pdf
 */
import { chromium } from "playwright";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUT_DIR = path.resolve(process.cwd(), "..", "docs", "screenshots", "pdf");

/** Top crop height per route (px at source width). */
const CROPS: {
  src: string;
  dest: string;
  width: number;
  height: number;
}[] = [
  { src: "home-desktop.png", dest: "home-desktop.png", width: 1280, height: 920 },
  { src: "batch-desktop.png", dest: "batch-desktop.png", width: 1280, height: 1180 },
  { src: "results-desktop.png", dest: "results-desktop.png", width: 1280, height: 900 },
  { src: "home-mobile.png", dest: "home-mobile.png", width: 390, height: 780 },
];

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const srcDir = path.resolve(OUT_DIR, "..");
  await mkdir(OUT_DIR, { recursive: true });

  for (const crop of CROPS) {
    const srcPath = path.join(srcDir, crop.src);
    if (!(await fileExists(srcPath))) {
      throw new Error(`Missing ${srcPath} — run npm run screenshots first`);
    }
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const crop of CROPS) {
      const srcPath = path.join(srcDir, crop.src);
      const destPath = path.join(OUT_DIR, crop.dest);
      const srcUrl = pathToFileURL(srcPath).href;

      const html = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #e7eef2; }
  .frame {
    width: ${crop.width}px;
    height: ${crop.height}px;
    overflow: hidden;
    background: #e7eef2;
  }
  img { display: block; width: ${crop.width}px; height: auto; }
</style></head><body>
  <div class="frame" id="shot"><img src="${srcUrl}" alt="" /></div>
</body></html>`;

      const page = await browser.newPage({
        viewport: { width: crop.width, height: crop.height },
      });
      await page.setContent(html, { waitUntil: "load" });
      await page.locator("#shot").screenshot({ path: destPath });
      await page.close();
      console.log("Wrote", path.relative(process.cwd(), destPath));
    }
  } finally {
    await browser.close();
  }

  console.log("Done —", OUT_DIR);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
