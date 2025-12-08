#!/bin/bash
# GermanFence COMPLETE PRODUCTION DEPLOYMENT
# Version 3.3 (Git Conflict Fix + FORCED PORTS)
set -e

echo "🚀 GERMAN FENCE DEPLOYMENT"
echo "===================================================="

# --- KONFIGURATION ---
PROJECT_ROOT="/var/www/germanfence.de/german-shield"
APP_DIR="$PROJECT_ROOT/app"
WEBSITE_DIR="$PROJECT_ROOT/website"
PLUGIN_DIR="$PROJECT_ROOT/germanfence"
DOWNLOADS_DIR="/var/www/germanfence.de/downloads"
PM2_APP_NAME="germanfence-app"
PM2_WEB_NAME="germanfence-website"

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# ==========================================
# 1. GIT PULL (MIT CONFLICT FIX)
# ==========================================
echo -e "${CYAN}📥 STEP 1: Git Pull${NC}"
cd "$PROJECT_ROOT"

# WICHTIG: Alles zurücksetzen vor dem Pull
git fetch origin
git reset --hard origin/main
git clean -fd

echo -e "${GREEN}✅ Git Pull erfolgreich${NC}"
echo ""

# ==========================================
# 2. PLUGIN ZIP + INFO.JSON
# ==========================================
echo -e "${CYAN}📦 STEP 2: Plugin ZIP + Info.json${NC}"

if [ -d "$PLUGIN_DIR" ]; then
    cd "$PLUGIN_DIR"
    VERSION=$(grep -oP "Version:\s*\K[\d\.]+" "germanfence.php" || echo "1.0.0")
    
    mkdir -p "$DOWNLOADS_DIR"
    mkdir -p "$APP_DIR/public"
    
    # ZIP erstellen
    echo "> Erstelle Plugin ZIP v$VERSION..."
    zip -r "germanfence-plugin.zip" . -x "*.git*" -x "node_modules/*" -x ".DS_Store" -x "*.zip" -q
    
    cp "germanfence-plugin.zip" "$DOWNLOADS_DIR/"
    cp "germanfence-plugin.zip" "$APP_DIR/public/germanfence.zip"
    
    chmod 644 "$DOWNLOADS_DIR/germanfence-plugin.zip"
    chmod 644 "$APP_DIR/public/germanfence.zip"
    
    echo -e "${GREEN}✅ ZIP v$VERSION erstellt${NC}"
    
    # INFO.JSON ERSTELLEN
    echo "> Erstelle info.json..."
    cat > "$DOWNLOADS_DIR/info.json" << EOF
{
  "name": "GermanFence",
  "version": "$VERSION",
  "download_url": "https://germanfence.de/downloads/germanfence-plugin.zip",
  "homepage": "https://germanfence.de",
  "requires": "5.0",
  "tested": "6.7",
  "requires_php": "7.4",
  "last_updated": "$(date -u '+%Y-%m-%d %H:%M:%S')",
  "author": "GermanFence Team",
  "author_homepage": "https://germanfence.de",
  "sections": {
    "description": "Bestes WordPress Anti-Spam Plugin aus Deutschland! Schützt alle WordPress-Formulare vor Spam mit modernsten Techniken: Honeypot, Zeitstempel, GEO-Blocking, intelligente Phrasen-Erkennung und mehr. Made in Germany 🇩🇪",
    "changelog": "<h4>$VERSION</h4><ul><li>Design-System vereinheitlicht</li><li>UI Farben und Borders optimiert</li></ul>"
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
    
    chmod 644 "$DOWNLOADS_DIR/info.json"
    echo -e "${GREEN}✅ info.json v$VERSION erstellt${NC}"
else
    echo -e "${RED}⚠️  Plugin Ordner nicht gefunden (Skip)${NC}"
fi

echo ""

# ==========================================
# 3. BUILD APPS
# ==========================================
echo -e "${CYAN}📦 STEP 3: Builds${NC}"

# App Build
cd "$APP_DIR"
echo "> App Install & Build..."
npm install --production=false
npx prisma generate
npx prisma migrate deploy
npm run build || { echo -e "${RED}❌ App Build Failed${NC}"; exit 1; }

# Website Build
cd "$WEBSITE_DIR"
echo "> Website Install & Build..."
npm install --production=false
npm run build || { echo -e "${RED}❌ Website Build Failed${NC}"; exit 1; }

echo -e "${GREEN}✅ Builds erfolgreich${NC}"
echo ""

# ==========================================
# 4. PM2 RESTART
# ==========================================
echo -e "${CYAN}🔄 STEP 4: PM2 Restart${NC}"

pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
pm2 delete "$PM2_WEB_NAME" 2>/dev/null || true

echo "Starte App auf Port 3000..."
cd "$APP_DIR"
PORT=3000 pm2 start npm --name "$PM2_APP_NAME" -- start

echo "Starte Website auf Port 3001..."
cd "$WEBSITE_DIR"
PORT=3001 pm2 start npm --name "$PM2_WEB_NAME" -- start

pm2 save

echo -e "${GREEN}✅ Prozesse neu gestartet${NC}"
echo ""

# ==========================================
# 5. HEALTH CHECKS
# ==========================================
echo -e "${CYAN}🏥 STEP 5: Health Check${NC}"
sleep 5

HTTP_APP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
HTTP_WEB=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "000")

if [[ "$HTTP_APP" =~ ^(200|307|308)$ ]]; then
    echo -e "${GREEN}✅ App (3000): OK ($HTTP_APP)${NC}"
else
    echo -e "${RED}❌ App (3000): FEHLER ($HTTP_APP)${NC}"
    pm2 logs "$PM2_APP_NAME" --lines 10 --err
fi

if [[ "$HTTP_WEB" =~ ^(200|307|308)$ ]]; then
    echo -e "${GREEN}✅ Website (3001): OK ($HTTP_WEB)${NC}"
else
    echo -e "${RED}❌ Website (3001): FEHLER ($HTTP_WEB)${NC}"
    pm2 logs "$PM2_WEB_NAME" --lines 10 --err
fi

echo ""
echo -e "${GREEN}🚀 DEPLOYMENT FERTIG!${NC}"
echo -e "${YELLOW}📋 Plugin: v$VERSION${NC}"
echo -e "${YELLOW}📂 ZIP: $DOWNLOADS_DIR/germanfence-plugin.zip${NC}"
echo -e "${YELLOW}📄 Info: $DOWNLOADS_DIR/info.json${NC}"
