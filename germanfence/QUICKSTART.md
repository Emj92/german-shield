# German Shield - Schnellstart-Anleitung

## ⚡ In 5 Minuten einsatzbereit

### 1️⃣ Installation (1 Minute)

```bash
# Lade den Ordner nach WordPress hoch
/wp-content/plugins/german-shield/

# Oder via WP-CLI
wp plugin activate german-shield
```

### 2️⃣ Aktivierung (30 Sekunden)

WordPress Admin → Plugins → "German Shield" → **Aktivieren**

### 3️⃣ Basis-Konfiguration (2 Minuten)

1. Gehe zu **German Shield** im Admin-Menü
2. Tab: **Anti-Spam**
   - ✅ Honeypot aktivieren
   - ✅ Timestamp-Prüfung aktivieren
3. Klicke **"Einstellungen speichern"**

### 4️⃣ Test (1 Minute)

1. Erstelle ein Testformular (z.B. Contact Form 7)
2. Fülle es aus und sende es ab
3. Prüfe im **Dashboard** → Sollte als "legitim" gezählt werden

### 5️⃣ Fertig! 🎉

Das Plugin schützt jetzt automatisch **alle Formulare** auf deiner Website!

---

## 🔧 Empfohlene Einstellungen

### Für maximalen Schutz:

```
✅ Honeypot
✅ Timestamp (Min: 3s, Max: 3600s)
✅ JavaScript-Prüfung
✅ GEO Blocking (CN, RU, IN)
✅ Phrasen-Blocking
```

### Für maximale Benutzerfreundlichkeit:

```
✅ Nur Honeypot
⬜ Rest deaktiviert
```

---

## 🌍 GEO Blocking einrichten (Optional)

1. Tab: **GEO Blocking**
2. ✅ "GEO Blocking aktivieren"
3. Wähle Länder (z.B. CN, RU, IN)
4. Speichern

**Tipp:** Halte `Strg` (Win) oder `Cmd` (Mac) für Mehrfachauswahl

---

## 📝 Phrasen blockieren (Optional)

1. Tab: **Phrasen-Blocking**
2. ✅ "Phrasen-Blocking aktivieren"
3. Klicke **"Phrase hinzufügen"**
4. Gib Spam-Wörter ein (z.B. "viagra", "casino")
5. Speichern

---

## 📊 Statistiken ansehen

Tab: **Dashboard**

- 📈 Blockierte Anfragen
- ✅ Legitime Anfragen
- 📊 Block-Rate
- 📅 Heute blockiert
- 📋 Letzte Blocks (Tabelle)

---

## 🔄 Plugin updaten

```bash
# Via WP-CLI
wp update-p

# Nur prüfen
wp update-p --check

# Rollback
wp update-p --rollback
```

---

## ❓ Häufige Fragen

### Welche Formulare werden geschützt?

**Alle!** Das Plugin erkennt automatisch:
- Contact Form 7
- Elementor Pro
- Divi
- Gravity Forms
- WPForms
- Ninja Forms
- Formidable
- Fluent Forms
- WordPress Comments
- Alle HTML-Formulare

### Muss ich etwas am Formular ändern?

**Nein!** Der Schutz wird automatisch hinzugefügt.

### Bemerken Nutzer den Schutz?

**Nein!** Die Schutzfelder sind unsichtbar und beeinträchtigen die UX nicht.

### Funktioniert es mit meinem Theme?

**Ja!** Das Plugin ist Theme-unabhängig.

### Kostet es Performance?

**Minimal!** Durch Caching und optimierte Queries.

---

## 🆘 Probleme?

### Legitime Anfragen werden blockiert

**Lösung:**
1. Erhöhe Timestamp-Minimum auf 5 Sekunden
2. Deaktiviere JavaScript-Prüfung
3. Prüfe blockierte Phrasen

### Formulare werden nicht geschützt

**Lösung:**
1. Leere Browser-Cache
2. Prüfe Browser-Konsole auf Fehler
3. Aktiviere WP_DEBUG

### GEO Blocking funktioniert nicht

**Lösung:**
1. Teste mit externer IP (nicht localhost)
2. Installiere lokale GeoIP-Datenbank
3. Prüfe Firewall (API-Zugriff)

---

## 📚 Weitere Dokumentation

- **README.md** - Vollständige Dokumentation
- **INSTALLATION.md** - Detaillierte Installation
- **STRUCTURE.md** - Plugin-Struktur
- **CHANGELOG.md** - Versionshistorie

---

## 💡 Tipps & Tricks

### Performance optimieren

```bash
# Lokale GeoIP-Datenbank installieren
# 1. Download von maxmind.com
# 2. Datei nach /data/GeoLite2-Country.mmdb
```

### Alte Statistiken löschen

```bash
wp eval "German_Shield_Statistics::clear_old_stats(90);"
```

### Debug-Modus

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

---

## 🎯 Nächste Schritte

1. ✅ Plugin aktiviert
2. ✅ Basis-Konfiguration
3. ✅ Test durchgeführt
4. 📊 Statistiken überwachen
5. 🔧 Optional: GEO Blocking
6. 📝 Optional: Phrasen-Blocking
7. 🔄 Regelmäßig updaten

---

## 🛡️ Viel Erfolg mit German Shield!

Bei Fragen: support@germanshield.com

