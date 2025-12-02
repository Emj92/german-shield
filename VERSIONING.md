# 📋 Semantic Versioning für GermanFence

## Format: MAJOR.MINOR.PATCH

Wir folgen [Semantic Versioning 2.0.0](https://semver.org/lang/de/)

### Version Schema

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─── PATCH: Bugfixes, kleine Änderungen (abwärtskompatibel)
  │     └───────── MINOR: Neue Features (abwärtskompatibel)
  └─────────────── MAJOR: Breaking Changes (NICHT abwärtskompatibel)
```

### Beispiele

| Von     | Nach    | Typ             | Beschreibung                           |
|---------|---------|-----------------|----------------------------------------|
| 1.0.0   | 1.0.1   | **PATCH**       | Bugfix, Sicherheitsupdate             |
| 1.0.1   | 1.1.0   | **MINOR**       | Neues Feature, neue Funktion          |
| 1.1.0   | 2.0.0   | **MAJOR**       | Breaking Change, API-Änderung         |

---

## 🔄 Version erhöhen

### 1. PATCH (Bugfix) - z.B. 1.0.0 → 1.0.1

**Wann:**
- Bugfixes
- Kleine Verbesserungen
- Sicherheitsupdates
- Tippfehler korrigiert

**Beispiele:**
- Fix: Honeypot funktioniert nicht bei Contact Form 7
- Fix: GEO-Blocking Länder-Liste wird nicht gespeichert
- Security: XSS-Schwachstelle behoben

**Ändern:**
```php
// germanfence/germanfence.php
* Version: 1.0.1
define('GERMANFENCE_VERSION', '1.0.1');
```

---

### 2. MINOR (Feature) - z.B. 1.0.1 → 1.1.0

**Wann:**
- Neue Features
- Neue Funktionalität
- Abwärtskompatible Änderungen

**Beispiele:**
- Feature: AI-basierte Spam-Erkennung hinzugefügt
- Feature: Dark Mode im Admin-Panel
- Improvement: Performance-Optimierung

**Ändern:**
```php
// germanfence/germanfence.php
* Version: 1.1.0
define('GERMANFENCE_VERSION', '1.1.0');
```

---

### 3. MAJOR (Breaking Change) - z.B. 1.1.0 → 2.0.0

**Wann:**
- Breaking Changes
- API-Änderungen
- Datenbank-Schema-Änderungen
- WordPress-Mindestversion erhöht
- PHP-Mindestversion erhöht

**Beispiele:**
- Breaking: API komplett überarbeitet
- Breaking: Mindestversion WordPress 6.0 erforderlich
- Breaking: Alte Konfiguration nicht mehr kompatibel

**Ändern:**
```php
// germanfence/germanfence.php
* Version: 2.0.0
define('GERMANFENCE_VERSION', '2.0.0');
```

---

## 🚀 Release-Workflow

### Schritt 1: Version im Code erhöhen

```bash
# germanfence/germanfence.php bearbeiten
* Version: 1.X.X
define('GERMANFENCE_VERSION', '1.X.X');
```

### Schritt 2: Plugin-ZIP erstellen

```bash
./create-plugin-zip.sh
```

Das Script:
- Liest automatisch die Version aus `germanfence.php`
- Erstellt `germanfence-v1.X.X.zip`
- Kopiert es nach `/var/www/germanfence.de/downloads/`
- Erstellt einen "latest" Link: `germanfence-plugin.zip`

### Schritt 3: Git Commit & Tag

```bash
git add .
git commit -m "Release v1.X.X: Beschreibung"
git tag v1.X.X
git push origin main --tags
```

### Schritt 4: GitHub Release (optional)

1. Gehe zu: https://github.com/Emj92/german-shield/releases/new
2. Tag: `v1.X.X`
3. Titel: `GermanFence v1.X.X`
4. Beschreibung: Changelog
5. ZIP hochladen als Asset

---

## 📝 Changelog pflegen

Pflege `germanfence/CHANGELOG.md`:

```markdown
# Changelog

## [1.1.0] - 2024-12-03
### Added
- Neue AI-basierte Spam-Erkennung
- Dark Mode im Admin-Panel

### Fixed
- Honeypot funktioniert jetzt mit allen Formularen

## [1.0.1] - 2024-12-02
### Fixed
- GEO-Blocking Länder-Liste Speicher-Bug
- XSS-Sicherheitslücke geschlossen

## [1.0.0] - 2024-12-01
### Initial Release
- Honeypot Protection
- Timestamp Validation
- GEO-Blocking
- Phrase Blocking
```

---

## 🎯 Quick Reference

**Aktuelle Version:** 1.0.0

**Nächste Version je nach Art:**
- **Bugfix:** 1.0.1
- **Feature:** 1.1.0
- **Breaking:** 2.0.0

**Commands:**
```bash
# ZIP erstellen
./create-plugin-zip.sh

# Version checken
grep "Version:" germanfence/germanfence.php
```

