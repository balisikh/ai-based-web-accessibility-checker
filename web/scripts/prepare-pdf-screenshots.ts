/**
 * Crop viewport regions from README screenshots for the portfolio PDF.
 * Does not need the app running — reads docs/screenshots/*.png.
 * Run: npm run screenshots:pdf
 */
import sharp from "sharp";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.resolve(process.cwd(), "..", "docs", "screenshots", "pdf");

/** Crop per route. scrollTop skips the hero for “complete page” shots. */
const CROPS: {
  src: string;
  dest: string;
  width: number;
  height: number;
  scrollTop?: number;
}[] = [
  { src: "home-desktop.png", dest: "home-desktop.png", width: 1280, height: 920 },
  {
    src: "home-desktop.png",
    dest: "home-desktop-complete.png",
    width: 1280,
    height: 1320,
    scrollTop: 780,
  },
  { src: "batch-desktop.png", dest: "batch-desktop.png", width: 1280, height: 1180 },
  {
    src: "batch-desktop.png",
    dest: "batch-desktop-complete.png",
    width: 1280,
    height: 2200,
    scrollTop: 1180,
  },
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

  for (const crop of CROPS) {
    const srcPath = path.join(srcDir, crop.src);
    const destPath = path.join(OUT_DIR, crop.dest);
    const scrollTop = crop.scrollTop ?? 0;

    const meta = await sharp(srcPath).metadata();
    const imgWidth = meta.width ?? crop.width;
    const imgHeight = meta.height ?? crop.height;

    const extractWidth = Math.min(crop.width, imgWidth);
    const extractHeight = Math.min(crop.height, imgHeight - scrollTop);
    if (extractHeight <= 0) {
      throw new Error(
        `Crop ${crop.dest} exceeds source height (${imgHeight}px at scrollTop ${scrollTop})`,
      );
    }

    await sharp(srcPath)
      .extract({
        left: 0,
        top: scrollTop,
        width: extractWidth,
        height: extractHeight,
      })
      .png()
      .toFile(destPath);

    console.log("Wrote", path.relative(process.cwd(), destPath));
  }

  console.log("Done —", OUT_DIR);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
