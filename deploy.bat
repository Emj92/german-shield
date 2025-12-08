@echo off
echo Pushe zu GitHub...
git add .
git commit -m "Update %date% %time%"
git push origin main

echo.
echo Deploye auf Server...
echo Der Server holt sich jetzt das lange Skript und fuehrt es aus.
:: Das ruft das Skript aus Schritt 1 auf, NACHDEM es per Git auf den Server kam
ssh -i "C:\Users\emein\.ssh\id_ed25519" erwin@188.245.101.122 "cd /var/www/germanfence.de/german-shield && git fetch origin && git reset --hard origin/main && chmod +x deploy.sh && ./deploy.sh"

echo.
echo Fertig!
pause