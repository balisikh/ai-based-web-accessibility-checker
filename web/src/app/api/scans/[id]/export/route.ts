import { NextResponse } from "next/server";
import { isScanWorkerProxyEnabled } from "@/lib/scan-worker-config";
import { fetchScanPdfFromWorker } from "@/lib/scan-worker-client";
import { renderScanReportPdf } from "@/lib/scan-report-pdf";
import { getScan } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 60;

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

  if (format === "pdf") {
    try {
      if (isScanWorkerProxyEnabled()) {
        const workerRes = await fetchScanPdfFromWorker(scan.id);
        if (!workerRes.ok) {
          const detail = (await workerRes.text().catch(() => "")).slice(0, 240);
          throw new Error(
            detail || `Worker PDF export returned ${workerRes.status}.`,
          );
        }
        const pdf = await workerRes.arrayBuffer();
        return new NextResponse(pdf, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="lumen-scan-${scan.id}.pdf"`,
          },
        });
      }

      const pdf = await renderScanReportPdf(scan);
      return new NextResponse(new Uint8Array(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="lumen-scan-${scan.id}.pdf"`,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PDF export failed.";
      return NextResponse.json(
        { error: `Could not generate PDF report. ${message}` },
        { status: 500 },
      );
    }
  }

  if (format !== "json") {
    return NextResponse.json(
      { error: "Supported formats: json, pdf." },
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
