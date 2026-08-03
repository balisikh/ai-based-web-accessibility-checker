# Fix "plain white text" — broken CSS on http://localhost:4376
# Usage (from web/):  .\scripts\fix-styles.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "Lumen — fix missing styles (plain text UI)" -ForegroundColor Cyan
Write-Host ""

# Stop anything on port 4376
$lines = netstat -ano | Select-String ":4376\s" | Select-String "LISTENING"
foreach ($line in $lines) {
  $pid = ($line -split "\s+")[-1]
  if ($pid -match "^\d+$") {
    Write-Host "Stopping old server (PID $pid)..." -ForegroundColor Yellow
    Stop-Process -Id ([int]$pid) -Force -ErrorAction SilentlyContinue
  }
}
Start-Sleep -Seconds 2

Write-Host "Removing broken .next build..." -ForegroundColor Yellow
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue

Write-Host "Building with webpack (close other heavy apps first)..." -ForegroundColor Yellow
npm run build:low-mem
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "Build ran out of memory. Try:" -ForegroundColor Red
  Write-Host "  1. Close Chrome, Cursor extras, other apps" -ForegroundColor Red
  Write-Host "  2. Run this script again" -ForegroundColor Red
  Write-Host "  Or use dev mode: npm run dev  (keep terminal open)" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Starting server on http://localhost:4376 ..." -ForegroundColor Green
Write-Host "Open that URL and press Ctrl+F5. Keep this window open." -ForegroundColor Green
Write-Host ""
npm run start:low-mem
