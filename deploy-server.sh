#!/bin/bash
# GermanFence Server Deployment Script
# Läuft auf dem Server: /var/www/germanfence.de/german-shield/

set -e  # Exit bei Fehler

echo "🚀 GermanFence Server Deployment gestartet..."

# Verzeichnisse
APP_DIR="/var/www/germanfence.de/german-shield/app"
WEBSITE_DIR="/var/www/germanfence.de/german-shield/website"

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Pulling latest changes from Git...${NC}"
cd /var/www/germanfence.de/german-shield
git pull origin main

echo -e "${YELLOW}🔧 Installing dependencies for APP (Portal)...${NC}"
cd "$APP_DIR"
npm install --production=false

echo -e "${YELLOW}🏗️  Building APP (Portal)...${NC}"
npm run build

echo -e "${YELLOW}🔧 Installing dependencies for WEBSITE...${NC}"
cd "$WEBSITE_DIR"
npm install --production=false

echo -e "${YELLOW}🏗️  Building WEBSITE...${NC}"
npm run build

echo -e "${YELLOW}🔄 Restarting PM2 processes...${NC}"
pm2 restart germanfence-app
pm2 restart germanfence-website

echo -e "${GREEN}✅ Deployment erfolgreich!${NC}"
echo -e "${GREEN}📊 PM2 Status:${NC}"
pm2 list | grep germanfence

echo -e "${GREEN}🔍 Checking logs...${NC}"
pm2 logs germanfence-app --lines 10 --nostream
pm2 logs germanfence-website --lines 10 --nostream

echo -e "${GREEN}✨ GermanFence ist jetzt online!${NC}"

