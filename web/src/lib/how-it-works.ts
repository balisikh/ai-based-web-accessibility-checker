export type HowItWorksItem = {
  step: number;
  id: string;
  title: string;
  body: string;
};

export const HOW_IT_WORKS_ITEMS: HowItWorksItem[] = [
  {
    step: 1,
    id: "public-urls",
    title: "Public websites",
    body: "Use http or https links that anyone can open on the internet.",
  },
  {
    step: 2,
    id: "browser-scan",
    title: "Real browser scan",
    body: "Automated Chrome loads the page in the background, like a real visitor.",
  },
  {
    step: 3,
    id: "wcag-rules",
    title: "Accessibility rules",
    body: "Industry-standard checks (axe-core) for common WCAG Level A and AA requirements.",
  },
  {
    step: 4,
    id: "ai-tips",
    title: "Optional AI tips",
    body: "Plain-language fix ideas for top issues when the site operator enables AI.",
  },
];
