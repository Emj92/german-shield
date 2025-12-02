# German Shield - Änderungen & Updates

## ✅ Struktur-Änderungen

### Neue Ordnerstruktur

```
German-Shield/
├── german-shield/          # Plugin-Verzeichnis (komplett kopierbar!)
│   └── plugin/            # Alle WordPress Plugin-Dateien
│       ├── german-shield.php
│       ├── includes/
│       ├── assets/
│       ├── data/
│       ├── languages/
│       └── Dokumentation
├── website/               # Für zukünftige Website-Dateien
└── app/                   # Für zukünftige App-Dateien
```

### Vorteile

✅ **Einfaches Kopieren**: Der komplette `german-shield/plugin` Ordner kann als Ganzes kopiert werden
✅ **Klare Trennung**: Plugin, Website und App sind getrennt
✅ **Deployment-Ready**: Einfach `german-shield/plugin` nach `/wp-content/plugins/german-shield/` kopieren

## 🔄 Update-System (OHNE FTP!)

### Wie es funktioniert

Das Update-System nutzt **WordPress eigene APIs** - keine FTP-Zugangsdaten erforderlich!

#### Technische Umsetzung

1. **WordPress Filesystem API**
   - Nutzt `WP_Filesystem()` mit `FS_METHOD = 'direct'`
   - Direkter Dateisystem-Zugriff ohne FTP
   - Funktioniert auf den meisten Hosting-Umgebungen

2. **Plugin_Upgrader Class**
   - WordPress eigene Update-Klasse
   - Automatisches Deaktivieren/Aktivieren
   - Fehlerbehandlung integriert

3. **Automatische Backups**
   - Vor jedem Update wird ein ZIP-Backup erstellt
   - Gespeichert in `/wp-content/german-shield-backups/`
   - Behält die letzten 5 Backups

4. **Rollback-Funktion**
   - Wiederherstellung aus Backup möglich
   - Via WP-CLI: `wp update-p --rollback`
   - Kann spezifische Version wiederherstellen

### WP-CLI Befehle

```bash
# Update durchführen
wp update-p

# Nur nach Updates suchen
wp update-p --check

# Rollback zur vorherigen Version
wp update-p --rollback

# Rollback zu spezifischer Version
wp update-p --rollback=0.01
```

### Setup (einmalig)

In `wp-config.php` hinzufügen:

```php
define('FS_METHOD', 'direct');
```

Berechtigungen prüfen:
```bash
# Verzeichnisse
chmod 755 wp-content/plugins/german-shield

# Dateien
chmod 644 wp-content/plugins/german-shield/*.php
```

### Update-Server API

Das Plugin kommuniziert mit deinem Update-Server:

```
GET https://api.germanshield.com/v1/check
POST {
    "plugin": "german-shield",
    "version": "0.01",
    "site_url": "https://example.com",
    "php_version": "8.1",
    "wp_version": "6.4"
}

Response:
{
    "version": "0.02",
    "download_url": "https://api.germanshield.com/v1/download/0.02",
    "changelog": "...",
    "requires": "5.0",
    "tested": "6.4",
    "requires_php": "7.4"
}
```

## 🛡️ Optimierte Anti-Spam-Routinen

### Mehrschichtige Validierung (10 Ebenen)

#### 1. Nonce-Prüfung
```php
wp_verify_nonce($data['gs_nonce'], 'german_shield_nonce')
```
- WordPress Security Token
- Verhindert CSRF-Angriffe

#### 2. Rate Limiting
```php
Max 5 Submissions pro Minute pro IP
```
- Verhindert Spam-Floods
- Transient-basiert (60 Sekunden)

#### 3. Duplikat-Erkennung
```php
Hash aus Formular-Daten
Cache für 5 Minuten
```
- Verhindert Mehrfach-Submissions
- Erkennt identische Inhalte

#### 4. Honeypot (Erweitert)
```php
Rotierender Feldname (stündlich)
Realistische Namen: 'website_url', 'homepage_link', etc.
Prüft auf fehlendes UND ausgefülltes Feld
```
- Täuscht Bots mit realistischen Feldnamen
- Zeitüberlappung für Übergänge

#### 5. Timestamp-Validierung
```php
Min: 3 Sekunden (konfigurierbar)
Max: 3600 Sekunden (konfigurierbar)
Prüft auf Zukunfts-Timestamps
```
- Blockiert zu schnelle Submissions (Bots)
- Blockiert abgelaufene Formulare
- Erkennt manipulierte Timestamps

#### 6. JavaScript-Token (Session-basiert)
```php
SHA-256(SessionToken + Timestamp)
Session-Token pro Benutzer-Session
```
- Stellt sicher, dass JavaScript aktiviert ist
- Session-basiert für bessere Sicherheit
- Kann nicht einfach kopiert werden

#### 7. User-Agent-Prüfung (Erweitert)
```php
40+ Bot-Patterns erkannt
Whitelist für legitime Bots
Prüft User-Agent-Länge
```
Erkannte Patterns:
- Standard Bots (bot, crawler, spider)
- Programming Languages (python, java, perl)
- Libraries (requests, urllib, axios)
- Headless Browsers (puppeteer, selenium)
- Security Scanners (sqlmap, nikto, burp)

#### 8. HTTP-Headers-Validierung
```php
Prüft: HTTP_ACCEPT, HTTP_ACCEPT_LANGUAGE
Prüft HTTP_REFERER (muss von eigener Seite sein)
```
- Bots fehlen oft Standard-Header
- Externe Referer sind verdächtig

#### 9. GEO Blocking
```php
Multiple GeoIP-Quellen
24h Caching
Unterstützt lokale MaxMind-DB
```

#### 10. Phrasen-Blocking
```php
Spam-Score-Berechnung
Pattern-Erkennung
Vordefinierte Spam-Phrasen
```

### Human Behavior Tracking (Frontend)

```javascript
// Maus-Bewegungen
mouseMovements (throttled)

// Tastatur-Eingaben
keyPresses in Formularfeldern

// Form-Ausfüll-Zeit
Clientseitige Validierung (min 2 Sekunden)
```

### Verbesserungen gegenüber Standard-Lösungen

| Feature | Standard | German Shield |
|---------|----------|---------------|
| Honeypot | Statisch | Rotierend (stündlich) |
| Timestamp | Einfach | Mit Future-Check |
| JS-Token | Hash | Session-basiert |
| User-Agent | 5-10 Patterns | 40+ Patterns |
| Rate Limiting | ❌ | ✅ 5/min |
| Duplikat-Check | ❌ | ✅ 5min Cache |
| HTTP-Headers | ❌ | ✅ Accept, Referer |
| Nonce | ❌ | ✅ WordPress Nonce |
| Human Tracking | ❌ | ✅ Mouse, Keyboard |
| Rollback | ❌ | ✅ Automatisch |

## 🔧 Technische Details

### Keine externen Abhängigkeiten

- Nutzt nur WordPress Core-Funktionen
- Keine FTP-Bibliotheken
- Keine externen Services (außer GeoIP-APIs)

### Performance

- Caching für GeoIP (24h)
- Transients für Rate Limiting
- Minimale DB-Queries
- Lazy Loading von Assets

### Sicherheit

- Prepared Statements
- Nonce-Prüfung
- Escaping aller Ausgaben
- Session-basierte Tokens

## 📝 Migration

### Von alter Struktur zu neuer Struktur

Wenn du bereits die alte Struktur hattest:

```bash
# Alte Struktur
German-Shield/
├── german-shield.php
├── includes/
└── assets/

# Neue Struktur
German-Shield/
└── german-shield/
    └── plugin/
        ├── german-shield.php
        ├── includes/
        └── assets/
```

Alle Dateien wurden automatisch verschoben - keine manuelle Migration nötig!

## 🚀 Deployment

### Produktiv-Installation

```bash
# 1. Kopiere Plugin-Ordner
cp -r german-shield/plugin /pfad/zu/wordpress/wp-content/plugins/german-shield

# 2. Setze Berechtigungen
chmod 755 /pfad/zu/wordpress/wp-content/plugins/german-shield
chmod 644 /pfad/zu/wordpress/wp-content/plugins/german-shield/*.php

# 3. Aktiviere Plugin
wp plugin activate german-shield

# 4. Konfiguriere wp-config.php
echo "define('FS_METHOD', 'direct');" >> wp-config.php
```

## 📚 Weitere Dokumentation

- `german-shield/plugin/README.md` - Vollständige Plugin-Dokumentation
- `german-shield/plugin/QUICKSTART.md` - 5-Minuten-Schnellstart
- `german-shield/plugin/INSTALLATION.md` - Detaillierte Installation
- `german-shield/plugin/STRUCTURE.md` - Plugin-Architektur

## ✅ Commit-Message

```
refactor: Struktur umorganisiert + Update-System ohne FTP

Struktur:
- Plugin in german-shield/plugin/ verschoben (komplett kopierbar)
- website/ und app/ Ordner für zukünftige Komponenten

Update-System (OHNE FTP):
- Nutzt WordPress Filesystem API + Plugin_Upgrader
- Automatische Backups vor Updates (ZIP)
- Rollback-Funktion via WP-CLI
- WP-CLI: 'wp update-p', 'wp update-p --check', 'wp update-p --rollback'

Anti-Spam optimiert (10 Ebenen):
- Nonce, Rate Limiting (5/min), Duplikat-Check (5min)
- Honeypot rotierend (stündlich), realistische Feldnamen
- Timestamp mit Future-Check, Session-basierter JS-Token
- User-Agent: 40+ Bot-Patterns, Whitelist für legitime Bots
- HTTP-Headers: Accept, Accept-Language, Referer
- Human Behavior: Mouse, Keyboard, Form-Zeit
- GEO + Phrasen-Blocking unverändert

Keine FTP-Zugangsdaten erforderlich!
```

