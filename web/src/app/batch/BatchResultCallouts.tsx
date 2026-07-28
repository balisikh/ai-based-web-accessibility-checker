import type { WebsiteBatchResult } from "@/lib/website-batch-results";
import {
  websiteBatchFailIssueCallout,
  websiteBatchFailReason,
  websiteBatchPass,
  websiteBatchPassIssueCallout,
} from "@/lib/website-pass-fail";

export function BatchResultCallouts({ row }: { row: WebsiteBatchResult }) {
  const pass = websiteBatchPass(row.score, row.critical);
  const failReason = websiteBatchFailReason(row.score, row.critical);
  const passIssueCallout = websiteBatchPassIssueCallout(row.totalIssues);
  const failIssueCallout = websiteBatchFailIssueCallout(pass, row.totalIssues);

  return (
    <>
      {pass && passIssueCallout ? (
        <p className="batch-row-callout batch-row-callout-pass">
          {passIssueCallout}
        </p>
      ) : null}
      {!pass && row.critical > 0 ? (
        <p className="batch-critical-callout" role="alert">
          {row.critical} critical {row.critical === 1 ? "issue" : "issues"}
        </p>
      ) : null}
      {!pass && failReason ? (
        <p className="batch-row-callout">{failReason}</p>
      ) : null}
      {!pass && failIssueCallout ? (
        <p className="batch-row-callout">{failIssueCallout}</p>
      ) : null}
    </>
  );
}
