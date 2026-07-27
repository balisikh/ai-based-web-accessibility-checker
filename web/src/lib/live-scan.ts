import { chromium, type Browser } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mapAxeViolationsToIssues } from "./axe-mapper";
import { assertPublicHostname } from "./ssrf";
import type { Issue } from "./types";

const NAV_TIMEOUT_MS = 45_000;
const ACTION_TIMEOUT_MS = 15_000;

export type LiveScanResult = {
  issues: Issue[];
  pageTitle?: string;
};

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

/**
 * Render a public URL with Playwright and run axe-core accessibility checks.
 */
export async function analyzeUrlWithAxe(
  scanId: string,
  url: string,
): Promise<LiveScanResult> {
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
    userAgent:
      "LumenAccessibilityChecker/0.1 (+https://localhost; educational scanner)",
  });
  context.setDefaultTimeout(ACTION_TIMEOUT_MS);

  const page = await context.newPage();

  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAV_TIMEOUT_MS,
    });

    if (!response) {
      throw new Error("No response received from the website.");
    }

    const status = response.status();
    if (status >= 400) {
      throw new Error(`Website returned HTTP ${status}.`);
    }

    // Allow late content to settle briefly without waiting forever.
    await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);

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
