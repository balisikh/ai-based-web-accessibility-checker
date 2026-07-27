"use client";

import { useEffect, useId, useState } from "react";
import type { Issue, ScanStatus, ScanSummary, Severity } from "@/lib/types";

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

const EXAMPLE_URLS = [
  { label: "example.com", url: "https://example.com" },
  {
    label: "W3C bad demo",
    url: "https://www.w3.org/WAI/demos/bad/before/home.html",
  },
] as const;

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

export function ScanExperience() {
  const inputId = useId();
  const errorId = useId();
  const examplesId = useId();
  const [url, setUrl] = useState("https://example.com");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanSummary | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIssues([]);
    setSelectedId(null);
    setSeverityFilter("all");
    setPhase("submitting");

    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not start scan.");
      }
      setScan(data.scan as ScanSummary);
      setPhase("scanning");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start scan.");
      setPhase("error");
    }
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

  return (
    <div className="scan-shell">
      {(phase === "idle" || phase === "submitting" || phase === "error") && (
        <section className="hero" aria-labelledby="hero-heading">
          <p className="brand">Lumen</p>
          <h1 id="hero-heading" className="headline">
            Accessibility Checker
          </h1>
          <p className="lede">
            Paste a public URL. Get WCAG-oriented findings, a clear score, and
            practical fix guidance.
          </p>

          <form className="scan-form" onSubmit={onSubmit} noValidate>
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
                  className="example-chip"
                  disabled={phase === "submitting"}
                  onClick={() => setUrl(example.url)}
                >
                  {example.label}
                </button>
              ))}
            </div>

            <p id="url-hint" className="hint">
              Public http/https pages only. We do not scan private or local
              network addresses. Scans run in a headless browser with axe-core
              (WCAG A/AA tags). Optional AI tips appear when an API key is
              configured on the server.
            </p>
            {error && (
              <p id={errorId} className="form-error" role="alert">
                {error}
              </p>
            )}
          </form>
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
            {STATUS_LABEL[scan.status] ?? scan.status}
          </p>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-bar" />
          </div>
          <ol className="scan-steps">
            {SCAN_STEPS.map((step) => {
              const state = stepState(scan.status, step.id);
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
        </section>
      )}

      {phase === "results" && scan && (
        <section className="results" aria-labelledby="results-heading">
          <div className="panel-topbar">
            <button type="button" className="back-link" onClick={backToHome}>
              ← Back to home
            </button>
          </div>
          <header className="results-header">
            <div>
              <p className="brand compact">Lumen</p>
              <h2 id="results-heading">Results</h2>
              <p className="results-url">
                <a href={scan.url} target="_blank" rel="noopener noreferrer">
                  {scan.url}
                </a>
              </p>
            </div>
            <div
              className={`score-block score-${rating.tone}`}
              aria-label={`Accessibility score ${scan.score}, ${rating.label}`}
            >
              <p className="score-value">{scan.score}</p>
              <p className="score-label">Score</p>
              <p className="score-rating">{rating.label}</p>
            </div>
          </header>

          <ul className="count-row">
            {SEVERITY_ORDER.map((severity) => (
              <li key={severity}>
                <span className={`sev sev-${severity}`}>{severity}</span>
                <strong>{scan.summaryCounts?.[severity] ?? 0}</strong>
              </li>
            ))}
          </ul>

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
                  Back to home
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
                    Back to home
                  </button>
                </div>
              </div>

              <p className="disclaimer">
                Assistive findings only — not a legal accessibility certificate.
              </p>

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
                    <p className="empty">Select an issue to see details.</p>
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
