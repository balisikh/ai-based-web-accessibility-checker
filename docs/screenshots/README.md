# Demo screenshots

Used in the root [README](../README.md) and portfolio PDF.

## README (full-page)

| File | Route | Viewport |
|------|--------|----------|
| `home-desktop.png` | `/` | 1280px wide, full page |
| `batch-desktop.png` | `/batch` | 1280px, full page |
| `results-desktop.png` | `/fixtures/results` | 1280px |
| `home-mobile.png` | `/` | 390px, full page |

## PDF (`pdf/` — viewport crops)

Portfolio PDF uses **top crops** so images are large and fit ~1 page each (not tiny thumbnails or 20-page scrolls).

| File | Source | Crop (top) |
|------|--------|------------|
| `pdf/home-desktop.png` | `home-desktop.png` | 1280×920 |
| `pdf/batch-desktop.png` | `batch-desktop.png` | 1280×1180 (header + overview + severity) |
| `pdf/results-desktop.png` | `results-desktop.png` | 1280×900 |
| `pdf/home-mobile.png` | `home-mobile.png` | 390×780 |

Regenerate PDF crops from existing PNGs (no server needed):

```bash
cd web
npm run screenshots:pdf
npm run docs:pdf
```

Or one command: `npm run docs:pdf` (runs crop step first).

## Full refresh (app must be running)

```bash
cd web
npm run dev   # or npm run start:low-mem
# other terminal:
npm run screenshots
npm run docs:pdf
```

Captures force **light** theme for consistent images.

## Manual

1. Open http://localhost:4376  
2. Save PNGs into this folder (and run `npm run screenshots:pdf` for PDF crops)
