/**
 * Re-scan all websites in the batch snapshot (live Playwright + axe).
 * Run from web/: npx tsx scripts/batch-rescan.ts
 * Output: batch-rescan-report.json in web/
 */
import fs from "node:fs";
import path from "node:path";
import { WEBSITE_BATCH_RESULTS } from "../src/lib/website-batch-results";
import { analyzeUrlWithAxe } from "../src/lib/live-scan";
import { countBySeverity, scoreFromIssues } from "../src/lib/store";
import { websiteBatchPass } from "../src/lib/website-pass-fail";
import {
  type BatchRescanReport,
  buildRescanSummary,
} from "./lib/batch-rescan-report";

type RescanRow = {
  id: number;
  name: string;
  url: string;
  ok: boolean;
  error?: string;
  score?: number;
  critical?: number;
  serious?: number;
  moderate?: number;
  minor?: number;
  totalIssues?: number;
  batchPass?: boolean;
  recorded: {
    score: number;
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
    totalIssues: number;
  };
  delta: {
    score: number | null;
    critical: number | null;
    serious: number | null;
    moderate: number | null;
    minor: number | null;
    totalIssues: number | null;
  };
};

async function main() {
  const started = Date.now();
  const rows: RescanRow[] = [];

  for (const site of WEBSITE_BATCH_RESULTS) {
    const label = `[${site.id}/28] ${site.name}`;
    process.stdout.write(`${label} … `);
    const recorded = {
      score: site.score,
      critical: site.critical,
      serious: site.serious,
      moderate: site.moderate,
      minor: site.minor,
      totalIssues: site.totalIssues,
    };

    try {
      const { issues } = await analyzeUrlWithAxe(
        `batch_rescan_${site.id}`,
        site.url,
      );
      const counts = countBySeverity(issues);
      const score = scoreFromIssues(issues);
      const totalIssues = issues.length;
      const batchPass = websiteBatchPass(score, counts.critical);

      const row: RescanRow = {
        id: site.id,
        name: site.name,
        url: site.url,
        ok: true,
        score,
        critical: counts.critical,
        serious: counts.serious,
        moderate: counts.moderate,
        minor: counts.minor,
        totalIssues,
        batchPass,
        recorded,
        delta: {
          score: score - site.score,
          critical: counts.critical - site.critical,
          serious: counts.serious - site.serious,
          moderate: counts.moderate - site.moderate,
          minor: counts.minor - site.minor,
          totalIssues: totalIssues - site.totalIssues,
        },
      };
      rows.push(row);
      console.log(
        `score ${score} (was ${site.score}), crit ${counts.critical}, total ${totalIssues}`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      rows.push({
        id: site.id,
        name: site.name,
        url: site.url,
        ok: false,
        error: message,
        recorded,
        delta: {
          score: null,
          critical: null,
          serious: null,
          moderate: null,
          minor: null,
          totalIssues: null,
        },
      });
      console.log(`FAIL: ${message.slice(0, 120)}`);
    }
  }

  const outPath = path.join(process.cwd(), "batch-rescan-report.json");
  const report: BatchRescanReport = {
    generatedAt: new Date().toISOString(),
    durationSec: Math.round((Date.now() - started) / 1000),
    rows,
    summary: buildRescanSummary(rows),
  };
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log("\nWrote", outPath);
  console.log("Summary:", report.summary);

  const mismatches = rows.filter(
    (r) =>
      r.ok &&
      (r.delta.score !== 0 ||
        r.delta.critical !== 0 ||
        r.delta.serious !== 0 ||
        r.delta.moderate !== 0 ||
        r.delta.minor !== 0),
  );
  if (mismatches.length) {
    console.log("\nSites with any count/score change vs snapshot:");
    for (const r of mismatches) {
      console.log(
        `  #${r.id} ${r.name}: score ${r.recorded.score}→${r.score}, crit ${r.recorded.critical}→${r.critical}, total ${r.recorded.totalIssues}→${r.totalIssues}`,
      );
    }
  } else {
    console.log("\nAll successful scans matched recorded snapshot exactly.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
