# 🌍 GermanFence Übersetzungen

## Wie es funktioniert

Die Übersetzungen werden automatisch geladen! Das Plugin erkennt die WordPress-Sprache und zeigt:
- **Deutsch** (de_DE): Deutsche Texte (Original)
- **Englisch** (en_US): Englische Übersetzungen

## Verwendung in PHP

Statt hardcoded Text:
```php
<h2>Dashboard</h2>
```

Nutze die Übersetzungsfunktion:
```php
<h2><?php echo gf__('Dashboard'); ?></h2>
```

## Beispiele

```php
// Einfacher Text
echo gf__('Speichern');  // → "Save" (EN) oder "Speichern" (DE)

// In HTML
<button><?php echo gf__('Aktivieren'); ?></button>

// In Strings
$message = gf__('Einstellungen gespeichert');
```

## Neue Übersetzungen hinzufügen

Bearbeite `languages/translations.php`:

```php
'en_US' => array(
    'Dein deutscher Text' => 'Your English text',
    'Noch ein Text' => 'Another text',
)
```

## Verfügbare Übersetzungen

Über **120 Texte** sind bereits übersetzt:
- Navigation & Menüs
- Anti-Spam Settings
- GEO Blocking
- Badge-Einstellungen
- Buttons & Messages
- Dashboard & Stats

## Support

Falls Texte fehlen, einfach in `languages/translations.php` ergänzen!

