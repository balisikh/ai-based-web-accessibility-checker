import {
  countBySeverity,
  scoreFromIssues,
  updateScan,
} from "./store";
import type { Issue } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildDemoIssues(scanId: string, url: string): Issue[] {
  const host = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return [
    {
      id: `${scanId}_iss_1`,
      scanId,
      source: "rule",
      ruleId: "image-alt",
      wcagCriteria: ["1.1.1"],
      severity: "critical",
      impact: "critical",
      category: "perceivable",
      selector: "img.hero",
      htmlSnippet: '<img class="hero" src="/banner.jpg">',
      message: "Images must have alternate text",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/image-alt",
      aiExplanation:
        "Screen reader users will not know what this hero image communicates without alt text.",
      aiRemediation:
        'Add a meaningful alt attribute, e.g. alt="Product team collaborating in a bright studio". Use alt="" only if the image is decorative.',
      aiConfidence: 0.86,
    },
    {
      id: `${scanId}_iss_2`,
      scanId,
      source: "rule",
      ruleId: "color-contrast",
      wcagCriteria: ["1.4.3"],
      severity: "serious",
      impact: "serious",
      category: "perceivable",
      selector: ".muted-link",
      htmlSnippet: '<a class="muted-link" href="/pricing">See pricing</a>',
      message: "Elements must meet minimum color contrast ratio thresholds",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
    },
    {
      id: `${scanId}_iss_3`,
      scanId,
      source: "rule",
      ruleId: "label",
      wcagCriteria: ["1.3.1", "3.3.2"],
      severity: "serious",
      impact: "serious",
      category: "understandable",
      selector: "input#email",
      htmlSnippet: '<input id="email" type="email" placeholder="Email">',
      message: "Form elements must have labels",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/label",
    },
    {
      id: `${scanId}_iss_4`,
      scanId,
      source: "rule",
      ruleId: "link-name",
      wcagCriteria: ["2.4.4", "4.1.2"],
      severity: "moderate",
      impact: "moderate",
      category: "operable",
      selector: `a[href='https://${host}/more']`,
      htmlSnippet: '<a href="/more">Click here</a>',
      message: "Links must have discernible text",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.10/link-name",
      aiExplanation:
        '"Click here" does not describe the destination when read out of context by a screen reader.',
      aiRemediation:
        'Replace the link text with the destination purpose, e.g. "View accessibility documentation".',
      aiConfidence: 0.9,
    },
  ];
}

/**
 * Demo pipeline (sample issues). Used when USE_DEMO_SCAN=1.
 */
export async function runDemoScan(scanId: string): Promise<void> {
  const stages = [
    "fetching",
    "rendering",
    "rule_analysis",
    "ai_enrichment",
    "scoring",
  ] as const;

  try {
    for (const status of stages) {
      await sleep(450);
      const current = await updateScan(scanId, { status });
      if (!current) return;
    }

    const scan = await updateScan(scanId, {});
    if (!scan) return;

    const issues = buildDemoIssues(scanId, scan.url);
    const summaryCounts = countBySeverity(issues);
    const score = scoreFromIssues(issues);

    await updateScan(scanId, {
      status: "completed",
      completedAt: new Date().toISOString(),
      issues,
      summaryCounts,
      score,
    });
  } catch (error) {
    await updateScan(scanId, {
      status: "failed",
      completedAt: new Date().toISOString(),
      errorMessage:
        error instanceof Error ? error.message : "Scan failed unexpectedly.",
    });
  }
}
