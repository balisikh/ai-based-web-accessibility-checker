# Start Lumen on http://localhost:4376 (low-memory friendly).
# Usage: from web/  →  .\scripts\start-local.ps1
# Keep this window open while you use the app in the browser.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Lumen — starting on http://localhost:4376" -ForegroundColor Cyan
Write-Host "Close other heavy apps if the server crashes (out of memory)." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path ".next\BUILD_ID")) {
  Write-Host "No production build found — running build:low-mem (one-time, may take a few minutes)..." -ForegroundColor Yellow
  npm run build:low-mem
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Try: close apps, then npm run dev:low-mem" -ForegroundColor Red
    exit 1
  }
}

Write-Host "Starting production server (more stable than dev on low RAM)..." -ForegroundColor Green
npm run start:low-mem
