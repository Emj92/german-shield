# GermanFence Update-System

## ✅ Wichtig: GitHub Release erstellen

Das Plugin nutzt **GitHub Releases** für automatische Updates in WordPress.

### 1. Neue Version erstellen

1. **Gehe zu GitHub**: https://github.com/Emj92/german-shield/releases
2. **Klicke auf "Create a new release"**
3. **Tag erstellen**: `v1.3.5` (mit "v" davor!)
4. **Release Title**: `GermanFence v1.3.5`
5. **Beschreibung**: Changelog einfügen

### 2. Plugin-ZIP hochladen

**WICHTIG:** Das ZIP muss die richtige Struktur haben!

```
germanfence-v1.3.5.zip
└── germanfence/
    ├── germanfence.php
    ├── includes/
    ├── assets/
    ├── lib/
    └── ...
```

**ZIP erstellen (Windows PowerShell):**

```powershell
cd C:\Users\emein\Desktop\GermanFence
Compress-Archive -Path germanfence\* -DestinationPath germanfence-v1.3.5.zip -Force
```

**ZIP erstellen (Linux/Mac):**

```bash
cd /var/www/germanfence.de/german-shield
zip -r germanfence-v1.3.5.zip germanfence/
```

### 3. ZIP als Asset hochladen

1. Scrolle im Release-Formular nach unten zu "Attach binaries"
2. Ziehe `germanfence-v1.3.5.zip` in den Bereich
3. **Klicke auf "Publish release"**

### 4. Update testen

1. Gehe in WordPress zu **Plugins**
2. Klicke auf **"Nach Updates suchen"**
3. Das Update sollte erscheinen!

---

## 🔧 Troubleshooting

### Update wird nicht angezeigt?

1. **Cache löschen**: In WordPress unter Plugins → GermanFence → "Nach Updates suchen"
2. **Transients löschen**: 
   ```php
   delete_site_transient('update_plugins');
   ```
3. **Debug aktivieren**: In `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

### ZIP-Struktur prüfen

```bash
unzip -l germanfence-v1.3.5.zip
```

Die erste Zeile MUSS `germanfence/` sein, NICHT `german-shield/`!

---

## 📋 Checklist für jedes Update

- [ ] Version in `germanfence.php` erhöht (Zeile 6 + 46)
- [ ] GitHub Release erstellt mit Tag `v1.3.5`
- [ ] ZIP mit korrekter Struktur hochgeladen
- [ ] Release veröffentlicht
- [ ] Update in WordPress getestet

---

## 🚀 Aktueller Stand

- **Plugin-Version**: 1.3.5
- **Update-Check**: Alle 1 Stunde
- **GitHub Repo**: https://github.com/Emj92/german-shield
- **Branch**: main

