# Quick Setup - Admin-User erstellen

## Problem
Der Dev-Server blockiert die Prisma-DLL, daher können wir `prisma generate` nicht ausführen.

## Lösung: SQL direkt ausführen

### Option 1: Via Prisma Studio
```bash
npx prisma studio
```
Dann im Browser:
1. Öffne die `users` Tabelle
2. Klicke auf "Add record"
3. Füge ein:
   - email: `kontakt@meindl-webdesign.de`
   - name: `Erwin Meindl`
   - password: `$2a$10$zrDk5xSACG6fb0pxN5FxmOyOhVo2rcMOYFmy6gxHjS88TquiEtAQK`
   - role: `ADMIN`
   - emailVerified: `true` (Checkbox)

### Option 2: Via pgAdmin / DBeaver
Führe die Datei `create-admin.sql` aus.

### Option 3: Via psql
```bash
psql -h 127.0.0.1 -p 5433 -U dein_user -d germanfence -f create-admin.sql
```

## Credentials
- **E-Mail:** kontakt@meindl-webdesign.de
- **Passwort:** Erolfni1992ge-!
- **Rolle:** ADMIN

## Nach dem Erstellen
1. Gehe zu https://portal.germanfence.de/login
2. Logge dich mit den Credentials ein
3. Du hast jetzt Admin-Zugriff!

