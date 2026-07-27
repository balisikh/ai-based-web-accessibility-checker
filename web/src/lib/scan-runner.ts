import {
  countBySeverity,
  createScanId,
  saveScan,
  scoreFromIssues,
  updateScan,
  getScan,
} from "./store";
import type { Scan } from "./types";

export async function createQueuedScan(url: string): Promise<Scan> {
  const scan: Scan = {
    id: createScanId(),
    url,
    status: "queued",
    createdAt: new Date().toISOString(),
    wcagLevelTarget: "AA",
    issues: [],
  };
  await saveScan(scan);
  return scan;
}

/**
 * Live pipeline: resolve/SSRF check → Playwright render → axe-core → optional AI → score.
 */
export async function runLiveScan(scanId: string): Promise<void> {
  const scan = await updateScan(scanId, { status: "fetching" });
  if (!scan) return;

  try {
    await updateScan(scanId, { status: "rendering" });

    const { analyzeUrlWithAxe } = await import("./live-scan");

    await updateScan(scanId, { status: "rule_analysis" });
    const current = await getScan(scanId);
    if (!current) return;

    let { issues } = await analyzeUrlWithAxe(scanId, current.url);

    await updateScan(scanId, { status: "ai_enrichment" });
    const { enrichIssuesWithAi } = await import("./ai-enrichment");
    issues = await enrichIssuesWithAi(current.url, issues);

    await updateScan(scanId, { status: "scoring" });
    const summaryCounts = countBySeverity(issues);
    const score = scoreFromIssues(issues);

    await updateScan(scanId, {
      status: "completed",
      completedAt: new Date().toISOString(),
      issues,
      summaryCounts,
      score,
    });
  } catch (error) {
    await updateScan(scanId, {
      status: "failed",
      completedAt: new Date().toISOString(),
      errorMessage:
        error instanceof Error ? error.message : "Scan failed unexpectedly.",
    });
  }
}
