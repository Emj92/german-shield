# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.3.9] - 2025-12-04

### Verbessert
- WP-Admin-Notices durch eigene Toast-Meldungen ersetzt (oben rechts)
- Lizenz-Key-Aktivierung funktioniert jetzt auch mit extern generierten Keys
- Website: Browser-Prompt durch schönes Modal für Kauf-Flow ersetzt

### Behoben
- Free-License-Key konnte nicht auf anderen Domains aktiviert werden
- Hässliche WordPress-Standard-Meldungen bei Aktivierung/Deaktivierung entfernt

## [0.01] - 2025-11-27

### Hinzugefügt

#### Kern-Features
- Vollständiges Anti-Spam-System mit mehreren Schutzebenen
- GEO-Blocking mit automatischer IP-zu-Land-Erkennung
- Phrasen-Blocking-System mit Spam-Score-Analyse
- Umfassendes Statistik-Dashboard
- Unterstützung für alle gängigen Form-Builder

#### Anti-Spam Funktionen
- **Honeypot-Schutz**: Unsichtbare Felder, die nur Bots ausfüllen
- **Timestamp-Prüfung**: Blockiert zu schnelle oder zu langsame Submissions
- **JavaScript-Validierung**: Stellt sicher, dass JavaScript aktiviert ist
- **User-Agent-Prüfung**: Erkennt bekannte Bot-Signaturen
- Dynamische Honeypot-Feldnamen mit Caching
- Konfigurierbarer Zeitbereich für Timestamp-Validierung

#### GEO Blocking
- Mehrere GeoIP-Datenquellen:
  - Cloudflare-Header (wenn verfügbar)
  - ip-api.com (kostenlose API)
  - ipapi.co (kostenlose API)
  - Lokale MaxMind GeoLite2-Datenbank (optional)
- 24-Stunden-Caching für GeoIP-Lookups
- Unterstützung für lokale/private IP-Adressen
- Vollständige Länderliste mit deutschen Namen

#### Phrasen-Blocking
- Flexible Phrasen-Erkennung (case-insensitive)
- Wort-Grenzen-Matching
- Spam-Score-Berechnung
- Vordefinierte Spam-Phrasen (Englisch & Deutsch)
- Import/Export-Funktionalität
- Erkennung verdächtiger Muster:
  - Multiple URLs
  - Excessive special characters
  - Repeated characters
  - All caps text
  - Email patterns

#### Statistik-System
- Echtzeit-Statistiken im Dashboard
- Detaillierte Logs mit:
  - IP-Adresse
  - Land
  - Block-Typ
  - Zeitstempel
  - Grund
- Statistiken nach:
  - Datum/Zeitraum
  - Block-Typ
  - Land
  - IP-Adresse
- CSV-Export-Funktion
- Automatische Bereinigung alter Daten
- AJAX-Aktualisierung (optional)

#### Form-Builder-Unterstützung
- **Contact Form 7**: Vollständige Integration
- **Elementor Pro Forms**: Native Hooks
- **Divi Contact Form**: Content-Filter
- **Gravity Forms**: Form-Filter
- **WPForms**: Frontend-Output-Filter
- **Ninja Forms**: JavaScript-Integration
- **Formidable Forms**: Field-Filter
- **Fluent Forms**: Rendering-Hooks
- **WordPress Comments**: Comment-Form-Filter
- **Generische HTML-Formulare**: Content-Filter

#### Admin-Interface
- Modernes Dark Mode UI
- Akzentfarbe: #22D6DD
- Border-Radius: 6px
- Inter-Font für optimale Lesbarkeit
- Tab-Navigation:
  - Dashboard (Übersicht & Statistiken)
  - Anti-Spam (Schutzfunktionen)
  - GEO Blocking (Länder-Filter)
  - Phrasen-Blocking (Inhalts-Filter)
- Responsive Design
- Schnellzugriff-Buttons
- Toggle-Switches für einfache Konfiguration
- Live-Vorschau der letzten Blocks

#### Update-System
- WP-CLI-Integration: `wp update-p`
- Automatische Backups vor Updates
- Rollback-Funktion
- Update-Check ohne Installation
- Migrations-System für Datenbank-Updates
- Automatische Bereinigung alter Backups (behält letzte 5)

#### Frontend-Integration
- Automatische Form-Erkennung via MutationObserver
- Schutz für dynamisch geladene Formulare
- Minimaler JavaScript-Overhead
- Unsichtbare Schutzfelder (accessibility-freundlich)
- Kompatibilität mit AJAX-Formularen

#### Sicherheit
- Nonce-Prüfung für alle Admin-Aktionen
- Capability-Checks (`manage_options`)
- Prepared Statements für alle DB-Queries
- Escaping aller Ausgaben
- Validation aller Eingaben
- Index.php in allen Verzeichnissen
- Sichere Transient-Verwendung

#### Performance
- WordPress Transients für Caching
- Optimierte Datenbankabfragen
- Lazy Loading von Assets
- Minimale externe API-Calls
- Effizientes GeoIP-Caching

#### Dokumentation
- Umfassendes README.md
- Detaillierte INSTALLATION.md
- Plugin-Struktur-Dokumentation (STRUCTURE.md)
- Inline-Code-Dokumentation
- Beispiele für Hooks & Filter
- WP-CLI-Befehle dokumentiert

#### Entwickler-Features
- Hooks für Custom-Validierung
- Filter für alle Einstellungen
- JavaScript-Events
- Debug-Modus
- Erweiterbare Architektur

### Technische Details

#### Datenbank
- Tabelle: `wp_german_shield_stats`
- Indizes für optimale Performance
- Auto-Cleanup-Funktion

#### WordPress Options
- `german_shield_settings` - Alle Einstellungen
- `german_shield_version` - Versionsnummer

#### Transients
- `german_shield_honeypot_field` (1 Stunde)
- `german_shield_blocks_today` (24 Stunden)
- `german_shield_legitimate_today` (24 Stunden)
- `gs_country_{md5(ip)}` (24 Stunden)

#### Dateien
- 8 PHP-Klassen
- 2 CSS-Dateien (Admin + Frontend)
- 2 JavaScript-Dateien (Admin + Frontend)
- Vollständige Dokumentation
- Sicherheitsdateien (index.php)

### Kompatibilität

- WordPress: 5.0+
- PHP: 7.4+
- MySQL: 5.6+
- Getestet mit WordPress 6.4

### Bekannte Einschränkungen

- GeoIP-APIs haben Rate-Limits (empfohlen: lokale Datenbank)
- Statistiken können bei sehr hohem Traffic die Datenbank belasten
- JavaScript-Prüfung kann bei deaktiviertem JS zu False-Positives führen

### Geplante Features (zukünftige Versionen)

- [ ] Machine Learning für Spam-Erkennung
- [ ] IP-Whitelist/Blacklist
- [ ] E-Mail-Benachrichtigungen bei Blocks
- [ ] Erweiterte Statistik-Visualisierung (Charts)
- [ ] Export/Import von Einstellungen
- [ ] Multi-Site-Unterstützung
- [ ] REST API für externe Integration
- [ ] Rate-Limiting pro IP
- [ ] CAPTCHA-Integration (optional)
- [ ] Zwei-Faktor-Authentifizierung für kritische Formulare

---

## Versionierungs-Schema

- **Major (X.0.0)**: Breaking Changes, große neue Features
- **Minor (0.X.0)**: Neue Features, keine Breaking Changes
- **Patch (0.0.X)**: Bugfixes, kleine Verbesserungen

## Support

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/germanshield/german-shield/issues
- E-Mail: support@germanshield.com
- Dokumentation: https://germanshield.com/docs

