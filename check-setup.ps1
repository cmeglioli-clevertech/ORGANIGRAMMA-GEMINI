# 🔍 CHECK SETUP - ORGANIGRAMMA GEMINI
# Script di verifica ambiente per AI Agents
# Uso: .\check-setup.ps1

Write-Host "🔍 VERIFICA AMBIENTE ORGANIGRAMMA GEMINI" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$errors = @()
$warnings = @()

# 1. Verifica Node.js
Write-Host "`n📋 Verifica Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    $errors += "❌ Node.js non installato"
} else {
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
}

# 2. Verifica npm
$npmVersion = npm --version 2>$null
if (-not $npmVersion) {
    $errors += "❌ npm non installato"
} else {
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
}

# 3. Verifica package.json
Write-Host "`n📄 Verifica package.json..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    $errors += "❌ package.json mancante"
} else {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.name -eq "interactive-organizational-chart") {
        Write-Host "✅ package.json valido" -ForegroundColor Green
    } else {
        $warnings += "⚠️  package.json potrebbe essere corrotto"
    }
}

# 4. Verifica node_modules
Write-Host "`n📦 Verifica dipendenze..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    $warnings += "⚠️  node_modules mancante - esegui npm install"
} else {
    $packageCount = 0
    try {
        $listOutput = npm list --depth=0 2>$null
        if ($listOutput -match "(\d+) packages") {
            $packageCount = [int]$matches[1]
        }
    } catch {}
    
    if ($packageCount -gt 150) {
        Write-Host "✅ Dipendenze installate: $packageCount pacchetti" -ForegroundColor Green
    } elseif ($packageCount -gt 0) {
        $warnings += "⚠️  Dipendenze incomplete: solo $packageCount pacchetti (attesi ~171)"
    } else {
        $warnings += "⚠️  Impossibile verificare dipendenze"
    }
}

# 5. Verifica file .env
Write-Host "`n🔐 Verifica configurazione..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ File .env presente" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "VITE_SMARTSHEET_TOKEN") {
        Write-Host "✅ Token Smartsheet configurato" -ForegroundColor Green
    } else {
        $warnings += "⚠️  Token Smartsheet non trovato nel .env"
    }
} else {
    $warnings += "⚠️  File .env non presente - app userà dati CSV locali"
}

# 6. Verifica file CSV
Write-Host "`n📊 Verifica dati..." -ForegroundColor Yellow
if (Test-Path "_Suddivisione Clevertech light.csv") {
    Write-Host "✅ Dataset CSV presente" -ForegroundColor Green
} else {
    $errors += "❌ File CSV dati mancante"
}

# 7. Verifica porte in uso
Write-Host "`n🌐 Verifica porte..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($port3000) {
    $warnings += "⚠️  Porta 3000 già in uso"
} else {
    Write-Host "✅ Porta 3000 disponibile" -ForegroundColor Green
}

if ($port3001) {
    $warnings += "⚠️  Porta 3001 già in uso"
} else {
    Write-Host "✅ Porta 3001 disponibile" -ForegroundColor Green
}

# 8. Verifica script di avvio
Write-Host "`n🚀 Verifica script automazione..." -ForegroundColor Yellow
if (Test-Path "start-app.ps1") {
    Write-Host "✅ Script automatico presente" -ForegroundColor Green
} else {
    $warnings += "⚠️  Script start-app.ps1 mancante"
}

# Riepilogo risultati
Write-Host "`n📋 RIEPILOGO VERIFICA:" -ForegroundColor Cyan
Write-Host "====================" -ForegroundColor Cyan

if ($errors.Count -eq 0) {
    Write-Host "`n🎉 AMBIENTE OK!" -ForegroundColor Green
    Write-Host "Puoi avviare l'app con: .\start-app.ps1" -ForegroundColor White
} else {
    Write-Host "`n❌ ERRORI CRITICI:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   $error" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  AVVISI:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   $warning" -ForegroundColor Yellow
    }
}

Write-Host "`n🔧 SUGGERIMENTI:" -ForegroundColor White
Write-Host "- Se ci sono errori: installa Node.js/npm" -ForegroundColor Gray
Write-Host "- Se dipendenze incomplete: .\start-app.ps1 (risolve automaticamente)" -ForegroundColor Gray  
Write-Host "- Per Smartsheet sync: crea file .env con token API" -ForegroundColor Gray

exit ($errors.Count)
