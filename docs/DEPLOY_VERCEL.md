# Deploy na Vercel (frontend + API)

Ovaj repo je pripremljen za Vercel monorepo deploy:
- `frontend/` — React + Vite SPA, gradi se kao static build
- `api/` — Vercel serverless funkcije (`/api/*` rute)

## 1) Kreiraj projekat na Vercel-u
- Importuj GitHub/Git repo (root folder ovog repoa)
- Vercel će automatski detektovati:
  - Static build u `frontend/` (`@vercel/static-build`)
  - Node funkcije u `api/` (`@vercel/node`)

Ako ne prepozna, koristi postojeći `vercel.json` (već je dodat u repo).

## 2) Environment Variables (Project Settings → Environment Variables)
Dodaj sledeće varijable u Vercel (Production i Preview):
- `TMDB_BEARER` — TMDB Read Access Token (v4)
- `WATCHMODE_API_KEY` — (opciono) Watchmode API ključ
- `GROQ_API_KEY` — (opciono) Groq API ključ

Napomena: `DISABLE_TORRENTS=true` nije potreban jer serverless funkcije ionako ne izbacuju torrent linkove.

## 3) Deploy
- Klikni “Deploy” u Vercel UI
- Nakon build-a:
  - Frontend dostupan na domeni projekta
  - API endpointi na `https://<tvoj-domen>/api/...` (npr. `/api/movies/search/Inception`)

## 4) Lokalni razvoj
- Backend Express (opciono, za lokalno testiranje): `npm start`
- Frontend dev server sa proxy ka lokalnom backend-u:
  ```bash
  cd frontend
  npm run dev
  ```
- Serverless funkcije se pozivaju na Vercel-u; lokalno možeš koristiti `/api/*` rute iz Express-a ili dodati Vercel CLI ako želiš da emuliraš

## 5) Endpointi na Vercel-u
- `GET /api/movies/search/:title` — TMDB + (opciono) Watchmode + (opciono) Groq; bez torrent linkova
- `GET /api/trending/top3?period=day|week&lang=sr` — TMDB trendovi
- `GET /api/tv/schedule?country=RS&date=YYYY-MM-DD` — TVmaze raspored
- `GET /api/disclaimer` — pravne napomene i atribucija

## 6) Pravne napomene
- Projekat ne hostuje niti linkuje torrent/magnet sadržaj.
- Poštuj ToS TMDB/TVmaze i lokalne zakone o autorskim pravima.

