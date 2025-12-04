# GermanFence - Deploy von lokalem PC auf Server
# Führt dieses Script lokal aus, es verbindet sich mit dem Server

$SERVER_USER = "erwinneu"
$SERVER_IP = "188.245.101.122"
$SSH_KEY = "C:\Users\emein\.ssh\id_ed25519"

Write-Host "🚀 GermanFence Deployment starten..." -ForegroundColor Cyan

# 1. Lokale Änderungen pushen
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git add .
git status
$commitMsg = Read-Host "Commit Message (oder Enter für 'Update')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Update"
}
git commit -m "$commitMsg"
git push origin main

Write-Host "✅ Git Push erfolgreich!" -ForegroundColor Green

# 2. Auf Server deployen
Write-Host "🔄 Deploying auf Server..." -ForegroundColor Yellow
ssh -i $SSH_KEY ${SERVER_USER}@${SERVER_IP} "bash /var/www/germanfence.de/german-shield/deploy-server.sh"

Write-Host "✅ Deployment abgeschlossen!" -ForegroundColor Green
Write-Host "🌐 Portal: https://portal.germanfence.de" -ForegroundColor Cyan
Write-Host "🌐 Website: https://germanfence.de" -ForegroundColor Cyan

