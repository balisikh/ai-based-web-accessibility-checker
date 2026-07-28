import Link from "next/link";
import {
  WEBSITE_BATCH_RESULTS,
  WEBSITE_BATCH_SUMMARY,
  BATCH_SNAPSHOT_DATE,
} from "@/lib/website-batch-results";
import {
  websiteBatchPass,
} from "@/lib/website-pass-fail";
import { batchGuidanceForRow } from "@/lib/website-batch-guidance";
import { BATCH_TAG_LABELS, tagsForBatchSite } from "@/lib/website-batch-tags";
import { BatchGuidanceCell } from "./BatchGuidanceCell";
import { BatchMobileCards } from "./BatchMobileCards";
import { BatchResultCallouts } from "./BatchResultCallouts";

export const metadata = {
  title: "Lumen | Website batch results",
  description:
    "Pass and fail counts for the 28-site accessibility batch (static snapshot).",
};

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

export default function BatchResultsPage() {
  return (
    <main className="scan-shell">
      <section className="batch-panel" aria-labelledby="batch-heading">
        <p className="brand compact">Lumen</p>
        <h1 id="batch-heading">Website batch results</h1>
        <p className="lede batch-lede">
          Static snapshot (last full live resync <strong>{BATCH_SNAPSHOT_DATE}</strong>)
          — loads instantly and does not run scans. Live checks use the{" "}
          <Link href="/">accessibility checker</Link>.
        </p>

        <ul className="batch-summary" aria-label="Batch totals">
          <li>
            <span className="batch-summary-label">Tested</span>
            <strong>{WEBSITE_BATCH_SUMMARY.tested}</strong>
          </li>
          <li className="batch-summary-pass">
            <span className="batch-summary-label">Passed</span>
            <strong>{WEBSITE_BATCH_SUMMARY.passed}</strong>
            <span className="batch-summary-sub">
              {WEBSITE_BATCH_SUMMARY.passedClean} clean ·{" "}
              {WEBSITE_BATCH_SUMMARY.passedWithIssues} with issues
            </span>
          </li>
          <li className="batch-summary-fail">
            <span className="batch-summary-label">Failed</span>
            <strong>{WEBSITE_BATCH_SUMMARY.failed}</strong>
          </li>
          <li>
            <span className="batch-summary-label">Total issues</span>
            <strong>{WEBSITE_BATCH_SUMMARY.totalIssues}</strong>
          </li>
        </ul>

        <ul
          className="batch-summary batch-summary-severity"
          aria-label="Severity totals across all 28 sites"
        >
          <li>
            <span className="sev sev-critical">Critical</span>
            <strong>{WEBSITE_BATCH_SUMMARY.totalCritical}</strong>
          </li>
          <li>
            <span className="sev sev-serious">Serious</span>
            <strong>{WEBSITE_BATCH_SUMMARY.totalSerious}</strong>
          </li>
          <li>
            <span className="sev sev-moderate">Moderate</span>
            <strong>{WEBSITE_BATCH_SUMMARY.totalModerate}</strong>
          </li>
          <li>
            <span className="sev sev-minor">Minor</span>
            <strong>{WEBSITE_BATCH_SUMMARY.totalMinor}</strong>
          </li>
        </ul>

        <p className="hint batch-rule">
          <strong>Pass:</strong> score ≥ 85 and critical = 0.{" "}
          <strong>Fail:</strong> otherwise. Pass and Fail rows both use{" "}
          <strong>Notes &amp; recommendations</strong> when there are issues to
          triage. Source: <code>TEST_RESULTS.md</code> in the repo.
        </p>

        <BatchMobileCards rows={WEBSITE_BATCH_RESULTS} />

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
              {WEBSITE_BATCH_RESULTS.map((row) => {
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
