/**
 * Apply batch-rescan-report.json to website-batch-results.ts snapshot.
 * Run: npx tsx scripts/apply-batch-rescan.ts
 */
import fs from "node:fs";
import path from "node:path";
import { WEBSITE_BATCH_RESULTS } from "../src/lib/website-batch-results";
import { websiteBatchPass } from "../src/lib/website-pass-fail";

type ReportRow = {
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
};

/** Matches batch-rescan-report.json (summary is optional for older reports). */
type BatchRescanReport = {
  generatedAt: string;
  rows: ReportRow[];
  summary?: {
    ok: number;
    failed: number;
  };
};

function rescanCounts(report: BatchRescanReport): { ok: number; failed: number } {
  const ok = report.summary?.ok ?? report.rows.filter((r) => r.ok).length;
  const failed =
    report.summary?.failed ?? report.rows.filter((r) => !r.ok).length;
  return { ok, failed };
}

const reportPath = path.join(process.cwd(), "batch-rescan-report.json");
const outPath = path.join(process.cwd(), "src/lib/website-batch-results.ts");

const report = JSON.parse(
  fs.readFileSync(reportPath, "utf8"),
) as BatchRescanReport;

const snapshotDate = report.generatedAt.slice(0, 10);
const { ok: rescannedOk, failed: rescannedFailed } = rescanCounts(report);

const lines: string[] = [
  `/**`,
  ` * Snapshot of batch runs — synced from live rescan ${snapshotDate} (batch-rescan-report.json).`,
  ` * Static data only: no impact on live scan performance.`,
  ` */`,
  `export type WebsiteBatchResult = {`,
  `  id: number;`,
  `  name: string;`,
  `  url: string;`,
  `  score: number;`,
  `  critical: number;`,
  `  serious: number;`,
  `  moderate: number;`,
  `  minor: number;`,
  `  totalIssues: number;`,
  `  date: string;`,
  `  note?: string;`,
  `};`,
  ``,
  `export const BATCH_SNAPSHOT_DATE = "${snapshotDate}";`,
  ``,
  `/** Last full live rescan stats (from batch-rescan-report.json via batch:apply-rescan). */`,
  `export const BATCH_SNAPSHOT_META = {`,
  `  date: "${snapshotDate}",`,
  `  rescannedOk: ${rescannedOk},`,
  `  rescannedFailed: ${rescannedFailed},`,
  `  total: ${WEBSITE_BATCH_RESULTS.length},`,
  `};`,
  ``,
  `/** Human-readable resync coverage for batch page and home sidebar. */`,
  `export function batchResyncDetail(): string {`,
  `  const { rescannedOk, total, rescannedFailed } = BATCH_SNAPSHOT_META;`,
  `  if (rescannedFailed === 0) {`,
  `    return \`all \${total} sites scanned live\`;`,
  `  }`,
  `  return \`\${rescannedOk}/\${total} sites scanned live · \${rescannedFailed} kept prior snapshot\`;`,
  `}`,
  ``,
  `export const WEBSITE_BATCH_RESULTS: WebsiteBatchResult[] = [`,
];

for (const site of WEBSITE_BATCH_RESULTS) {
  const row = report.rows.find((r) => r.id === site.id);
  if (!row) {
    throw new Error(`missing report row #${site.id}`);
  }

  let score = site.score;
  let critical = site.critical;
  let serious = site.serious;
  let moderate = site.moderate;
  let minor = site.minor;
  let totalIssues = site.totalIssues;
  let note = site.note;

  if (row.ok && row.score !== undefined) {
    score = row.score;
    critical = row.critical ?? 0;
    serious = row.serious ?? 0;
    moderate = row.moderate ?? 0;
    minor = row.minor ?? 0;
    totalIssues = row.totalIssues ?? 0;
  } else if (!row.ok) {
    note = note
      ? `${note}; rescan ${snapshotDate} failed — kept prior snapshot`
      : `Rescan ${snapshotDate} failed (${row.error?.slice(0, 80) ?? "error"}) — kept prior snapshot`;
  }

  const parts = [
    `id: ${site.id}`,
    `name: ${JSON.stringify(site.name)}`,
    `url: ${JSON.stringify(site.url)}`,
    `score: ${score}`,
    `critical: ${critical}`,
    `serious: ${serious}`,
    `moderate: ${moderate}`,
    `minor: ${minor}`,
    `totalIssues: ${totalIssues}`,
    `date: ${JSON.stringify(snapshotDate)}`,
  ];
  if (note) parts.push(`note: ${JSON.stringify(note)}`);
  lines.push(`  { ${parts.join(", ")} },`);
}

lines.push(`];`, ``);
lines.push(`import { websiteBatchPass } from "./website-pass-fail";`, ``);
lines.push(`export const WEBSITE_BATCH_SUMMARY = {`);
lines.push(`  tested: WEBSITE_BATCH_RESULTS.length,`);
lines.push(
  `  passed: WEBSITE_BATCH_RESULTS.filter((r) => websiteBatchPass(r.score, r.critical))`,
);
lines.push(`    .length,`);
lines.push(`  failed: WEBSITE_BATCH_RESULTS.filter(`);
lines.push(`    (r) => !websiteBatchPass(r.score, r.critical),`);
lines.push(`  ).length,`);
lines.push(`  passedClean: WEBSITE_BATCH_RESULTS.filter(`);
lines.push(
  `    (r) => websiteBatchPass(r.score, r.critical) && r.totalIssues === 0,`,
);
lines.push(`  ).length,`);
lines.push(`  passedWithIssues: WEBSITE_BATCH_RESULTS.filter(`);
lines.push(
  `    (r) => websiteBatchPass(r.score, r.critical) && r.totalIssues > 0,`,
);
lines.push(`  ).length,`);
lines.push(`  totalCritical: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.critical, 0),`);
lines.push(`  totalSerious: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.serious, 0),`);
lines.push(`  totalModerate: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.moderate, 0),`);
lines.push(`  totalMinor: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.minor, 0),`);
lines.push(`  totalIssues: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.totalIssues, 0),`);
lines.push(`};`, ``);

fs.writeFileSync(outPath, lines.join("\n"));

let pass = 0;
let fail = 0;
for (const site of WEBSITE_BATCH_RESULTS) {
  const row = report.rows.find((r) => r.id === site.id)!;
  const s = row.ok ? row.score! : site.score;
  const c = row.ok ? row.critical! : site.critical;
  if (websiteBatchPass(s, c)) pass += 1;
  else fail += 1;
}

console.log(`Wrote ${outPath}`);
console.log(`Snapshot date: ${snapshotDate}`);
console.log(`Pass/Fail (approx): ${pass} pass / ${fail} fail`);
console.log(
  `Rescan failures kept prior row:`,
  report.rows.filter((r) => !r.ok).map((r) => `#${r.id} ${r.name}`).join(", ") || "none",
);
