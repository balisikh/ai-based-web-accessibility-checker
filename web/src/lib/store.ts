import { getDb } from "./db";
import type {
  Issue,
  Scan,
  ScanSummary,
  Severity,
  SeverityCounts,
  ScanStatus,
  IssueSource,
} from "./types";

type ScanRow = {
  id: string;
  url: string;
  status: ScanStatus;
  created_at: string | Date;
  completed_at: string | Date | null;
  score: number | null;
  summary_critical: number;
  summary_serious: number;
  summary_moderate: number;
  summary_minor: number;
  wcag_level_target: "AA";
  error_message: string | null;
};

type IssueRow = {
  id: string;
  scan_id: string;
  source: IssueSource;
  rule_id: string | null;
  wcag_criteria: string[] | string;
  severity: Severity;
  impact: string;
  category: string;
  selector: string;
  html_snippet: string;
  message: string;
  help_url: string | null;
  ai_explanation: string | null;
  ai_remediation: string | null;
  ai_confidence: number | null;
};

function toIso(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString();
  return new Date(value).toISOString();
}

function parseCriteria(value: string[] | string): string[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function rowToIssue(row: IssueRow): Issue {
  return {
    id: row.id,
    scanId: row.scan_id,
    source: row.source,
    ruleId: row.rule_id ?? undefined,
    wcagCriteria: parseCriteria(row.wcag_criteria),
    severity: row.severity,
    impact: row.impact,
    category: row.category,
    selector: row.selector,
    htmlSnippet: row.html_snippet,
    message: row.message,
    helpUrl: row.help_url ?? undefined,
    aiExplanation: row.ai_explanation ?? undefined,
    aiRemediation: row.ai_remediation ?? undefined,
    aiConfidence: row.ai_confidence ?? undefined,
  };
}

function rowToScan(row: ScanRow, issues: Issue[]): Scan {
  const hasCounts =
    row.summary_critical +
      row.summary_serious +
      row.summary_moderate +
      row.summary_minor >
      0 ||
    row.status === "completed";

  return {
    id: row.id,
    url: row.url,
    status: row.status,
    createdAt: toIso(row.created_at) ?? new Date().toISOString(),
    completedAt: toIso(row.completed_at),
    score: row.score ?? undefined,
    summaryCounts: hasCounts
      ? {
          critical: row.summary_critical,
          serious: row.summary_serious,
          moderate: row.summary_moderate,
          minor: row.summary_minor,
        }
      : undefined,
    wcagLevelTarget: row.wcag_level_target,
    errorMessage: row.error_message ?? undefined,
    issues,
  };
}

export function createScanId(): string {
  return `scn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function toSummary(scan: Scan): ScanSummary {
  const { issues: _issues, ...summary } = scan;
  return summary;
}

export function countBySeverity(issues: Issue[]): SeverityCounts {
  const counts: SeverityCounts = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };
  for (const issue of issues) {
    counts[issue.severity] += 1;
  }
  return counts;
}

const WEIGHTS: Record<Severity, number> = {
  critical: 25,
  serious: 15,
  moderate: 7,
  minor: 3,
};

export function scoreFromIssues(issues: Issue[]): number {
  if (issues.length === 0) return 100;
  const penalty = issues.reduce((sum, issue) => sum + WEIGHTS[issue.severity], 0);
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

async function loadIssues(scanId: string): Promise<Issue[]> {
  const db = await getDb();
  const result = await db.query<IssueRow>(
    `SELECT * FROM issues WHERE scan_id = $1 ORDER BY sort_order ASC, id ASC`,
    [scanId],
  );
  return result.rows.map(rowToIssue);
}

export async function saveScan(scan: Scan): Promise<void> {
  const db = await getDb();
  const counts = scan.summaryCounts ?? {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  await db.query(
    `INSERT INTO scans (
      id, url, status, created_at, completed_at, score,
      summary_critical, summary_serious, summary_moderate, summary_minor,
      wcag_level_target, error_message
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
    )
    ON CONFLICT (id) DO UPDATE SET
      url = EXCLUDED.url,
      status = EXCLUDED.status,
      created_at = EXCLUDED.created_at,
      completed_at = EXCLUDED.completed_at,
      score = EXCLUDED.score,
      summary_critical = EXCLUDED.summary_critical,
      summary_serious = EXCLUDED.summary_serious,
      summary_moderate = EXCLUDED.summary_moderate,
      summary_minor = EXCLUDED.summary_minor,
      wcag_level_target = EXCLUDED.wcag_level_target,
      error_message = EXCLUDED.error_message`,
    [
      scan.id,
      scan.url,
      scan.status,
      scan.createdAt,
      scan.completedAt ?? null,
      scan.score ?? null,
      counts.critical,
      counts.serious,
      counts.moderate,
      counts.minor,
      scan.wcagLevelTarget,
      scan.errorMessage ?? null,
    ],
  );

  if (scan.issues.length > 0) {
    await replaceIssues(scan.id, scan.issues);
  }
}

async function replaceIssues(scanId: string, issues: Issue[]): Promise<void> {
  const db = await getDb();
  await db.query(`DELETE FROM issues WHERE scan_id = $1`, [scanId]);

  for (let i = 0; i < issues.length; i += 1) {
    const issue = issues[i];
    await db.query(
      `INSERT INTO issues (
        id, scan_id, source, rule_id, wcag_criteria, severity, impact, category,
        selector, html_snippet, message, help_url,
        ai_explanation, ai_remediation, ai_confidence, sort_order
      ) VALUES (
        $1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16
      )`,
      [
        issue.id,
        scanId,
        issue.source,
        issue.ruleId ?? null,
        JSON.stringify(issue.wcagCriteria ?? []),
        issue.severity,
        issue.impact,
        issue.category,
        issue.selector,
        issue.htmlSnippet,
        issue.message,
        issue.helpUrl ?? null,
        issue.aiExplanation ?? null,
        issue.aiRemediation ?? null,
        issue.aiConfidence ?? null,
        i,
      ],
    );
  }
}

export async function getScan(id: string): Promise<Scan | undefined> {
  const db = await getDb();
  const result = await db.query<ScanRow>(`SELECT * FROM scans WHERE id = $1`, [
    id,
  ]);
  const row = result.rows[0];
  if (!row) return undefined;
  const issues = await loadIssues(id);
  return rowToScan(row, issues);
}

export async function updateScan(
  id: string,
  patch: Partial<Scan>,
): Promise<Scan | undefined> {
  const existing = await getScan(id);
  if (!existing) return undefined;

  const next: Scan = {
    ...existing,
    ...patch,
    issues: patch.issues ?? existing.issues,
  };

  if (patch.summaryCounts) {
    next.summaryCounts = patch.summaryCounts;
  }

  const db = await getDb();
  const counts = next.summaryCounts ?? {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
  };

  await db.query(
    `UPDATE scans SET
      url = $2,
      status = $3,
      created_at = $4,
      completed_at = $5,
      score = $6,
      summary_critical = $7,
      summary_serious = $8,
      summary_moderate = $9,
      summary_minor = $10,
      wcag_level_target = $11,
      error_message = $12
    WHERE id = $1`,
    [
      next.id,
      next.url,
      next.status,
      next.createdAt,
      next.completedAt ?? null,
      next.score ?? null,
      counts.critical,
      counts.serious,
      counts.moderate,
      counts.minor,
      next.wcagLevelTarget,
      next.errorMessage ?? null,
    ],
  );

  if (patch.issues) {
    await replaceIssues(id, patch.issues);
  }

  return next;
}
