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
  const existing = await getScan(scanId);
  if (!existing) return;

  try {
    const { analyzeUrlWithAxe } = await import("./live-scan");

    let { issues } = await analyzeUrlWithAxe(
      scanId,
      existing.url,
      async (status) => {
        await updateScan(scanId, { status });
      },
    );

    await updateScan(scanId, { status: "ai_enrichment" });
    const { enrichIssuesWithAi } = await import("./ai-enrichment");
    issues = await enrichIssuesWithAi(existing.url, issues);

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
