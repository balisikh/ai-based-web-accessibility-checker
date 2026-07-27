# Product Brief: AI-Based Web Accessibility Checker

**Version:** 1.0  
**Status:** Concept / Pre-build  
**Date:** July 2026

---

## 1. Overview

**AI-Based Web Accessibility Checker** is a web product that scans websites, detects accessibility barriers against WCAG standards, and uses AI to explain issues and recommend fixes. It helps teams ship inclusive digital experiences faster—without relying only on slow, expensive manual audits.

**One-liner:** Scan any page. Get WCAG-aligned findings, AI-powered guidance, and a clear path to fix.

---

## 2. Problem

- Millions of users with disabilities cannot fully use many websites (missing alt text, poor contrast, keyboard traps, unclear forms, broken ARIA).
- Manual accessibility audits are costly, infrequent, and hard to scale across large sites.
- Rule-only tools miss context (e.g. whether alt text is *meaningful*, or link text makes sense in context).
- Legal and procurement pressure is rising (ADA, Equality Act, EN 301 549, Section 508-style requirements, public-sector mandates).
- Developers often learn about issues late—after design and launch—when fixes are expensive.

---

## 3. Solution

A hybrid accessibility checker that combines:

1. **Automated rule engines** for deterministic WCAG checks  
2. **AI analysis** for contextual quality, prioritization, and remediation advice  
3. **Actionable reporting** so designers, developers, and compliance stakeholders can act quickly  

Users submit a URL (or HTML/page set), receive a scored report mapped to WCAG criteria, and get prioritized fixes with suggested changes.

---

## 4. Goals & Success Metrics

### Product goals
- Make accessibility checking fast, understandable, and repeatable  
- Reduce time from “issue found” to “issue fixed”  
- Support compliance workflows without replacing human expert judgment  

### Success metrics (targets for MVP+)
| Metric | Target direction |
|--------|------------------|
| Time to first useful report | < 2 minutes for a typical page |
| Issue actionability rate | > 80% of findings include clear fix guidance |
| Critical issue detection coverage | Core WCAG 2.2 AA automated + AI-assisted checks |
| User retention (weekly scans) | Teams re-scan after fixes |
| False-positive complaints | Tracked and reduced over releases |

---

## 5. Target Users

| Persona | Need |
|---------|------|
| **Frontend / full-stack developers** | Fast feedback in the build cycle; code-level fixes |
| **UI/UX designers** | Early design/content guidance (contrast, structure, labels) |
| **QA / accessibility specialists** | Triage, evidence, and audit support |
| **Product / compliance owners** | Scores, trends, exportable reports for stakeholders |
| **Agencies & consultants** | Multi-client scanning and client-ready deliverables |

**Primary beachhead:** Small-to-mid product teams and agencies who need WCAG AA readiness without a full-time accessibility team.

---

## 6. Value Proposition

| For | Value |
|-----|--------|
| Development teams | Catch issues early; fewer late surprises |
| Business / legal | Lower compliance and reputation risk |
| End users | More usable, inclusive experiences |
| Organizations | Broader audience reach and brand trust |

**Why AI matters here:** Rules catch “missing alt.” AI judges whether alt text actually describes the image, whether “click here” links are ambiguous, and how to rewrite content clearly.

---

## 7. Key Features (Required)

### Must-have (MVP)
1. **URL scan** — analyze a public page by URL  
2. **WCAG 2.2 AA mapping** — criterion ID, severity, impact  
3. **Core detectors** — images/alt, contrast, headings, forms/labels, links, keyboard/focus basics, landmark/ARIA essentials  
4. **AI remediation** — plain-language explanation + suggested fix (content and/or code)  
5. **Prioritized report** — Critical → Serious → Moderate → Minor  
6. **Accessibility score** — simple page score with issue breakdown  
7. **Export** — PDF and/or JSON for sharing  

### Should-have (next)
8. Multi-page / site crawl (depth-limited)  
9. Scan history and score trends  
10. Ignore / mark-as-reviewed workflow  
11. API + CI integration (fail build on critical issues)  
12. Authenticated / staging page support  

### Later
13. Design-file / Figma checks  
14. Team workspaces and roles  
15. Browser extension for live page inspection  
16. Comparison reports (before vs after fix)  

---

## 8. User Journey (MVP)

1. User opens the app and enters a website URL  
2. System fetches and analyzes the page (rules + AI)  
3. User sees score, issue list, and WCAG references  
4. User expands an issue for explanation, evidence, and fix suggestion  
5. User exports or shares the report; re-scans after fixes  

---

## 9. Competitive Positioning

| Approach | Limitation | Our angle |
|----------|------------|-----------|
| Manual audit only | Slow, expensive, not continuous | Instant first pass + human escalation later |
| Rule-only tools (axe, Lighthouse, WAVE) | Weak on context and content quality | AI layer for meaning, priority, and remediation |
| Enterprise suites | Heavy, costly for smaller teams | Fast, focused product for teams who need clarity now |

**Positioning statement:**  
*For product and engineering teams who must meet WCAG AA, AI-Based Web Accessibility Checker is the accessibility scanner that combines automated standards checks with AI guidance—so you don’t just find issues, you know how to fix them.*

---

## 10. Scope & Non-Goals (MVP)

### In scope
- Public web pages (HTML/CSS rendered analysis)  
- WCAG 2.2 Level A/AA focused reporting  
- Single-page scan + report + export  

### Out of scope (initially)
- Full legal certification or formal conformance claims  
- Native mobile apps  
- Guaranteeing 100% issue coverage (no tool can; human review remains required)  
- Automatic code commits / auto-remediation into customer repos  

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| False positives erode trust | Confidence scores; allow dismiss/ignore; tune rules |
| AI hallucinations in fix advice | Ground suggestions in detected DOM evidence; cite WCAG |
| Dynamic SPAs hard to scan | Use headless browser rendering where needed |
| Over-promising compliance | Clear disclaimer: assistive tool, not a certificate |
| Privacy of scanned content | Minimize retention; optional no-store mode |

---

## 12. High-Level Requirements

### Functional
- Accept URL input and return structured accessibility results  
- Classify severity and map to WCAG success criteria  
- Generate AI explanations and remediation suggestions  
- Persist scan results for revisit (if accounts enabled)  
- Export reports  

### Non-functional
- Scan latency suitable for interactive use  
- Secure handling of URLs and page content  
- Accessible product UI (the checker itself must meet WCAG AA)  
- Clear audit trail of what was checked and when  

---

## 13. Suggested MVP Tech Direction (indicative)

- **Frontend:** Web app for scan input, results, and report views  
- **Backend:** Scan orchestration API  
- **Analysis:** Accessibility rule engine (e.g. axe-core style checks) + headless browser  
- **AI:** LLM for contextual review and remediation text  
- **Storage:** Scan metadata, scores, issue history  

*(Final stack to be decided during technical design.)*

---

## 14. Rollout Plan (proposed)

| Phase | Deliverable |
|-------|-------------|
| **Phase 0** | Product brief, UX wireframes, technical design |
| **Phase 1 – MVP** | Single URL scan, core WCAG checks, AI fix tips, score, PDF/JSON export |
| **Phase 2** | History, multi-page crawl, ignore list, better SPA support |
| **Phase 3** | API/CI, teams, authenticated pages, advanced reporting |

---

## 15. Open Questions

**MVP defaults locked** — see `MVP_DECISIONS.md` (TypeScript/Next.js stack, anonymous scans, optional AI, container hosting).

Still open (post-MVP / business):
1. Self-serve SaaS, internal tool, or both?  
2. Free tier limits (pages/month) and paid plans?  
3. Which AI provider / model constraints (cost, privacy, region)?  
4. Target WCAG version focus for launch: 2.1 AA vs 2.2 AA? (architecture assumes 2.2 AA)

---

## 16. Summary

Build an AI-assisted accessibility checker that makes WCAG issues **visible, prioritized, and fixable**. Start with a sharp MVP: one URL → scored report → AI remediation → export. Expand into crawl, CI, and team workflows once the core loop is trusted.
