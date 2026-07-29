export function BatchReadGuide() {
  return (
    <details className="learn-more batch-read-guide">
      <summary>How to read this dashboard</summary>
      <div className="learn-more-body">
        <p>
          Static snapshot of <strong>28 public sites</strong> from the test plan
          (not a live scan). Pass/Fail colors stay clear in{" "}
          <strong>Light</strong>, <strong>Dark</strong>, and <strong>System</strong>{" "}
          themes.
        </p>
        <h3 className="batch-read-subhead">Color legend</h3>
        <div className="batch-legend" role="list" aria-label="Color legend">
          <div className="batch-legend-item batch-legend-pass" role="listitem">
            <span className="batch-legend-swatch" aria-hidden="true" />
            <span>
              <strong>Pass</strong> — score at least 85 and zero critical issues.
              Teal row tint and badge.
            </span>
          </div>
          <div className="batch-legend-item batch-legend-fail" role="listitem">
            <span className="batch-legend-swatch" aria-hidden="true" />
            <span>
              <strong>Fail</strong> — score below 85 and/or one or more critical
              issues. Warm row tint and badge.
            </span>
          </div>
          <div className="batch-legend-item batch-legend-guidance" role="listitem">
            <span className="batch-legend-swatch" aria-hidden="true" />
            <span>
              <strong>Notes column</strong> — colored left edge (teal = Pass site,
              red = Fail). Bullet list of what to fix or maintain.
            </span>
          </div>
        </div>
        <h3 className="batch-read-subhead">Sections on this page</h3>
        <ul className="batch-read-list">
          <li>
            <strong>Overview</strong> — how many sites tested, passed, failed, and
            total issues. “Passed with issues” still counts as Pass.
          </li>
          <li>
            <strong>Severity totals</strong> — sum of Critical, Serious,
            Moderate, and Minor across all 28 scans (labels match table colors).
          </li>
          <li>
            <strong>All websites</strong> — one row per site: scores, counts,
            Pass/Fail, and recommendations.
          </li>
        </ul>
      </div>
    </details>
  );
}
