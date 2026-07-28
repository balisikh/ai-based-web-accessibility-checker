# Demo screenshots

Used in the root [README](../README.md).

| File | Route | Viewport |
|------|--------|----------|
| `home-desktop.png` | `/` | 1280px wide, full page |
| `batch-desktop.png` | `/batch` | 1280px |
| `results-desktop.png` | `/fixtures/results` | 1280px (static results layout) |
| `home-mobile.png` | `/` | 390px |

## Automated

Captures force **light** theme for consistent README images.

```bash
cd web
npm run dev
# other terminal:
npm run screenshots
```

## Manual

1. Open the app at http://localhost:4376  
2. Use browser DevTools → device toolbar for mobile  
3. Save PNGs with the names above into this folder  

After updating images, commit `docs/screenshots/*.png` with your README change.
