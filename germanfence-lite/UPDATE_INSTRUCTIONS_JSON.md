# GermanFence Update-System (JSON-basiert)

## ✅ Selbst gehostetes Update-System

Das Plugin nutzt jetzt einen **selbst gehosteten JSON-Update-Server** statt GitHub Releases.

### 📋 Vorteile

- ✅ Keine GitHub-Abhängigkeit
- ✅ Volle Kontrolle über Updates
- ✅ Schnellere Updates
- ✅ Einfachere Verwaltung

---

## 🔧 Update veröffentlichen

### 1. Plugin-ZIP erstellen

**Windows PowerShell:**
```powershell
cd C:\Users\emein\Desktop\GermanFence
Compress-Archive -Path germanfence\* -DestinationPath germanfence-v1.3.6.zip -Force
```

**Linux:**
```bash
cd /var/www/germanfence.de/german-shield
zip -r germanfence-v1.3.6.zip germanfence/
```

### 2. ZIP auf Server hochladen

```bash
scp germanfence-v1.3.6.zip user@server:/var/www/germanfence.de/downloads/
```

Oder via FTP/SFTP nach:
```
/var/www/germanfence.de/downloads/germanfence-v1.3.6.zip
```

### 3. info.json aktualisieren

Bearbeite `/var/www/germanfence.de/downloads/info.json`:

```json
{
  "name": "GermanFence",
  "version": "1.3.6",
  "download_url": "https://germanfence.de/downloads/germanfence-v1.3.6.zip",
  "last_updated": "2025-12-04 18:00:00",
  "sections": {
    "changelog": "<h4>1.3.6</h4><ul><li>Deine Änderungen hier</li></ul>"
  }
}
```

### 4. Nginx-Konfiguration prüfen

Stelle sicher, dass `/downloads/` öffentlich zugänglich ist:

```nginx
location /downloads/ {
    alias /var/www/germanfence.de/downloads/;
    autoindex off;
    add_header Content-Disposition "attachment";
}
```

### 5. Update testen

1. Gehe in WordPress zu **Plugins**
2. Klicke auf **"Nach Updates suchen"**
3. Das Update sollte erscheinen!

---

## 📁 Dateistruktur

```
/var/www/germanfence.de/
├── downloads/
│   ├── info.json                    ← Update-Informationen
│   ├── germanfence-v1.3.6.zip      ← Aktuelles Plugin
│   ├── germanfence-v1.3.5.zip      ← Alte Version (Backup)
│   └── germanfence-plugin.zip      ← Symlink zur aktuellen Version
```

---

## 🔄 Schnell-Update-Script

Erstelle `update-plugin.sh`:

```bash
#!/bin/bash
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./update-plugin.sh 1.3.7"
    exit 1
fi

cd /var/www/germanfence.de/german-shield

# ZIP erstellen
zip -r germanfence-v${VERSION}.zip germanfence/

# Auf Server kopieren
mv germanfence-v${VERSION}.zip /var/www/germanfence.de/downloads/

# info.json aktualisieren
cat > /var/www/germanfence.de/downloads/info.json <<EOF
{
  "name": "GermanFence",
  "version": "${VERSION}",
  "download_url": "https://germanfence.de/downloads/germanfence-v${VERSION}.zip",
  "homepage": "https://germanfence.de",
  "requires": "5.0",
  "tested": "6.4",
  "requires_php": "7.4",
  "last_updated": "$(date '+%Y-%m-%d %H:%M:%S')",
  "author": "GermanFence Team",
  "sections": {
    "description": "Bestes WordPress Anti-Spam Plugin aus Deutschland!",
    "changelog": "<h4>${VERSION}</h4><ul><li>Update veröffentlicht</li></ul>"
  }
}
EOF

echo "✅ Update ${VERSION} veröffentlicht!"
echo "📦 ZIP: https://germanfence.de/downloads/germanfence-v${VERSION}.zip"
echo "📋 JSON: https://germanfence.de/downloads/info.json"
```

**Verwendung:**
```bash
chmod +x update-plugin.sh
./update-plugin.sh 1.3.7
```

---

## 🐛 Troubleshooting

### Update wird nicht angezeigt?

1. **Cache löschen:**
   ```php
   delete_site_transient('update_plugins');
   ```

2. **JSON prüfen:**
   ```bash
   curl https://germanfence.de/downloads/info.json
   ```

3. **ZIP prüfen:**
   ```bash
   curl -I https://germanfence.de/downloads/germanfence-v1.3.6.zip
   ```

### JSON-Validierung

Online: https://jsonlint.com/

Oder via CLI:
```bash
cat info.json | python -m json.tool
```

---

## 📋 Checklist für jedes Update

- [ ] Version in `germanfence.php` erhöht (Zeile 6 + 46)
- [ ] Plugin-ZIP erstellt
- [ ] ZIP auf Server hochgeladen
- [ ] `info.json` aktualisiert
- [ ] JSON-Syntax validiert
- [ ] Update in WordPress getestet
- [ ] Alte ZIP-Versionen als Backup behalten

---

## 🚀 Aktueller Stand

- **Plugin-Version**: 1.3.6
- **Update-Check**: Alle 1 Stunde
- **JSON-URL**: https://germanfence.de/downloads/info.json
- **Download-URL**: https://germanfence.de/downloads/germanfence-v1.3.6.zip

