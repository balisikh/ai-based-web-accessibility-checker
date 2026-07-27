import { NextResponse } from "next/server";
import { getScan, toSummary } from "@/lib/store";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const scan = await getScan(id);

  if (!scan) {
    return NextResponse.json({ error: "Scan not found." }, { status: 404 });
  }

  return NextResponse.json({ scan: toSummary(scan) });
}
