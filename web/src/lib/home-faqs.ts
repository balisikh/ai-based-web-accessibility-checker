export type HomeFaq = {
  id: string;
  summary: string;
  paragraphs: string[];
};

/** Expandable FAQs below “How Lumen checks a page” (URLs + limits are separate). */
export const HOME_EXTRA_FAQS: HomeFaq[] = [
  {
    id: "score-pass-fail",
    summary: "How is the score calculated? What does Pass / Fail mean?",
    paragraphs: [
      "The score is 0–100 from automated issue counts (axe-core). Higher is better. Strong on the results screen means 85 or above.",
      "In our website batch tests, Pass means score at least 85 and zero critical issues. Fail is score below 85 or any critical issue. Live scan results show the same Batch Pass/Fail badge when those rules apply.",
      "Open Website batch results from the link below this section for the 28-site snapshot and severity totals.",
    ],
  },
  {
    id: "ai-tips",
    summary: "What are AI tips? Why are they off?",
    paragraphs: [
      "When enabled, Lumen sends the top few issues (by severity) to an OpenAI-compatible API for a short explanation and suggested fix. Rule findings and scoring run without AI.",
      "AI tips are off when this Lumen server has no AI_API_KEY or OPENAI_API_KEY in its environment. That is a deployment setting, not something the website you scan controls.",
      "Operators add a key in web/.env.local (local) or host secrets (production), then restart the app. The home pill and GET /api/config show whether AI is configured.",
    ],
  },
  {
    id: "failures-rate-limit",
    summary: "Why did my scan fail or say rate limited?",
    paragraphs: [
      "Scans can fail when the URL is blocked (private or local), the page times out, the site blocks automated browsers, or Playwright cannot launch a browser.",
      "A 429 rate limit means too many scan requests from your IP in a short window. Default is 5 per minute in production (RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS). Local dev allows more unless you override those variables.",
      "Fix the URL, wait a minute, or ask the operator to raise limits for testing. Use Try again after errors when the message is transient.",
    ],
  },
  {
    id: "data-privacy",
    summary: "What happens to my URL and scan data?",
    paragraphs: [
      "Each scan stores the URL, findings, and score in the app database (Postgres or local PGlite under web/data/). There are no user accounts in the MVP.",
      "Data is used to show your results and Export JSON. Do not paste secrets into URLs; query tokens in links may be stored.",
      "Retention is not automated in the MVP. See DEPLOY.md for backup and database notes on hosted environments.",
    ],
  },
];
