# Script per avviare sia il Proxy Server che il Frontend
# Uso: .\start-servers.ps1

Write-Host "🚀 Avvio Organigramma Clevertech con Smartsheet Integration..." -ForegroundColor Cyan
Write-Host ""

# Avvia il Proxy Server in una nuova finestra
Write-Host "📡 Avvio Proxy Server (porta 3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run proxy"

# Aspetta un secondo
Start-Sleep -Seconds 2

# Avvia il Frontend in una nuova finestra
Write-Host "🌐 Avvio Frontend (porta 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

Write-Host ""
Write-Host "✅ Server avviati!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Informazioni:" -ForegroundColor Cyan
Write-Host "  • Proxy Server: http://localhost:3001" -ForegroundColor White
Write-Host "  • Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Per fermare i server, chiudi entrambe le finestre PowerShell" -ForegroundColor Yellow
Write-Host ""
Write-Host "Premi un tasto per aprire il browser..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Apri il browser
Start-Process "http://localhost:3000"

