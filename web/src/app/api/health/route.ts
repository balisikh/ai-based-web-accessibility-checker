import { NextResponse } from "next/server";
import { getDb, getDbModeLabel } from "@/lib/db";
import { isAiConfigured } from "@/lib/ai-enrichment";
import { getScanExecutionMode } from "@/lib/scan-worker-config";

export async function GET() {
  try {
    const db = await getDb();
    await db.query("SELECT 1 as ok");
    return NextResponse.json({
      ok: true,
      service: "lumen-accessibility-checker",
      db: getDbModeLabel(),
      ai: isAiConfigured(),
      scanExecution: getScanExecutionMode(),
      time: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "lumen-accessibility-checker",
        db: getDbModeLabel(),
        ai: isAiConfigured(),
        scanExecution: getScanExecutionMode(),
        error: error instanceof Error ? error.message : "Database unavailable",
        time: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
