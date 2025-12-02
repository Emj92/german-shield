# German Shield - Server-Struktur pruefen

$FTP_HOST = "s321.goserver.host"
$FTP_USER = "web44f2"
$FTP_PASS = "Erolfni1992ft-!"

$winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"

$scriptContent = @"
option batch abort
option confirm off
open ftp://${FTP_USER}:${FTP_PASS}@${FTP_HOST}

# Zeige Root-Verzeichnis
pwd
ls

# Versuche verschiedene Pfade
cd mydaubner.de 2>/dev/null && pwd && ls || echo "mydaubner.de nicht gefunden"
cd /mydaubner.de 2>/dev/null && pwd && ls || echo "/mydaubner.de nicht gefunden"
cd www 2>/dev/null && pwd && ls || echo "www nicht gefunden"
cd public_html 2>/dev/null && pwd && ls || echo "public_html nicht gefunden"
cd htdocs 2>/dev/null && pwd && ls || echo "htdocs nicht gefunden"

close
exit
"@

$scriptFile = "winscp-check.txt"
$scriptContent | Out-File -FilePath $scriptFile -Encoding ASCII

Write-Host "Pruefe Server-Struktur..." -ForegroundColor Cyan
Write-Host ""

& $winscpPath /script=$scriptFile

Remove-Item $scriptFile -ErrorAction SilentlyContinue

