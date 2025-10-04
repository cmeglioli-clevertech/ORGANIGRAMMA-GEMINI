# 🚀 ORGANIGRAMMA GEMINI - AVVIO AUTOMATICO
# Script PowerShell per avviare l'applicazione completa
# Uso: .\start-app.ps1

Write-Host "🏢 ORGANIGRAMMA GEMINI v4.4.2 - Avvio Automatico" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# 1. Verifica Node.js e npm
Write-Host "📋 Verifica sistema..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if (-not $nodeVersion) {
    Write-Host "❌ ERRORE: Node.js non installato!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "✅ npm: $npmVersion" -ForegroundColor Green

# 2. Verifica dipendenze
Write-Host "`n📦 Verifica dipendenze..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installazione dipendenze..." -ForegroundColor Yellow
    npm install
} else {
    $packageCount = (npm list --depth=0 2>$null | Select-String "packages").Count
    if ($packageCount -eq 0) {
        Write-Host "🔧 Reinstallazione dipendenze (cache corrotta)..." -ForegroundColor Yellow
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
        npm install
    }
}

# 3. Pulizia cache Vite (prevenzione errori 504)
Write-Host "`n🧹 Pulizia cache Vite..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue

# 4. Verifica file .env
Write-Host "`n🔍 Verifica configurazione..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ File .env trovato - Sincronizzazione Smartsheet disponibile" -ForegroundColor Green
} else {
    Write-Host "⚠️  File .env non trovato - App funziona con dati CSV locali" -ForegroundColor Yellow
    Write-Host "   Per Smartsheet: crea .env con VITE_SMARTSHEET_TOKEN e VITE_SMARTSHEET_SHEET_ID" -ForegroundColor Gray
}

# 5. Termina processi precedenti
Write-Host "`n🛑 Pulizia processi precedenti..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# 6. Avvia entrambi i server
Write-Host "`n🚀 Avvio server..." -ForegroundColor Yellow
Write-Host "   🔹 Frontend (Vite): http://localhost:3000" -ForegroundColor Cyan
Write-Host "   🔹 Proxy (Smartsheet): http://localhost:3001" -ForegroundColor Cyan

# Avvia proxy in background
Start-Process -WindowStyle Hidden -FilePath "cmd" -ArgumentList "/c", "npm run proxy"
Start-Sleep -Seconds 2

# Avvia frontend
Write-Host "`n✨ Avvio completato! Browser si aprirà automaticamente..." -ForegroundColor Green
Write-Host "   Ctrl+C per fermare entrambi i server" -ForegroundColor Gray

# Apri browser dopo 3 secondi
Start-Process -FilePath "cmd" -ArgumentList "/c", "timeout /t 3 >nul && start http://localhost:3000" -WindowStyle Hidden

# Avvia frontend (interattivo)
npm run dev
