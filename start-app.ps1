# Clevertech Organigramma Launcher
# Gestisce avvio proxy + frontend con conferma chiusura

$ErrorActionPreference = "Stop"
$PROJECT_ROOT = $PSScriptRoot

# Colori console
function Write-ColorOutput($ForegroundColor, $Message) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $fc
}

# Test porta
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Avvio processo
function Start-ServerProcess {
    param(
        [string]$Name,
        [string]$Command,
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )
    
    Write-ColorOutput Green "🚀 Avvio $Name..."
    
    # Avvia processo
    $job = Start-Job -ScriptBlock {
        param($cmd, $root)
        Set-Location $root
        Invoke-Expression $cmd
    } -ArgumentList $Command, $PROJECT_ROOT
    
    # Attendi disponibilità porta
    $elapsed = 0
    while (-not (Test-Port $Port) -and $elapsed -lt $TimeoutSeconds) {
        Start-Sleep -Seconds 1
        $elapsed++
    }
    
    if (Test-Port $Port) {
        Write-ColorOutput Green "✅ $Name avviato su porta $Port (Job ID: $($job.Id))"
        return $job
    } else {
        Write-ColorOutput Red "❌ $Name non risponde dopo ${TimeoutSeconds}s"
        Stop-Job $job
        Remove-Job $job
        return $null
    }
}

try {
    Write-Host "=" * 70
    Write-ColorOutput Cyan "🚀 Clevertech Organigramma - PowerShell Launcher"
    Write-Host "=" * 70
    
    # Avvia proxy
    $proxyJob = Start-ServerProcess -Name "Proxy Smartsheet" -Command "npm run proxy" -Port 3001 -TimeoutSeconds 30
    if (-not $proxyJob) { throw "Proxy non avviato" }
    
    # Avvia frontend
    $frontendJob = Start-ServerProcess -Name "Frontend Vite" -Command "npm run dev" -Port 3000 -TimeoutSeconds 60
    if (-not $frontendJob) { throw "Frontend non avviato" }
    
    Write-Host ""
    Write-ColorOutput Green "✅ Server pronti!"
    Write-Host ""
    
    # Apri browser
    Write-ColorOutput Cyan "🌐 Apertura browser..."
    Start-Process "http://localhost:3000"
    
    Write-Host "=" * 70
    Write-ColorOutput Yellow "🎉 Applicazione avviata!"
    Write-ColorOutput Yellow "📍 URL: http://localhost:3000"
    Write-Host "=" * 70
    Write-Host ""
    Write-ColorOutput Yellow "⚠️ Premi Ctrl+C per terminare"
    
    # Monitora (attendi Ctrl+C)
    while ($true) {
        Start-Sleep -Seconds 2
        
        # Verifica server ancora attivi
        if (-not (Test-Port 3001) -or -not (Test-Port 3000)) {
            Write-ColorOutput Red "❌ Un server si è arrestato!"
            break
        }
    }
    
} catch {
    Write-ColorOutput Red "❌ Errore: $_"
    
} finally {
    Write-Host ""
    Write-Host "=" * 70
    Write-ColorOutput Yellow "🛑 Chiusura applicazione..."
    Write-Host "=" * 70
    
    # Chiedi conferma
    $response = Read-Host "Terminare anche i server? (S/N) [S]"
    
    if ($response -eq "" -or $response -match "^[Ss]") {
        Write-ColorOutput Yellow "🧹 Terminazione server..."
        
        if ($proxyJob) {
            Stop-Job $proxyJob -ErrorAction SilentlyContinue
            Remove-Job $proxyJob -ErrorAction SilentlyContinue
        }
        if ($frontendJob) {
            Stop-Job $frontendJob -ErrorAction SilentlyContinue
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
        }
        
        Write-ColorOutput Green "✅ Server terminati"
    } else {
        Write-ColorOutput Cyan "ℹ️ Server mantenuti attivi"
        Write-ColorOutput Cyan "📍 Proxy: http://localhost:3001 | Frontend: http://localhost:3000"
    }
    
    Write-Host ""
    Write-ColorOutput Green "👋 Arrivederci!"
}