import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

/** Static layout sample for responsive overflow tests (not a real scan). */
export const metadata = pageMetadata({
  title: "Results layout fixture",
  description: "Internal layout fixture for responsive tests.",
  path: "/fixtures/results",
  noIndex: true,
});

export default function ResultsLayoutFixturePage() {
  return (
    <main className="scan-shell">
      <section className="results" aria-labelledby="fixture-results-heading">
        <div className="panel-topbar">
          <Link href="/" className="back-link">
            ← New scan
          </Link>
        </div>
        <header className="results-header">
          <div>
            <p className="brand compact">Lumen</p>
            <h2 id="fixture-results-heading">Results</h2>
            <p className="results-url">
              <a
                href="https://www.w3.org/WAI/demos/bad/before/home.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.w3.org/WAI/demos/bad/before/home.html
              </a>
            </p>
          </div>
          <div
            className="score-block score-needs-work"
            aria-label="Accessibility score 42, Needs work"
          >
            <p className="score-value">42</p>
            <p className="score-label">Score</p>
            <p className="score-rating">Needs work</p>
            <p className="batch-live-badge batch-live-badge-fail">Batch: Fail</p>
          </div>
        </header>

        <p className="batch-live-reason hint" role="note">
          <span className="batch-critical-callout-inline">Critical: 3. </span>
          3 critical issues; score 42 (need ≥ 85)
        </p>

        <p className="critical-banner" role="alert">
          <strong>3 critical</strong> issues — address these before lower-severity
          items, even if the score looks acceptable.
        </p>

        <p className="score-explainer">
          Score <strong>0–100</strong> from automated issue counts.{" "}
          <strong>Needs work</strong> means 42 (85+ is Strong). In our website test
          batches, <strong>Pass</strong> also requires zero critical issues.
        </p>

        <ul className="count-row" aria-label="Issue counts by severity">
          <li>
            <span className="sev sev-critical">critical</span>
            <strong>3</strong>
          </li>
          <li>
            <span className="sev sev-serious">serious</span>
            <strong>2</strong>
          </li>
          <li>
            <span className="sev sev-moderate">moderate</span>
            <strong>5</strong>
          </li>
          <li>
            <span className="sev sev-minor">minor</span>
            <strong>1</strong>
          </li>
        </ul>

        <dl className="severity-legend">
          <div>
            <dt className="sev sev-critical">critical</dt>
            <dd>Blocks many users — fix first.</dd>
          </div>
          <div>
            <dt className="sev sev-serious">serious</dt>
            <dd>Major barriers for some users.</dd>
          </div>
        </dl>

        <div className="toolbar">
          <label>
            Filter severity
            <select defaultValue="all" aria-label="Filter severity">
              <option value="all">All</option>
              <option value="critical">critical</option>
            </select>
          </label>
          <div className="toolbar-actions">
            <span className="button-secondary">Export JSON</span>
            <span className="button-secondary">New scan</span>
          </div>
        </div>

        <p className="disclaimer">
          Assistive findings only — not a legal accessibility certificate.
        </p>

        <div className="results-grid">
          <div className="issue-list" role="list">
            <button type="button" role="listitem" className="issue-item active">
              <span className="sev sev-critical">critical</span>
              <span className="issue-message">
                Images must have alternate text: decorative banner missing alt
              </span>
            </button>
            <button type="button" role="listitem" className="issue-item">
              <span className="sev sev-serious">serious</span>
              <span className="issue-message">
                Elements must meet minimum color contrast ratio thresholds
              </span>
            </button>
          </div>
          <article className="issue-detail">
            <p className="sev sev-critical">critical</p>
            <h3>Images must have alternate text</h3>
            <dl className="meta">
              <div>
                <dt>WCAG</dt>
                <dd>1.1.1</dd>
              </div>
              <div>
                <dt>Rule</dt>
                <dd>image-alt</dd>
              </div>
              <div>
                <dt>Selector</dt>
                <dd>
                  <code>img.hero-banner</code>
                </dd>
              </div>
            </dl>
            <h4>Snippet</h4>
            <pre>
              <code>{`<img class="hero-banner" src="/banner.jpg">`}</code>
            </pre>
          </article>
        </div>
      </section>
    </main>
  );
}
