# MVP Wireframes — Lumen Accessibility Checker

Low-fidelity layouts for the four MVP screens. Interactive version: open the canvas beside chat.

**Flow:** Home / Scan → Scanning → Results → Export JSON or New scan  
**Errors:** stay on Home shell with an inline alert  
**Auth:** none in MVP

---

## 1. Home / Scan

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   LUMEN                          ← brand (hero-level)       │
│   Accessibility Checker          ← one headline             │
│   Paste a public URL…            ← one short sentence       │
│                                                             │
│   Website URL                                             │
│   ┌──────────────────────────────┐ ┌────────────────────┐ │
│   │ https://example.com          │ │ Check accessibility│ │
│   └──────────────────────────────┘ └────────────────────┘ │
│   Public http/https only. No private/local addresses.       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Must include:** brand, headline, lede, labeled URL field, primary CTA, privacy/scope hint  
**Avoid on first viewport:** stats, feature cards, secondary promos

---

## 2. Scanning

```
┌─────────────────────────────────────────────────────────────┐
│  Lumen                                                      │
│  Checking https://example.com                               │
│  Status: Rendering page                                     │
│  [===========··············]  progress                      │
│                                                             │
│  (Optional later: Cancel)                                   │
└─────────────────────────────────────────────────────────────┘
```

**Status chain:** Queued → Fetching → Rendering → Rules → AI → Scoring → Completed

---

## 3. Results

```
┌─────────────────────────────────────────────────────────────┐
│  Lumen / Results                    ┌──────────┐            │
│  https://example.com                │  SCORE   │            │
│                                     │   47     │            │
│                                     └──────────┘            │
│  [Critical n] [Serious n] [Moderate n] [Minor n]            │
│                                                             │
│  Filter: [All ▼]     [Export JSON]  [New scan]              │
│  Disclaimer: assistive findings, not a certificate          │
│                                                             │
│  ┌─ Issue list ──────────┐  ┌─ Issue detail ─────────────┐ │
│  │ [critical] Missing alt│  │ Severity + message         │ │
│  │ [serious] Contrast    │  │ WCAG · Rule · Selector     │ │
│  │ [moderate] Link name  │  │ HTML snippet               │ │
│  │ …                     │  │ AI guidance (optional)     │ │
│  └───────────────────────┘  │ Suggested fix (optional)   │ │
│                             └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Error (Home shell)

```
┌─────────────────────────────────────────────────────────────┐
│  LUMEN / Accessibility Checker                              │
│  ┌──────────────────────────────┐ ┌────────────────────┐   │
│  │ http://127.0.0.1             │ │ Check accessibility│   │
│  └──────────────────────────────┘ └────────────────────┘   │
│  ⚠ Private or local network addresses cannot be scanned.    │
└─────────────────────────────────────────────────────────────┘
```

**Messages:** invalid URL · blocked private host · unreachable/timeout (after live fetch)

---

## Mapped to build

| Wireframe | Implemented in |
|-----------|----------------|
| Home / Scan | `web/src/app/ScanExperience.tsx` (idle) |
| Scanning | same (scanning phase) |
| Results | same (results phase) |
| Error | same (error phase + API 400s) |
