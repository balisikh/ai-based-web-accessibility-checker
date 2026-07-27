import type { Result, NodeResult, ImpactValue } from "axe-core";
import type { Issue, Severity } from "./types";

const IMPACT_TO_SEVERITY: Record<NonNullable<ImpactValue>, Severity> = {
  critical: "critical",
  serious: "serious",
  moderate: "moderate",
  minor: "minor",
};

function impactToSeverity(impact: ImpactValue | undefined): Severity {
  if (!impact) return "moderate";
  return IMPACT_TO_SEVERITY[impact] ?? "moderate";
}

function categoryFromTags(tags: string[]): string {
  if (tags.includes("cat.perceivable")) return "perceivable";
  if (tags.includes("cat.operable")) return "operable";
  if (tags.includes("cat.understandable")) return "understandable";
  if (tags.includes("cat.robust")) return "robust";
  return "general";
}

function wcagFromTags(tags: string[]): string[] {
  const criteria = new Set<string>();
  for (const tag of tags) {
    // e.g. wcag2a, wcag21aa, wcag111, wcag143
    const match = /^wcag(\d)(\d)(\d)$/i.exec(tag);
    if (match) {
      criteria.add(`${match[1]}.${match[2]}.${match[3]}`);
    }
  }
  return [...criteria];
}

function nodeToIssue(
  scanId: string,
  index: number,
  violation: Result,
  node: NodeResult,
): Issue {
  const selector =
    node.target?.map(String).join(" ") ||
    node.xpath?.map(String).join(" ") ||
    "(unknown)";

  return {
    id: `${scanId}_iss_${index}`,
    scanId,
    source: "rule",
    ruleId: violation.id,
    wcagCriteria: wcagFromTags(violation.tags ?? []),
    severity: impactToSeverity(violation.impact ?? node.impact),
    impact: violation.impact ?? node.impact ?? "moderate",
    category: categoryFromTags(violation.tags ?? []),
    selector,
    htmlSnippet: (node.html ?? "").slice(0, 2000),
    message: violation.help || violation.description || violation.id,
    helpUrl: violation.helpUrl,
  };
}

/** Flatten axe violations into one Issue per failing node (capped). */
export function mapAxeViolationsToIssues(
  scanId: string,
  violations: Result[],
  maxIssues = 100,
): Issue[] {
  const issues: Issue[] = [];
  let index = 0;

  for (const violation of violations) {
    const nodes = violation.nodes?.length ? violation.nodes : [undefined];
    for (const node of nodes) {
      if (issues.length >= maxIssues) return issues;
      index += 1;
      if (!node) {
        issues.push({
          id: `${scanId}_iss_${index}`,
          scanId,
          source: "rule",
          ruleId: violation.id,
          wcagCriteria: wcagFromTags(violation.tags ?? []),
          severity: impactToSeverity(violation.impact),
          impact: violation.impact ?? "moderate",
          category: categoryFromTags(violation.tags ?? []),
          selector: "(page)",
          htmlSnippet: "",
          message: violation.help || violation.description || violation.id,
          helpUrl: violation.helpUrl,
        });
        continue;
      }
      issues.push(nodeToIssue(scanId, index, violation, node));
    }
  }

  return issues;
}
