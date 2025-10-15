# 🏢 ORGANIGRAMMA GEMINI - Avvio WebApp Automatico
# Script PowerShell per avviare proxy + frontend + browser

Write-Host "🏢 ORGANIGRAMMA GEMINI - Avvio Automatico" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Verifica directory corretta
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ProjectRoot
Write-Host "📂 Directory progetto: $ProjectRoot" -ForegroundColor Cyan

# Verifica che siamo nella directory corretta
if (-not (Test-Path "package.json") -or -not (Test-Path "server-proxy.js")) {
    Write-Host "❌ ERRORE: Directory progetto non valida!" -ForegroundColor Red
    Write-Host "   Assicurati di eseguire lo script dalla directory del progetto" -ForegroundColor Yellow
    Write-Host "   Directory attuale: $ProjectRoot" -ForegroundColor Gray
    Read-Host "Premi INVIO per uscire"
    exit 1
}

# 2. Verifica Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ ERRORE: Node.js non installato!" -ForegroundColor Red
    Read-Host "Premi INVIO per uscire"
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green

# 3. Verifica file .env
Write-Host "`n🔍 Verifica configurazione..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ File .env presente" -ForegroundColor Green
    # Testa caricamento variabili
    $envTest = node -e "require('dotenv').config(); console.log(process.env.VITE_SMARTSHEET_TOKEN ? 'OK' : 'NO_TOKEN');" 2>$null
    if ($envTest -eq "OK") {
        Write-Host "✅ Variabili ambiente caricate correttamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️  File .env presente ma token non caricato" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  File .env non trovato - app userà dati CSV locali" -ForegroundColor Yellow
}

# 4. Termina processi precedenti (pulizia)
Write-Host "`n🧹 Pulizia processi precedenti..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "chrome" -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*localhost:3000*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 5. Avvia Proxy Smartsheet
Write-Host "`n🚀 Avvio Proxy Smartsheet (porta 3001)..." -ForegroundColor Yellow
$proxyJob = Start-Job -ScriptBlock {
    Set-Location $using:ProjectRoot
    node server-proxy.js
}
Write-Host "✅ Proxy avviato (Job ID: $($proxyJob.Id))" -ForegroundColor Green

# Attendi che il proxy sia pronto
Write-Host "⏳ Attesa disponibilità proxy..." -ForegroundColor Yellow
$proxyReady = $false
for ($i = 1; $i -le 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $proxyReady = $true
            Write-Host "✅ Proxy pronto!" -ForegroundColor Green
            break
        }
    } catch {}
}

if (-not $proxyReady) {
    Write-Host "⚠️  Proxy non risponde, ma continuo..." -ForegroundColor Yellow
}

# 6. Avvia Frontend Vite
Write-Host "`n🚀 Avvio Frontend Vite (porta 3000)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:ProjectRoot
    npm run dev
}
Write-Host "✅ Frontend avviato (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Attendi che il frontend sia pronto
Write-Host "⏳ Attesa disponibilità frontend..." -ForegroundColor Yellow
$frontendReady = $false
for ($i = 1; $i -le 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $frontendReady = $true
            Write-Host "✅ Frontend pronto!" -ForegroundColor Green
            break
        }
    } catch {}
    
    if ($i % 5 -eq 0) {
        Write-Host "   Ancora $($30 - $i)s..." -ForegroundColor Gray
    }
}

if (-not $frontendReady) {
    Write-Host "❌ Frontend non risponde dopo 30s" -ForegroundColor Red
    Write-Host "Terminazione processi..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Read-Host "Premi INVIO per uscire"
    exit 1
}

# 7. Apri browser
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

# 8. Informazioni finali
Write-Host "`n✨ Applicazione avviata con successo!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "📍 URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Proxy: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`n⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - NON chiudere questa finestra!" -ForegroundColor White
Write-Host "   - Chiudi il browser per terminare l'applicazione" -ForegroundColor White
Write-Host "   - I server verranno terminati automaticamente" -ForegroundColor White
Write-Host "================================================`n" -ForegroundColor Green

# 9. Attendi che l'utente chiuda (mantieni i server attivi)
try {
    Write-Host "👀 Monitoraggio server in corso... (Premi Ctrl+C per terminare)" -ForegroundColor Cyan
    while ($true) {
        Start-Sleep -Seconds 5
        
        # Verifica che i job siano ancora attivi
        $proxyStatus = (Get-Job -Id $proxyJob.Id -ErrorAction SilentlyContinue).State
        $frontendStatus = (Get-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue).State
        
        if ($proxyStatus -eq "Failed" -or $frontendStatus -eq "Failed") {
            Write-Host "⚠️  Un server si è arrestato!" -ForegroundColor Red
            break
        }
    }
} catch {
    Write-Host "`n🛑 Interruzione ricevuta" -ForegroundColor Yellow
} finally {
    # Cleanup
    Write-Host "`n🧹 Terminazione server..." -ForegroundColor Yellow
    Get-Job | Stop-Job -ErrorAction SilentlyContinue
    Get-Job | Remove-Job -ErrorAction SilentlyContinue
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Chiusura completata" -ForegroundColor Green
}
