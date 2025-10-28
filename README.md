# 🎬 Movie Search App - Full Stack

Express.js backend + React frontend aplikacija za pretragu filmova sa AI pregledom, besplatnim streaming linkovima i torrent izvorima.

---

## 🚀 Funkcionalnosti

### Backend (Express API)
- ✅ **TMDB API** - Pretraga filmova i osnovni podaci
- ✅ **Groq AI** - AI generisan pregled filma na srpskom jeziku (3 zanimljivosti)
- ✅ **Watchmode API** - Top 5 besplatnih streaming izvora
- ✅ **Torrent Search** - Top 5 magnet linkova (legalno u Švajcarskoj 🇨🇭)
- ✅ **CORS enabled** - Povezan sa React frontendom

### Frontend (React + Vite)
- ✅ **Tamna narandžasto-crna tema** (Cyberpunk stil)
- ✅ **Neon glow efekti** na tekstovima i linkovima
- ✅ **Rucno pokretanje pretrage** dugmetom "Pretra�i"
- **TMDB reference rezultati** (filmovi i serije) sa TMDB linkovima
- ✅ **Framer Motion** - Smooth animacije (fade-in, slide-up, hover scale)
- ✅ **AI Highlights sekcija** - Prikazuje Groq AI pregled
- ✅ **Responsive dizajn** - Mobile-first pristup
- ✅ **Loading states** - Spinner i skeleton screens
- ✅ **Error handling** - User-friendly poruke

---

## 📦 Instalacija

### 1️⃣ Backend Setup

```bash
# Instaliraj zavisnosti
npm install

# Proveri .env fajl (već konfigurisano)
# TMDB_BEARER, WATCHMODE_API_KEY, GROQ_API_KEY
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
```

---

## ▶️ Pokretanje

### Backend (Port 8787)
```bash
npm start
```

### Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

---

## 🌐 Endpoints

### Backend API

**GET** `/api/movies/search/:title`

**Primer zahteva:**
```bash
GET http://localhost:8787/api/movies/search/Inception
```

**Primer odgovora:**
```json
{
  "naziv": "Inception",
  "godina": 2010,
  "tip": "movie",
  "reference_tmdb_id": 27205,
  "reference_url": "https://www.themoviedb.org/movie/27205",
  "opis": "Cobb, a skilled thief who commits corporate espionage...",
  "poster_url": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  "alternativni_rezultati": [
    {
      "tmdb_id": 11324,
      "media_type": "movie",
      "title": "Incendies",
      "year": 2010,
      "reference_url": "https://www.themoviedb.org/movie/11324"
    }
  ],
  "top5_besplatno": [
    "https://tubitv.com/movies/12345",
    "https://pluto.tv/movies/inception"
  ],
  "top5_piratizovano": [
    {
      "title": "Inception 2010 1080p BluRay",
      "magnet": "magnet:?xt=urn:btih:...",
      "size": "2.5 GB",
      "seeds": 150,
      "peers": 20,
      "provider": "ThePirateBay"
    }
  ],
  "ai_pregled": [
    "Inception je vizuelno spektakularan SF triler Christophera Nolana",
    "Leonardo DiCaprio igra lopova koji krade tajne kroz snove",
    "Film je dobio 4 Oscara za vizuelne i zvucne efekte"
  ]
}
```

---

## 📁 Struktura Projekta

```
piratejoke/
├── src/                          # Backend (Express)
│   └── server.js                 # Main server file
├── frontend/                     # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.jsx    # Input sa debouncing-om
│   │   │   ├── MovieCard.jsx    # Prikaz filma + AI
│   │   │   └── Loader.jsx       # Loading spinner
│   │   ├── App.jsx              # Main layout
│   │   ├── api.js               # Backend integration
│   │   └── index.css            # Tailwind + custom styles
│   ├── vite.config.js           # Vite config + proxy
│   └── tailwind.config.js       # Custom orange theme
├── .env                          # API ključevi
├── package.json                  # Backend dependencies
└── README.md
```

---

## 🔑 API Ključevi (.env)

```env
# TMDB API (Read Access Token - v4)
TMDB_BEARER=eyJhbGciOiJIUzI1NiJ9...

# Watchmode API (Free tier - 1000 requests/month)
WATCHMODE_API_KEY=mCzqvjsJnOOUijDAzG7qk0b1l0kD6usakkJenvqE

# Groq AI API (Free tier)
GROQ_API_KEY=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

# Server port
PORT=8787
```

---

## 🎨 Frontend Features

### 🌈 Dizajn Paleta
- **Neon Orange**: `#ff6b35` (glavni akcent)
- **Dark Orange**: `#f97316` (sekundarni)
- **Cyber Black**: `#0a0a0a` (pozadina)
- **Cyber Gray**: `#1a1a1a` (kartice)
- **Purple**: Za AI sekciju

### ✨ Animacije
- **Fade-in** ulazak komponenti
- **Slide-up** za kartice
- **Hover scale** na linkovima
- **Glow efekti** na tekstovima
- **Smooth transitions** svuda

### 📱 Responsive Breakpoints
```css
/* Mobile first */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
```

---

## 🤖 AI Pregled (Groq)

Backend koristi **Groq API** sa `llama3-8b-8192` modelom za generisanje:
- ✅ Do 3 kratke zanimljivosti o filmu
- ✅ Na srpskom jeziku
- ✅ Bez numeracije (bullet points)
- ✅ Max 180 tokena

**Primer prompta:**
```
System: You are a movie concierge that responds in Serbian using short bullet-like lines without numbering.

User:
Naslov: Inception
Godina: 2010
Opis: Cobb, a skilled thief who commits corporate espionage...
Pripremi do tri kratke preporuke ili zanimljivosti za gledaoce.
```

---

## 🏴‍☠️ Torrent Search

Koristi **torrent-search-api** sa:
- ThePirateBay
- 1337x
- YTS
- TorrentGalaxy

**Napomena:** Legalno u Švajcarskoj za ličnu upotrebu 🇨🇭

---

## 🛠️ Tehnologije

### Backend
- **Express.js** - Web framework
- **Groq SDK** - AI API
- **Axios** - HTTP klijent (za TMDB/Watchmode)
- **torrent-search-api** - Torrent pretraga
- **cors** - CORS middleware
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **Vite** - Build tool (fast HMR)
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animation library
- **Axios** - HTTP klijent

---

## 🧪 Testiranje

### Backend Test
```bash
curl http://localhost:8787/api/movies/search/Inception
```

### Frontend
1. Otvori http://localhost:5173
2. Upiši "Inception" ili "Matrix"
3. Klikni dugme "Pretra�i"
4. Vidi rezultate!

---

## ⚖️ Legal Notice

- **Streaming linkovi**: Samo legalni besplatni servisi
- **Torrent linkovi**: Legalni za ličnu upotrebu u Švajcarskoj 🇨🇭
- **AI pregled**: Generisan od Groq AI (llama3)
- **Svi podaci**: Iz javnih API-ja (TMDB, Watchmode)

**Disclaimer**: Aplikacija ne hostuje nikakav sadržaj. Samo agregira javne informacije.

---

## 📝 Napomene

- Backend mora biti pokrenut pre frontenda (proxy)
- Debouncing smanjuje broj API poziva
- Torrent pretraga može biti spora (10+ torrenta)
- Watchmode free tier: ~1000 zahteva/mesec
- Groq AI može da bude nedostupan (fallback: prazan niz)

---

## 🎉 Enjoy!

Made with ❤️ using React, Vite, Tailwind CSS, Express & Groq AI

**Legal under Swiss law** 🇨🇭
