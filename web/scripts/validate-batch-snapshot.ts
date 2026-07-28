/**
 * CI check: batch snapshot internal consistency + fail guidance coverage.
 * Run: npm run validate:batch
 */
import { FAIL_SITE_GUIDANCE } from "../src/lib/website-batch-fail-guidance";
import { PASS_SITE_GUIDANCE } from "../src/lib/website-batch-pass-guidance";
import {
  WEBSITE_BATCH_RESULTS,
  WEBSITE_BATCH_SUMMARY,
} from "../src/lib/website-batch-results";
import { websiteBatchPass } from "../src/lib/website-pass-fail";
import { scoreFromIssues } from "../src/lib/store";
import type { Issue, Severity } from "../src/lib/types";

function fail(message: string): never {
  console.error("validate:batch FAIL:", message);
  process.exit(1);
}

function issueStub(severity: Severity, n: number): Issue[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `stub_${severity}_${i}`,
    scanId: "validate",
    source: "rule" as const,
    severity,
    impact: severity,
    category: "validate",
    message: "stub",
    wcagCriteria: [],
    selector: "",
    htmlSnippet: "",
    ruleId: "stub",
  }));
}

let errors = 0;
function check(condition: boolean, message: string) {
  if (!condition) {
    console.error("  -", message);
    errors += 1;
  }
}

if (WEBSITE_BATCH_RESULTS.length !== 28) {
  fail(`expected 28 sites, got ${WEBSITE_BATCH_RESULTS.length}`);
}

let pass = 0;
let failCount = 0;
let tc = 0;
let ts = 0;
let tm = 0;
let tn = 0;
let tt = 0;

for (const row of WEBSITE_BATCH_RESULTS) {
  const sum = row.critical + row.serious + row.moderate + row.minor;
  check(sum === row.totalIssues, `#${row.id} severity sum ${sum} !== total ${row.totalIssues}`);

  const stubIssues = [
    ...issueStub("critical", row.critical),
    ...issueStub("serious", row.serious),
    ...issueStub("moderate", row.moderate),
    ...issueStub("minor", row.minor),
  ];
  const calcScore = scoreFromIssues(stubIssues);
  check(
    calcScore === row.score,
    `#${row.id} score ${row.score} !== formula score ${calcScore}`,
  );

  const isPass = websiteBatchPass(row.score, row.critical);
  if (isPass) pass += 1;
  else failCount += 1;

  if (!isPass && !FAIL_SITE_GUIDANCE[row.id]) {
    check(false, `#${row.id} ${row.name} is Fail but missing FAIL_SITE_GUIDANCE`);
  }

  if (isPass && !PASS_SITE_GUIDANCE[row.id]) {
    check(false, `#${row.id} ${row.name} is Pass but missing PASS_SITE_GUIDANCE`);
  }

  if (isPass && PASS_SITE_GUIDANCE[row.id]?.recommendations.length === 0) {
    check(false, `#${row.id} ${row.name} Pass guidance has no recommendations`);
  }

  if (!isPass && FAIL_SITE_GUIDANCE[row.id]?.furtherActions.length === 0) {
    check(false, `#${row.id} ${row.name} Fail guidance has no actions`);
  }

  tc += row.critical;
  ts += row.serious;
  tm += row.moderate;
  tn += row.minor;
  tt += row.totalIssues;
}

check(pass === WEBSITE_BATCH_SUMMARY.passed, `pass count ${pass} !== summary ${WEBSITE_BATCH_SUMMARY.passed}`);
check(
  failCount === WEBSITE_BATCH_SUMMARY.failed,
  `fail count ${failCount} !== summary ${WEBSITE_BATCH_SUMMARY.failed}`,
);
check(tc === WEBSITE_BATCH_SUMMARY.totalCritical, "total critical mismatch");
check(ts === WEBSITE_BATCH_SUMMARY.totalSerious, "total serious mismatch");
check(tm === WEBSITE_BATCH_SUMMARY.totalModerate, "total moderate mismatch");
check(tn === WEBSITE_BATCH_SUMMARY.totalMinor, "total minor mismatch");
check(tt === WEBSITE_BATCH_SUMMARY.totalIssues, "total issues mismatch");

if (errors > 0) {
  fail(`${errors} check(s) failed`);
}

console.log(
  `validate:batch OK — 28 sites, ${pass} pass / ${failCount} fail, ${tt} issues`,
);
