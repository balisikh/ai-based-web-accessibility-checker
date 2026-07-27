import type { Issue, Severity } from "./types";

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

type AiTip = {
  issueId: string;
  explanation: string;
  remediation: string;
  confidence?: number;
};

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function isAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim());
}

function getAiConfig() {
  const apiKey =
    process.env.AI_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim() || "";
  const baseUrl = (
    process.env.AI_BASE_URL?.trim() || "https://api.openai.com/v1"
  ).replace(/\/$/, "");
  const model = process.env.AI_MODEL?.trim() || "gpt-4o-mini";
  const maxIssues = envInt("AI_MAX_ISSUES", 5);
  return { apiKey, baseUrl, model, maxIssues };
}

function pickTopIssues(issues: Issue[], maxIssues: number): Issue[] {
  return [...issues]
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, maxIssues);
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("AI response was not valid JSON.");
  }
}

async function requestTips(
  pageUrl: string,
  issues: Issue[],
): Promise<AiTip[]> {
  const { apiKey, baseUrl, model } = getAiConfig();

  const payload = {
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a web accessibility expert. Explain axe-core findings and suggest practical fixes. Only use the provided evidence. Do not invent DOM details. Reply with JSON only.",
      },
      {
        role: "user",
        content: JSON.stringify({
          pageUrl,
          instruction:
            "For each issue, return explanation (1-2 sentences) and remediation (concrete HTML/CSS/ARIA or content change). confidence is 0-1.",
          schema: {
            tips: [
              {
                issueId: "string",
                explanation: "string",
                remediation: "string",
                confidence: 0.8,
              },
            ],
          },
          issues: issues.map((issue) => ({
            issueId: issue.id,
            ruleId: issue.ruleId,
            severity: issue.severity,
            message: issue.message,
            wcagCriteria: issue.wcagCriteria,
            selector: issue.selector,
            htmlSnippet: issue.htmlSnippet.slice(0, 800),
            helpUrl: issue.helpUrl,
          })),
        }),
      },
    ],
  };

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `AI provider error (${response.status}): ${body.slice(0, 240) || response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI provider returned an empty response.");
  }

  const parsed = extractJsonObject(content) as { tips?: AiTip[] };
  if (!Array.isArray(parsed.tips)) {
    throw new Error("AI response missing tips array.");
  }

  return parsed.tips.filter(
    (tip) =>
      tip &&
      typeof tip.issueId === "string" &&
      typeof tip.explanation === "string" &&
      typeof tip.remediation === "string",
  );
}

/**
 * Enrich top issues with AI explanations/fixes when an API key is configured.
 * Never throws — on failure returns the original issues unchanged.
 */
export async function enrichIssuesWithAi(
  pageUrl: string,
  issues: Issue[],
): Promise<Issue[]> {
  if (!isAiConfigured() || issues.length === 0) {
    return issues;
  }

  const { maxIssues } = getAiConfig();
  const selected = pickTopIssues(issues, maxIssues);
  if (selected.length === 0) return issues;

  try {
    const tips = await requestTips(pageUrl, selected);
    const byId = new Map(tips.map((tip) => [tip.issueId, tip]));

    return issues.map((issue) => {
      const tip = byId.get(issue.id);
      if (!tip) return issue;
      const confidence =
        typeof tip.confidence === "number" && Number.isFinite(tip.confidence)
          ? Math.max(0, Math.min(1, tip.confidence))
          : 0.75;
      return {
        ...issue,
        aiExplanation: tip.explanation.trim().slice(0, 1200),
        aiRemediation: tip.remediation.trim().slice(0, 1600),
        aiConfidence: confidence,
      };
    });
  } catch (error) {
    console.warn(
      "[ai-enrichment] skipped:",
      error instanceof Error ? error.message : error,
    );
    return issues;
  }
}
