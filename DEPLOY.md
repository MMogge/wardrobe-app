# Deployment Guide – My Wardrobe App

## Voraussetzungen
- [Node.js](https://nodejs.org) ≥ 18 installiert
- [Git](https://git-scm.com) installiert
- GitHub-Account (kostenlos)

---

## Schritt 1 – MongoDB Atlas einrichten (kostenlos)

1. Gehe zu [cloud.mongodb.com](https://cloud.mongodb.com) → Account erstellen (kostenlos)
2. **Create a Cluster** → "M0 Free" wählen → Region: Europe (Frankfurt)
3. **Database Access** → Add New Database User
   - Username & Passwort notieren (kein `@` oder `:` im Passwort)
   - Role: "Read and write to any database"
4. **Network Access** → Add IP Address → **"Allow Access from Anywhere"** (0.0.0.0/0)
5. **Connect** → "Drivers" → Node.js → Connection String kopieren:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Am Ende `?retryWrites=...` ersetzen durch `/wardrobe?retryWrites=true&w=majority`

---

## Schritt 2 – Code auf GitHub pushen

```bash
cd "/Users/MiriARD/Documents/Claude/Projects/Wardrobe App"
git init
git add .
git commit -m "Initial commit – Wardrobe App"
# Neues Repo auf github.com erstellen (z.B. "wardrobe-app"), dann:
git remote add origin https://github.com/DEIN-USERNAME/wardrobe-app.git
git push -u origin main
```

---

## Schritt 3 – Vercel deployen

1. Gehe zu [vercel.com](https://vercel.com) → Mit GitHub einloggen
2. **"Add New Project"** → dein `wardrobe-app` Repo importieren
3. Framework: **"Other"** (kein Framework)
4. **Environment Variables** eintragen:

   | Name | Wert |
   |------|------|
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/wardrobe?retryWrites=true&w=majority` |
   | `MONGODB_DB` | `wardrobe` |

5. **Deploy** klicken → fertig! ✅

Die App ist jetzt unter `https://wardrobe-app-XXXX.vercel.app` erreichbar.

---

## Schritt 4 – API-Key in der App hinterlegen

1. App öffnen → Oben rechts **⚙️**
2. Anthropic API-Key eintragen (von [console.anthropic.com](https://console.anthropic.com))
3. Speichern → Fertig!

Der API-Key wird **nur lokal im Browser** gespeichert, nicht in der Datenbank.

---

## Lokale Entwicklung (optional)

```bash
cd "/Users/MiriARD/Documents/Claude/Projects/Wardrobe App"
npm install
# .env Datei anlegen:
cp .env.example .env
# MONGODB_URI in .env eintragen, dann:
npm run dev
# → App läuft auf http://localhost:3000
```

---

## Datenbankstruktur

Collection: `wardrobe.items`

```json
{
  "_id": "ObjectId",
  "name": "Weißes Leinenhemd",
  "kategorie": "Oberteil",
  "farben": ["Weiß"],
  "sitz": "Regular/Normal",
  "laenge": "Normal",
  "material": "Leinen",
  "textur": "Glatt",
  "waerme": "Leicht (20-25°C)",
  "jahreszeiten": ["Frühling", "Sommer"],
  "styleMood": ["Casual", "Minimal"],
  "notizen": "Kombiniert sich gut mit heller Hose.",
  "imageData": "data:image/jpeg;base64,...",
  "analyzing": false,
  "addedAt": "2026-05-17T...",
  "updatedAt": "2026-05-17T..."
}
```
