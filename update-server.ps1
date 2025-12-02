# German Shield - Server Update Script (PowerShell)
# Laedt das Plugin automatisch auf den Live-Server hoch

# ========================================
# KONFIGURATION
# ========================================

$FTP_HOST = "s321.goserver.host"
$FTP_USER = "web44f2"
$FTP_PASS = "Erolfni1992ft-!"
$LOCAL_PLUGIN = "german-shield"

# ========================================
# SCRIPT
# ========================================

Write-Host "German Shield Server-Update" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"
if (-not (Test-Path $winscpPath)) {
    Write-Host "WinSCP nicht gefunden!" -ForegroundColor Red
    Write-Host "Installiere: https://winscp.net/eng/download.php" -ForegroundColor Yellow
    exit 1
}

# WinSCP Script
$scriptContent = @"
option batch on
option confirm off
open ftp://${FTP_USER}:${FTP_PASS}@${FTP_HOST}

# Synchronisiere Ordner (ueberspringt fehlende Dateien)
synchronize remote -delete ${LOCAL_PLUGIN}/ german-shield/ -filemask="|.git*;*.md"

close
exit
"@

$scriptFile = "winscp-upload.txt"
$scriptContent | Out-File -FilePath $scriptFile -Encoding ASCII

Write-Host "Lade Plugin hoch..." -ForegroundColor Yellow
Write-Host ""

& $winscpPath /script=$scriptFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Plugin erfolgreich aktualisiert!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Naechste Schritte:" -ForegroundColor Cyan
    Write-Host "1. WordPress Admin -> German Shield" -ForegroundColor White
    Write-Host "2. Pruefe ob alles funktioniert" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Upload fehlgeschlagen!" -ForegroundColor Red
}

Remove-Item $scriptFile -ErrorAction SilentlyContinue
Write-Host ""
