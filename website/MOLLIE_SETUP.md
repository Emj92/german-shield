# Mollie Payment Setup

## ⚠️ WICHTIG: Live vs Test Mode

### Test-Key (Testzahlungen)
- Beginnt mit `test_`
- **Verarbeitet KEINE echten Zahlungen**
- Nur für Entwicklung und Tests

### Live-Key (Echte Zahlungen)
- Beginnt mit `live_`
- **Verarbeitet echte Zahlungen**
- Für Produktion verwenden

## 🔧 Konfiguration

### 1. Mollie API Key erhalten
1. Gehe zu [Mollie Dashboard](https://www.mollie.com/dashboard)
2. Navigiere zu **Developers** → **API keys**
3. Kopiere deinen **Live API key** (beginnt mit `live_`)

### 2. ENV-Datei konfigurieren

Erstelle eine `.env.local` Datei im `website/` Ordner:

```bash
# Mollie Live API Key (für echte Zahlungen)
MOLLIE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxx

# Base URL der Website
NEXT_PUBLIC_BASE_URL=https://germanfence.de

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/germanfence

# Auth Secret
NEXTAUTH_SECRET=your-secret-key-here

# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

### 3. Überprüfung

Nach dem Neustart der Anwendung:

**Test-Key erkannt:**
```
⚠️ WARNUNG: Test-API-Key wird verwendet! Echte Zahlungen werden NICHT verarbeitet.
Bitte setze MOLLIE_API_KEY auf einen Live-Key (live_...)
```

**Live-Key erkannt:**
```
✅ Live-API-Key wird verwendet
```

## 🧪 Testen

### Mit Test-Key testen
1. Setze `MOLLIE_API_KEY=test_...`
2. Starte die Anwendung neu
3. Führe eine Testzahlung durch
4. Mollie zeigt Testseite mit Dummy-Zahlungsmethoden

### Mit Live-Key testen
1. Setze `MOLLIE_API_KEY=live_...`
2. Starte die Anwendung neu
3. **ACHTUNG:** Jetzt werden echte Zahlungen verarbeitet!

## 📝 Logs überprüfen

Die Anwendung loggt automatisch:
- Welcher Key-Typ verwendet wird (test/live)
- Payment-IDs
- Fehler bei der Zahlung

Prüfe die Logs in der Konsole oder im Server-Log.

## 🔒 Sicherheit

- **NIEMALS** API-Keys in Git committen
- `.env.local` ist in `.gitignore` enthalten
- Verwende separate Keys für Entwicklung und Produktion
- Rotiere Keys regelmäßig im Mollie Dashboard

## 🆘 Troubleshooting

### "Testzahlungen werden ausgeführt trotz Live-Key"
1. Überprüfe `.env.local` auf `live_` Präfix
2. Starte die Anwendung neu (`npm run dev` oder `npm run build && npm start`)
3. Prüfe die Logs auf "✅ Live-API-Key wird verwendet"

### "Invalid API key"
1. Überprüfe, ob der Key korrekt kopiert wurde (keine Leerzeichen)
2. Prüfe, ob der Key im Mollie Dashboard noch aktiv ist
3. Stelle sicher, dass der Key für dein Mollie-Konto gültig ist

### "Payment creation failed"
1. Überprüfe Mollie Dashboard auf Fehler
2. Prüfe, ob dein Mollie-Konto aktiviert ist
3. Stelle sicher, dass alle Zahlungsmethoden aktiviert sind

