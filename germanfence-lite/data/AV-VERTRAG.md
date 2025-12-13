# AUFTRAGSVERARBEITUNGSVERTRAG (AV-Vertrag)

**gemäß Art. 28 DSGVO**

---

## Präambel

Dieser Auftragsverarbeitungsvertrag regelt die Verarbeitung personenbezogener Daten durch **GermanFence** im Auftrag des Verantwortlichen (nachfolgend "Auftraggeber") im Rahmen der anonymisierten Telemetrie-Funktion des GermanFence WordPress-Plugins.

---

## § 1 Vertragsgegenstand

### 1.1 Zweck
Der Auftragnehmer verarbeitet im Auftrag des Auftraggebers ausschließlich **anonymisierte** technische Daten zur:
- **Gefahrenabwehr** (Erkennung neuer Spam-Muster)
- **Qualitätsverbesserung** des Anti-Spam-Schutzes
- **Mustererkennung** bei Spam-Angriffen

### 1.2 Art der Daten
Es werden **NUR** folgende anonymisierte Daten verarbeitet:
- **SHA-256 Hashes** von IP-Adressen (nicht umkehrbar)
- **ISO-Ländercodes** (z.B. DE, US, CN)
- **Block-Methode** und **Block-Grund** (technische Bezeichnung)
- **SHA-256 Hashes** von E-Mail-Domains (nur Domain, keine Adresse)
- **SHA-256 Hashes** von User-Agents
- **Extrahierte Spam-Domains** aus URLs (keine persönlichen Inhalte)

### 1.3 Keine sensiblen Daten
**Explizit NICHT verarbeitet werden:**
- ❌ Echte IP-Adressen
- ❌ E-Mail-Adressen
- ❌ Klarnamen oder persönliche Identifikationsdaten
- ❌ Formular-Inhalte oder Nachrichten
- ❌ Weitere personenbezogene Daten

---

## § 2 Parteien

### 2.1 Auftraggeber (Verantwortlicher)
**Sie** als Betreiber der WordPress-Website, auf der GermanFence installiert ist.

**Name:**       ___________________________  
**Adresse:**    ___________________________  
**E-Mail:**     ___________________________  

### 2.2 Auftragnehmer (Verarbeiter)
**GermanProWeb - Eugen Meindl**  
Sonnenweg 7  
93142 Maxhütte-Haidhof  
Deutschland  

**E-Mail:** kontakt@meindl-webdesign.de  
**Website:** https://germanfence.de  

---

## § 3 Ort und Art der Verarbeitung

### 3.1 Serverstandort
**Ausschließlich Deutschland:**
- **Hetzner Online GmbH**
- Rechenzentrum: Deutschland (Falkenstein oder Nürnberg)
- Kein Transfer außerhalb der EU/EWR

### 3.2 Technische Maßnahmen
- **Verschlüsselte Übertragung** (HTTPS/TLS)
- **Datenbank-Zugriff** nur über verschlüsselte Verbindung
- **SHA-256 Hashing** zur Irreversibilität
- **Keine Speicherung** von Klardaten

---

## § 4 Pflichten des Auftragnehmers

### 4.1 Vertraulichkeit
Der Auftragnehmer verpflichtet sich zur:
- **Geheimhaltung** aller verarbeiteten Daten
- **Keine Weitergabe** an Dritte (außer zur Vertragserfüllung)
- **Verpflichtung** aller Mitarbeiter auf Datengeheimnis

### 4.2 Technische und organisatorische Maßnahmen (TOM)
Gemäß Art. 32 DSGVO:
- ✅ Verschlüsselung der Datenübertragung (TLS 1.3)
- ✅ Zugriffskontrolle (Passwort-geschützt, 2FA)
- ✅ Regelmäßige Backups
- ✅ Logging und Monitoring
- ✅ Incident Response Plan
- ✅ Regelmäßige Sicherheitsupdates

### 4.3 Unterstützungspflichten
- Bereitstellung von Informationen auf Anfrage
- Unterstützung bei Betroffenenrechten
- Mitteilung bei Datenschutzverletzungen

---

## § 5 Rechte des Auftraggebers

### 5.1 Kontrollrechte
Der Auftraggeber hat das Recht:
- Auf Auskunft über verarbeitete Daten
- Auf Löschung aller Daten (durch Deaktivierung der Telemetrie)
- Auf Kontrolle der Verarbeitungstätigkeit

### 5.2 Widerruf
**Jederzeit widerrufbar:**
- Deaktivierung der Telemetrie im Plugin-Backend
- Sofortige Einstellung der Datenübermittlung
- Bestehende Daten werden nicht retroaktiv gelöscht (anonymisiert, nicht zuordenbar)

---

## § 6 Datenlöschung

### 6.1 Löschfristen
- **Automatische Löschung** nach 12 Monaten
- **Manuelle Löschung** auf Anfrage möglich
- **Widerruf** stoppt zukünftige Übertragung sofort

### 6.2 Nach Vertragsende
Bei Beendigung des Vertrags:
- Einstellung der Datenübermittlung
- Löschung auf Anfrage
- Bestätigung der Löschung

---

## § 7 Haftung und Freistellung

### 7.1 Haftung
Der Auftragnehmer haftet für Schäden:
- Bei vorsätzlichem oder grob fahrlässigem Handeln
- Bei Verletzung der Vertraulichkeit
- Bei Datenschutzverletzungen

### 7.2 Haftungsbegrenzung
Keine Haftung bei:
- Anonymisierten Daten ohne Personenbezug
- Höherer Gewalt
- Handlungen Dritter außerhalb der Kontrolle

---

## § 8 Laufzeit und Kündigung

### 8.1 Laufzeit
Dieser Vertrag gilt:
- **Beginn:** Mit Aktivierung der Telemetrie im Plugin
- **Dauer:** Solange Telemetrie aktiviert ist
- **Ende:** Bei Deaktivierung oder Deinstallation des Plugins

### 8.2 Außerordentliche Kündigung
Beide Parteien können aus wichtigem Grund kündigen:
- Wesentliche Vertragsverletzung
- Insolvenz einer Partei
- Datenschutzverletzung

---

## § 9 Datenschutz-Folgenabschätzung

### 9.1 Erforderlichkeit
Eine Datenschutz-Folgenabschätzung ist **nicht erforderlich**, da:
- ✅ Ausschließlich anonymisierte Daten
- ✅ Keine Profiling-Aktivitäten
- ✅ Geringes Risiko für Betroffene
- ✅ Zweckgebunden (Gefahrenabwehr)

---

## § 10 Unterauftragnehmer

### 10.1 Hosting-Dienstleister
**Hetzner Online GmbH**  
Industriestr. 25  
91710 Gunzenhausen  
Deutschland  

**Zweck:** Server-Hosting und Infrastruktur  
**Standort:** Deutschland  
**Zertifizierung:** ISO 27001

### 10.2 Weitere Unterauftragnehmer
Aktuell keine weiteren Unterauftragnehmer.  
Bei Hinzufügung: Vorabinformation des Auftraggebers

---

## § 11 Schlussbestimmungen

### 11.1 Änderungen
Änderungen bedürfen der Schriftform oder dokumentierten elektronischen Form.

### 11.2 Salvatorische Klausel
Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.

### 11.3 Anwendbares Recht
Es gilt das Recht der Bundesrepublik Deutschland.

### 11.4 Gerichtsstand
Gerichtsstand ist der Sitz des Auftragnehmers (Amtsgericht Regensburg).

---

## § 12 Unterschriften

### Auftraggeber (Website-Betreiber)

**Ort, Datum:** _______________________

**Unterschrift:** _______________________

---

### Auftragnehmer (GermanFence / GermanProWeb)

**Ort, Datum:** Maxhütte-Haidhof, 01.12.2025

**Unterschrift:**  
*Eugen Meindl*  
GermanProWeb

---

## Anhang: Technische und organisatorische Maßnahmen (TOM)

### 1. Zutrittskontrolle
- Physischer Zugang zu Rechenzentrum durch Hetzner gesichert
- Zutritt nur für autorisiertes Personal

### 2. Zugangskontrolle
- Passwort-geschützte Zugänge (min. 12 Zeichen)
- Optional: 2-Faktor-Authentifizierung (2FA)
- Regelmäßige Passwort-Änderungen

### 3. Zugriffskontrolle
- Rollenbasierte Zugriffsrechte
- Logging aller Zugriffe
- Minimalprinzip (Least Privilege)

### 4. Weitergabekontrolle
- Verschlüsselte Datenübertragung (TLS 1.3)
- Keine Weitergabe an Dritte
- Protokollierung aller Datenflüsse

### 5. Eingabekontrolle
- Audit-Logs für alle Datenbankänderungen
- Versionierung und Änderungshistorie

### 6. Verfügbarkeitskontrolle
- Tägliche Backups
- Redundante Systeme
- Disaster Recovery Plan

### 7. Trennungskontrolle
- Mandantentrennung durch Installation-IDs
- Separate Datenbank-Tabellen
- Keine Vermischung von Daten

---

**Version:** 1.0  
**Stand:** 01. Dezember 2025  
**Nächste Überprüfung:** 01. Dezember 2026

---

## Kontakt bei Fragen

**E-Mail:** kontakt@meindl-webdesign.de  
**Website:** https://germanfence.de  
**Datenschutzbeauftragter:** Eugen Meindl (gleichzeitig)

