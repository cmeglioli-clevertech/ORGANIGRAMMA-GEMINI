# 🏢 ORGANIGRAMMA GEMINI - Avvio Semplice
# Script PowerShell semplificato per avviare l'applicazione

Write-Host "🏢 ORGANIGRAMMA GEMINI - Avvio Automatico" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Naviga alla directory del progetto
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot
Write-Host "📂 Directory: $ProjectRoot" -ForegroundColor Cyan

# Verifica che siamo nella directory corretta
if (-not (Test-Path "package.json") -or -not (Test-Path "server-proxy.js")) {
    Write-Host "❌ ERRORE: Directory progetto non valida!" -ForegroundColor Red
    Write-Host "   Assicurati di eseguire lo script dalla directory del progetto" -ForegroundColor Yellow
    Read-Host "Premi INVIO per uscire"
    exit 1
}

# Verifica Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ ERRORE: Node.js non installato!" -ForegroundColor Red
    Read-Host "Premi INVIO per uscire"
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# Verifica file .env
if (Test-Path ".env") {
    Write-Host "✅ File .env presente" -ForegroundColor Green
} else {
    Write-Host "⚠️  File .env non trovato - app userà dati CSV locali" -ForegroundColor Yellow
}

# Termina processi precedenti
Write-Host "`n🧹 Pulizia processi precedenti..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Avvia Proxy Smartsheet
Write-Host "`n🚀 Avvio Proxy Smartsheet..." -ForegroundColor Yellow
Start-Process -WindowStyle Hidden -FilePath "node" -ArgumentList "server-proxy.js"
Start-Sleep -Seconds 3

# Verifica proxy
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Proxy attivo (porta 3001)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Proxy non risponde correttamente" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Proxy non raggiungibile" -ForegroundColor Yellow
}

# Avvia Frontend Vite
Write-Host "`n🚀 Avvio Frontend Vite..." -ForegroundColor Yellow
Start-Process -WindowStyle Normal -FilePath "cmd" -ArgumentList "/c", "npm run dev"
Start-Sleep -Seconds 5

# Verifica frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend attivo (porta 3000)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend non risponde correttamente" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Frontend non raggiungibile" -ForegroundColor Yellow
}

# Apri browser
Write-Host "`n🌐 Apertura browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Trova Chrome o Edge
$chromePath = $null
$chromePaths = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
)

foreach ($path in $chromePaths) {
    if (Test-Path $path) {
        $chromePath = $path
        break
    }
}

if ($chromePath) {
    $browserName = Split-Path -Leaf $chromePath
    Write-Host "✅ Browser trovato: $browserName" -ForegroundColor Green
    
    # Avvia in modalità app
    Start-Process -FilePath $chromePath -ArgumentList @(
        "--app=http://localhost:3000",
        "--window-size=1700,1000",
        "--window-position=110,40"
    )
} else {
    Write-Host "⚠️  Browser non trovato, apro con browser predefinito" -ForegroundColor Yellow
    Start-Process "http://localhost:3000"
}

# Informazioni finali
Write-Host "`n✨ Applicazione avviata!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "📍 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Proxy: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`n⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - Chiudi il browser per terminare l'applicazione" -ForegroundColor White
Write-Host "   - I server verranno terminati automaticamente" -ForegroundColor White
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "✅ Avvio completato! L'applicazione dovrebbe essere aperta nel browser." -ForegroundColor Green
Write-Host "   Se non si apre automaticamente, vai su: http://localhost:3000" -ForegroundColor Cyan
