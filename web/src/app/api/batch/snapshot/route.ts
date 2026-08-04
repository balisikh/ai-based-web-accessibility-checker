import { NextResponse } from "next/server";
import {
  getBatchSnapshot,
  getBatchSnapshotSource,
} from "@/lib/batch-snapshot-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Read-only batch snapshot status (no rescan). */
export async function GET() {
  const [snapshot, source] = await Promise.all([
    getBatchSnapshot(),
    getBatchSnapshotSource(),
  ]);

  return NextResponse.json({
    date: snapshot.date,
    generatedAt: snapshot.generatedAt,
    meta: snapshot.meta,
    summary: snapshot.summary,
    source,
  });
}
