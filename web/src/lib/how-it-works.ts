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
    body: "A headless Chromium session loads the page like a visitor would.",
  },
  {
    step: 3,
    id: "wcag-rules",
    title: "WCAG A/AA rules",
    body: "axe-core runs automated checks tagged for WCAG 2.x Levels A and AA.",
  },
  {
    step: 4,
    id: "ai-tips",
    title: "AI tips",
    body: "Optional plain-language fixes for top issues when this server has an API key.",
  },
];
