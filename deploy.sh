#!/bin/bash

# GermanFence OPTIMIZED DEPLOYMENT v4.0
# Mit parallelen Prozessen & Smart-Caching

set -e
echo "🚀 GERMAN FENCE DEPLOYMENT (OPTIMIZED)"
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
# 1. GIT PULL (unverändert)
# ==========================================
echo -e "${CYAN}📥 STEP 1: Git Pull${NC}"
cd "$PROJECT_ROOT"
git fetch origin
git reset --hard origin/main
git clean -fd
echo -e "${GREEN}✅ Git Pull erfolgreich${NC}"

# ==========================================
# 2. PLUGIN ZIP (im Hintergrund starten)
# ==========================================
echo -e "${CYAN}📦 STEP 2: Plugin ZIP (parallel)${NC}"
(
    if [ -d "$PLUGIN_DIR" ]; then
        cd "$PLUGIN_DIR"
        VERSION=$(grep -oP "Version:\s*\K[\d\.]+" "germanfence.php" || echo "1.0.0")
        mkdir -p "$DOWNLOADS_DIR" "$APP_DIR/public"
        
        zip -r "germanfence-plugin.zip" . -x "*.git*" -x "node_modules/*" -x ".DS_Store" -x "*.zip" -q
        cp "germanfence-plugin.zip" "$DOWNLOADS_DIR/"
        cp "germanfence-plugin.zip" "$APP_DIR/public/germanfence.zip"
        chmod 644 "$DOWNLOADS_DIR/germanfence-plugin.zip" "$APP_DIR/public/germanfence.zip"
        
        # info.json
        cat > "$DOWNLOADS_DIR/info.json" << EOF
{
  "name": "GermanFence",
  "version": "$VERSION",
  "download_url": "https://germanfence.de/downloads/germanfence-plugin.zip",
  "homepage": "https://germanfence.de",
  "requires": "5.0",
  "tested": "6.7",
  "requires_php": "7.4",
  "last_updated": "$(date -u '+%Y-%m-%d %H:%M:%S')"
}
EOF
        chmod 644 "$DOWNLOADS_DIR/info.json"
        echo -e "${GREEN}✅ ZIP v$VERSION erstellt${NC}"
    fi
) &
ZIP_PID=$!

# ==========================================
# 3. PARALLEL BUILDS (App + Website gleichzeitig!)
# ==========================================
echo -e "${CYAN}📦 STEP 3: Parallel Builds${NC}"

# App Build (Hintergrund)
(
    cd "$APP_DIR"
    echo "> App Build startet..."
    npm ci --prefer-offline --no-audit 2>/dev/null || npm install --prefer-offline
    npx prisma generate
    npx prisma migrate deploy 2>/dev/null || true
    npm run build
    echo -e "${GREEN}✅ App Build fertig${NC}"
) &
APP_PID=$!

# Website Build (Hintergrund)
(
    cd "$WEBSITE_DIR"
    echo "> Website Build startet..."
    npm ci --prefer-offline --no-audit 2>/dev/null || npm install --prefer-offline
    npm run build
    echo -e "${GREEN}✅ Website Build fertig${NC}"
) &
WEB_PID=$!

# Warten auf alle parallelen Prozesse
echo "> Warte auf parallele Builds..."
wait $ZIP_PID 2>/dev/null || true
wait $APP_PID || { echo -e "${RED}❌ App Build Failed${NC}"; exit 1; }
wait $WEB_PID || { echo -e "${RED}❌ Website Build Failed${NC}"; exit 1; }

echo -e "${GREEN}✅ Alle Builds erfolgreich${NC}"

# ==========================================
# 4. PM2 RELOAD (statt delete+start = schneller!)
# ==========================================
echo -e "${CYAN}🔄 STEP 4: PM2 Reload${NC}"

# Graceful reload (kein Downtime!)
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
    cd "$APP_DIR" && PORT=3000 pm2 reload "$PM2_APP_NAME" --update-env
else
    cd "$APP_DIR" && PORT=3000 pm2 start npm --name "$PM2_APP_NAME" -- start
fi

if pm2 describe "$PM2_WEB_NAME" > /dev/null 2>&1; then
    cd "$WEBSITE_DIR" && PORT=3001 pm2 reload "$PM2_WEB_NAME" --update-env
else
    cd "$WEBSITE_DIR" && PORT=3001 pm2 start npm --name "$PM2_WEB_NAME" -- start
fi

pm2 save
echo -e "${GREEN}✅ Prozesse aktualisiert${NC}"

# ==========================================
# 5. QUICK HEALTH CHECK
# ==========================================
echo -e "${CYAN}🏥 STEP 5: Health Check${NC}"
sleep 3

HTTP_APP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3000 || echo "000")
HTTP_WEB=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3001 || echo "000")

[[ "$HTTP_APP" =~ ^(200|307|308)$ ]] && echo -e "${GREEN}✅ App: OK${NC}" || echo -e "${RED}❌ App: $HTTP_APP${NC}"
[[ "$HTTP_WEB" =~ ^(200|307|308)$ ]] && echo -e "${GREEN}✅ Website: OK${NC}" || echo -e "${RED}❌ Website: $HTTP_WEB${NC}"

# Version aus Plugin holen
VERSION=$(grep -oP "Version:\s*\K[\d\.]+" "$PLUGIN_DIR/germanfence.php" 2>/dev/null || echo "?")

echo ""
echo -e "${GREEN}🚀 DEPLOYMENT FERTIG!${NC}"
echo -e "${YELLOW}📋 Plugin: v$VERSION${NC}"