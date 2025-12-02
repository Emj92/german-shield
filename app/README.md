# 🛡️ German Shield - Admin Portal

Modernes Admin-Portal für German Shield WordPress Plugin mit PostgreSQL-Backend.

## 🚀 Features

- ✅ **Authentifizierung**: Login/Register mit bcrypt + JWT
- 📊 **Dashboard**: Übersicht über alle Installationen und Statistiken
- 🔑 **Lizenz-Verwaltung**: API-Keys verwalten, Installationen aktivieren/deaktivieren
- 👥 **User-Management**: Admin und User-Rollen
- 📈 **Statistiken**: Spam-Blockierungen, legitime Anfragen, etc.
- 🎨 **DevBro-Design**: Türkis/Grau Theme mit Glassmorphism

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Auth**: Jose (JWT) + bcryptjs
- **Styling**: Tailwind CSS
- **TypeScript**: Vollständig typisiert

## 📦 Installation

### 1. Dependencies installieren

```bash
npm install
```

### 2. Datenbank konfigurieren

Erstelle eine `.env` Datei:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/germanshield"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
```

### 3. Datenbank initialisieren

```bash
# Schema pushen
npm run db:push

# Prisma Client generieren
npm run db:generate

# Admin-User erstellen
npm run create-admin
```

**Standard Admin-Credentials:**
- E-Mail: `admin@germanshield.com`
- Passwort: `GermanShield2024!`

⚠️ **Wichtig**: Ändere das Passwort nach dem ersten Login!

### 4. Development Server starten

```bash
npm run dev
```

App läuft auf [http://localhost:3000](http://localhost:3000)

## 📁 Projekt-Struktur

```
app/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Login, Register, Logout
│   │   └── installations/   # Installation-Management
│   ├── dashboard/           # Dashboard-Seiten
│   │   ├── licenses/        # Lizenz-Verwaltung
│   │   └── page.tsx         # Dashboard-Übersicht
│   ├── login/               # Login-Seite
│   └── register/            # Registrierungs-Seite
├── components/              # React Components
│   ├── DashboardLayout.tsx  # Haupt-Layout mit Sidebar
│   ├── LicenseManager.tsx   # Lizenz-Verwaltung
│   └── StatsCard.tsx        # Statistik-Karten
├── lib/                     # Utilities
│   ├── auth.ts              # Auth-Funktionen
│   └── db.ts                # Prisma Client
├── prisma/                  # Prisma Schema & Migrations
│   ├── schema.prisma        # Datenbank-Schema
│   └── init.sql             # Initiales SQL-Script
└── scripts/                 # Helper-Scripts
    └── create-admin.ts      # Admin-User erstellen
```

## 🔐 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrierung
- `POST /api/auth/logout` - Logout

### Installations
- `PATCH /api/installations/[id]` - Installation aktivieren/deaktivieren
- `DELETE /api/installations/[id]` - Installation löschen

## 🎨 Design-System

### Farben
- **Primary**: Cyan (#22D6DD)
- **Background**: Grau-Gradient (900-800)
- **Cards**: Grau 800/50 mit Backdrop-Blur
- **Border**: Grau 700

### Components
- **Border-Radius**: 16px (rounded-2xl)
- **Shadows**: Cyan mit 30% Opacity
- **Icons**: Emoji + Gradient-Backgrounds

## 🚢 Production Deployment

### 1. Build erstellen

```bash
npm run build
```

### 2. Server starten

```bash
npm start
```

### 3. Umgebungsvariablen setzen

Stelle sicher, dass alle ENV-Variablen in Production gesetzt sind:
- `DATABASE_URL` - PostgreSQL Connection String
- `NEXTAUTH_URL` - Production URL (z.B. https://portal.germanshield.com)
- `NEXTAUTH_SECRET` - Starker Secret Key

## 📝 Entwicklung

### Prisma Commands

```bash
# Schema ändern und pushen
npm run db:push

# Client neu generieren
npm run db:generate

# Prisma Studio öffnen
npx prisma studio
```

### TypeScript

Alle Dateien sind vollständig typisiert. TypeScript-Fehler werden beim Build geprüft.

## 🤝 Credits

Erstellt mit ♥ von [www.meindl-webdesign.de](https://www.meindl-webdesign.de)

## 📄 Lizenz

© 2024 German Shield. Alle Rechte vorbehalten.
