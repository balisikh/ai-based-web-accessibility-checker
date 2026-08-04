import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { pageMetadata } from "@/lib/seo";
import {
  batchResyncDetailFromMeta,
  getBatchSnapshot,
} from "@/lib/batch-snapshot-store";
import {
  websiteBatchPass,
} from "@/lib/website-pass-fail";
import { batchGuidanceForRow } from "@/lib/website-batch-guidance";
import { BATCH_TAG_LABELS, tagsForBatchSite } from "@/lib/website-batch-tags";
import {
  BATCH_NOTES_COLUMN_HINT,
  BATCH_SNAPSHOT_NOTE,
  PASS_FAIL_RULE_LINE,
} from "@/lib/product-copy";
import { BatchRefreshButton } from "./BatchRefreshButton";
import { BatchReadGuide } from "./BatchReadGuide";
import { BatchGuidanceCell } from "./BatchGuidanceCell";
import { BatchMobileCards } from "./BatchMobileCards";
import { BatchResultCallouts } from "./BatchResultCallouts";

export const metadata = pageMetadata({
  title: "28-site batch accessibility results",
  description:
    "Pass and fail counts for 28 public websites — static axe snapshot with scores, severity totals, and recommended actions per site.",
  path: "/batch",
});

type BatchSeverity = "critical" | "serious" | "moderate" | "minor";

function BatchSeverityCount({
  severity,
  count,
}: {
  severity: BatchSeverity;
  count: number;
}) {
  if (count === 0) {
    return <span className="batch-sev-zero">0</span>;
  }
  return (
    <span className={`batch-sev-num sev sev-${severity}`}>{count}</span>
  );
}

export const dynamic = "force-dynamic";

export default async function BatchResultsPage() {
  const snapshot = await getBatchSnapshot();
  const { results, summary, date, meta } = snapshot;

  return (
    <main className="scan-shell">
      <JsonLd page="batch" />
      <section className="batch-panel" aria-labelledby="batch-heading">
        <div className="batch-page-head">
          <div>
            <p className="batch-page-eyebrow">Portfolio test set</p>
            <h1 id="batch-heading">Website batch results</h1>
            <p className="lede batch-lede">
              {BATCH_SNAPSHOT_NOTE} Last full live resync{" "}
              <strong>{date}</strong> ({batchResyncDetailFromMeta(meta)}).
              Live checks use the{" "}
              <Link href="/">accessibility checker</Link>.
            </p>
          </div>
          <div className="batch-head-actions">
            <BatchRefreshButton />
            <Link href="/" className="batch-head-cta">
              Run a live scan
            </Link>
          </div>
        </div>

        <BatchReadGuide />

        <h2 className="batch-section-title">Overview</h2>
        <ul className="batch-summary" aria-label="Batch totals">
          <li>
            <span className="batch-summary-label">Tested</span>
            <strong>{summary.tested}</strong>
          </li>
          <li className="batch-summary-pass">
            <span className="batch-summary-label">Passed</span>
            <strong>{summary.passed}</strong>
            <span className="batch-summary-sub">
              {summary.passedClean} clean · {summary.passedWithIssues} with
              issues
            </span>
          </li>
          <li className="batch-summary-fail">
            <span className="batch-summary-label">Failed</span>
            <strong>{summary.failed}</strong>
          </li>
          <li>
            <span className="batch-summary-label">Total issues</span>
            <strong>{summary.totalIssues}</strong>
          </li>
        </ul>

        <h2 className="batch-section-title">Severity totals (all 28 sites)</h2>
        <ul
          className="batch-summary batch-summary-severity"
          aria-label="Severity totals across all 28 sites"
        >
          <li className="batch-summary-sev batch-summary-sev-critical">
            <span className="sev sev-critical">Critical</span>
            <strong>{summary.totalCritical}</strong>
          </li>
          <li className="batch-summary-sev batch-summary-sev-serious">
            <span className="sev sev-serious">Serious</span>
            <strong>{summary.totalSerious}</strong>
          </li>
          <li className="batch-summary-sev batch-summary-sev-moderate">
            <span className="sev sev-moderate">Moderate</span>
            <strong>{summary.totalModerate}</strong>
          </li>
          <li className="batch-summary-sev batch-summary-sev-minor">
            <span className="sev sev-minor">Minor</span>
            <strong>{summary.totalMinor}</strong>
          </li>
        </ul>

        <p className="hint batch-rule">
          {PASS_FAIL_RULE_LINE} {BATCH_NOTES_COLUMN_HINT} Source:{" "}
          <code>TEST_RESULTS.md</code> in the repo.
        </p>

        <BatchMobileCards rows={results} />

        <h2 className="batch-section-title batch-section-title-table">
          All websites
        </h2>
        <div className="batch-table-wrap batch-table-desktop">
          <table className="batch-table">
            <caption className="sr-only">
              All batch websites with score, severity counts, and pass or fail
            </caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Website</th>
                <th scope="col">Score</th>
                <th scope="col">Critical</th>
                <th scope="col">Serious</th>
                <th scope="col">Moderate</th>
                <th scope="col">Minor</th>
                <th scope="col">Total</th>
                <th scope="col">Result</th>
                <th scope="col">Notes &amp; recommendations</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => {
                const pass = websiteBatchPass(row.score, row.critical);
                const guidanceView = batchGuidanceForRow(row);
                return (
                  <tr
                    key={row.id}
                    className={`batch-row batch-row-${pass ? "pass" : "fail"}`}
                  >
                    <td>{row.id}</td>
                    <td>
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {row.name}
                      </a>
                      <ul className="batch-tag-row" aria-label="Site tags">
                        {tagsForBatchSite(row).map((tag) => (
                          <li key={tag}>
                            <span className="batch-tag">{BATCH_TAG_LABELS[tag] ?? tag}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td>{row.score}</td>
                    <td className="batch-sev-cell">
                      <BatchSeverityCount severity="critical" count={row.critical} />
                    </td>
                    <td className="batch-sev-cell">
                      <BatchSeverityCount severity="serious" count={row.serious} />
                    </td>
                    <td className="batch-sev-cell">
                      <BatchSeverityCount severity="moderate" count={row.moderate} />
                    </td>
                    <td className="batch-sev-cell">
                      <BatchSeverityCount severity="minor" count={row.minor} />
                    </td>
                    <td>{row.totalIssues}</td>
                    <td>
                      <span
                        className={`batch-badge batch-badge-${pass ? "pass" : "fail"}`}
                      >
                        {pass ? "Pass" : "Fail"}
                      </span>
                      <BatchResultCallouts row={row} />
                    </td>
                    <td className="batch-notes">
                      <BatchGuidanceCell guidance={guidanceView} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="batch-footer">
          <Link href="/">← Back to checker</Link>
        </p>
      </section>
    </main>
  );
}
