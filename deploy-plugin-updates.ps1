# GermanFence Plugin Update Files Deployment (Windows)
# Deployed info.json und plugin.zip auf den Server

$ErrorActionPreference = "Stop"

Write-Host "🚀 GermanFence Plugin Update-Dateien Deployment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Lese Plugin-Version
$content = Get-Content "germanfence\germanfence.php" -Raw
if ($content -match "Version:\s*([\d\.]+)") {
    $Version = $Matches[1]
} else {
    Write-Host "❌ Fehler: Plugin-Version nicht gefunden" -ForegroundColor Red
    exit 1
}

Write-Host "📌 Plugin Version: v$Version" -ForegroundColor Cyan
Write-Host ""

# ==========================================
# 1. VERZEICHNISSE ERSTELLEN
# ==========================================
Write-Host "📁 Erstelle Verzeichnisse..." -ForegroundColor Cyan

if (-not (Test-Path "downloads")) {
    New-Item -ItemType Directory -Path "downloads" | Out-Null
}

Write-Host "✅ Lokale Verzeichnisse bereit" -ForegroundColor Green

# ==========================================
# 2. PLUGIN ZIP ERSTELLEN
# ==========================================
Write-Host ""
Write-Host "📦 Erstelle Plugin-ZIP..." -ForegroundColor Cyan

$zipLatest = "downloads\germanfence-plugin.zip"
$zipVersioned = "downloads\germanfence-v$Version.zip"

# Lösche alte ZIPs
if (Test-Path $zipLatest) { Remove-Item $zipLatest -Force }
if (Test-Path $zipVersioned) { Remove-Item $zipVersioned -Force }

# Erstelle ZIP
Compress-Archive -Path "germanfence\*" -DestinationPath $zipLatest -Force
Copy-Item $zipLatest $zipVersioned -Force

$fileSize = [math]::Round((Get-Item $zipLatest).Length / 1MB, 2)
Write-Host "✅ ZIP erstellt: $fileSize MB" -ForegroundColor Green

# ==========================================
# 3. INFO.JSON AKTUALISIEREN
# ==========================================
Write-Host ""
Write-Host "📝 Erstelle info.json..." -ForegroundColor Cyan

$currentDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")

$infoJson = @{
    name = "GermanFence"
    version = $Version
    download_url = "https://germanfence.de/downloads/germanfence-plugin.zip"
    homepage = "https://germanfence.de"
    requires = "5.0"
    tested = "6.7"
    requires_php = "7.4"
    last_updated = $currentDate
    author = "GermanFence Team"
    author_homepage = "https://germanfence.de"
    sections = @{
        description = "Bestes WordPress Anti-Spam Plugin aus Deutschland! Schützt alle WordPress-Formulare vor Spam mit modernsten Techniken: Honeypot, Zeitstempel, GEO-Blocking, intelligente Phrasen-Erkennung und mehr. Made in Germany 🇩🇪"
        changelog = "<h4>$Version</h4><ul><li>Badge Doppel-Anzeige behoben</li><li>Update-System repariert</li></ul>"
    }
    banners = @{
        low = "https://germanfence.de/assets/banner-772x250.png"
        high = "https://germanfence.de/assets/banner-1544x500.png"
    }
    icons = @{
        "1x" = "https://germanfence.de/germanfence_logo.png"
        "2x" = "https://germanfence.de/germanfence_logo.png"
    }
} | ConvertTo-Json -Depth 10

$infoJson | Out-File "downloads\info.json" -Encoding UTF8 -NoNewline

Write-Host "✅ info.json erstellt" -ForegroundColor Green

# ==========================================
# 4. AUF SERVER HOCHLADEN (via SCP)
# ==========================================
Write-Host ""
Write-Host "📤 Lade auf Server hoch..." -ForegroundColor Cyan

$sshKey = "C:\Users\emein\.ssh\id_ed25519"
$serverUser = "erwin"
$serverIP = "188.245.101.122"
$remotePath = "/var/www/germanfence.de/downloads/"

try {
    # Erstelle Remote-Verzeichnis falls nicht vorhanden
    ssh -i $sshKey "${serverUser}@${serverIP}" "sudo mkdir -p $remotePath"
    
    # Upload Dateien
    scp -i $sshKey "downloads\germanfence-plugin.zip" "${serverUser}@${serverIP}:/tmp/"
    scp -i $sshKey "downloads\germanfence-v$Version.zip" "${serverUser}@${serverIP}:/tmp/"
    scp -i $sshKey "downloads\info.json" "${serverUser}@${serverIP}:/tmp/"
    
    # Verschiebe mit sudo und setze Berechtigungen
    ssh -i $sshKey "${serverUser}@${serverIP}" @"
        sudo mv /tmp/germanfence-plugin.zip $remotePath
        sudo mv /tmp/germanfence-v$Version.zip $remotePath
        sudo mv /tmp/info.json $remotePath
        sudo chown -R www-data:www-data $remotePath
        sudo chmod -R 644 ${remotePath}*
        sudo chmod 755 $remotePath
"@
    
    Write-Host "✅ Dateien hochgeladen & Berechtigungen gesetzt" -ForegroundColor Green
    
    # Prüfe Erreichbarkeit
    Write-Host ""
    Write-Host "🔍 Prüfe Erreichbarkeit..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "https://germanfence.de/downloads/info.json" -Method Head -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ info.json ist erreichbar" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  info.json NICHT erreichbar - prüfe Nginx/Apache Config" -ForegroundColor Yellow
    }
    
    try {
        $response = Invoke-WebRequest -Uri "https://germanfence.de/downloads/germanfence-plugin.zip" -Method Head -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Plugin-ZIP ist erreichbar" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Plugin-ZIP NICHT erreichbar - prüfe Nginx/Apache Config" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "⚠️  Upload fehlgeschlagen: $_" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📤 Manuell hochladen mit:" -ForegroundColor Cyan
    Write-Host "   scp -i $sshKey downloads\* ${serverUser}@${serverIP}:$remotePath"
}

# ==========================================
# 5. FERTIG
# ==========================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT ABGESCHLOSSEN!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📥 Download URLs:" -ForegroundColor Cyan
Write-Host "   https://germanfence.de/downloads/germanfence-plugin.zip"
Write-Host "   https://germanfence.de/downloads/germanfence-v$Version.zip"
Write-Host "   https://germanfence.de/downloads/info.json"
Write-Host ""
Write-Host "🔄 Update-Check:" -ForegroundColor Cyan
Write-Host "   WordPress sollte jetzt Updates anzeigen!"
Write-Host "   (Cache leeren falls nötig)"
Write-Host ""

