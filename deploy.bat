@echo off
echo Pushe zu GitHub...
git add .
git commit -m "Update %date% %time%"
git push origin main

echo Deploye auf Server...
ssh erwinneu@188.245.101.122 "cd /var/www/germanfence.de/german-shield && ./deploy.sh"

echo Fertig!
pause