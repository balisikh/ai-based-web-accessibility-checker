import type { WebsiteBatchResult } from "@/lib/website-batch-results";
import { batchGuidanceForRow } from "@/lib/website-batch-guidance";
import { websiteBatchPass } from "@/lib/website-pass-fail";
import { BATCH_TAG_LABELS, tagsForBatchSite } from "@/lib/website-batch-tags";
import { BatchGuidanceCell } from "./BatchGuidanceCell";
import { BatchResultCallouts } from "./BatchResultCallouts";

type BatchSeverity = "critical" | "serious" | "moderate" | "minor";

function SeverityChip({
  label,
  severity,
  count,
}: {
  label: string;
  severity: BatchSeverity;
  count: number;
}) {
  return (
    <li className="batch-card-sev">
      <span className={`sev sev-${severity}`}>{label}</span>
      <strong>{count}</strong>
    </li>
  );
}

export function BatchMobileCards({ rows }: { rows: WebsiteBatchResult[] }) {
  return (
    <ul className="batch-cards" aria-label="Batch websites (mobile list)">
      {rows.map((row) => {
        const pass = websiteBatchPass(row.score, row.critical);
        const guidanceView = batchGuidanceForRow(row);

        return (
          <li
            key={row.id}
            className={`batch-card batch-card-${pass ? "pass" : "fail"}`}
          >
            <div className="batch-card-head">
              <span className="batch-card-id">#{row.id}</span>
              <span
                className={`batch-badge batch-badge-${pass ? "pass" : "fail"}`}
              >
                {pass ? "Pass" : "Fail"}
              </span>
            </div>
            <h2 className="batch-card-title">
              <a href={row.url} target="_blank" rel="noopener noreferrer">
                {row.name}
              </a>
            </h2>
            <ul className="batch-tag-row" aria-label="Site tags">
              {tagsForBatchSite(row).map((tag) => (
                <li key={tag}>
                  <span className="batch-tag">{BATCH_TAG_LABELS[tag] ?? tag}</span>
                </li>
              ))}
            </ul>
            <dl className="batch-card-stats">
              <div>
                <dt>Score</dt>
                <dd>{row.score}</dd>
              </div>
              <div>
                <dt>Total issues</dt>
                <dd>{row.totalIssues}</dd>
              </div>
            </dl>
            <ul className="batch-card-severity" aria-label="Severity counts">
              <SeverityChip label="Critical" severity="critical" count={row.critical} />
              <SeverityChip label="Serious" severity="serious" count={row.serious} />
              <SeverityChip label="Moderate" severity="moderate" count={row.moderate} />
              <SeverityChip label="Minor" severity="minor" count={row.minor} />
            </ul>
            <BatchResultCallouts row={row} />
            <BatchGuidanceCell guidance={guidanceView} />
          </li>
        );
      })}
    </ul>
  );
}
