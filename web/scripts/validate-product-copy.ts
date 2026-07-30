/**
 * CI check: README must not duplicate in-app copy (single source in web/src/lib).
 * Run: npm run validate:copy
 */
import fs from "node:fs";
import path from "node:path";
import { HOW_TO_USE_STEPS } from "../src/lib/how-to-use";
import { HOME_FAQS } from "../src/lib/home-faqs";

function fail(message: string): never {
  console.error("validate:copy FAIL:", message);
  process.exit(1);
}

const readmePath = path.join(process.cwd(), "..", "README.md");
if (!fs.existsSync(readmePath)) {
  fail(`README not found at ${readmePath}`);
}

const readmeRaw = fs.readFileSync(readmePath, "utf8");
const readme = readmeRaw.replace(/\r\n/g, "\n");

const howToSection = readme.match(/## How to use\n([\s\S]*?)\n---/)?.[1] ?? "";
if (!howToSection.includes("how-to-use.ts")) {
  fail("README How to use must point to web/src/lib/how-to-use.ts");
}

for (const step of HOW_TO_USE_STEPS) {
  if (howToSection.includes(step.title)) {
    fail(
      `README duplicates how-to step title "${step.title}" — remove from README`,
    );
  }
  if (howToSection.includes(step.body.slice(0, 40))) {
    fail(
      `README duplicates how-to step body for "${step.title}" — remove from README`,
    );
  }
}

if (/^\d+\.\s+(Open the app|Click \*\*Check accessibility\*\*)/m.test(howToSection)) {
  fail("README How to use must not contain a numbered step list");
}

const faqSection =
  readme.match(/## Common questions\n([\s\S]*?)\n---/)?.[1] ?? "";
if (!faqSection.includes("home-faqs.ts")) {
  fail("README Common questions must point to web/src/lib/home-faqs.ts");
}

for (const faq of HOME_FAQS) {
  if (faqSection.includes(faq.summary)) {
    fail(
      `README duplicates FAQ summary "${faq.summary}" — remove from README`,
    );
  }
}

if (!readme.includes("product-copy.ts")) {
  fail("README must reference web/src/lib/product-copy.ts as shared UI copy source");
}

console.log(
  "validate:copy OK — README points to source files, no duplicated steps/FAQs",
);
