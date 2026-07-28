/**
 * Snapshot of batch runs — synced from live rescan 2026-07-28 (batch-rescan-report.json).
 * Static data only: no impact on live scan performance.
 */
export type WebsiteBatchResult = {
  id: number;
  name: string;
  url: string;
  score: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  totalIssues: number;
  date: string;
  note?: string;
};

export const BATCH_SNAPSHOT_DATE = "2026-07-28";

export const WEBSITE_BATCH_RESULTS: WebsiteBatchResult[] = [
  { id: 1, name: "Google UK", url: "https://www.google.co.uk/", score: 100, critical: 0, serious: 0, moderate: 0, minor: 0, totalIssues: 0, date: "2026-07-28" },
  { id: 2, name: "YouTube", url: "https://www.youtube.com/", score: 0, critical: 4, serious: 0, moderate: 0, minor: 0, totalIssues: 4, date: "2026-07-28" },
  { id: 3, name: "BBC Weather Southall", url: "https://www.bbc.co.uk/weather/2637490", score: 54, critical: 1, serious: 0, moderate: 3, minor: 0, totalIssues: 4, date: "2026-07-28" },
  { id: 4, name: "BBC iPlayer", url: "https://www.bbc.co.uk/iplayer", score: 86, critical: 0, serious: 0, moderate: 2, minor: 0, totalIssues: 2, date: "2026-07-28" },
  { id: 5, name: "BBC News", url: "https://www.bbc.co.uk/news", score: 93, critical: 0, serious: 0, moderate: 1, minor: 0, totalIssues: 1, date: "2026-07-28" },
  { id: 6, name: "Disney+ UK", url: "https://www.disneyplus.com/en-gb", score: 100, critical: 0, serious: 0, moderate: 0, minor: 0, totalIssues: 0, date: "2026-07-28" },
  { id: 7, name: "GitHub balisikh", url: "https://github.com/balisikh", score: 100, critical: 0, serious: 0, moderate: 0, minor: 0, totalIssues: 0, date: "2026-07-28", note: "Profile page" },
  { id: 8, name: "ChatGPT", url: "https://chatgpt.com", score: 50, critical: 1, serious: 1, moderate: 1, minor: 1, totalIssues: 4, date: "2026-07-28" },
  { id: 9, name: "Spotify Web Player", url: "https://open.spotify.com/", score: 0, critical: 82, serious: 0, moderate: 2, minor: 16, totalIssues: 100, date: "2026-07-28", note: "Re-scan: app shell / login — confirm in UI" },
  { id: 10, name: "Google Maps", url: "https://www.google.com/maps", score: 100, critical: 0, serious: 0, moderate: 0, minor: 0, totalIssues: 0, date: "2026-07-28" },
  { id: 11, name: "Google Mail (Gmail)", url: "https://mail.google.com", score: 33, critical: 1, serious: 0, moderate: 6, minor: 0, totalIssues: 7, date: "2026-07-28", note: "Sign-in surface" },
  { id: 12, name: "Google Docs", url: "https://docs.google.com", score: 33, critical: 1, serious: 0, moderate: 6, minor: 0, totalIssues: 7, date: "2026-07-28" },
  { id: 13, name: "Google Sheets", url: "https://sheets.google.com", score: 33, critical: 1, serious: 0, moderate: 6, minor: 0, totalIssues: 7, date: "2026-07-28" },
  { id: 14, name: "Google Slides", url: "https://slides.google.com", score: 33, critical: 1, serious: 0, moderate: 6, minor: 0, totalIssues: 7, date: "2026-07-28" },
  { id: 15, name: "Yahoo", url: "https://www.yahoo.com", score: 78, critical: 0, serious: 1, moderate: 1, minor: 0, totalIssues: 2, date: "2026-07-28" },
  { id: 16, name: "Amazon UK", url: "https://www.amazon.co.uk", score: 71, critical: 0, serious: 1, moderate: 2, minor: 0, totalIssues: 3, date: "2026-07-28", note: "Re-scan when page loads cleanly (avoid bot shell)" },
  { id: 17, name: "eBay UK", url: "https://www.ebay.co.uk", score: 0, critical: 0, serious: 8, moderate: 0, minor: 0, totalIssues: 8, date: "2026-07-28" },
  { id: 18, name: "Netflix UK", url: "https://www.netflix.com/gb/", score: 0, critical: 0, serious: 0, moderate: 16, minor: 0, totalIssues: 16, date: "2026-07-28" },
  { id: 19, name: "ITVX", url: "https://www.itv.com/watch", score: 79, critical: 0, serious: 0, moderate: 3, minor: 0, totalIssues: 3, date: "2026-07-28" },
  { id: 20, name: "Channel 4", url: "https://www.channel4.com/", score: 68, critical: 0, serious: 1, moderate: 2, minor: 1, totalIssues: 4, date: "2026-07-28" },
  { id: 21, name: "Channel 5", url: "https://www.channel5.com/", score: 79, critical: 0, serious: 0, moderate: 3, minor: 0, totalIssues: 3, date: "2026-07-28" },
  { id: 22, name: "Lidl UK", url: "https://www.lidl.co.uk/", score: 78, critical: 0, serious: 1, moderate: 1, minor: 0, totalIssues: 2, date: "2026-07-28" },
  { id: 23, name: "Tesco", url: "https://www.tesco.com/", score: 57, critical: 0, serious: 1, moderate: 4, minor: 0, totalIssues: 5, date: "2026-07-28" },
  { id: 24, name: "Iceland", url: "https://www.iceland.co.uk/", score: 57, critical: 0, serious: 1, moderate: 4, minor: 0, totalIssues: 5, date: "2026-07-28" },
  { id: 25, name: "Wikipedia (en Main Page)", url: "https://en.wikipedia.org/wiki/Main_Page", score: 91, critical: 0, serious: 0, moderate: 0, minor: 3, totalIssues: 3, date: "2026-07-28" },
  { id: 26, name: "example.com", url: "https://example.com/", score: 86, critical: 0, serious: 0, moderate: 2, minor: 0, totalIssues: 2, date: "2026-07-28" },
  { id: 27, name: "W3C bad demo", url: "https://www.w3.org/WAI/demos/bad/before/home.html", score: 0, critical: 34, serious: 10, moderate: 23, minor: 0, totalIssues: 67, date: "2026-07-28" },
  { id: 28, name: "W3Schools", url: "https://www.w3schools.com/", score: 0, critical: 0, serious: 5, moderate: 95, minor: 0, totalIssues: 100, date: "2026-07-28" },
];

import { websiteBatchPass } from "./website-pass-fail";

export const WEBSITE_BATCH_SUMMARY = {
  tested: WEBSITE_BATCH_RESULTS.length,
  passed: WEBSITE_BATCH_RESULTS.filter((r) => websiteBatchPass(r.score, r.critical))
    .length,
  failed: WEBSITE_BATCH_RESULTS.filter(
    (r) => !websiteBatchPass(r.score, r.critical),
  ).length,
  passedClean: WEBSITE_BATCH_RESULTS.filter(
    (r) => websiteBatchPass(r.score, r.critical) && r.totalIssues === 0,
  ).length,
  passedWithIssues: WEBSITE_BATCH_RESULTS.filter(
    (r) => websiteBatchPass(r.score, r.critical) && r.totalIssues > 0,
  ).length,
  totalCritical: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.critical, 0),
  totalSerious: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.serious, 0),
  totalModerate: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.moderate, 0),
  totalMinor: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.minor, 0),
  totalIssues: WEBSITE_BATCH_RESULTS.reduce((n, r) => n + r.totalIssues, 0),
};
