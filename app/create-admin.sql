-- Admin-User erstellen
-- E-Mail: kontakt@meindl-webdesign.de
-- Passwort: Erolfni1992ge-!
-- Hash: $2a$10$zrDk5xSACG6fb0pxN5FxmOyOhVo2rcMOYFmy6gxHjS88TquiEtAQK

INSERT INTO users (
  id,
  email,
  name,
  password,
  role,
  "emailVerified",
  "verificationToken",
  "verificationTokenExpiry",
  "createdAt",
  "updatedAt"
) VALUES (
  'admin_' || substr(md5(random()::text), 1, 20),
  'kontakt@meindl-webdesign.de',
  'Erwin Meindl',
  '$2a$10$zrDk5xSACG6fb0pxN5FxmOyOhVo2rcMOYFmy6gxHjS88TquiEtAQK',
  'ADMIN',
  true,
  NULL,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  password = EXCLUDED.password,
  role = 'ADMIN',
  "emailVerified" = true,
  "updatedAt" = NOW();

