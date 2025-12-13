# German Shield - Installationsanleitung

## Schnellstart

### 1. Plugin hochladen

```bash
# Via FTP/SFTP
# Lade den gesamten 'german-shield' Ordner nach:
/wp-content/plugins/german-shield/

# Oder via WP-CLI
wp plugin install /pfad/zu/german-shield.zip --activate
```

### 2. Plugin aktivieren

1. Gehe zu WordPress Admin → Plugins
2. Finde "German Shield" in der Liste
3. Klicke auf "Aktivieren"

### 3. Grundkonfiguration

1. Gehe zu **German Shield** im Admin-Menü
2. Im **Dashboard** siehst du die Übersicht
3. Wechsle zum **Anti-Spam** Tab
4. Aktiviere die gewünschten Schutzfunktionen:
   - ✅ Honeypot (empfohlen)
   - ✅ Timestamp-Prüfung (empfohlen)
   - ✅ JavaScript-Prüfung (optional)
   - ✅ User-Agent-Prüfung (optional)

5. Klicke auf **"Einstellungen speichern"**

## Erweiterte Konfiguration

### GEO Blocking einrichten

1. Gehe zum **GEO Blocking** Tab
2. Aktiviere "GEO Blocking aktivieren"
3. Wähle die Länder aus, die blockiert werden sollen
4. Halte `Strg` (Windows) oder `Cmd` (Mac) gedrückt für Mehrfachauswahl
5. Speichern

**Tipp:** Häufig blockierte Länder für Spam:
- CN (China)
- RU (Russland)
- IN (Indien)
- VN (Vietnam)

### Phrasen-Blocking konfigurieren

1. Gehe zum **Phrasen-Blocking** Tab
2. Aktiviere "Phrasen-Blocking aktivieren"
3. Füge Phrasen hinzu, die blockiert werden sollen:
   - Klicke auf "Phrase hinzufügen"
   - Gib die Phrase ein (z.B. "viagra", "casino")
   - Wiederhole für weitere Phrasen
4. Speichern

**Vordefinierte Spam-Phrasen:**
Das Plugin enthält bereits eine Liste häufiger Spam-Phrasen in Englisch und Deutsch.

## Kompatibilität prüfen

### Unterstützte Form-Builder

Das Plugin erkennt automatisch folgende Form-Builder:

- ✅ Contact Form 7
- ✅ Elementor Pro Forms
- ✅ Divi Contact Form
- ✅ Gravity Forms
- ✅ WPForms
- ✅ Ninja Forms
- ✅ Formidable Forms
- ✅ Fluent Forms

### Kompatibilitätstest

1. Erstelle ein Testformular
2. Fülle es aus und sende es ab
3. Prüfe im **Dashboard** ob die Anfrage als "legitim" gezählt wurde
4. Teste auch mit absichtlich falschen Daten (z.B. blockierte Phrase)

## Performance-Optimierung

### GeoIP-Datenbank (Optional)

Für bessere Performance kannst du eine lokale GeoIP-Datenbank verwenden:

1. Registriere dich bei MaxMind: https://www.maxmind.com/en/geolite2/signup
2. Lade `GeoLite2-Country.mmdb` herunter
3. Platziere die Datei in: `/wp-content/plugins/german-shield/data/`
4. Das Plugin nutzt nun die lokale Datenbank (schneller, keine API-Calls)

### Caching

Das Plugin nutzt WordPress Transients für Caching:
- GeoIP-Lookups: 24 Stunden
- Honeypot-Feldnamen: 1 Stunde

## WP-CLI Integration

### Plugin updaten

```bash
# Update prüfen
wp update-p --check

# Update durchführen
wp update-p

# Rollback zur vorherigen Version
wp update-p --rollback
```

### Statistiken verwalten

```bash
# Alte Statistiken löschen (älter als 90 Tage)
wp eval "German_Shield_Statistics::clear_old_stats(90);"

# Alle Statistiken löschen
wp eval "German_Shield_Statistics::clear_all_stats();"
```

## Fehlerbehebung

### Problem: Formulare werden nicht geschützt

**Lösung:**
1. Leere den Browser-Cache
2. Leere den WordPress-Cache
3. Prüfe ob JavaScript aktiviert ist
4. Prüfe die Browser-Konsole auf Fehler

### Problem: Legitime Anfragen werden blockiert

**Lösung:**
1. Erhöhe die minimale Timestamp-Zeit (Standard: 3 Sekunden)
2. Deaktiviere JavaScript-Prüfung falls Probleme auftreten
3. Prüfe die blockierten Phrasen auf False-Positives

### Problem: GEO Blocking funktioniert nicht

**Lösung:**
1. Prüfe ob die IP-Adresse korrekt erkannt wird
2. Teste mit einer externen IP (nicht localhost)
3. Installiere die lokale GeoIP-Datenbank
4. Prüfe die Firewall-Einstellungen (API-Zugriff)

### Debug-Modus aktivieren

```php
// In wp-config.php hinzufügen
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

// Logs prüfen in:
// /wp-content/debug.log
```

## Sicherheitshinweise

### Empfohlene Einstellungen

**Für maximalen Schutz:**
- ✅ Honeypot aktiviert
- ✅ Timestamp: Min 3s, Max 3600s
- ✅ JavaScript-Prüfung aktiviert
- ✅ GEO Blocking für Hochrisiko-Länder
- ✅ Phrasen-Blocking mit Standard-Liste

**Für maximale Benutzerfreundlichkeit:**
- ✅ Nur Honeypot aktiviert
- ⬜ Timestamp deaktiviert
- ⬜ JavaScript-Prüfung deaktiviert
- ⬜ GEO Blocking deaktiviert
- ✅ Phrasen-Blocking nur für offensichtlichen Spam

### Datenschutz (DSGVO)

Das Plugin speichert:
- IP-Adressen (für Statistiken)
- Länder-Codes
- Timestamps
- Block-Gründe

**Empfehlung:**
- Lösche alte Statistiken regelmäßig (z.B. nach 90 Tagen)
- Informiere Nutzer in der Datenschutzerklärung
- Nutze IP-Anonymisierung falls gewünscht

## Support

Bei Fragen oder Problemen:

- 📧 E-Mail: support@germanshield.com
- 📚 Dokumentation: https://germanshield.com/docs
- 🐛 Bug Reports: https://github.com/germanshield/german-shield/issues

## Nächste Schritte

1. ✅ Plugin installiert und aktiviert
2. ✅ Grundkonfiguration abgeschlossen
3. ✅ Testformular geprüft
4. 📊 Statistiken im Dashboard überwachen
5. 🔧 Feintuning nach Bedarf

**Viel Erfolg mit German Shield!** 🛡️

