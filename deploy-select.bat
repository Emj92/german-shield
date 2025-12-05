@echo off
echo Pushe zu GitHub...
git add .
git commit -m "Update %date% %time%"
git push origin main

echo Starte interaktives Deployment auf Server...

:: WICHTIG: 
:: 1. "-t" wurde hinzugefügt (erzwingt Interaktion für das Menü)
:: 2. Pfad zum neuen Skript angepasst (/german-shield/deploy-select.sh)
ssh -t -i "C:\Users\emein\.ssh\id_ed25519" -o StrictHostKeyChecking=no erwinneu@188.245.101.122 "/var/www/germanfence.de/german-shield/deploy-select.sh"

echo Fertig!
pause