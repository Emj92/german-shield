# German Shield - Plugin-Struktur

## Verzeichnisstruktur

```
german-shield/
├── german-shield.php           # Haupt-Plugin-Datei
├── uninstall.php              # Deinstallations-Script
├── index.php                  # Sicherheitsdatei
├── README.md                  # Hauptdokumentation
├── INSTALLATION.md            # Installationsanleitung
├── STRUCTURE.md               # Diese Datei
├── .gitignore                 # Git-Ignore-Regeln
│
├── includes/                  # PHP-Klassen
│   ├── class-german-shield.php      # Hauptklasse
│   ├── class-admin.php              # Admin-Interface
│   ├── class-antispam.php           # Anti-Spam-Logik
│   ├── class-geo-blocking.php       # GEO-Blocking
│   ├── class-phrase-blocking.php    # Phrasen-Blocking
│   ├── class-statistics.php         # Statistiken
│   ├── class-form-detector.php      # Form-Builder-Erkennung
│   ├── class-updater.php            # Update-System
│   └── index.php                    # Sicherheitsdatei
│
├── assets/                    # Frontend/Backend-Assets
│   ├── css/
│   │   ├── admin.css          # Admin-Styles (Dark Mode)
│   │   ├── frontend.css       # Frontend-Styles
│   │   └── index.php
│   ├── js/
│   │   ├── admin.js           # Admin-JavaScript
│   │   ├── frontend.js        # Frontend-JavaScript
│   │   └── index.php
│   └── index.php
│
├── languages/                 # Übersetzungsdateien
│   └── index.php
│
└── data/                      # Daten-Verzeichnis
    ├── README.md              # GeoIP-Anleitung
    └── index.php
```

## Klassen-Übersicht

### 1. German_Shield (class-german-shield.php)

**Hauptklasse** - Koordiniert alle Komponenten

**Methoden:**
- `run()` - Initialisiert alle Hooks
- `validate_submission()` - Validiert Formulareingaben
- `perform_validation()` - Führt alle Validierungen durch
- `get_client_ip()` - Ermittelt Client-IP

**Hooks:**
- `plugins_loaded` - Plugin-Initialisierung
- `preprocess_comment` - Kommentar-Validierung
- `wpcf7_validate` - Contact Form 7
- `elementor_pro/forms/validation` - Elementor Pro

### 2. German_Shield_Admin (class-admin.php)

**Admin-Interface** - Verwaltungsoberfläche

**Methoden:**
- `add_admin_menu()` - Fügt Menüeintrag hinzu
- `render_admin_page()` - Rendert Admin-Seite
- `enqueue_admin_assets()` - Lädt CSS/JS
- `save_settings()` - Speichert Einstellungen
- `get_country_list()` - Liefert Länderliste

**Features:**
- Tab-Navigation (Dashboard, Anti-Spam, GEO, Phrasen)
- Dark Mode UI (#22D6DD)
- Statistik-Übersicht
- Einstellungsformular

### 3. German_Shield_AntiSpam (class-antispam.php)

**Anti-Spam-Funktionen** - Kern-Schutzfunktionen

**Methoden:**
- `check_honeypot()` - Honeypot-Validierung
- `check_timestamp()` - Timestamp-Validierung
- `check_javascript()` - JavaScript-Validierung
- `check_user_agent()` - User-Agent-Validierung
- `get_protection_fields()` - HTML für Schutzfelder

**Schutzfelder:**
- Honeypot-Feld (unsichtbar)
- Timestamp-Feld (hidden)
- JavaScript-Token (hidden)

### 4. German_Shield_GeoBlocking (class-geo-blocking.php)

**GEO-Blocking** - Länder-basierte Filterung

**Methoden:**
- `check_country()` - Prüft Land der IP
- `get_country_from_ip()` - Ermittelt Land
- `get_country_from_cloudflare()` - Via Cloudflare
- `get_country_from_ip_api()` - Via ip-api.com
- `get_country_from_ipapi()` - Via ipapi.co
- `get_country_from_geoip()` - Via lokale DB
- `is_local_ip()` - Prüft auf lokale IP
- `clear_cache()` - Löscht GeoIP-Cache

**GeoIP-Quellen:**
1. Cloudflare-Header (wenn verfügbar)
2. ip-api.com (kostenlos)
3. ipapi.co (kostenlos, limitiert)
4. Lokale MaxMind-Datenbank (optional)

### 5. German_Shield_PhraseBlocking (class-phrase-blocking.php)

**Phrasen-Blocking** - Inhaltsfilterung

**Methoden:**
- `check_phrases()` - Prüft auf blockierte Phrasen
- `collect_content()` - Sammelt Formular-Inhalt
- `contains_phrase()` - Phrase-Matching
- `check_suspicious_patterns()` - Pattern-Erkennung
- `get_spam_score()` - Spam-Score-Berechnung
- `import_phrases()` - Import von Phrasen
- `export_phrases()` - Export von Phrasen

**Features:**
- Case-insensitive Suche
- Wort-Grenzen-Erkennung
- Spam-Score-System
- Vordefinierte Spam-Phrasen

### 6. German_Shield_Statistics (class-statistics.php)

**Statistiken** - Logging und Reporting

**Methoden:**
- `log_block()` - Loggt blockierte Anfrage
- `log_legitimate()` - Loggt legitime Anfrage
- `get_stats()` - Holt Statistiken
- `get_stats_by_date_range()` - Zeitraum-Statistiken
- `get_stats_by_block_type()` - Nach Typ
- `get_stats_by_country()` - Nach Land
- `get_daily_stats()` - Tägliche Statistiken
- `get_top_blocked_ips()` - Top blockierte IPs
- `clear_old_stats()` - Löscht alte Daten
- `export_to_csv()` - CSV-Export

**Datenbank-Tabelle:**
- `wp_german_shield_stats`

### 7. German_Shield_FormDetector (class-form-detector.php)

**Form-Erkennung** - Unterstützt alle Builder

**Methoden:**
- `detect_and_protect_forms()` - Initialisiert Schutz
- `protect_cf7_form()` - Contact Form 7
- `protect_elementor_form()` - Elementor Pro
- `protect_divi_form()` - Divi
- `protect_gravity_form()` - Gravity Forms
- `protect_wpforms()` - WPForms
- `protect_ninja_forms()` - Ninja Forms
- `protect_formidable()` - Formidable Forms
- `protect_fluent_forms()` - Fluent Forms
- `protect_comment_form()` - WordPress Comments
- `protect_generic_forms()` - Generische Formulare
- `detect_active_form_builders()` - Erkennt aktive Builder

**Unterstützte Builder:**
- Contact Form 7
- Elementor Pro Forms
- Divi Contact Form
- Gravity Forms
- WPForms
- Ninja Forms
- Formidable Forms
- Fluent Forms
- WordPress Comment Forms
- Alle HTML-Formulare

### 8. German_Shield_Updater (class-updater.php)

**Update-System** - Plugin-Updates

**Methoden:**
- `check_for_update()` - Prüft auf Updates
- `perform_update()` - Führt Update durch
- `download_update()` - Lädt Update herunter
- `backup_plugin()` - Erstellt Backup
- `install_update()` - Installiert Update
- `rollback()` - Rollback zu alter Version
- `run_update_routines()` - Migrations-Routinen

**WP-CLI:**
- `wp update-p` - Update durchführen
- `wp update-p --check` - Nur prüfen
- `wp update-p --rollback` - Rollback

## Datenbank-Schema

### Tabelle: wp_german_shield_stats

```sql
CREATE TABLE wp_german_shield_stats (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    type varchar(50) NOT NULL,              -- 'blocked' oder 'legitimate'
    ip_address varchar(100) NOT NULL,       -- IP-Adresse
    country varchar(10) DEFAULT NULL,       -- Ländercode (z.B. 'DE')
    form_id varchar(255) DEFAULT NULL,      -- Formular-ID
    reason varchar(255) DEFAULT NULL,       -- Block-Grund
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY type (type),
    KEY created_at (created_at)
);
```

## WordPress Options

### german_shield_settings

```php
array(
    'honeypot_enabled' => bool,
    'timestamp_enabled' => bool,
    'timestamp_min' => int,              // Sekunden
    'timestamp_max' => int,              // Sekunden
    'javascript_check' => bool,
    'user_agent_check' => bool,
    'geo_blocking_enabled' => bool,
    'blocked_countries' => array,        // z.B. ['CN', 'RU']
    'phrase_blocking_enabled' => bool,
    'blocked_phrases' => array,          // z.B. ['viagra', 'casino']
)
```

## Transients

- `german_shield_honeypot_field` - Honeypot-Feldname (1 Stunde)
- `german_shield_blocks_today` - Heutige Blocks (24 Stunden)
- `german_shield_legitimate_today` - Heutige legitime Anfragen (24 Stunden)
- `gs_country_{md5(ip)}` - GeoIP-Cache (24 Stunden)

## Hooks & Filter

### Actions

```php
// Plugin-Initialisierung
do_action('german_shield_init');

// Vor Validierung
do_action('german_shield_before_validation', $data);

// Nach Validierung
do_action('german_shield_after_validation', $data, $result);

// Bei Block
do_action('german_shield_blocked', $type, $ip, $reason);

// Bei legitimer Anfrage
do_action('german_shield_legitimate', $ip);
```

### Filters

```php
// Validierungsergebnis ändern
apply_filters('german_shield_validation_result', $result, $data);

// Blockierte Länder anpassen
apply_filters('german_shield_blocked_countries', $countries);

// Blockierte Phrasen anpassen
apply_filters('german_shield_blocked_phrases', $phrases);

// Honeypot-Feldname ändern
apply_filters('german_shield_honeypot_field', $field_name);
```

## JavaScript-Events

### Frontend

```javascript
// Formular geschützt
document.addEventListener('germanShieldProtected', function(e) {
    console.log('Form protected:', e.detail.form);
});

// Validierung fehlgeschlagen
document.addEventListener('germanShieldBlocked', function(e) {
    console.log('Blocked:', e.detail.reason);
});
```

### Admin

```javascript
// Statistiken aktualisiert
jQuery(document).trigger('germanShieldStatsUpdated', [stats]);

// Einstellungen gespeichert
jQuery(document).trigger('germanShieldSettingsSaved', [settings]);
```

## CSS-Klassen

### Admin

- `.german-shield-wrapper` - Haupt-Container
- `.german-shield-tab` - Tab-Button
- `.german-shield-tab-content` - Tab-Inhalt
- `.german-shield-stat-card` - Statistik-Karte
- `.german-shield-table` - Tabelle
- `.german-shield-btn` - Button
- `.german-shield-toggle` - Toggle-Switch

### Frontend

- `.gs-honeypot` - Honeypot-Feld (versteckt)
- `.gs-protected` - Geschütztes Formular
- `.gs-js-token` - JavaScript-Token-Feld

## Performance-Tipps

1. **GeoIP-Caching:** 24 Stunden Cache für IP-Lookups
2. **Lokale GeoIP-DB:** Schneller als API-Calls
3. **Transients:** WordPress-Cache für häufige Abfragen
4. **Lazy Loading:** JavaScript nur bei Formularen
5. **Minimale DB-Queries:** Optimierte Statistik-Abfragen

## Sicherheits-Features

1. **Nonce-Prüfung:** Alle Admin-Aktionen
2. **Capability-Check:** `manage_options` für Admin
3. **Prepared Statements:** Alle DB-Queries
4. **Escaping:** Alle Ausgaben escaped
5. **Validation:** Alle Eingaben validiert
6. **Index.php:** In allen Verzeichnissen

## Testing

### Manueller Test

1. Erstelle Testformular
2. Teste legitime Submission
3. Teste mit Honeypot ausgefüllt
4. Teste zu schnelle Submission
5. Teste blockierte Phrase
6. Teste blockiertes Land (VPN)

### WP-CLI Test

```bash
# Plugin-Status
wp plugin status german-shield

# Update-Check
wp update-p --check

# Statistiken
wp eval "print_r(German_Shield_Statistics::get_stats());"
```

## Entwicklung

### Debug-Modus

```php
// In wp-config.php
define('GERMAN_SHIELD_DEBUG', true);
```

### Logging

```php
// Custom Log
do_action('german_shield_log', $message, $level);
```

### Erweiterungen

```php
// Custom Validation
add_filter('german_shield_validation_result', function($result, $data) {
    // Eigene Logik
    return $result;
}, 10, 2);
```

## Version History

- **0.01** - Initial Release (2025-11-27)
  - Alle Kern-Features implementiert
  - Dark Mode UI
  - WP-CLI Support
  - Multi-Builder Support

