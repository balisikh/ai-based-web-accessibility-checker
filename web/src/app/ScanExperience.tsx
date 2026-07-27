"use client";

import { useEffect, useId, useState } from "react";
import type { Issue, ScanSummary, Severity } from "@/lib/types";

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

export function ScanExperience() {
  const inputId = useId();
  const errorId = useId();
  const [url, setUrl] = useState("https://example.com");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [scan, setScan] = useState<ScanSummary | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "scanning" || !scan) return;

    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const res = await fetch(`/api/scans/${scan.id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Could not load scan status.");
        }
        if (cancelled) return;

        const next = data.scan as ScanSummary;
        setScan(next);

        if (next.status === "completed") {
          const issuesRes = await fetch(`/api/scans/${next.id}/issues`);
          const issuesData = await issuesRes.json();
          if (!issuesRes.ok) {
            throw new Error(issuesData.error ?? "Could not load issues.");
          }
          if (cancelled) return;
          setIssues(issuesData.issues as Issue[]);
          setSelectedId(issuesData.issues[0]?.id ?? null);
          setPhase("results");
          window.clearInterval(timer);
        }

        if (next.status === "failed") {
          setError(next.errorMessage ?? "Scan failed.");
          setPhase("error");
          window.clearInterval(timer);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Scan polling failed.");
        setPhase("error");
        window.clearInterval(timer);
      }
    }, 600);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [phase, scan]);

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
  }

  const filteredIssues =
    severityFilter === "all"
      ? issues
      : issues.filter((issue) => issue.severity === severityFilter);
  const selected = issues.find((issue) => issue.id === selectedId) ?? null;

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
                aria-describedby={error ? errorId : "url-hint"}
                disabled={phase === "submitting"}
                required
              />
              <button type="submit" disabled={phase === "submitting"}>
                {phase === "submitting" ? "Starting…" : "Check accessibility"}
              </button>
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
          <p className="brand compact">Lumen</p>
          <h2>Checking {scan.url}</h2>
          <p className="status-line">
            {STATUS_LABEL[scan.status] ?? scan.status}
          </p>
          <div className="progress-track" aria-hidden="true">
            <div className="progress-bar" />
          </div>
        </section>
      )}

      {phase === "results" && scan && (
        <section className="results" aria-labelledby="results-heading">
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
            <div className="score-block" aria-label={`Accessibility score ${scan.score}`}>
              <p className="score-value">{scan.score}</p>
              <p className="score-label">Score</p>
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
              <button type="button" className="button-secondary" onClick={reset}>
                New scan
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
                  <span className={`sev sev-${issue.severity}`}>{issue.severity}</span>
                  <span className="issue-message">{issue.message}</span>
                </button>
              ))}
            </div>

            <article className="issue-detail" aria-live="polite">
              {!selected && <p className="empty">Select an issue to see details.</p>}
              {selected && (
                <>
                  <p className={`sev sev-${selected.severity}`}>{selected.severity}</p>
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
        </section>
      )}
    </div>
  );
}
