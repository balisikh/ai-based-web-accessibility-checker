import {
  DISCLAIMER_SCAN_LIMITS,
  HOW_IT_WORKS_HEADING,
  PASS_FAIL_RULE_FAQ,
  PASS_FAIL_RULE_INLINE,
  SCORE_FORMULA,
  SCORE_LABELS,
} from "./product-copy";
import { tryExamplesFaqSentence } from "./try-examples";

export type HomeFaq = {
  id: string;
  summary: string;
  paragraphs: string[];
};

/**
 * Common questions on the home page (collapsed details).
 * Order: URLs → limits → score → live vs batch → export → AI → failures → data → free → author.
 */
export const HOME_FAQS: HomeFaq[] = [
  {
    id: "urls",
    summary: "What URLs can I use?",
    paragraphs: [
      "Lumen scans pages on the public web. Use http or https links that open in a normal browser without signing in.",
      "Blocked: localhost, 127.0.0.1, private IPs (192.168.x.x, 10.x.x.x), and hostnames that resolve to them — SSRF protection so Lumen cannot probe your home or office network.",
      tryExamplesFaqSentence(),
    ],
  },
  {
    id: "scan-limits",
    summary: "What are the limits of a scan?",
    paragraphs: [
      "Each run checks one URL, not a whole website. Most public pages finish in a few seconds to about a minute.",
      "Login-only, paywalled, or bot-challenged pages may show a sign-in shell or partial content — batch results for Gmail and similar sites note this.",
      DISCLAIMER_SCAN_LIMITS,
    ],
  },
  {
    id: "score-pass-fail",
    summary: "How is the score calculated? What does Pass / Fail mean?",
    paragraphs: [
      `The score is 0–100 from issue counts: ${SCORE_FORMULA} Results label: ${SCORE_LABELS}`,
      PASS_FAIL_RULE_FAQ,
      "The 28-site batch snapshot on Website batch results uses the same rule; live scans and the batch table are separate — run Check accessibility to scan a URL now.",
    ],
  },
  {
    id: "live-vs-batch",
    summary:
      "What's the difference between a live scan and Website batch results?",
    paragraphs: [
      "A live scan runs when you click Check accessibility: Playwright opens that URL now, axe runs, and you get fresh results, Export JSON, Export PDF, and optional AI tips.",
      "Website batch results is a static snapshot of 28 public sites from the test plan (last resync date on that page). It loads instantly, does not re-scan the web, and includes Pass/Fail counts plus recommended actions per site.",
      `Use live scan to check a URL today; use batch to see portfolio-wide evaluation and compare sites. Both use the same Pass rule (${PASS_FAIL_RULE_INLINE}) on live results and in the batch table.`,
    ],
  },
  {
    id: "export-share",
    summary: "Can I export or share my scan?",
    paragraphs: [
      "Yes — on the results screen, Export JSON downloads structured data for tooling; Export PDF downloads a formatted report (summary, score, Pass/Fail, and issues) for tickets or stakeholders.",
      "There is no public share link in the MVP. Scan data is stored on this server (see What happens to my URL and scan data?) but not published to other users.",
      "To share findings, send the JSON file or describe score and top issues. After deploy, you can point reviewers to your hosted Lumen URL for live scans.",
    ],
  },
  {
    id: "ai-tips",
    summary: "What are AI tips? Why are they off?",
    paragraphs: [
      "When enabled, Lumen sends the top few issues (by severity) to an OpenAI-compatible API for a short explanation and suggested fix. Rule findings, score, and Export JSON/PDF work without AI.",
      "AI tips are off when this server has no AI_API_KEY or OPENAI_API_KEY. That is a deployment setting, not something the website you scan controls.",
      `The ${HOW_IT_WORKS_HEADING} pill and GET /api/health show whether AI is configured. Add a key in web/.env.local (local) or host secrets (production), then restart.`,
    ],
  },
  {
    id: "failures-rate-limit",
    summary: "Why did my scan fail or say rate limited?",
    paragraphs: [
      "Scans fail when the URL is blocked (private/local), the page times out, the site blocks automated browsers, or Chrome/Playwright cannot launch.",
      "429 rate limited means too many POST /api/scans requests from your IP. Default: 5 per minute in production (RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS). Local npm run dev allows more unless you override those variables.",
      "Fix the URL, wait about a minute, or use Try again for transient errors. For heavy testing, raise RATE_LIMIT_MAX in .env.local.",
    ],
  },
  {
    id: "data-privacy",
    summary: "What happens to my URL and scan data?",
    paragraphs: [
      "Each scan stores the URL, findings, and score in the app database (Postgres in production, or local PGlite under web/data/). There are no user accounts in the MVP.",
      "Data is used to show your results and Export JSON/PDF. Do not paste secrets into URLs — query tokens in links may be stored.",
      "Retention is not automated in the MVP. See web/DEPLOY.md for backup and database notes on hosted environments.",
    ],
  },
  {
    id: "is-free",
    summary: "Is this free?",
    paragraphs: [
      "Yes — Lumen is free to use in this MVP: no sign-up, no payment, and no subscription. Paste a public URL and run a scan.",
      "Scans are rate-limited per IP (see Why did my scan fail or say rate limited?) so the service stays fair on shared hosts. There is no paid tier or commercial support SLA in this version.",
      "Optional AI tips use an API key on the server you use (local or deployed) — that cost is borne by whoever runs Lumen, not by visitors running scans.",
    ],
  },
  {
    id: "who-built",
    summary: "Who built this?",
    paragraphs: [
      "Lumen is an AI-based web accessibility checker built as a portfolio project by Baljinder Sikh (GitHub: balisikh).",
      "Stack: Next.js, Playwright, axe-core, optional OpenAI-compatible AI tips, and a 28-site batch evaluation snapshot documented in TEST_RESULTS.md.",
      "Source, docs, and issues: https://github.com/balisikh/ai-based-web-accessibility-checker",
    ],
  },
];

/** @deprecated Use HOME_FAQS */
export const HOME_EXTRA_FAQS = HOME_FAQS;
