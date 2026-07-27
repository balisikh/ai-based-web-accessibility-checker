export type ScanStatus =
  | "queued"
  | "fetching"
  | "rendering"
  | "rule_analysis"
  | "ai_enrichment"
  | "scoring"
  | "completed"
  | "failed";

export type Severity = "critical" | "serious" | "moderate" | "minor";

export type IssueSource = "rule" | "ai";

export interface Issue {
  id: string;
  scanId: string;
  source: IssueSource;
  ruleId?: string;
  wcagCriteria: string[];
  severity: Severity;
  impact: string;
  category: string;
  selector: string;
  htmlSnippet: string;
  message: string;
  helpUrl?: string;
  aiExplanation?: string;
  aiRemediation?: string;
  aiConfidence?: number;
}

export interface SeverityCounts {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

export interface Scan {
  id: string;
  url: string;
  status: ScanStatus;
  createdAt: string;
  completedAt?: string;
  score?: number;
  summaryCounts?: SeverityCounts;
  wcagLevelTarget: "AA";
  errorMessage?: string;
  issues: Issue[];
}

export type ScanSummary = Omit<Scan, "issues">;
