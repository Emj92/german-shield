-- German Shield Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Installations Table
CREATE TABLE IF NOT EXISTS installations (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "siteUrl" TEXT NOT NULL,
    "siteName" TEXT,
    "apiKey" TEXT UNIQUE NOT NULL,
    version TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "lastSeen" TIMESTAMP NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Statistics Table
CREATE TABLE IF NOT EXISTS statistics (
    id TEXT PRIMARY KEY,
    "installationId" TEXT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT NOW(),
    "totalBlocked" INTEGER NOT NULL DEFAULT 0,
    "totalLegitimate" INTEGER NOT NULL DEFAULT 0,
    "blockedByType" JSONB,
    "blockedByCountry" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("installationId") REFERENCES installations(id) ON DELETE CASCADE
);

-- Global Stats Table
CREATE TABLE IF NOT EXISTS global_stats (
    id TEXT PRIMARY KEY,
    date TIMESTAMP UNIQUE NOT NULL DEFAULT NOW(),
    "totalInstallations" INTEGER NOT NULL DEFAULT 0,
    "activeInstallations" INTEGER NOT NULL DEFAULT 0,
    "totalBlocked" INTEGER NOT NULL DEFAULT 0,
    "totalLegitimate" INTEGER NOT NULL DEFAULT 0
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_installations_userId ON installations("userId");
CREATE INDEX IF NOT EXISTS idx_installations_apiKey ON installations("apiKey");
CREATE INDEX IF NOT EXISTS idx_statistics_installationId ON statistics("installationId");
CREATE INDEX IF NOT EXISTS idx_statistics_date ON statistics(date);
CREATE INDEX IF NOT EXISTS idx_global_stats_date ON global_stats(date);

