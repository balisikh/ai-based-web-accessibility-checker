/** In-app copy of README “How to use” — keep in sync when that section changes. */
export type HowToUseStep = {
  step: number;
  id: string;
  title: string;
  body: string;
};

export const HOW_TO_USE_STEPS: HowToUseStep[] = [
  {
    step: 1,
    id: "enter-url",
    title: "Enter a public URL",
    body: "Paste an http or https link in the field above (for example https://example.com), or pick a Try example.",
  },
  {
    step: 2,
    id: "start-scan",
    title: "Check accessibility",
    body: "Click Check accessibility to scan that single page. Localhost and private network addresses are blocked.",
  },
  {
    step: 3,
    id: "wait",
    title: "Wait for progress",
    body: "Follow the status steps while Lumen fetches the page, runs rules, optional AI tips (when enabled), and calculates a score. Most public pages finish within about a minute.",
  },
  {
    step: 4,
    id: "review",
    title: "Review findings",
    body: "Check the score and severity counts. Select an issue to see WCAG mapping, HTML snippet, rule help, and AI guidance when enabled on this server. Filter by severity if the list is long.",
  },
  {
    step: 5,
    id: "export",
    title: "Export JSON (optional)",
    body: "On the results screen, use Export JSON to download the report for tickets, docs, or automation.",
  },
];
