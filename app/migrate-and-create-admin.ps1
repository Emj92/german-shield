# Migration durchführen
Write-Host "🔄 Führe Datenbank-Migration durch..." -ForegroundColor Cyan

# Prisma DB Push mit --accept-data-loss Flag
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Migration fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migration erfolgreich!" -ForegroundColor Green

# Prisma Client generieren
Write-Host "🔄 Generiere Prisma Client..." -ForegroundColor Cyan
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma Generate fehlgeschlagen!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prisma Client generiert!" -ForegroundColor Green

# Admin-User erstellen
Write-Host "🔄 Erstelle Admin-User..." -ForegroundColor Cyan
npm run create-admin

Write-Host "`n✅ Fertig! Du kannst dich jetzt einloggen." -ForegroundColor Green

