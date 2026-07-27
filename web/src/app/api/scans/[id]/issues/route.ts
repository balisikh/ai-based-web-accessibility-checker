import { NextResponse } from "next/server";
import { getScan } from "@/lib/store";
import type { Severity } from "@/lib/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

const SEVERITIES: Severity[] = ["critical", "serious", "moderate", "minor"];

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const scan = await getScan(id);

  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  const severityParam = new URL(request.url).searchParams.get("severity");
  let issues = scan.issues;

  if (severityParam) {
    if (!SEVERITIES.includes(severityParam as Severity)) {
      return NextResponse.json(
        { error: "severity must be critical, serious, moderate, or minor." },
        { status: 400 },
      );
    }
    issues = issues.filter((issue) => issue.severity === severityParam);
  }

  return NextResponse.json({ scanId: scan.id, issues });
}
