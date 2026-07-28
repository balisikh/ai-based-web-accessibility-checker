import Link from "next/link";
import {
  WEBSITE_BATCH_RESULTS,
  WEBSITE_BATCH_SUMMARY,
} from "@/lib/website-batch-results";
import {
  websiteBatchFailReason,
  websiteBatchPass,
} from "@/lib/website-pass-fail";

export const metadata = {
  title: "Lumen | Website batch results",
  description:
    "Pass and fail counts for the 28-site accessibility batch (static snapshot).",
};

export default function BatchResultsPage() {
  return (
    <main className="scan-shell">
      <section className="batch-panel" aria-labelledby="batch-heading">
        <p className="brand compact">Lumen</p>
        <h1 id="batch-heading">Website batch results</h1>
        <p className="lede batch-lede">
          Static snapshot from manual testing — loads instantly and does not run
          scans. Live checks still use the{" "}
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
          </li>
          <li className="batch-summary-fail">
            <span className="batch-summary-label">Failed</span>
            <strong>{WEBSITE_BATCH_SUMMARY.failed}</strong>
          </li>
          <li>
            <span className="batch-summary-label">Critical (all sites)</span>
            <strong>{WEBSITE_BATCH_SUMMARY.totalCritical}</strong>
          </li>
        </ul>

        <p className="hint batch-rule">
          <strong>Pass:</strong> score ≥ 85 and critical = 0.{" "}
          <strong>Fail:</strong> otherwise. Source:{" "}
          <code>TEST_RESULTS.md</code> in the repo.
        </p>

        <div className="batch-table-wrap">
          <table className="batch-table">
            <caption className="sr-only">
              All batch websites with score, critical count, and pass or fail
            </caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Website</th>
                <th scope="col">Score</th>
                <th scope="col">Critical</th>
                <th scope="col">Result</th>
                <th scope="col">Notes</th>
              </tr>
            </thead>
            <tbody>
              {WEBSITE_BATCH_RESULTS.map((row) => {
                const pass = websiteBatchPass(row.score, row.critical);
                const failReason = websiteBatchFailReason(
                  row.score,
                  row.critical,
                );
                return (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {row.name}
                      </a>
                    </td>
                    <td>{row.score}</td>
                    <td>
                      {row.critical > 0 ? (
                        <span className="batch-critical-num">{row.critical}</span>
                      ) : (
                        row.critical
                      )}
                    </td>
                    <td>
                      <span
                        className={`batch-badge batch-badge-${pass ? "pass" : "fail"}`}
                      >
                        {pass ? "Pass" : "Fail"}
                      </span>
                      {!pass && row.critical > 0 && (
                        <p className="batch-critical-callout" role="alert">
                          {row.critical} critical{" "}
                          {row.critical === 1 ? "issue" : "issues"}
                        </p>
                      )}
                      {!pass && failReason && (
                        <p className="batch-row-callout">{failReason}</p>
                      )}
                    </td>
                    <td className="batch-notes">{row.note ?? "—"}</td>
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
