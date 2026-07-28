import { chromium, type Browser, type Page } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mapAxeViolationsToIssues } from "./axe-mapper";
import { assertPublicHostname } from "./ssrf";
import type { Issue, ScanStatus } from "./types";

const NAV_TIMEOUT_MS = 45_000;
const ACTION_TIMEOUT_MS = 25_000;
const LOAD_SETTLE_MS = 2_500;

export type LiveScanResult = {
  issues: Issue[];
  pageTitle?: string;
};

export type ScanProgress = (
  status: Extract<ScanStatus, "fetching" | "rendering" | "rule_analysis">,
) => Promise<void> | void;

let browserPromise: Promise<Browser> | null = null;

function resetBrowserInstance(): void {
  browserPromise = null;
}

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    try {
      const existing = await browserPromise;
      if (!existing.isConnected()) {
        resetBrowserInstance();
      }
    } catch {
      resetBrowserInstance();
    }
  }

  if (!browserPromise) {
    const launchOptions: Parameters<typeof chromium.launch>[0] = {
      headless: true,
      args: ["--disable-dev-shm-usage", "--disable-gpu"],
    };
    if (process.env.PLAYWRIGHT_CHROMIUM !== "1" && process.env.CI !== "true") {
      launchOptions.channel = "chrome";
    }
    browserPromise = chromium.launch(launchOptions).catch((error) => {
      resetBrowserInstance();
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

function isNetworkReachabilityError(message: string): boolean {
  if (/net::ERR_/i.test(message)) return true;
  if (/NS_ERROR_(CONNECTION|UNKNOWN|NET|OFFLINE)/i.test(message)) return true;
  if (/ENOTFOUND|ECONNREFUSED|ECONNRESET|EAI_AGAIN|ETIMEDOUT/i.test(message)) {
    return true;
  }
  if (
    /ERR_(NAME_NOT_RESOLVED|CONNECTION|INTERNET_DISCONNECTED|ADDRESS_UNREACHABLE|TIMED_OUT|CONNECTION_RESET|CONNECTION_CLOSED|SSL|CERT|ABORTED|FAILED|BLOCKED)/i.test(
      message,
    )
  ) {
    return true;
  }
  if (/Target (page|closed|crashed)|Browser has been closed/i.test(message)) {
    return true;
  }
  return false;
}

function friendlyNetworkError(message: string): string {
  if (/ERR_NAME_NOT_RESOLVED|ENOTFOUND|getaddrinfo/i.test(message)) {
    return "Could not resolve that website’s address. Check spelling (including www) and try again.";
  }
  if (/ERR_CERT|ERR_SSL/i.test(message)) {
    return "Could not establish a secure connection to that website. It may have an invalid certificate.";
  }
  if (/ERR_TIMED_OUT|ETIMEDOUT/i.test(message)) {
    return "The website took too long to respond. Try again or use a simpler page on the same site.";
  }
  if (/ERR_ABORTED|Navigation interrupted/i.test(message)) {
    return "The page navigation was interrupted (common on sites with redirects). Try the URL again, or use the site’s homepage.";
  }
  if (/ERR_BLOCKED|BLOCKED_BY/i.test(message)) {
    return "That website blocked the automated browser. Try the homepage URL or scan in Chrome manually.";
  }
  if (/ERR_CONNECTION|ECONNREFUSED|ECONNRESET/i.test(message)) {
    return "The connection to that website was refused or reset. The site may be down or blocking automated access.";
  }
  if (/Target (page|closed|crashed)|Browser has been closed/i.test(message)) {
    return "The scan browser closed unexpectedly. Stop the dev server, run npm run dev again in web/, and retry.";
  }
  return "Could not reach that website. Check the URL opens in Chrome, then try again.";
}

type GotoWaitUntil = "domcontentloaded" | "load" | "commit";

async function pageHasScanableDom(page: Page): Promise<boolean> {
  return page
    .evaluate(() => {
      if (!document.documentElement) return false;
      const body = document.body;
      if (!body) return document.documentElement.children.length > 0;
      if (body.children.length > 0) return true;
      const text = (body.innerText ?? "").replace(/\s+/g, " ").trim();
      return text.length >= 15;
    })
    .catch(() => false);
}

async function gotoScanUrl(
  page: Page,
  url: string,
): Promise<Awaited<ReturnType<Page["goto"]>>> {
  const strategies: GotoWaitUntil[] = ["domcontentloaded", "load", "commit"];
  let lastError: unknown;

  for (const waitUntil of strategies) {
    try {
      const response = await page.goto(url, {
        waitUntil,
        timeout: NAV_TIMEOUT_MS,
      });
      if (response || (await pageHasScanableDom(page))) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (await pageHasScanableDom(page)) {
        return null;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (!isNetworkReachabilityError(message)) {
        throw error;
      }
    }
  }

  if (await pageHasScanableDom(page)) {
    return null;
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Navigation failed for an unknown reason.");
}

function isRecoverableAxeDomError(message: string): boolean {
  return (
    /axe\.utils|reading 'utils'|runPartial|frame\.evaluate/i.test(message) ||
    /documentElement/i.test(message)
  );
}

async function waitForMainHtmlDocument(page: Page): Promise<void> {
  try {
    await page.waitForFunction(
      () =>
        document.documentElement != null &&
        document.readyState !== "loading",
      { timeout: 20_000 },
    );
  } catch {
    if (await pageHasScanableDom(page)) {
      return;
    }
    throw new Error(
      "Page did not finish loading HTML. The site may still be loading, use a bot check, or block automated browsers.",
    );
  }
}

async function runAxeAnalysis(page: Page) {
  await waitForMainHtmlDocument(page);

  const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
  const build = () =>
    new AxeBuilder({ page })
      .withTags(tags)
      .options({ iframes: false })
      .exclude("iframe")
      .setLegacyMode(true);

  try {
    return await build().analyze();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isRecoverableAxeDomError(message)) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    await waitForMainHtmlDocument(page);
    return await build().analyze();
  }
}

async function analyzeUrlWithAxeOnce(
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
  });
  context.setDefaultTimeout(ACTION_TIMEOUT_MS);

  const page = await context.newPage();

  try {
    await onProgress?.("rendering");

    const response = await gotoScanUrl(page, url);

    if (!response) {
      if (!(await pageHasScanableDom(page))) {
        throw new Error(
          "No response received from the website. Check the URL in Chrome, then try again.",
        );
      }
    } else {
      const status = response.status();
      if (status >= 400) {
        const canScanDespiteStatus =
          BOT_BLOCK_STATUSES.has(status) && (await pageHasScanableDom(page));
        if (!canScanDespiteStatus) {
          throw new Error(httpErrorMessage(status));
        }
      }
    }

    await page
      .waitForLoadState("load", { timeout: LOAD_SETTLE_MS })
      .catch(() => undefined);

    await onProgress?.("rule_analysis");

    const axeResults = await runAxeAnalysis(page);

    const issues = mapAxeViolationsToIssues(scanId, axeResults.violations);
    const pageTitle = await page.title().catch(() => undefined);

    return { issues, pageTitle };
  } finally {
    await context.close().catch(() => undefined);
  }
}

function rethrowScanError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (/Timeout/i.test(message)) {
    throw new Error(
      "Timed out loading the page. The site may be slow, blocking bots, or unreachable.",
    );
  }
  if (isNetworkReachabilityError(message)) {
    const friendly = friendlyNetworkError(message);
    if (process.env.NODE_ENV === "development") {
      const detail = message.replace(/\s+/g, " ").slice(0, 160);
      throw new Error(`${friendly} (debug: ${detail})`);
    }
    throw new Error(friendly);
  }
  if (isRecoverableAxeDomError(message)) {
    throw new Error(
      "Accessibility rules could not run on this page (unstable DOM or embedded frames). Wait and try again, or use a simpler URL without heavy iframe embeds.",
    );
  }
  throw error instanceof Error ? error : new Error(message);
}

/**
 * Render a public URL with Playwright and run axe-core accessibility checks.
 * Retries once with a fresh browser if the first attempt hits a network/browser error.
 */
export async function analyzeUrlWithAxe(
  scanId: string,
  url: string,
  onProgress?: ScanProgress,
): Promise<LiveScanResult> {
  try {
    return await analyzeUrlWithAxeOnce(scanId, url, onProgress);
  } catch (firstError) {
    const firstMessage =
      firstError instanceof Error ? firstError.message : String(firstError);
    if (!isNetworkReachabilityError(firstMessage)) {
      rethrowScanError(firstError);
    }

    try {
      if (browserPromise) {
        const stale = await browserPromise;
        await stale.close().catch(() => undefined);
      }
    } finally {
      resetBrowserInstance();
    }

    try {
      return await analyzeUrlWithAxeOnce(scanId, url, onProgress);
    } catch (secondError) {
      rethrowScanError(secondError);
    }
  }
}
