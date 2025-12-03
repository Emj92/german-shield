@echo off
echo Pushe zu GitHub...
git add .
git commit -m "Update %date% %time%"
git push origin main

echo Deploye auf Server...
:: HIER war der Fehler: Der Pfad zeigt jetzt auf die sichere Datei
:: Das "-t" erlaubt dir, dein Passwort einzugeben, falls sudo danach fragt
ssh -o StrictHostKeyChecking=no -t erwinneu@188.245.101.122 "sudo bash /var/www/germanfence.de/deploy.sh"

echo Fertig!
pause