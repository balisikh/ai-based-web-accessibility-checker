import { NextResponse } from "next/server";
import { runLiveScan } from "@/lib/scan-runner";
import { verifyScanWorkerAuth } from "@/lib/scan-worker-auth";
import { isScanWorkerRunEndpointEnabled } from "@/lib/scan-worker-config";
import { getScan } from "@/lib/store";

export const runtime = "nodejs";
export const maxDuration = 900;

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  if (!isScanWorkerRunEndpointEnabled()) {
    return NextResponse.json(
      { error: "Scan worker endpoint is not enabled on this host." },
      { status: 404 },
    );
  }

  if (!verifyScanWorkerAuth(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const scan = await getScan(id);

  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  if (scan.status !== "queued") {
    return NextResponse.json(
      {
        error: "Scan is not queued.",
        status: scan.status,
      },
      { status: 409 },
    );
  }

  void runLiveScan(id);

  return NextResponse.json(
    { accepted: true, scanId: id },
    { status: 202 },
  );
}
