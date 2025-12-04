@echo off
echo Pushe zu GitHub...
git add .
git commit -m "Update %date% %time%"
git push origin main

echo Deploye auf Server...
:: HIER war der Fehler: Der Pfad zeigt jetzt auf die sichere Datei
:: Das "-t" erlaubt dir, dein Passwort einzugeben, falls sudo danach fragt
ssh -i "C:\Users\emein\.ssh\id_ed25519" -o StrictHostKeyChecking=no erwinneu@188.245.101.122 "/var/www/germanfence.de/deploy.sh"
echo Fertig!
pause