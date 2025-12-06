#!/bin/bash
# GermanFence Plugin Update Files Deployment
# Deployed info.json und plugin.zip auf den Server

set -e

echo "🚀 GermanFence Plugin Update-Dateien Deployment"
echo "================================================"

# Lese Plugin-Version
VERSION=$(grep -oP "Version:\s*\K[\d\.]+" germanfence/germanfence.php)

if [ -z "$VERSION" ]; then
    echo "❌ Fehler: Plugin-Version nicht gefunden"
    exit 1
fi

echo "📌 Plugin Version: v${VERSION}"
echo ""

# ==========================================
# 1. VERZEICHNISSE ERSTELLEN
# ==========================================
echo "📁 Erstelle Verzeichnisse..."

# Lokale downloads Ordner
mkdir -p downloads

# Server-Verzeichnis erstellen (falls nicht vorhanden)
if [ -d "/var/www/germanfence.de" ]; then
    sudo mkdir -p /var/www/germanfence.de/downloads
    echo "✅ Server-Verzeichnis bereit"
else
    echo "⚠️  Lokaler Modus - kein Server-Zugriff"
fi

# ==========================================
# 2. PLUGIN ZIP ERSTELLEN
# ==========================================
echo ""
echo "📦 Erstelle Plugin-ZIP..."

cd germanfence

ZIP_LATEST="../downloads/germanfence-plugin.zip"
ZIP_VERSIONED="../downloads/germanfence-v${VERSION}.zip"

# Lösche alte ZIPs
rm -f "$ZIP_LATEST" "$ZIP_VERSIONED" 2>/dev/null || true

# Erstelle ZIP (ohne unnötige Dateien)
zip -r "$ZIP_LATEST" . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x ".DS_Store" \
  -x "*.log" \
  -x ".env*" \
  -x "*.zip" \
  -x "*.md" \
  -x "RELOAD-INSTRUCTIONS.txt" \
  -q

# Kopiere versionierte Version
cp "$ZIP_LATEST" "$ZIP_VERSIONED"

cd ..

FILE_SIZE=$(du -h "downloads/germanfence-plugin.zip" | cut -f1)
echo "✅ ZIP erstellt: $FILE_SIZE"

# ==========================================
# 3. INFO.JSON AKTUALISIEREN
# ==========================================
echo ""
echo "📝 Erstelle info.json..."

CURRENT_DATE=$(date -u +"%Y-%m-%d %H:%M:%S")
FILE_SIZE_BYTES=$(stat -f%z "downloads/germanfence-plugin.zip" 2>/dev/null || stat -c%s "downloads/germanfence-plugin.zip")

cat > downloads/info.json <<EOF
{
  "name": "GermanFence",
  "version": "${VERSION}",
  "download_url": "https://germanfence.de/downloads/germanfence-plugin.zip",
  "homepage": "https://germanfence.de",
  "requires": "5.0",
  "tested": "6.7",
  "requires_php": "7.4",
  "last_updated": "${CURRENT_DATE}",
  "author": "GermanFence Team",
  "author_homepage": "https://germanfence.de",
  "sections": {
    "description": "Bestes WordPress Anti-Spam Plugin aus Deutschland! Schützt alle WordPress-Formulare vor Spam mit modernsten Techniken: Honeypot, Zeitstempel, GEO-Blocking, intelligente Phrasen-Erkennung und mehr. Made in Germany 🇩🇪",
    "changelog": "<h4>${VERSION}</h4><ul><li>Badge Doppel-Anzeige behoben</li><li>Update-System repariert</li></ul>"
  },
  "banners": {
    "low": "https://germanfence.de/assets/banner-772x250.png",
    "high": "https://germanfence.de/assets/banner-1544x500.png"
  },
  "icons": {
    "1x": "https://germanfence.de/germanfence_logo.png",
    "2x": "https://germanfence.de/germanfence_logo.png"
  }
}
EOF

echo "✅ info.json erstellt"

# ==========================================
# 4. AUF SERVER KOPIEREN
# ==========================================
echo ""
echo "📤 Kopiere zu /var/www/germanfence.de/downloads/..."

if [ -d "/var/www/germanfence.de/downloads" ]; then
    # Dateien kopieren
    sudo cp downloads/germanfence-plugin.zip /var/www/germanfence.de/downloads/
    sudo cp downloads/germanfence-v${VERSION}.zip /var/www/germanfence.de/downloads/
    sudo cp downloads/info.json /var/www/germanfence.de/downloads/
    
    # Berechtigungen setzen
    sudo chown -R www-data:www-data /var/www/germanfence.de/downloads/
    sudo chmod -R 644 /var/www/germanfence.de/downloads/*
    sudo chmod 755 /var/www/germanfence.de/downloads/
    
    echo "✅ Dateien hochgeladen & Berechtigungen gesetzt"
    
    # Prüfe ob Dateien erreichbar sind
    echo ""
    echo "🔍 Prüfe Erreichbarkeit..."
    
    if curl -s -I "https://germanfence.de/downloads/info.json" | grep -q "200 OK"; then
        echo "✅ info.json ist erreichbar"
    else
        echo "⚠️  info.json NICHT erreichbar - prüfe Nginx/Apache Config"
    fi
    
    if curl -s -I "https://germanfence.de/downloads/germanfence-plugin.zip" | grep -q "200 OK"; then
        echo "✅ Plugin-ZIP ist erreichbar"
    else
        echo "⚠️  Plugin-ZIP NICHT erreichbar - prüfe Nginx/Apache Config"
    fi
else
    echo "⚠️  Server-Verzeichnis nicht gefunden"
    echo "     Dateien liegen in: ./downloads/"
    echo ""
    echo "📤 Manuell hochladen mit:"
    echo "     scp downloads/* user@server:/var/www/germanfence.de/downloads/"
fi

# ==========================================
# 5. FERTIG
# ==========================================
echo ""
echo "================================================"
echo "✅ DEPLOYMENT ABGESCHLOSSEN!"
echo "================================================"
echo ""
echo "📥 Download URLs:"
echo "   https://germanfence.de/downloads/germanfence-plugin.zip"
echo "   https://germanfence.de/downloads/germanfence-v${VERSION}.zip"
echo "   https://germanfence.de/downloads/info.json"
echo ""
echo "🔄 Update-Check:"
echo "   WordPress sollte jetzt Updates anzeigen!"
echo "   (Cache leeren falls nötig)"
echo ""

