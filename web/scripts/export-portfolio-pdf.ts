/**
 * Build portfolio HTML from Lumen-Portfolio-Documentation.md and save as PDF.
 * Run: npm run docs:pdf
 */
import { chromium } from "playwright";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(process.cwd(), "..");
const DOCS = path.join(ROOT, "docs");
const MD = path.join(DOCS, "Lumen-Portfolio-Documentation.md");
const HTML = path.join(DOCS, "Lumen-Portfolio-Documentation.html");
const OUT = path.join(DOCS, "Lumen-Portfolio-Documentation.pdf");

const SHOTS: { title: string; file: string; className: string }[] = [
  {
    title: "Home — accessibility checker (hero)",
    file: "screenshots/pdf/home-desktop.png",
    className: "shot-desktop",
  },
  {
    title: "Home — complete page (how-to, rules & FAQ)",
    file: "screenshots/pdf/home-desktop-complete.png",
    className: "shot-desktop",
  },
  {
    title: "Batch results — 28 sites (overview)",
    file: "screenshots/pdf/batch-desktop.png",
    className: "shot-desktop",
  },
  {
    title: "Batch results — complete page (website table)",
    file: "screenshots/pdf/batch-desktop-complete.png",
    className: "shot-desktop shot-tall",
  },
  {
    title: "Results — sample layout",
    file: "screenshots/pdf/results-desktop.png",
    className: "shot-desktop",
  },
  {
    title: "Mobile home (390px)",
    file: "screenshots/pdf/home-mobile.png",
    className: "shot-mobile",
  },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function buildScreenshotFigures(): string {
  return SHOTS.map(
    (shot) =>
      `<figure class="${shot.className}"><figcaption>${escapeHtml(shot.title)}</figcaption><img src="${shot.file}" alt="${escapeHtml(shot.title)}" /></figure>`,
  ).join("\n");
}

function isTableRow(line: string): boolean {
  return line.trimStart().startsWith("|");
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "<!-- SCREENSHOTS -->") {
      html.push(buildScreenshotFigures());
      i += 1;
      continue;
    }

    if (trimmed === "---") {
      html.push("<hr />");
      i += 1;
      continue;
    }

    if (trimmed.startsWith("# ")) {
      html.push(`<h1>${inlineMarkdown(trimmed.slice(2))}</h1>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      i += 1;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i += 1;
      }
      html.push(
        `<blockquote class="note">${quoteLines.map((q) => inlineMarkdown(q)).join(" ")}</blockquote>`,
      );
      continue;
    }

    if (isTableRow(trimmed)) {
      const tableLines: string[] = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        i += 1;
      }
      const dataRows = tableLines.filter((row) => !isTableSeparator(row));
      if (dataRows.length === 0) continue;

      const headerCells = parseTableRow(dataRows[0]);
      const bodyRows = dataRows.slice(1);
      html.push("<table>");
      html.push("<tr>" + headerCells.map((c) => `<th>${inlineMarkdown(c)}</th>`).join("") + "</tr>");
      for (const row of bodyRows) {
        const cells = parseTableRow(row);
        html.push("<tr>" + cells.map((c) => `<td>${inlineMarkdown(c)}</td>`).join("") + "</tr>");
      }
      html.push("</table>");
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i += 1;
      }
      i += 1;
      html.push(`<pre><code>${codeLines.join("\n")}</code></pre>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      html.push("<ol>");
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        html.push(`<li>${inlineMarkdown(lines[i].trim().replace(/^\d+\.\s/, ""))}</li>`);
        i += 1;
      }
      html.push("</ol>");
      continue;
    }

    if (trimmed.startsWith("- ")) {
      html.push("<ul>");
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        html.push(`<li>${inlineMarkdown(lines[i].trim().slice(2))}</li>`);
        i += 1;
      }
      html.push("</ul>");
      continue;
    }

    if (trimmed === "") {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
      html.push(`<p class="footer-note">${inlineMarkdown(trimmed.slice(1, -1))}</p>`);
      i += 1;
      continue;
    }

    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
    i += 1;
  }

  return html.join("\n");
}

function buildHtml(body: string): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="utf-8" />
  <title>Lumen — Portfolio Documentation</title>
  <style>
    @page { margin: 10mm 8mm; }
    body { font-family: "Segoe UI", system-ui, sans-serif; color: #14221f; line-height: 1.45; max-width: 920px; margin: 0 auto; padding: 1rem 1.25rem; font-size: 10.5pt; }
    h1 { color: #083f44; font-size: 1.55rem; margin-bottom: 0.2rem; page-break-after: avoid; }
    h2 { color: #083f44; font-size: 1.05rem; margin-top: 1.1rem; border-bottom: 2px solid rgba(13,92,99,.15); padding-bottom: 0.25rem; page-break-after: avoid; }
    h3 { color: #0d5c63; font-size: 0.95rem; margin-top: 0.85rem; page-break-after: avoid; }
    p { margin: 0.4rem 0; font-size: 0.88rem; }
    .note { background: #f3f7f5; border-left: 4px solid #e85d04; padding: 0.55rem 0.75rem; margin: 0.65rem 0; font-size: 0.85rem; }
    .footer-note { font-size: 0.75rem; color: #3d524c; margin-top: 1rem; }
    table { border-collapse: collapse; width: 100%; margin: 0.45rem 0 0.65rem; font-size: 0.8rem; page-break-inside: avoid; }
    th, td { border: 1px solid rgba(20,34,31,.12); padding: 0.3rem 0.45rem; text-align: left; vertical-align: top; }
    th { background: rgba(13,92,99,.08); }
    td:first-child { font-weight: 600; width: 22%; color: #083f44; }
    figure { margin: 0.85rem 0 1.1rem; page-break-inside: avoid; }
    figcaption { font-weight: 600; margin-bottom: 0.35rem; color: #083f44; font-size: 0.88rem; }
    figure img { display: block; width: 100%; height: auto; border: 1px solid rgba(20,34,31,.12); border-radius: 6px; }
    figure.shot-mobile { max-width: 380px; margin-left: auto; margin-right: auto; }
    pre { background: #f3f7f5; border: 1px solid rgba(20,34,31,.1); border-radius: 6px; padding: 0.5rem 0.65rem; font-size: 0.78rem; overflow-x: auto; page-break-inside: avoid; }
    code { font-family: Consolas, "Courier New", monospace; font-size: 0.82em; background: rgba(13,92,99,.06); padding: 0.05rem 0.25rem; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    ul, ol { padding-left: 1.15rem; font-size: 0.85rem; margin: 0.35rem 0; }
    li { margin: 0.15rem 0; }
    hr { border: none; border-top: 1px solid rgba(20,34,31,.12); margin: 0.75rem 0; }
    blockquote.note { margin: 0.65rem 0; }
    h2, h3 { break-after: avoid; }
    table, figure, pre { break-inside: avoid; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

async function main(): Promise<void> {
  const md = await readFile(MD, "utf8");
  const body = mdToHtml(md);
  const html = buildHtml(body);
  await writeFile(HTML, html, "utf8");

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage", "--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(HTML).href, {
      waitUntil: "load",
      timeout: 60_000,
    });
    await page.waitForTimeout(800);
    await page.pdf({
      path: OUT,
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "8mm", right: "8mm" },
    });
    console.log("Wrote", OUT);
    console.log("Wrote", HTML);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
