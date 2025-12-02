# German Shield - Projekt-Struktur

Dieses Repository enthält das German Shield WordPress Anti-Spam Plugin und zugehörige Komponenten.

## 📁 Verzeichnisstruktur

```
German-Shield/
├── german-shield/          # WordPress Plugin (komplett kopierbar!)
│   ├── german-shield.php  # Haupt-Plugin-Datei
│   ├── includes/          # PHP-Klassen
│   ├── assets/            # CSS & JavaScript
│   ├── data/              # GeoIP-Datenbank (optional)
│   ├── languages/         # Übersetzungen
│   └── *.md               # Dokumentation
├── website/               # Website-Dateien (für später)
└── app/                   # App-Dateien (für später)
```

## 🚀 Plugin-Installation

### Schnelle Installation

1. Kopiere den kompletten `german-shield` Ordner nach:
   ```
   /wp-content/plugins/german-shield/
   ```

2. Aktiviere das Plugin in WordPress:
   ```
   WordPress Admin → Plugins → German Shield → Aktivieren
   ```

### Via WP-CLI

```bash
# Plugin aktivieren
wp plugin activate german-shield

# Update durchführen
wp update-p
```

## 📦 Plugin kopieren

Der `german-shield` Ordner ist **komplett eigenständig** und kann direkt kopiert werden:

```bash
# Lokale Installation
cp -r german-shield /pfad/zu/wordpress/wp-content/plugins/

# Via FTP/SFTP
# Lade german-shield nach:
# /wp-content/plugins/german-shield/
```

## 🔄 Updates (OHNE FTP!)

Das Plugin unterstützt Updates **ohne FTP-Zugangsdaten**:

```bash
# Update prüfen
wp update-p --check

# Update installieren
wp update-p

# Rollback zur vorherigen Version
wp update-p --rollback
```

### Wie funktioniert das Update ohne FTP?

Das Update-System nutzt:
- ✅ WordPress Filesystem API (direkter Dateisystem-Zugriff)
- ✅ Plugin_Upgrader Klasse (WordPress Core)
- ✅ Automatische Backups vor Updates (ZIP)
- ✅ Rollback-Funktion aus Backup

**Setup (einmalig in `wp-config.php`):**
```php
define('FS_METHOD', 'direct');
```

## 🛡️ Features

### Anti-Spam (10 Validierungs-Ebenen)
- ✅ Nonce-Prüfung (WordPress Security Token)
- ✅ Rate Limiting (5 Submissions/Minute)
- ✅ Duplikat-Erkennung (5 Minuten Cache)
- ✅ Honeypot (rotierender Feldname, stündlich)
- ✅ Timestamp-Prüfung (Min/Max + Future-Check)
- ✅ JavaScript-Token (Session-basiert)
- ✅ User-Agent-Prüfung (40+ Bot-Patterns)
- ✅ HTTP-Headers-Validierung
- ✅ GEO Blocking (automatische IP-Erkennung)
- ✅ Phrasen-Blocking (Spam-Score-System)

### Weitere Features
- ✅ Dark Mode UI (#22D6DD Akzentfarbe)
- ✅ Statistik-Dashboard
- ✅ Unterstützt alle Form-Builder (CF7, Elementor, Divi, etc.)
- ✅ WP-CLI Integration
- ✅ Human Behavior Tracking (Maus, Tastatur)

## 📚 Dokumentation

Vollständige Dokumentation im Plugin-Ordner:
- `german-shield/README.md` - Hauptdokumentation
- `german-shield/QUICKSTART.md` - 5-Minuten-Schnellstart
- `german-shield/INSTALLATION.md` - Detaillierte Installation
- `german-shield/STRUCTURE.md` - Plugin-Architektur
- `german-shield/CHANGELOG.md` - Versionshistorie

## 🔧 Entwicklung

### Ordner-Zweck

- **german-shield/** - WordPress Plugin (produktionsbereit)
- **website/** - Für zukünftige Website-Komponenten
- **app/** - Für zukünftige App-Komponenten

### Plugin-Entwicklung

```bash
# In german-shield arbeiten
cd german-shield

# Plugin testen
wp plugin activate german-shield
```

## 📝 Version

**Aktuelle Version:** 0.01

## 📧 Support

- E-Mail: support@germanshield.com
- GitHub: https://github.com/germanshield/german-shield
- Dokumentation: https://germanshield.com/docs

## 📄 Lizenz

GPL v2 or later
