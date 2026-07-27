import { NextResponse } from "next/server";
import { getScan } from "@/lib/store";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const { id } = await params;
  const scan = await getScan(id);

  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  if (scan.status !== "completed") {
    return NextResponse.json(
      { error: "Export is available after the scan completes." },
      { status: 409 },
    );
  }

  const format = new URL(request.url).searchParams.get("format") ?? "json";
  if (format !== "json") {
    return NextResponse.json(
      { error: "Only format=json is supported in this MVP shell." },
      { status: 400 },
    );
  }

  const report = {
    generator: "Lumen Accessibility Checker",
    disclaimer:
      "This report is an assistive findings aid, not a legal accessibility certificate.",
    scannedUrl: scan.url,
    scannedAt: scan.createdAt,
    completedAt: scan.completedAt,
    wcagLevelTarget: scan.wcagLevelTarget,
    score: scan.score,
    summaryCounts: scan.summaryCounts,
    issues: scan.issues,
  };

  return new NextResponse(JSON.stringify(report, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="lumen-scan-${scan.id}.json"`,
    },
  });
}
