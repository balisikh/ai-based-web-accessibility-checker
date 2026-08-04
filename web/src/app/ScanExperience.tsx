"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { HOW_IT_WORKS_ITEMS } from "@/lib/how-it-works";
import { HOME_FAQS } from "@/lib/home-faqs";
import { HOW_TO_USE_STEPS } from "@/lib/how-to-use";
import {
  DISCLAIMER_ASSISTIVE,
  DISCLAIMER_ASSISTIVE_SHORT,
  FAQ_HEADING,
  FAQ_LEDE,
  HOW_IT_WORKS_HEADING,
  HOW_TO_USE_HEADING,
  HOW_TO_USE_LEDE,
  PASS_FAIL_PASS_BODY,
  PASS_FAIL_PASS_HEADING,
  SCORE_BATCH_PASS_NOTE,
  URL_PUBLIC_HINT,
} from "@/lib/product-copy";
import { TRY_EXAMPLE_URLS } from "@/lib/try-examples";
import type { Issue, ScanStatus, ScanSummary, Severity } from "@/lib/types";
import { validateScanUrl } from "@/lib/validate-url";
import {
  websiteBatchFailReason,
  websiteBatchPass,
} from "@/lib/website-pass-fail";
import {
  batchResyncDetailFromMeta,
  type BatchSnapshotMeta,
  type WebsiteBatchSummary,
} from "@/lib/batch-snapshot-types";

export type BatchSidebarSnapshot = {
  date: string;
  meta: BatchSnapshotMeta;
  summary: WebsiteBatchSummary;
};

type Phase = "idle" | "submitting" | "scanning" | "results" | "error";

const STATUS_LABEL: Record<string, string> = {
  queued: "Queued",
  fetching: "Fetching page",
  rendering: "Rendering page",
  rule_analysis: "Running accessibility rules",
  ai_enrichment: "Adding AI guidance",
  scoring: "Calculating score",
  completed: "Completed",
  failed: "Failed",
};

const SEVERITY_ORDER: Severity[] = ["critical", "serious", "moderate", "minor"];

const SEVERITY_HINT: Record<Severity, string> = {
  critical: "Blocks many users — fix first.",
  serious: "Major barriers for some users.",
  moderate: "Noticeable friction — plan fixes.",
  minor: "Small improvements when you can.",
};

const EXAMPLE_URLS = TRY_EXAMPLE_URLS;

const SCAN_STEPS = [
  { id: "fetching", label: "Fetch page" },
  { id: "rendering", label: "Render page" },
  { id: "rule_analysis", label: "Run accessibility rules" },
  { id: "ai_enrichment", label: "Add AI guidance" },
  { id: "scoring", label: "Calculate score" },
] as const;

const STEP_ORDER: ScanStatus[] = [
  "queued",
  "fetching",
  "rendering",
  "rule_analysis",
  "ai_enrichment",
  "scoring",
  "completed",
];

function stepState(
  current: ScanStatus,
  stepId: (typeof SCAN_STEPS)[number]["id"],
): "done" | "active" | "pending" {
  const currentIndex = STEP_ORDER.indexOf(current);
  const stepIndex = STEP_ORDER.indexOf(stepId);
  if (current === "failed") {
    return stepIndex <= Math.max(currentIndex, 1) ? "done" : "pending";
  }
  if (currentIndex < 0) return "pending";
  if (currentIndex > stepIndex) return "done";
  if (currentIndex === stepIndex) return "active";
  // queued is before fetching
  if (current === "queued" && stepId === "fetching") return "active";
  return "pending";
}

function scoreRating(score: number | undefined): {
  label: string;
  tone: "strong" | "fair" | "needs-work";
} {
  const value = score ?? 0;
  if (value >= 85) return { label: "Strong", tone: "strong" };
  if (value >= 60) return { label: "Fair", tone: "fair" };
  return { label: "Needs work", tone: "needs-work" };
}

function effectiveScanStatus(
  status: ScanStatus,
  aiTipsEnabled: boolean,
): ScanStatus {
  if (!aiTipsEnabled && status === "ai_enrichment") {
    return "scoring";
  }
  return status;
}

function visibleScanSteps(aiTipsEnabled: boolean) {
  if (aiTipsEnabled) return SCAN_STEPS;
  return SCAN_STEPS.filter((step) => step.id !== "ai_enrichment");
}

export function ScanExperience({
  batchSnapshot,
}: {
  batchSnapshot: BatchSidebarSnapshot;
}) {
  const { date: batchSnapshotDate, meta: batchMeta, summary: batchSummary } =
    batchSnapshot;
  const inputId = useId();
  const errorId = useId();
  const examplesId = useId();
  const howItWorksId = useId();
  const howToUseId = useId();
  const [url, setUrl] = useState("https://example.com");
  const [aiTipsEnabled, setAiTipsEnabled] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanSummary | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const errorAlertRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then(async (res) => {
        const data = (await res.json()) as { aiTipsEnabled?: boolean };
        if (!cancelled) {
          setAiTipsEnabled(Boolean(data.aiTipsEnabled));
        }
      })
      .catch(() => {
        if (!cancelled) setAiTipsEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const scanSteps = useMemo(
    () => visibleScanSteps(aiTipsEnabled),
    [aiTipsEnabled],
  );

  useEffect(() => {
    if (phase !== "scanning" || !scan?.id) return;

    const scanId = scan.id;
    let cancelled = false;

    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scanId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Could not load scan status.");
        }
        if (cancelled) return;

        const next = data.scan as ScanSummary;

        if (next.status === "completed") {
          window.clearInterval(timer);
          const issuesRes = await fetch(`/api/scans/${next.id}/issues`);
          const issuesData = await issuesRes.json();
          if (!issuesRes.ok) {
            throw new Error(issuesData.error ?? "Could not load issues.");
          }
          if (cancelled) return;
          setIssues(issuesData.issues as Issue[]);
          setSelectedId(issuesData.issues[0]?.id ?? null);
          setScan(next);
          setPhase("results");
          return;
        }

        if (next.status === "failed") {
          window.clearInterval(timer);
          setScan(next);
          setError(next.errorMessage ?? "Scan failed.");
          setPhase("error");
          return;
        }

        // Progress update only — do not restart this effect.
        setScan(next);
      } catch (err) {
        if (cancelled) return;
        window.clearInterval(timer);
        setError(err instanceof Error ? err.message : "Scan polling failed.");
        setPhase("error");
      }
    }, 600);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
    // Intentionally depend on scan.id only so status updates don't cancel in-flight completion.
  }, [phase, scan?.id]);

  useEffect(() => {
    if (phase === "results") {
      resultsHeadingRef.current?.focus();
    } else if (phase === "error" && error) {
      errorAlertRef.current?.focus();
    }
  }, [phase, error]);

  async function startScan(rawUrl: string) {
    setError(null);
    setIssues([]);
    setSelectedId(null);
    setSeverityFilter("all");

    const validation = validateScanUrl(rawUrl);
    if (!validation.ok) {
      setError(validation.error);
      setPhase("error");
      return;
    }

    setUrl(validation.url);
    setScan(null);
    setPhase("submitting");

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: validation.url }),
      });
      const data = await res.json();
      if (!res.ok) {
        const retry =
          typeof data.retryAfterSec === "number" && data.retryAfterSec > 0
            ? ` Try again in about ${data.retryAfterSec} seconds.`
            : "";
        throw new Error((data.error ?? "Could not start scan.") + retry);
      }
      setScan(data.scan as ScanSummary);
      setPhase("scanning");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start scan.");
      setPhase("error");
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await startScan(url);
  }

  function reset() {
    setPhase("idle");
    setScan(null);
    setIssues([]);
    setSelectedId(null);
    setError(null);
    setSeverityFilter("all");
  }

  function backToHome() {
    reset();
  }

  const filteredIssues =
    severityFilter === "all"
      ? issues
      : issues.filter((issue) => issue.severity === severityFilter);
  const selected = issues.find((issue) => issue.id === selectedId) ?? null;
  const rating = scoreRating(scan?.score);
  const cleanScan = phase === "results" && issues.length === 0;
  const criticalCount = scan?.summaryCounts?.critical ?? 0;
  const failedScanUrl =
    phase === "error" && scan?.url ? scan.url : null;
  const batchPass =
    phase === "results" && scan
      ? websiteBatchPass(scan.score ?? 0, criticalCount)
      : null;
  const batchFailReason =
    phase === "results" && scan && batchPass === false
      ? websiteBatchFailReason(scan.score ?? 0, criticalCount)
      : null;

  return (
    <div className="scan-shell">
      {(phase === "idle" || phase === "submitting" || phase === "error") && (
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-grid">
            <div className="hero-primary">
          <p className="brand">Lumen</p>
          <p className="hero-eyebrow">WCAG-oriented · live Playwright + axe</p>
          <h1 id="hero-heading" className="headline headline-hero">
            <span className="headline-accent">Accessibility</span> checker
          </h1>
          <p className="lede">
            Paste a public URL. Get automated accessibility findings, a clear
            score, and links to rule help.
          </p>

          <form className="scan-form" onSubmit={onSubmit} noValidate>
            {phase === "error" && failedScanUrl && (
              <div className="error-summary" role="group" aria-label="Scan failure">
                <p className="error-summary-title">Scan did not finish</p>
                <p className="error-summary-url">{failedScanUrl}</p>
              </div>
            )}
            <label htmlFor={inputId} className="url-label">
              Website URL
            </label>
            <div className="url-row">
              <input
                id={inputId}
                name="url"
                type="url"
                inputMode="url"
                autoComplete="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                  error ? `${examplesId} ${errorId}` : `${examplesId} url-hint`
                }
                disabled={phase === "submitting"}
                required
              />
              <button type="submit" disabled={phase === "submitting"}>
                {phase === "submitting" ? "Starting…" : "Check accessibility"}
              </button>
            </div>

            <div id={examplesId} className="example-row">
              <span className="example-label">Try</span>
              {EXAMPLE_URLS.map((example) => (
                <button
                  key={example.url}
                  type="button"
                  className={`example-chip${
                    "chipClass" in example && example.chipClass === "demo-bad"
                      ? " example-chip-demo-bad"
                      : ""
                  }`}
                  disabled={phase === "submitting"}
                  title={example.ariaDescription}
                  aria-label={`${example.label}: ${example.ariaDescription}`}
                  onClick={() => setUrl(example.url)}
                >
                  {example.label}
                </button>
              ))}
            </div>
            <p className="hint example-descriptions">
              {EXAMPLE_URLS.map((example, index) => (
                <span key={example.url}>
                  {index > 0 ? (
                    <span className="example-desc-sep" aria-hidden="true">
                      {" "}
                      ·{" "}
                    </span>
                  ) : null}
                  <span
                    className={`example-desc${
                      "chipClass" in example && example.chipClass === "demo-bad"
                        ? " example-desc-fail"
                        : " example-desc-pass"
                    }`}
                  >
                    <strong>{example.label}</strong> — {example.hint}
                  </span>
                </span>
              ))}
            </p>

            <p id="url-hint" className="hint">
              {URL_PUBLIC_HINT}
            </p>
            {error && (
              <>
                <p
                  id={errorId}
                  ref={errorAlertRef}
                  tabIndex={-1}
                  className="form-error"
                  role="alert"
                >
                  {error}
                </p>
                <button
                  type="button"
                  className="button-secondary retry-button"
                  disabled={phase === "submitting"}
                  onClick={() => startScan(url)}
                >
                  Try again
                </button>
              </>
            )}
          </form>
            </div>

            <aside className="hero-aside" aria-label="Quick links">
              <div
                className="hero-stat-card"
                aria-label={`Batch snapshot: ${batchSummary.tested} sites, ${batchSummary.passed} pass, ${batchSummary.failed} fail`}
              >
                <p className="hero-stat-kicker">Portfolio snapshot</p>
                <p className="hero-stat-value">
                  <span className="hero-stat-num">
                    {batchSummary.tested}
                  </span>
                  <span className="hero-stat-unit">sites tested</span>
                </p>
                <p className="hero-stat-split">
                  <span className="hero-stat-pass">
                    {batchSummary.passed} Pass
                  </span>
                  <span className="hero-stat-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="hero-stat-fail">
                    {batchSummary.failed} Fail
                  </span>
                </p>
                <p className="hero-stat-meta">
                  {batchSummary.totalIssues} issues · resync{" "}
                  {batchSnapshotDate} ({batchResyncDetailFromMeta(batchMeta)})
                </p>
                <Link href="/batch" className="hero-stat-link">
                  Open batch dashboard →
                </Link>
              </div>
              <details className="learn-more home-sidebar-guide">
                <summary>Pass/Fail rule &amp; disclaimer</summary>
                <div className="learn-more-body">
                  <p>
                    <strong className="home-guide-pass">
                      {PASS_FAIL_PASS_HEADING}:
                    </strong>{" "}
                    {PASS_FAIL_PASS_BODY}
                  </p>
                  <p>
                    <strong>Batch dashboard:</strong>{" "}
                    <Link href="/batch">28-site snapshot</Link> with Pass/Fail,
                    severity totals, and recommended actions for each URL.
                  </p>
                  <p>
                    <strong>Assistive only:</strong> {DISCLAIMER_ASSISTIVE}
                  </p>
                </div>
              </details>
            </aside>
          </div>

          <section className="how-to-use home-guide-section" aria-labelledby={howToUseId}>
            <h2 id={howToUseId}>{HOW_TO_USE_HEADING}</h2>
            <p className="how-to-use-lede">{HOW_TO_USE_LEDE}</p>
            <ol className="how-grid how-to-use-grid">
              {HOW_TO_USE_STEPS.map((item) => (
                <li key={item.id} className="how-card">
                  <span className="how-card-step" aria-hidden="true">
                    {item.step}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="how-it-works home-guide-section"
            aria-labelledby={howItWorksId}
          >
            <div className="how-it-works-head">
              <h2 id={howItWorksId}>{HOW_IT_WORKS_HEADING}</h2>
              <span
                className={`ai-status-pill${aiTipsEnabled ? " ai-status-on" : ""}`}
              >
                {aiTipsEnabled ? "AI tips on" : "AI tips off"}
                <span className="sr-only">
                  {aiTipsEnabled
                    ? ". AI guidance is enabled on this server."
                    : ". Automated axe scan and scoring are unchanged."}
                </span>
              </span>
            </div>
            <ol className="how-grid">
              {HOW_IT_WORKS_ITEMS.map((item) => (
                <li key={item.id} className="how-card">
                  <span className="how-card-step" aria-hidden="true">
                    {item.step}
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      {item.id === "ai-tips"
                        ? aiTipsEnabled
                          ? "Short explanations and fix ideas for the most severe issues on this scan."
                          : "Not enabled on this Lumen server — you still get rule findings, WCAG mapping, and a score."
                        : item.body}
                    </p>
                    {item.id === "public-urls" && (
                      <p className="how-examples">
                        <span className="how-ok">✓ https://example.com</span>
                        <span className="how-no">✗ localhost or 127.0.0.1</span>
                        <span className="how-no">✗ 192.168.x.x</span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <div className="learn-more-group">
              <h3 className="home-faq-heading">{FAQ_HEADING}</h3>
              <p className="home-faq-lede">{FAQ_LEDE}</p>
              <p className="batch-link-row">
                <Link href="/batch" className="batch-dashboard-link">
                  Website batch results (28-site snapshot)
                </Link>
              </p>
              {HOME_FAQS.map((faq) => (
                <details key={faq.id} className="learn-more">
                  <summary>{faq.summary}</summary>
                  <div className="learn-more-body">
                    {faq.paragraphs.map((paragraph, index) => (
                      <p key={`${faq.id}-${index}`}>{paragraph}</p>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </section>
      )}

      {phase === "scanning" && scan && (
        <section className="status-panel" aria-live="polite" aria-busy="true">
          <div className="panel-topbar">
            <button type="button" className="back-link" onClick={backToHome}>
              ← Back to home
            </button>
          </div>
          <p className="brand compact">Lumen</p>
          <h2>Checking {scan.url}</h2>
          <p className="status-line">
            {STATUS_LABEL[
              effectiveScanStatus(scan.status, aiTipsEnabled)
            ] ?? scan.status}
          </p>
          <div className="progress-track progress-track-active" aria-hidden="true">
            <div className="progress-bar" />
          </div>
          <ol className="scan-steps">
            {scanSteps.map((step) => {
              const state = stepState(
                effectiveScanStatus(scan.status, aiTipsEnabled),
                step.id,
              );
              return (
                <li key={step.id} className={`scan-step scan-step-${state}`}>
                  <span className="scan-step-marker" aria-hidden="true" />
                  <span>
                    {step.label}
                    {state === "active" ? " (in progress)" : ""}
                    {state === "done" ? " (done)" : ""}
                  </span>
                </li>
              );
            })}
          </ol>
          {!aiTipsEnabled && (
            <p className="scan-note hint">
              AI guidance is not enabled on this Lumen server; automated rule
              checks and scoring still run as usual.
            </p>
          )}
        </section>
      )}

      {phase === "results" && scan && (
        <section className="results" aria-labelledby="results-heading">
          <div className="panel-topbar">
            <button type="button" className="back-link" onClick={backToHome}>
              ← New scan
            </button>
          </div>
          <header className="results-header">
            <div>
              <p className="brand compact">Lumen</p>
              <h2 id="results-heading" ref={resultsHeadingRef} tabIndex={-1}>
                Results
              </h2>
              <p className="results-url">
                <a href={scan.url} target="_blank" rel="noopener noreferrer">
                  {scan.url}
                </a>
              </p>
            </div>
            <div
              className={`score-block score-${rating.tone} score-animate-in`}
              aria-label={`Accessibility score ${scan.score}, ${rating.label}`}
            >
              <p className="score-value">{scan.score}</p>
              <p className="score-label">Score</p>
              <p className="score-rating">{rating.label}</p>
              {batchPass !== null && (
                <p
                  className={`batch-live-badge batch-live-badge-${batchPass ? "pass" : "fail"}`}
                >
                  Batch: {batchPass ? "Pass" : "Fail"}
                </p>
              )}
            </div>
          </header>

          {batchPass === false && batchFailReason && (
            <p className="batch-live-reason hint" role="note">
              {criticalCount > 0 && (
                <span className="batch-critical-callout-inline">
                  Critical: {criticalCount}.{" "}
                </span>
              )}
              {batchFailReason}
            </p>
          )}

          {criticalCount > 0 && (
            <p className="critical-banner" role="alert">
              <strong>{criticalCount} critical</strong>{" "}
              {criticalCount === 1 ? "issue" : "issues"} — address these before
              lower-severity items, even if the score looks acceptable.
            </p>
          )}

          <p className="score-explainer">
            Score <strong>0–100</strong> from automated issue counts.{" "}
            <strong>{rating.label}</strong> means {scan.score ?? 0} (85+ is
            Strong). {SCORE_BATCH_PASS_NOTE}
          </p>

          <ul className="count-row" aria-label="Issue counts by severity">
            {SEVERITY_ORDER.map((severity) => (
              <li key={severity}>
                <span className={`sev sev-${severity}`}>{severity}</span>
                <strong>{scan.summaryCounts?.[severity] ?? 0}</strong>
              </li>
            ))}
          </ul>

          <dl className="severity-legend">
            {SEVERITY_ORDER.map((severity) => (
              <div key={severity}>
                <dt className={`sev sev-${severity}`}>{severity}</dt>
                <dd>{SEVERITY_HINT[severity]}</dd>
              </div>
            ))}
          </dl>

          {cleanScan ? (
            <div className="success-panel" role="status">
              <h3>Looking good</h3>
              <p>
                Automated scan finished with score{" "}
                <strong>{scan.score ?? 0}</strong> and{" "}
                <strong>0 issues</strong> for this page under the current WCAG
                A/AA rule set. That is the actual result — not a missing report.
                It is still not a formal certificate, so keep doing manual checks
                too.
              </p>
              <div className="toolbar-actions">
                <a
                  className="button-secondary"
                  href={`/api/scans/${scan.id}/export?format=json`}
                >
                  Export JSON
                </a>
                <button type="button" className="button-secondary" onClick={backToHome}>
                  New scan
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="toolbar">
                <label>
                  Filter severity
                  <select
                    value={severityFilter}
                    onChange={(e) =>
                      setSeverityFilter(e.target.value as Severity | "all")
                    }
                  >
                    <option value="all">All</option>
                    {SEVERITY_ORDER.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="toolbar-actions">
                  <a
                    className="button-secondary"
                    href={`/api/scans/${scan.id}/export?format=json`}
                  >
                    Export JSON
                  </a>
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={backToHome}
                  >
                    New scan
                  </button>
                </div>
              </div>

              <p className="disclaimer">{DISCLAIMER_ASSISTIVE_SHORT}</p>

              <div className="results-grid">
                <div className="issue-list" role="list">
                  {filteredIssues.length === 0 && (
                    <p className="empty">No issues for this filter.</p>
                  )}
                  {filteredIssues.map((issue) => (
                    <button
                      key={issue.id}
                      type="button"
                      role="listitem"
                      className={`issue-item${selectedId === issue.id ? " active" : ""}`}
                      onClick={() => setSelectedId(issue.id)}
                      aria-current={selectedId === issue.id ? "true" : undefined}
                    >
                      <span className={`sev sev-${issue.severity}`}>
                        {issue.severity}
                      </span>
                      <span className="issue-message">{issue.message}</span>
                    </button>
                  ))}
                </div>

                <article className="issue-detail" aria-live="polite">
                  {!selected && (
                    <p className="empty">
                      Select an issue to see WCAG criteria, the HTML snippet,
                      and rule help.
                    </p>
                  )}
                  {selected && (
                    <>
                      <p className={`sev sev-${selected.severity}`}>
                        {selected.severity}
                      </p>
                      <h3>{selected.message}</h3>
                      <dl className="meta">
                        <div>
                          <dt>WCAG</dt>
                          <dd>{selected.wcagCriteria.join(", ") || "—"}</dd>
                        </div>
                        <div>
                          <dt>Rule</dt>
                          <dd>{selected.ruleId ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Selector</dt>
                          <dd>
                            <code>{selected.selector}</code>
                          </dd>
                        </div>
                      </dl>
                      <h4>Snippet</h4>
                      <pre>
                        <code>{selected.htmlSnippet}</code>
                      </pre>
                      {selected.helpUrl && (
                        <p>
                          <a
                            href={selected.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Rule help
                          </a>
                        </p>
                      )}
                      {selected.aiExplanation && (
                        <div className="ai-panel">
                          <h4>AI guidance</h4>
                          <p>{selected.aiExplanation}</p>
                          {selected.aiRemediation && (
                            <>
                              <h4>Suggested fix</h4>
                              <p>{selected.aiRemediation}</p>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </article>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
