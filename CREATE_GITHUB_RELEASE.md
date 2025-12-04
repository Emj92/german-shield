# GitHub Release erstellen für WordPress Auto-Update

## Problem
Das WordPress Plugin sucht nach GitHub Releases, aber es wurde noch kein Release mit der korrekten ZIP-Datei erstellt.

## Lösung: GitHub Release erstellen

### Schritt 1: ZIP-Datei vorbereiten
Die ZIP-Datei muss die korrekte Struktur haben:
```
germanfence-v1.3.3.zip
└── germanfence/
    ├── germanfence.php
    ├── includes/
    ├── assets/
    ├── lib/
    └── ... (alle Plugin-Dateien)
```

### Schritt 2: GitHub Release erstellen

1. **Gehe zu GitHub:**
   ```
   https://github.com/Emj92/german-shield/releases/new
   ```

2. **Tag erstellen:**
   - Tag: `v1.3.3`
   - Target: `main` branch

3. **Release-Titel:**
   ```
   GermanFence v1.3.3
   ```

4. **Release-Beschreibung:**
   ```markdown
   ## GermanFence v1.3.3
   
   ### 🐛 Bugfixes
   - Undefined array key Fehler behoben (javascript_check, user_agent_check)
   - Zeitmessungen aus Plugin-Code entfernt
   
   ### ✨ Neue Features
   - Lizenz-Feature-Matrix implementiert
   - API-Validierung für Features basierend auf Pakettyp
   
   ### 🎨 Verbesserungen
   - Portal: Logo überall eingefügt
   - Mollie Payment: Validierung verbessert
   - Preispakete überarbeitet
   
   ### 📦 Installation
   1. ZIP-Datei herunterladen
   2. In WordPress: Plugins → Installieren → Plugin hochladen
   3. ZIP-Datei auswählen und hochladen
   4. Plugin aktivieren
   ```

5. **ZIP-Datei hochladen:**
   - Klicke auf "Attach binaries by dropping them here or selecting them"
   - Lade die Datei `germanfence-v1.3.3.zip` hoch
   - **WICHTIG:** Die ZIP muss `germanfence/` als Root-Ordner haben!

6. **Release veröffentlichen:**
   - Klicke auf "Publish release"

### Schritt 3: Korrekte ZIP-Struktur erstellen

```bash
cd /var/www/germanfence.de/german-shield
cd germanfence

# ZIP mit korrekter Struktur erstellen
zip -r ../germanfence-v1.3.3.zip . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x ".DS_Store" \
  -x "*.log" \
  -x ".env*"

# Prüfen ob die Struktur korrekt ist
unzip -l ../germanfence-v1.3.3.zip | head -20
```

Die Ausgabe sollte zeigen:
```
Archive:  germanfence-v1.3.3.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  2025-12-04 10:00   germanfence/
     1234  2025-12-04 10:00   germanfence/germanfence.php
        0  2025-12-04 10:00   germanfence/includes/
     ...
```

### Schritt 4: Release auf GitHub hochladen

1. Gehe zu: https://github.com/Emj92/german-shield/releases/new
2. Tag: `v1.3.3`
3. Titel: `GermanFence v1.3.3`
4. Beschreibung: (siehe oben)
5. ZIP hochladen: `germanfence-v1.3.3.zip`
6. "Publish release" klicken

### Schritt 5: In WordPress testen

1. Gehe zu WordPress Admin → Plugins
2. Klicke auf "Nach Updates suchen"
3. Es sollte jetzt "Version 1.3.3 verfügbar" anzeigen
4. Klicke auf "Jetzt aktualisieren"

## Wichtige Hinweise

### Plugin-Slug muss übereinstimmen
- GitHub Repo: `german-shield`
- Plugin-Ordner: `germanfence`
- Plugin-Slug in Code: `germanfence` ✅

### ZIP-Struktur ist kritisch
WordPress erwartet:
```
germanfence-v1.3.3.zip
└── germanfence/  ← MUSS der Plugin-Ordner-Name sein!
    └── germanfence.php
```

**NICHT:**
```
germanfence-v1.3.3.zip
└── german-shield/  ← FALSCH!
    └── germanfence/
        └── germanfence.php
```

### Debug-Modus aktivieren
Um zu sehen, was der Update-Checker macht:

1. In `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

2. Logs prüfen:
   ```bash
   tail -f /path/to/wp-content/debug.log
   ```

3. Nach Updates suchen in WordPress
4. Logs zeigen, ob GitHub Release gefunden wurde

## Troubleshooting

### "Keine Updates verfügbar"
- Prüfe ob GitHub Release existiert: https://github.com/Emj92/german-shield/releases
- Prüfe ob ZIP-Datei als Asset hochgeladen wurde
- Prüfe ob Version in `germanfence.php` korrekt ist (`1.3.3`)
- Prüfe ob Tag `v1.3.3` heißt (mit `v` am Anfang!)

### "Paket konnte nicht installiert werden"
- ZIP-Struktur ist falsch
- ZIP muss `germanfence/` als Root haben
- Neu erstellen mit korrekter Struktur

### Update-Checker findet Release nicht
- GitHub API Rate Limit erreicht?
- Repository ist privat? (Muss öffentlich sein oder Token verwenden)
- Branch `main` existiert?

## Automatisierung (Optional)

Für zukünftige Releases kannst du ein Script erstellen:

```bash
#!/bin/bash
VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./create-release.sh 1.3.4"
    exit 1
fi

cd germanfence
zip -r ../germanfence-v${VERSION}.zip . \
  -x "*.git*" -x "node_modules/*" -x ".DS_Store" -x "*.log" -x ".env*"

echo "✅ ZIP erstellt: germanfence-v${VERSION}.zip"
echo "📤 Jetzt auf GitHub hochladen:"
echo "   https://github.com/Emj92/german-shield/releases/new"
echo "   Tag: v${VERSION}"
```

