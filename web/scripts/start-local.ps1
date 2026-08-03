# Start Lumen on http://localhost:4376 (low-memory friendly).
# Usage: from web/  →  .\scripts\start-local.ps1
# Keep this window open while you use the app in the browser.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Lumen — starting on http://localhost:4376" -ForegroundColor Cyan
Write-Host "Close other heavy apps if the server crashes (out of memory)." -ForegroundColor Yellow
Write-Host ""

if (-not (Test-Path ".next\BUILD_ID")) {
  Write-Host "No production build found — running build:low-mem with webpack (one-time, may take a few minutes)..." -ForegroundColor Yellow
  Write-Host "Close Chrome, Cursor extras, and other heavy apps if the build runs out of memory." -ForegroundColor Yellow
  npm run build:low-mem
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed (often out of memory). Try:" -ForegroundColor Red
    Write-Host "  1. Close other apps, then run this script again" -ForegroundColor Red
    Write-Host "  2. Or: npm run dev   (dev server with webpack — keep terminal open)" -ForegroundColor Red
    exit 1
  }
}

Write-Host "Starting production server (more stable than dev on low RAM)..." -ForegroundColor Green
npm run start:low-mem
