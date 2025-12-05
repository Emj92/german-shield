#!/bin/bash
# Fix Portal BASE_URL

cd /root/germanfence-portal

# Backup
cp .env .env.backup-$(date +%s)

# Fix BASE_URL
sed -i 's|NEXT_PUBLIC_BASE_URL=https://germanfence.de|NEXT_PUBLIC_BASE_URL=https://portal.germanfence.de|g' .env

# Falls nicht vorhanden, hinzufügen
if ! grep -q "NEXT_PUBLIC_BASE_URL" .env; then
    echo "NEXT_PUBLIC_BASE_URL=https://portal.germanfence.de" >> .env
fi

echo "✅ BASE_URL korrigiert"
cat .env | grep BASE_URL

# Restart
pm2 restart germanfence-portal
pm2 logs germanfence-portal --lines 20

