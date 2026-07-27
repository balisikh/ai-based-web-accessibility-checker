/**
 * Quick smoke test for Playwright + axe against a public URL.
 * Run: npx tsx scripts/smoke-scan.ts
 */
import { analyzeUrlWithAxe } from "../src/lib/live-scan";

async function main() {
  const url = process.argv[2] ?? "https://example.com";
  console.log("Scanning", url);
  const result = await analyzeUrlWithAxe("smoke_1", url);
  console.log("Title:", result.pageTitle);
  console.log("Issues:", result.issues.length);
  for (const issue of result.issues.slice(0, 5)) {
    console.log(`- [${issue.severity}] ${issue.ruleId}: ${issue.message}`);
  }
}

main().catch((error) => {
  console.error("FAIL:", error instanceof Error ? error.message : error);
  process.exit(1);
});
