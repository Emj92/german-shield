# Plugin Update auf Live-Server

## 🚀 Easy Update via Cursor Console

### 1. Konfiguration (einmalig)

Öffne die passende Datei und trage deine Server-Daten ein:

**FTP-Zugang (Windows):**
```powershell
# Öffne: update-server.ps1
$FTP_HOST = "ftp.deine-domain.de"
$FTP_USER = "dein-ftp-user"
$FTP_PASS = "dein-ftp-passwort"
$FTP_PATH = "/wp-content/plugins/"
```

**SSH-Zugang (Windows):**
```powershell
# Öffne: update-server-scp.ps1
$SSH_HOST = "deine-domain.de"
$SSH_USER = "dein-ssh-user"
$SSH_PORT = "22"
$REMOTE_PATH = "/var/www/html/wp-content/plugins/"
```

**SSH-Zugang (Linux/Mac):**
```bash
# Öffne: update-server.sh
SSH_HOST="deine-domain.de"
SSH_USER="dein-ssh-user"
SSH_PORT="22"
REMOTE_PATH="/var/www/html/wp-content/plugins/"
```

### 2. Update durchführen

**In Cursor Console (Terminal):**

```powershell
# Windows mit FTP (benötigt WinSCP)
.\update-server.ps1

# Windows mit SSH
.\update-server-scp.ps1

# Linux/Mac mit SSH
chmod +x update-server.sh
./update-server.sh
```

**Das war's!** 🎉

Das Script:
- ✅ Erstellt automatisch Backup auf dem Server
- ✅ Lädt neues Plugin hoch
- ✅ Setzt Berechtigungen (755/644)
- ✅ Zeigt Erfolg/Fehler an

## 📋 Voraussetzungen

### Für FTP (Windows):
- **WinSCP** installieren: https://winscp.net/eng/download.php
- FTP-Zugangsdaten von deinem Hoster

### Für SSH:
- SSH-Zugang zu deinem Server
- SSH-Key oder Passwort-Login

## 🧪 Nach dem Update

1. **WordPress Admin** → German Shield
2. **Anti-Spam Tab** → Test-Modus aktivieren
3. **Formular testen** → Sollte blockiert werden
4. **Test-Modus deaktivieren!**

## 🔧 Troubleshooting

### "WinSCP nicht gefunden"
→ Installiere WinSCP oder nutze SSH-Script

### "SSH nicht gefunden" (Windows)
→ Installiere OpenSSH:
```powershell
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

### "Permission denied"
→ Prüfe SSH-Key oder Passwort
→ Oder nutze FTP-Script

### "Connection refused"
→ Prüfe SSH-Port (meist 22)
→ Prüfe Firewall-Einstellungen

## 💡 Tipps

### SSH-Key einrichten (empfohlen)

```bash
# SSH-Key generieren
ssh-keygen -t rsa -b 4096

# Public Key auf Server kopieren
ssh-copy-id dein-user@dein-server.de

# Danach kein Passwort mehr nötig!
```

### Script-Alias erstellen

**PowerShell Profil:**
```powershell
# Öffne Profil
notepad $PROFILE

# Füge hinzu:
function Update-GermanShield {
    & "C:\Users\emein\Desktop\German-Shield\update-server.ps1"
}
Set-Alias -Name ugs -Value Update-GermanShield

# Dann einfach:
ugs
```

**Bash Alias:**
```bash
# In ~/.bashrc oder ~/.zshrc
alias ugs='~/Desktop/German-Shield/update-server.sh'

# Dann einfach:
ugs
```

## 🎯 Workflow

```
1. Änderungen in german-shield/ machen
2. In Cursor Console: .\update-server.ps1
3. Test-Modus aktivieren
4. Testen
5. Test-Modus deaktivieren
6. Fertig! 🎉
```

## 📝 Beispiel-Output

```
🚀 German Shield Server-Update
================================

📦 Erstelle Backup auf Server...
📤 Lade Plugin hoch...
🔧 Setze Berechtigungen...

✅ Plugin erfolgreich aktualisiert!

🧪 Test-Modus aktivieren:
   1. WordPress Admin → German Shield
   2. Anti-Spam Tab → Test-Modus aktivieren
   3. Formular testen
   4. Test-Modus wieder deaktivieren!
```
