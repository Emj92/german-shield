# Webhook & Payment Success Fix

## Behobene Probleme

### ✅ 1. Webhook-Fehler behoben
**Problem:** `SyntaxError: Unexpected token 'i', "id=tr_..." is not valid JSON`

**Ursache:** Mollie sendet Webhooks als `application/x-www-form-urlencoded`, nicht als JSON!

**Lösung:** 
```typescript
// VORHER (falsch):
const { id } = await request.json()

// NACHHER (korrekt):
const formData = await request.formData()
const id = formData.get('id') as string
```

### ✅ 2. Payment Success Page Fehler behoben
**Problem:** Schwarzer Bildschirm mit Code beim ersten Laden

**Ursache:** Die Success Page erwartete einen `key` Parameter, der aber erst asynchron im Webhook generiert wird.

**Lösung:** 
- Success Page zeigt jetzt "Lizenzschlüssel wird generiert..." an
- Kein Fehler mehr, wenn Key noch nicht vorhanden ist
- User erhält Key per E-Mail (nach Webhook-Verarbeitung)

## 🚀 Deployment

### 1. Code auf Server laden
```bash
# Auf dem Server:
cd /path/to/germanfence/website
git pull
```

### 2. Neu bauen
```bash
npm run build
```

### 3. PM2 neu starten
```bash
pm2 restart germanfence-website
```

### 4. Logs prüfen
```bash
pm2 logs germanfence-website --lines 50
```

**Erwartete Ausgabe nach Fix:**
```
✅ Live-API-Key wird verwendet
📥 Webhook received for payment ID: tr_xxxxxx
Payment successful: { id: 'tr_xxxxx', ... }
📧 Creating license for email@example.com
✅ License created and email sent
```

## 🧪 Testen

1. Testbestellung durchführen
2. Nach Zahlung: Success Page sollte ohne Fehler laden
3. E-Mail sollte innerhalb von 10-30 Sekunden ankommen
4. Webhook-Logs prüfen (keine Fehler mehr)

## 📋 Checkliste

- [x] Webhook verwendet `formData()` statt `json()`
- [x] Success Page hat besseres Loading-State
- [x] Fehlerbehandlung verbessert
- [ ] Code auf Server deployed
- [ ] PM2 neu gestartet
- [ ] Mit echter Zahlung getestet
- [ ] E-Mail-Empfang bestätigt

## ⚠️ Hinweis zu Resend API Key

Falls E-Mails nicht ankommen, stelle sicher dass im Portal (`app/.env.local`):
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
```

gesetzt ist und PM2 Portal neu gestartet wurde:
```bash
pm2 restart germanfence-portal
```

