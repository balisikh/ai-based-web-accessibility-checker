export function BatchReadGuide() {
  return (
    <details className="learn-more batch-read-guide">
      <summary>How to read this dashboard</summary>
      <div className="learn-more-body">
        <p>
          This page is a <strong>static snapshot</strong> of 28 public sites
          from the test plan — not a live scan. Colors adapt to your{" "}
          <strong>Light / Dark / System</strong> theme in the header.
        </p>
        <div className="batch-legend" role="list" aria-label="Color legend">
          <div className="batch-legend-item batch-legend-pass" role="listitem">
            <span className="batch-legend-swatch" aria-hidden="true" />
            <span>
              <strong>Pass</strong> — score ≥ 85 and critical = 0 (teal row /
              badge)
            </span>
          </div>
          <div className="batch-legend-item batch-legend-fail" role="listitem">
            <span className="batch-legend-swatch" aria-hidden="true" />
            <span>
              <strong>Fail</strong> — score below 85 and/or critical issues
              (warm row / badge)
            </span>
          </div>
          <div className="batch-legend-item batch-legend-guidance" role="listitem">
            <span className="batch-legend-swatch" aria-hidden="true" />
            <span>
              <strong>Notes column</strong> — left border matches Pass (teal) or
              Fail (red); lists what to fix or maintain
            </span>
          </div>
        </div>
        <ul className="batch-read-list">
          <li>
            <strong>Tested / Passed / Failed</strong> — website batch rule counts
            (Passed may include sites with non-critical issues).
          </li>
          <li>
            <strong>Critical → Minor</strong> — total axe findings summed across
            all 28 URLs; severity labels use the same colors in every theme.
          </li>
          <li>
            <strong>Result column</strong> — Pass/Fail badge plus short callouts
            (e.g. issue count still to triage on a Pass).
          </li>
        </ul>
      </div>
    </details>
  );
}
