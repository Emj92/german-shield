#!/bin/bash

# GermanFence Plugin ZIP Creator
# Verwendet Semantic Versioning: MAJOR.MINOR.PATCH

set -e

echo "📦 Creating GermanFence Plugin ZIP..."

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Lese Version aus Plugin-Header
VERSION=$(grep -oP "Version:\s*\K[\d\.]+" germanfence/germanfence.php)

if [ -z "$VERSION" ]; then
    echo "❌ Fehler: Version konnte nicht aus germanfence.php gelesen werden"
    exit 1
fi

echo -e "${YELLOW}📌 Plugin Version: ${GREEN}v${VERSION}${NC}"

# Wechsle ins germanfence Verzeichnis
cd germanfence

# Erstelle ZIP mit Versionsnummer
ZIP_NAME="germanfence-v${VERSION}.zip"
ZIP_LATEST="germanfence-plugin.zip"

echo "🗜️  Erstelle ZIP-Archiv..."

# Erstelle ZIP (ohne .git, node_modules, etc.)
zip -r "../${ZIP_NAME}" . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x ".DS_Store" \
  -x "*.log" \
  -x ".env*" \
  -x "*.zip" \
  2>/dev/null

cd ..

# Kopiere als "latest" Version
cp "${ZIP_NAME}" "${ZIP_LATEST}"

echo -e "${GREEN}✅ ZIP erstellt: ${ZIP_NAME}${NC}"
echo -e "${GREEN}✅ Latest-Link: ${ZIP_LATEST}${NC}"

# Erstelle Download-Verzeichnis wenn nötig
if [ -d "/var/www/germanfence.de/downloads" ]; then
    echo "📤 Kopiere zu /var/www/germanfence.de/downloads/..."
    sudo cp "${ZIP_NAME}" /var/www/germanfence.de/downloads/
    sudo cp "${ZIP_LATEST}" /var/www/germanfence.de/downloads/
    sudo chown www-data:www-data /var/www/germanfence.de/downloads/germanfence-*.zip
    sudo chmod 644 /var/www/germanfence.de/downloads/germanfence-*.zip
    echo -e "${GREEN}✅ Dateien hochgeladen${NC}"
    echo ""
    echo "📥 Download URLs:"
    echo "   https://germanfence.de/downloads/germanfence-v${VERSION}.zip"
    echo "   https://germanfence.de/downloads/germanfence-plugin.zip (latest)"
else
    echo -e "${YELLOW}⚠️  Download-Verzeichnis nicht gefunden${NC}"
    echo "   Bitte manuell kopieren nach: /var/www/germanfence.de/downloads/"
fi

echo ""
echo -e "${GREEN}✨ Fertig!${NC}"
echo ""
echo "📝 Semantic Versioning Guide:"
echo "   - Bugfix:         ${VERSION} → $(echo $VERSION | awk -F. '{print $1"."$2"."$3+1}')"
echo "   - Neues Feature:  ${VERSION} → $(echo $VERSION | awk -F. '{print $1"."$2+1".0"}')"
echo "   - Breaking Change: ${VERSION} → $(echo $VERSION | awk -F. '{print $1+1".0.0"}')"

