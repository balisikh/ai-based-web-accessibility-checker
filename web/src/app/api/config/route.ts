import { NextResponse } from "next/server";
import { isAiConfigured } from "@/lib/ai-enrichment";

/** Public UI flags — no secrets. */
export async function GET() {
  return NextResponse.json({
    aiTipsEnabled: isAiConfigured(),
  });
}
