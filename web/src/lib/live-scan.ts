import { chromium, type Browser, type Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mapAxeViolationsToIssues } from "./axe-mapper";
import { assertPublicHostname } from "./ssrf";
import type { Issue, ScanStatus } from "./types";

const NAV_TIMEOUT_MS = 30_000;
const ACTION_TIMEOUT_MS = 12_000;
const LOAD_SETTLE_MS = 2_500;

export type LiveScanResult = {
  issues: Issue[];
  pageTitle?: string;
};

export type ScanProgress = (
  status: Extract<ScanStatus, "fetching" | "rendering" | "rule_analysis">,
) => Promise<void> | void;

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium
      .launch({
        // Use installed Google Chrome to avoid downloading Chromium (C: disk full).
        channel: "chrome",
        headless: true,
      })
      .catch((error) => {
        browserPromise = null;
        throw error;
      });
  }
  return browserPromise;
}

function friendlyLaunchError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/Executable doesn't exist|channel/i.test(message)) {
    return "Could not launch Chrome for scanning. Install Google Chrome or set PLAYWRIGHT to a local browser.";
  }
  return message;
}

/** Non-standard or anti-bot statuses where the server may still return HTML. */
const BOT_BLOCK_STATUSES = new Set([401, 403, 429, 999]);

function httpErrorMessage(status: number): string {
  if (status === 404) {
    return "Website returned HTTP 404 (page not found). Check the URL is correct and opens in your browser, then try again.";
  }
  if (status === 403) {
    return "Website returned HTTP 403 (access forbidden). The site may be blocking automated scanners.";
  }
  if (status === 429) {
    return "Website returned HTTP 429 (too many requests). Wait a minute and try again, or the site may be rate-limiting scanners.";
  }
  if (status === 999) {
    return "Website returned HTTP 999. This usually means the site blocked automated access (common on LinkedIn). Lumen runs without your login cookies, so try a different public URL, or test that page manually in the browser.";
  }
  return `Website returned HTTP ${status}.`;
}

async function pageHasScanableDom(page: Page): Promise<boolean> {
  return page
    .evaluate(() => {
      const body = document.body;
      if (!body || body.children.length === 0) return false;
      const text = (body.innerText ?? "").replace(/\s+/g, " ").trim();
      return text.length >= 60;
    })
    .catch(() => false);
}

/**
 * Render a public URL with Playwright and run axe-core accessibility checks.
 * Calls onProgress as real work starts for each phase.
 */
export async function analyzeUrlWithAxe(
  scanId: string,
  url: string,
  onProgress?: ScanProgress,
): Promise<LiveScanResult> {
  await onProgress?.("fetching");

  const parsed = new URL(url);
  await assertPublicHostname(parsed.hostname);

  let browser: Browser;
  try {
    browser = await getBrowser();
  } catch (error) {
    throw new Error(friendlyLaunchError(error));
  }

  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    // Default Chrome user agent — custom scanner UAs trigger bot blocks (e.g. HTTP 999).
  });
  context.setDefaultTimeout(ACTION_TIMEOUT_MS);

  const page = await context.newPage();

  try {
    await onProgress?.("rendering");

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });

    if (!response) {
      throw new Error("No response received from the website.");
    }

    const status = response.status();
    if (status >= 400) {
      const canScanDespiteStatus =
        BOT_BLOCK_STATUSES.has(status) && (await pageHasScanableDom(page));
      if (!canScanDespiteStatus) {
        throw new Error(httpErrorMessage(status));
      }
    }

    // Short settle only — avoid long networkidle waits on quiet/simple pages.
    await page
      .waitForLoadState("load", { timeout: LOAD_SETTLE_MS })
      .catch(() => undefined);

    await onProgress?.("rule_analysis");

    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const issues = mapAxeViolationsToIssues(scanId, axeResults.violations);
    const pageTitle = await page.title().catch(() => undefined);

    return { issues, pageTitle };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Timeout/i.test(message)) {
      throw new Error(
        "Timed out loading the page. The site may be slow, blocking bots, or unreachable.",
      );
    }
    if (/net::|NS_ERROR|ENOTFOUND|ECONNREFUSED|ERR_/i.test(message)) {
      throw new Error(
        "Could not reach that website. Check the URL or try again later.",
      );
    }
    throw error instanceof Error ? error : new Error(message);
  } finally {
    await context.close().catch(() => undefined);
  }
}
