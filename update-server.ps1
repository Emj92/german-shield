# German Shield - Server Update Script (PowerShell)
# Laedt das Plugin automatisch auf den Live-Server hoch

# ========================================
# KONFIGURATION
# ========================================

$FTP_HOST = "s321.goserver.host"
$FTP_USER = "web44f2"
$FTP_PASS = "Erolfni1992ft-!"
$LOCAL_PLUGIN = "germanfence"

# ========================================
# SCRIPT
# ========================================

Write-Host "GermanFence Server-Update" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"
if (-not (Test-Path $winscpPath)) {
    Write-Host "WinSCP nicht gefunden!" -ForegroundColor Red
    Write-Host "Installiere: https://winscp.net/eng/download.php" -ForegroundColor Yellow
    exit 1
}

Write-Host "Lade Plugin auf Server hoch..." -ForegroundColor Yellow
Write-Host ""

# FTP startet direkt in /wp-content/plugins/ - daher kein cd noetig!
$scriptContent = @"
option batch on
option confirm off
open ftp://${FTP_USER}:${FTP_PASS}@${FTP_HOST}

# Synchronisiere Ordner (FTP-Root = plugins-Verzeichnis)
synchronize remote -delete ${LOCAL_PLUGIN}/ germanfence/ -filemask="|.git*;*.md;*.log;.gitignore"

close
exit
"@

$scriptFile = "winscp-upload-temp.txt"
$scriptContent | Out-File -FilePath $scriptFile -Encoding ASCII

& $winscpPath /script=$scriptFile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "Plugin erfolgreich aktualisiert!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Naechste Schritte:" -ForegroundColor Cyan
    Write-Host "1. WordPress Admin -> Plugins" -ForegroundColor White
    Write-Host "2. GermanFence aktivieren/neu laden" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Upload fehlgeschlagen!" -ForegroundColor Red
    Write-Host ""
}

Remove-Item $scriptFile -ErrorAction SilentlyContinue
Write-Host ""
