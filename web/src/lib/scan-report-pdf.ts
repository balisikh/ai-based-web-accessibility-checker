import { chromium } from "playwright";
import {
  DISCLAIMER_ASSISTIVE_SHORT,
  PASS_FAIL_RULE_LINE,
  SCORE_FORMULA,
} from "./product-copy";
import type { Issue, Scan } from "./types";
import { websiteBatchOutcome } from "./website-pass-fail";

const SEVERITY_ORDER = ["critical", "serious", "moderate", "minor"] as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

function formatWhen(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function sortIssues(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const ai = SEVERITY_ORDER.indexOf(a.severity);
    const bi = SEVERITY_ORDER.indexOf(b.severity);
    if (ai !== bi) return ai - bi;
    return a.message.localeCompare(b.message);
  });
}

function issueBlock(issue: Issue, index: number): string {
  const ai =
    issue.aiExplanation || issue.aiRemediation
      ? `<div class="ai"><strong>AI tip</strong><p>${escapeHtml(
          truncate(
            [issue.aiExplanation, issue.aiRemediation].filter(Boolean).join(" "),
            480,
          ),
        )}</p></div>`
      : "";

  return `<article class="issue">
    <h3>${index + 1}. <span class="sev sev-${issue.severity}">${escapeHtml(issue.severity)}</span> — ${escapeHtml(truncate(issue.message, 120))}</h3>
    <table class="meta">
      <tr><th>Rule</th><td>${escapeHtml(issue.ruleId ?? "—")}</td></tr>
      <tr><th>WCAG</th><td>${escapeHtml(issue.wcagCriteria.join(", ") || "—")}</td></tr>
      <tr><th>Selector</th><td><code>${escapeHtml(truncate(issue.selector, 200))}</code></td></tr>
      ${
        issue.helpUrl
          ? `<tr><th>Help</th><td>${escapeHtml(issue.helpUrl)}</td></tr>`
          : ""
      }
    </table>
    ${
      issue.htmlSnippet
        ? `<pre class="snippet">${escapeHtml(truncate(issue.htmlSnippet, 320))}</pre>`
        : ""
    }
    ${ai}
  </article>`;
}

/** Build printable HTML for a completed scan report. */
export function buildScanReportHtml(scan: Scan): string {
  const counts = scan.summaryCounts ?? {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  const score = scan.score ?? 0;
  const outcome =
    scan.status === "completed"
      ? websiteBatchOutcome(score, counts.critical)
      : "fail";
  const issues = sortIssues(scan.issues);
  const generatedAt = new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>Lumen scan report — ${escapeHtml(scan.url)}</title>
  <style>
    body { font-family: "Segoe UI", system-ui, sans-serif; color: #14221f; line-height: 1.45; font-size: 10pt; margin: 0; padding: 0; }
    .wrap { padding: 12mm 10mm; }
    h1 { color: #083f44; font-size: 1.35rem; margin: 0 0 0.25rem; }
    h2 { color: #083f44; font-size: 1rem; margin: 1rem 0 0.4rem; border-bottom: 2px solid rgba(13,92,99,.15); padding-bottom: 0.2rem; }
    .sub { color: #3d524c; margin: 0 0 0.75rem; font-size: 0.85rem; }
    .note { background: #f3f7f5; border-left: 4px solid #e85d04; padding: 0.5rem 0.65rem; margin: 0.65rem 0; font-size: 0.82rem; }
    table.summary { border-collapse: collapse; width: 100%; margin: 0.5rem 0; font-size: 0.85rem; }
    table.summary th, table.summary td { border: 1px solid rgba(20,34,31,.12); padding: 0.35rem 0.5rem; text-align: left; }
    table.summary th { background: rgba(13,92,99,.08); width: 28%; }
    .score { font-size: 1.5rem; font-weight: 700; color: #083f44; }
    .badge { display: inline-block; padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .badge-pass { background: rgba(13,92,99,.15); color: #083f44; }
    .badge-fail { background: rgba(232,93,4,.15); color: #9a3412; }
    .sev { font-weight: 700; text-transform: uppercase; font-size: 0.72rem; }
    .sev-critical { color: #b42318; }
    .sev-serious { color: #c2410c; }
    .sev-moderate { color: #a16207; }
    .sev-minor { color: #3d524c; }
    .counts { display: flex; gap: 0.75rem; flex-wrap: wrap; margin: 0.5rem 0; font-size: 0.82rem; }
    .issue { margin: 0.65rem 0 0.85rem; page-break-inside: avoid; }
    .issue h3 { font-size: 0.88rem; margin: 0 0 0.35rem; }
    table.meta { width: 100%; border-collapse: collapse; font-size: 0.78rem; margin-bottom: 0.35rem; }
    table.meta th { text-align: left; width: 18%; color: #083f44; vertical-align: top; padding: 0.15rem 0.35rem 0.15rem 0; }
    table.meta td { padding: 0.15rem 0; word-break: break-word; }
    pre.snippet { background: #f3f7f5; border: 1px solid rgba(20,34,31,.1); border-radius: 4px; padding: 0.35rem 0.5rem; font-size: 0.72rem; white-space: pre-wrap; word-break: break-word; margin: 0.25rem 0; }
    .ai { background: #f8faf9; border: 1px solid rgba(13,92,99,.15); border-radius: 4px; padding: 0.35rem 0.5rem; font-size: 0.78rem; margin-top: 0.25rem; }
    code { font-family: Consolas, monospace; font-size: 0.85em; }
    footer { margin-top: 1rem; font-size: 0.72rem; color: #3d524c; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Lumen — accessibility scan report</h1>
    <p class="sub">Generated ${escapeHtml(formatWhen(generatedAt))}</p>
    <div class="note">${escapeHtml(DISCLAIMER_ASSISTIVE_SHORT)}</div>

    <h2>Summary</h2>
    <table class="summary">
      <tr><th>URL scanned</th><td>${escapeHtml(scan.url)}</td></tr>
      <tr><th>Scan started</th><td>${escapeHtml(formatWhen(scan.createdAt))}</td></tr>
      <tr><th>Scan completed</th><td>${escapeHtml(formatWhen(scan.completedAt))}</td></tr>
      <tr><th>WCAG target</th><td>Level ${escapeHtml(scan.wcagLevelTarget)} (automated axe rules)</td></tr>
      <tr><th>Score</th><td><span class="score">${score}</span> / 100</td></tr>
      <tr><th>Pass / Fail</th><td><span class="badge badge-${outcome}">${outcome}</span> — ${escapeHtml(PASS_FAIL_RULE_LINE)}</td></tr>
      <tr><th>Score formula</th><td>${escapeHtml(SCORE_FORMULA)}</td></tr>
    </table>

    <div class="counts">
      <span class="sev sev-critical">Critical: ${counts.critical}</span>
      <span class="sev sev-serious">Serious: ${counts.serious}</span>
      <span class="sev sev-moderate">Moderate: ${counts.moderate}</span>
      <span class="sev sev-minor">Minor: ${counts.minor}</span>
      <span><strong>Total issues:</strong> ${issues.length}</span>
    </div>

    <h2>Issues (${issues.length})</h2>
    ${
      issues.length === 0
        ? "<p>No automated issues reported for this page under the current rule set.</p>"
        : issues.map((issue, i) => issueBlock(issue, i)).join("\n")
    }

    <footer>Lumen Accessibility Checker · Scan ID ${escapeHtml(scan.id)} · Assistive findings only — not a legal WCAG certificate.</footer>
  </div>
</body>
</html>`;
}

/** Render a completed scan as a PDF buffer (Playwright print). */
export async function renderScanReportPdf(scan: Scan): Promise<Buffer> {
  const html = buildScanReportHtml(scan);
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
