# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.6.1] - 2025-12-05
### Behoben
- **Badge-Farben:** Live-Preview & Speicherung jetzt korrekt
- **Badge-Farben:** Initial-Werte werden beim Laden angezeigt
- **Testpreise:** Website zeigt Testpreise (0,50€ / 1€ / 2€)

## [1.6.0] - 2025-12-05
### Neu (MAJOR)
- **Admin Lizenzverwaltung:** Checkbox "Bestätigungsmail senden" (optional)
- **Admin Lizenzverwaltung:** Alle Lizenzen werden gespeichert & angezeigt
- **Admin Lizenzverwaltung:** Suchleiste für Keys, E-Mails, Pakete
- **Admin Lizenzverwaltung:** Löschen & Sperren/Entsperren Buttons
- **Plugin Badge:** Rahmenfarbe & Hintergrundfarbe anpassbar

## [1.5.4] - 2025-12-04
### Behoben (Portal)
- **Build-Fehler:** useSearchParams() in Suspense-Boundary gewickelt (Register-Seite)

## [1.5.3] - 2025-12-04
### Behoben
- **Email-Anzeige:** Echte Email wird angezeigt statt "license-user@germanfence.local"
- **Passwort-Setzen:** Email wird automatisch vorausgefüllt (URL-Parameter)
- **Verify-Email:** Link führt korrekt zu WP-Admin (kein 404 mehr)

## [1.5.2] - 2025-12-04
### Behoben (KRITISCH)
- **FREE Lizenz:** GEO-Blocking & Phrasen-Blocking sind jetzt korrekt gesperrt für FREE-User
- **Hintergrundfarbe:** Header & Quote-Box nutzen jetzt einheitlich #F2F5F8
- **Plugin-Header:** Version im Plugin-Header korrigiert (war 1.4.8, jetzt 1.5.2)

## [1.5.1] - 2025-12-04
### Behoben
- **Badge:** Zeigt jetzt "GermanFence" statt "German Shield"
- **Badge:** Link zu https://germanfence.de hinzugefügt (klickbar)
- **Badge:** Cursor zeigt jetzt pointer bei Hover

## [1.5.0] - 2025-12-04
### Behoben (KRITISCH)
- **Plugin:** GEO-Blocking & Phrasen-Blocking Tabs werden jetzt korrekt freigeschaltet bei PRO-Lizenzen
  - Bug: `$is_license_valid` wurde nie korrekt gesetzt (Zeile 246)
  - Fix: Nutzt jetzt `$license_status['valid']` für die Prüfung
- **API:** Single-Lizenzen können nicht mehr auf mehreren Domains gleichzeitig aktiviert werden
  - Strenge Validierung: Single-Lizenz = 1 Domain
  - Klare Fehlermeldung mit Upgrade-Hinweis

## [1.4.9] - 2025-12-04
### Behoben
- **Plugin:** Sofortige API-Validierung nach PRO-Lizenz Aktivierung (Features werden sofort freigeschaltet)
- **Website:** Webhook Portal-URL hardcodiert für korrekte E-Mail-Zustellung nach Kauf
- **Portal/Website:** Verbesserte Logging für Debugging

## [1.4.8] - 2025-12-04

### Hinzugefügt
- **Portal:** Download-Button im Header (neben Sprachumschalter)
- **Portal:** User-Einstellungen Seite (Name, Adresse, USt-IdNr.)
- **Portal Dashboard:** Lizenz-Statistiken (FREE/SINGLE/FREELANCER/AGENCY Anzahl)
- **Portal Dashboard:** Aktive Domains Zähler (echte Installationen)

### Verbessert
- **Admin-Lizenzen:** Können jetzt OHNE E-Mail erstellt werden (ungebundene Lizenzen)
- **Benutzerverwaltung:** ACTIVE Badge bei Lizenzen entfernt

### Behoben
- **Portal:** TypeScript-Fehler in User Settings API
- **Plugin:** Honeypot-Slider Knopf vertikale Ausrichtung korrigiert

## [1.4.7] - 2025-12-04

### Behoben
- **Admin-Lizenzen:** Format jetzt korrekt `GS-AGENCY-XXXX-XXXX-XXXX` statt `GF-XXXX`
- **Portal UI:** Header Höhe 4.3rem, Sidebar Logo zentriert
- **Portal:** Browser-Alerts durch Toast-Notifications ersetzt
- **Portal:** Confirm-Modal statt Browser-Confirm für Domain-Löschung

### Hinzugefügt
- **Portal:** Header mit Sprachumschalter auf allen Seiten (inkl. Admin)

## [1.4.6] - 2025-12-04

### Behoben
- **Lizenzsystem:** Admin-erstellte Lizenzen schalten jetzt alle Features korrekt frei
- **API:** Features werden jetzt auch bei Domain-Auto-Registrierung zurückgegeben

### Hinzugefügt
- **Portal:** Sprachumschalter oben rechts (DE/EN mit Flaggen)
- **Portal:** SVG-Flaggen für konsistente Darstellung

## [1.4.5] - 2025-12-04

### Behoben
- Flaggen werden jetzt auf allen Systemen korrekt angezeigt (PNG statt Emoji)
- Website: SVG-Flaggen für Sprachumschalter
- Plugin: CDN-basierte Flaggen (flagcdn.com) für GEO-Blocking und Statistiken
- Sprachumschaltung zeigt echte Flaggen-Bilder

## [1.4.4] - 2025-12-04

### Neu
- **Kompletter Kauf-Flow implementiert:**
  - Shadow Account: User wird automatisch ohne Passwort erstellt
  - Lizenz wird automatisch generiert und gespeichert
  - Professionelle E-Mail mit Lizenzschlüssel + Passwort-Link
  - Success-Page zeigt Lizenzschlüssel an (mit Copy-Button)
  - Set-Password-Page für neue Kunden

### Verbessert
- Payment Webhook ruft jetzt Portal API auf
- E-Mail-Design mit HTML-Template
- Success-Page mit Dark-Mode Design

## [1.4.3] - 2025-12-04

### Verbessert
- Website Footer: GermanFence Logo aktualisiert (statt altes logo_klein)
- Website Header: "Made in Germany" Badge mit größerer Flagge verbessert
- WordPress Admin: Icon-Größe auf 17x21px optimiert
- Deployment: Automatisches Server-Deployment-Script erstellt

### Behoben
- Portal Build-Fehler: Unused `getStatusBadgeColor` entfernt
- ESLint: Alle Linter-Fehler behoben

## [1.4.2] - 2025-12-04

### Verbessert
- Portal: ACTIVE Badge bei Lizenzen entfernt (alle gezeigten Lizenzen sind aktiv)
- Plugin sperrt alle Tabs wenn keine Lizenz aktiviert (nur Lizenz-Tab offen)
- Lizenz-Key Styling vereinfacht (kein türkiser Rahmen, saubereres Design)
- FREELANCER/AGENCY-Lizenzen haben jetzt alle PRO-Features freigeschaltet
- Domain-Registrierung: Plugin meldet automatisch Domain an Lizenz bei Aktivierung
- Portal zeigt jetzt alle registrierten Domains pro Lizenz an

### Behoben
- Features bei generierten FREELANCER/AGENCY-Keys werden jetzt korrekt erkannt
- Lizenztyp wird in Meldungen korrekt angezeigt (nicht mehr "Custom Lizenz")
- ESLint Build-Fehler behoben (unused getStatusBadgeColor entfernt)

## [1.4.1] - 2025-12-04

### Verbessert
- PRO-Tabs (GEO/Phrasen) für Free-User jetzt komplett blockiert mit Toast-Meldung
- Flaggen werden überall korrekt angezeigt (bereits vorhanden)
- Verifizierungs-Mail mit Portal-Login-Link und Passwort-Setup erweitert
- Lizenz-Texte zeigen jetzt korrekten Typ an (FREE, SINGLE, FREELANCER, AGENCY)
- Aktivierungs-Meldung zeigt jetzt Lizenztyp: "✅ AGENCY-Lizenz erfolgreich aktiviert!"

### Behoben
- Mollie-Fehler: API-Key muss auf Server in .env gesetzt werden
- Lizenz-Feld akzeptiert jetzt alle Formate (nicht nur FREE)

## [1.4.0] - 2025-12-04

### Verbessert
- WP-Admin-Notices durch eigene Toast-Meldungen ersetzt (oben rechts)
- Lizenz-Key-Aktivierung akzeptiert jetzt ALLE Key-Formate (FREE, PRO, manuell)
- Website: Browser-Prompt durch schönes Modal für Kauf-Flow ersetzt
- Bessere Fehlerausgabe bei Mollie-Zahlungen
- Portal Downloads-Seite aktualisiert

### Behoben
- ALLE WP Core Meldungen werden auf GermanFence-Seiten blockiert
- Aktive Installationen werden jetzt korrekt angezeigt (Feldnamen-Mapping gefixt)
- Free-License-Key konnte nicht auf anderen Domains aktiviert werden
- PRO-Keys können jetzt auch im Free-Lizenz-Feld aktiviert werden

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

