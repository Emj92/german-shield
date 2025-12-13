# German Shield - Projekt-Übersicht

## 📁 Struktur

```
German-Shield/
├── german-shield/          # Plugin-Verzeichnis (komplett kopierbar)
│   └── plugin/            # WordPress Plugin
├── website/               # Website-Komponenten (für später)
└── app/                   # App-Komponenten (für später)
```

## 🚀 Plugin-Installation

### Schnelle Installation

Kopiere `german-shield/plugin` nach `/wp-content/plugins/german-shield/`

```bash
# Via WP-CLI
wp plugin activate german-shield
```

## 🔄 Update-System (OHNE FTP!)

Das Plugin nutzt WordPress eigene Update-API - **keine FTP-Zugangsdaten erforderlich**!

```bash
# Update durchführen
wp update-p

# Nur prüfen
wp update-p --check

# Rollback
wp update-p --rollback
```

### Wie funktioniert das Update ohne FTP?

1. **WordPress Filesystem API**: Nutzt direkten Dateisystem-Zugriff
2. **Automatische Backups**: Vor jedem Update wird ein Backup erstellt
3. **Plugin_Upgrader**: WordPress eigene Update-Klasse
4. **Rollback-Funktion**: Wiederherstellung aus Backup möglich

### Voraussetzungen

Füge in `wp-config.php` hinzu:

```php
define('FS_METHOD', 'direct');
```

Stelle sicher, dass die Berechtigungen korrekt sind:
- Verzeichnisse: `755`
- Dateien: `644`

## 🛡️ Optimierte Anti-Spam-Features

### Mehrschichtige Validierung

1. **Nonce-Prüfung** - WordPress Security Token
2. **Rate Limiting** - Max 5 Submissions/Minute pro IP
3. **Duplikat-Erkennung** - Verhindert Mehrfach-Submissions
4. **Honeypot** - Rotierender Feldname (stündlich)
5. **Timestamp** - Min/Max Zeit-Validierung
6. **JavaScript-Token** - Session-basierte Validierung
7. **User-Agent** - Erweiterte Bot-Erkennung
8. **HTTP-Headers** - Accept, Accept-Language, Referer
9. **GEO Blocking** - IP-zu-Land-Filterung
10. **Phrasen-Blocking** - Spam-Score-System

### Erweiterte Bot-Erkennung

- Erkennt 40+ Bot-Patterns
- Whitelist für legitime Bots (Googlebot, etc.)
- Prüft User-Agent-Länge
- Erkennt Headless-Browser
- Prüft HTTP-Header-Vollständigkeit

### Human Behavior Tracking

- Maus-Bewegungen
- Tastatur-Eingaben
- Form-Ausfüll-Zeit
- Session-Tokens

## 📚 Vollständige Dokumentation

Siehe `german-shield/plugin/README.md` für Details.

## 🔧 Entwicklung

### Plugin-Ordner

Der `german-shield/plugin` Ordner ist **komplett eigenständig** und kann als Ganzes kopiert werden.

### Ordner-Zweck

- **german-shield/plugin/** - WordPress Plugin (produktionsbereit)
- **website/** - Für zukünftige Website-Komponenten
- **app/** - Für zukünftige App-Komponenten

## 📝 Version

**Aktuelle Version:** 0.01

## 📧 Support

- E-Mail: support@germanshield.com
- GitHub: https://github.com/germanshield/german-shield

