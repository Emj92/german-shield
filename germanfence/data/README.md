# GermanFence Data-Ordner

## AV-Vertrag als PDF erstellen

Der `AV-VERTRAG.md` liegt als Markdown vor. Um ihn als PDF zu erstellen:

### Option 1: Online-Tool
1. Öffne https://www.markdowntopdf.com/
2. Lade `AV-VERTRAG.md` hoch
3. Speichere als `av-vertrag.pdf`

### Option 2: Pandoc (lokal)
```bash
pandoc AV-VERTRAG.md -o av-vertrag.pdf --pdf-engine=wkhtmltopdf
```

### Option 3: VS Code Extension
1. Installiere "Markdown PDF" Extension
2. Öffne `AV-VERTRAG.md`
3. Rechtsklick → "Markdown PDF: Export (pdf)"

## Datei-Struktur

```
data/
├── README.md           (Diese Datei)
├── AV-VERTRAG.md       (Markdown-Quelle)
└── av-vertrag.pdf      (Zu erstellen - wird im Plugin referenziert)
```

## Wichtig

Die `av-vertrag.pdf` wird im Plugin unter folgender URL referenziert:
`{PLUGIN_URL}/data/av-vertrag.pdf`

Stelle sicher, dass die PDF existiert, bevor du das Plugin veröffentlichst!
