# GermanFence GitHub Release Script (PowerShell)
# Erstellt eine korrekt strukturierte ZIP-Datei für WordPress Auto-Updates

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

Write-Host "🚀 Erstelle GermanFence Release v$Version..." -ForegroundColor Green

# Prüfe ob germanfence Ordner existiert
if (-not (Test-Path "germanfence")) {
    Write-Host "❌ Fehler: germanfence/ Ordner nicht gefunden" -ForegroundColor Red
    Write-Host "Bitte im Projekt-Root ausführen" -ForegroundColor Yellow
    exit 1
}

$zipFile = "germanfence-v$Version.zip"

# Lösche alte ZIP falls vorhanden
if (Test-Path $zipFile) {
    Write-Host "🗑️  Lösche alte ZIP-Datei..." -ForegroundColor Yellow
    Remove-Item $zipFile -Force
}

# Erstelle ZIP mit korrekter Struktur
Write-Host "📦 Erstelle ZIP-Datei..." -ForegroundColor Cyan

# Temporärer Ordner für ZIP-Erstellung
$tempDir = "temp-release-$Version"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# Kopiere germanfence Ordner
Copy-Item "germanfence" $tempDir -Recurse

# Entferne unerwünschte Dateien
$excludePatterns = @(
    "*.git*",
    "node_modules",
    ".DS_Store",
    "*.log",
    ".env*",
    "PERFORMANCE-TRACKING.md",
    "CHANGELOG.md",
    "INSTALLATION.md",
    "QUICKSTART.md",
    "STRUCTURE.md",
    "THEMEFOREST-INTEGRATION.md",
    "TRANSLATIONS-HOWTO.md",
    "RELOAD-INSTRUCTIONS.txt"
)

foreach ($pattern in $excludePatterns) {
    Get-ChildItem -Path $tempDir -Filter $pattern -Recurse -Force | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
}

# Erstelle ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile -Force

# Aufräumen
Remove-Item $tempDir -Recurse -Force

# Prüfe ZIP-Struktur
Write-Host "🔍 Prüfe ZIP-Struktur..." -ForegroundColor Cyan
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $zipFile))
$firstEntry = $zip.Entries[0].FullName
$zip.Dispose()

if ($firstEntry -match "^germanfence/") {
    Write-Host "✅ ZIP-Struktur korrekt!" -ForegroundColor Green
} else {
    Write-Host "❌ Fehler: ZIP-Struktur inkorrekt!" -ForegroundColor Red
    Write-Host "Erwartet: germanfence/..." -ForegroundColor Yellow
    Write-Host "Gefunden: $firstEntry" -ForegroundColor Yellow
    exit 1
}

# Zeige Datei-Info
$fileSize = (Get-Item $zipFile).Length / 1MB
Write-Host ""
Write-Host "✅ Release-ZIP erstellt!" -ForegroundColor Green
Write-Host "📄 Datei: $zipFile" -ForegroundColor Cyan
Write-Host "📊 Größe: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "📤 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "1. Gehe zu: https://github.com/Emj92/german-shield/releases/new"
Write-Host "2. Tag: v$Version"
Write-Host "3. Titel: GermanFence v$Version"
Write-Host "4. Lade die ZIP-Datei hoch: $zipFile"
Write-Host "5. Klicke auf 'Publish release'"
Write-Host ""
Write-Host "🔗 Oder verwende GitHub CLI:" -ForegroundColor Cyan
Write-Host "   gh release create v$Version $zipFile --title `"GermanFence v$Version`" --notes `"Release v$Version`""

