# 🚀 GitHub Release erstellen - Schritt für Schritt

## ⚠️ WICHTIG: GitHub Release ist PFLICHT für Auto-Updates!

Das WordPress-Plugin kann nur updaten, wenn ein **GitHub Release** existiert.

---

## 📋 Schritt-für-Schritt Anleitung

### 1. Plugin-ZIP lokal erstellen

Auf deinem **lokalen PC** oder **auf dem Server**:

```bash
cd /pfad/zu/GermanFence
cd germanfence

# ZIP erstellen
zip -r germanfence-v1.0.0.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x ".DS_Store" \
  -x "*.log"
```

**Alternative unter Windows (PowerShell):**
```powershell
cd C:\Users\emein\Desktop\GermanFence\germanfence
Compress-Archive -Path * -DestinationPath ..\germanfence-v1.0.0.zip -Force
```

---

### 2. Code committen und pushen

```bash
cd /pfad/zu/GermanFence
git add .
git commit -m "Release v1.0.0: Erste stabile Version"
git push origin main
```

---

### 3. GitHub Release erstellen

#### Option A: Über GitHub Website (Empfohlen)

1. **Gehe zu deinem Repository:**
   ```
   https://github.com/Emj92/german-shield
   ```

2. **Klicke auf "Releases"** (rechte Sidebar)

3. **Klicke auf "Create a new release"** (grüner Button)

4. **Fülle das Formular aus:**

   **Choose a tag:**
   ```
   v1.0.0
   ```
   _(Klicke auf "Create new tag: v1.0.0 on publish")_

   **Release title:**
   ```
   GermanFence v1.0.0 - Erste stabile Version
   ```

   **Description (Markdown):**
   ```markdown
   ## 🎉 GermanFence v1.0.0 - Erste stabile Version

   ### ✨ Features
   - 🍯 Intelligenter Honeypot
   - ⏱️ Zeitstempel-Validierung
   - 🌍 GEO-Blocking
   - 🔤 Phrasen-Blocking
   - 📊 Live-Statistiken
   - 🎨 Modernes Admin-Panel
   - 🇩🇪 Made in Germany

   ### 📦 Installation
   1. ZIP herunterladen
   2. WordPress Admin → Plugins → Installieren → Plugin hochladen
   3. ZIP hochladen und aktivieren
   4. Konfigurieren unter "GermanFence"

   ### 🔒 Systemanforderungen
   - WordPress: 5.0+
   - PHP: 7.4+

   ### 📞 Support
   support@germanfence.de
   ```

5. **ZIP hochladen:**
   - Scrolle zu "Attach binaries"
   - Drag & Drop oder klicke "Attach files"
   - Lade `germanfence-v1.0.0.zip` hoch

6. **Klicke auf "Publish release"** (grüner Button)

---

#### Option B: Über GitHub CLI (Schneller)

```bash
cd /var/www/germanfence.de/german-shield

# Release erstellen und ZIP hochladen
gh release create v1.0.0 \
  germanfence-v1.0.0.zip \
  --title "GermanFence v1.0.0" \
  --notes "Erste stabile Version mit Honeypot, GEO-Blocking & mehr"
```

---

### 4. Update-Check in WordPress erzwingen

**In WordPress Admin:**

1. Gehe zu: **Plugins** → **Installierte Plugins**
2. Warte 5 Minuten (oder klicke auf "Nach Updates suchen")
3. Du solltest jetzt ein Update für GermanFence sehen

**Oder per WP-CLI:**
```bash
wp plugin update german-fence --version=1.0.0
```

---

## 🔄 Workflow für zukünftige Updates

### Bugfix (1.0.0 → 1.0.1)

```bash
# 1. Version erhöhen in germanfence/germanfence.php
* Version: 1.0.1
define('GERMANFENCE_VERSION', '1.0.1');

# 2. Committen & Pushen
git add .
git commit -m "Release v1.0.1: Bugfix XYZ"
git push origin main

# 3. ZIP erstellen
cd germanfence
zip -r germanfence-v1.0.1.zip .

# 4. GitHub Release
gh release create v1.0.1 germanfence-v1.0.1.zip --notes "Bugfix: ..."
```

### Feature (1.0.1 → 1.1.0)

```bash
* Version: 1.1.0
define('GERMANFENCE_VERSION', '1.1.0');

git commit -m "Release v1.1.0: Neues Feature XYZ"
gh release create v1.1.0 germanfence-v1.1.0.zip --notes "Feature: ..."
```

### Breaking Change (1.1.0 → 2.0.0)

```bash
* Version: 2.0.0
define('GERMANFENCE_VERSION', '2.0.0');

git commit -m "Release v2.0.0: Breaking Changes"
gh release create v2.0.0 germanfence-v2.0.0.zip --notes "Breaking: ..."
```

---

## ⚡ Update-Check-Intervall

**Aktuell:** 5 Minuten (nur für Testing!)

**Für Production später ändern auf 12 Stunden:**

In `germanfence/germanfence.php` diese Zeilen auskommentieren:
```php
// add_filter('puc_request_info_query_args-german-fence', function($queryArgs) {
//     $queryArgs['update_check_interval'] = 300;
//     return $queryArgs;
// });
```

Dann wird nur alle 12 Stunden gecheckt (Standard).

---

## 🎯 Wichtig für Updates:

1. ✅ **GitHub Release MUSS existieren** (mit ZIP als Asset)
2. ✅ **Tag muss mit Version übereinstimmen** (v1.0.0)
3. ✅ **ZIP muss als Asset hochgeladen sein**

Ohne GitHub Release funktioniert das Auto-Update NICHT!

