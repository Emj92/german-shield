#!/bin/bash

# GermanFence GitHub Release Script
# Erstellt eine korrekt strukturierte ZIP-Datei für WordPress Auto-Updates

set -e

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "❌ Fehler: Keine Version angegeben"
    echo "Usage: ./create-release.sh 1.3.3"
    exit 1
fi

echo "🚀 Erstelle GermanFence Release v${VERSION}..."

# Prüfe ob germanfence Ordner existiert
if [ ! -d "germanfence" ]; then
    echo "❌ Fehler: germanfence/ Ordner nicht gefunden"
    echo "Bitte im Projekt-Root ausführen"
    exit 1
fi

# Lösche alte ZIP falls vorhanden
if [ -f "germanfence-v${VERSION}.zip" ]; then
    echo "🗑️  Lösche alte ZIP-Datei..."
    rm "germanfence-v${VERSION}.zip"
fi

# Erstelle ZIP mit korrekter Struktur
echo "📦 Erstelle ZIP-Datei..."
cd germanfence
zip -r "../germanfence-v${VERSION}.zip" . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x ".DS_Store" \
  -x "*.log" \
  -x ".env*" \
  -x "*.md" \
  -x "PERFORMANCE-TRACKING.md" \
  -x "CHANGELOG.md" \
  -x "INSTALLATION.md" \
  -x "QUICKSTART.md" \
  -x "STRUCTURE.md" \
  -x "THEMEFOREST-INTEGRATION.md" \
  -x "TRANSLATIONS-HOWTO.md" \
  -x "RELOAD-INSTRUCTIONS.txt" \
  > /dev/null

cd ..

# Prüfe ZIP-Struktur
echo "🔍 Prüfe ZIP-Struktur..."
FIRST_FILE=$(unzip -l "germanfence-v${VERSION}.zip" | grep -m 1 "germanfence/" | awk '{print $4}')

if [[ $FIRST_FILE == germanfence/* ]]; then
    echo "✅ ZIP-Struktur korrekt!"
else
    echo "❌ Fehler: ZIP-Struktur inkorrekt!"
    echo "Erwartet: germanfence/..."
    echo "Gefunden: $FIRST_FILE"
    exit 1
fi

# Zeige Datei-Info
FILE_SIZE=$(du -h "germanfence-v${VERSION}.zip" | cut -f1)
echo ""
echo "✅ Release-ZIP erstellt!"
echo "📄 Datei: germanfence-v${VERSION}.zip"
echo "📊 Größe: $FILE_SIZE"
echo ""
echo "📤 Nächste Schritte:"
echo "1. Gehe zu: https://github.com/Emj92/german-shield/releases/new"
echo "2. Tag: v${VERSION}"
echo "3. Titel: GermanFence v${VERSION}"
echo "4. Lade die ZIP-Datei hoch: germanfence-v${VERSION}.zip"
echo "5. Klicke auf 'Publish release'"
echo ""
echo "🔗 Oder verwende GitHub CLI:"
echo "   gh release create v${VERSION} germanfence-v${VERSION}.zip --title \"GermanFence v${VERSION}\" --notes \"Release v${VERSION}\""

