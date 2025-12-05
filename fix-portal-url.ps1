# PowerShell Script - Fix Portal URL
$ErrorActionPreference = "Stop"

Write-Host "🔧 Fixe Portal BASE_URL..." -ForegroundColor Cyan

# Upload fix script
scp fix-portal-url.sh root@germanfence.de:/tmp/

# Execute on server
ssh root@germanfence.de "bash /tmp/fix-portal-url.sh"

Write-Host "`n✅ FERTIG!" -ForegroundColor Green
Write-Host "📧 Teste jetzt NEU registrieren auf: https://portal.germanfence.de/register" -ForegroundColor Yellow

