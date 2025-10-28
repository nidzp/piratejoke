# 🎬 Kako Koristiti Movie Search App

## 🚀 Brzo Pokretanje

### 1. Pokreni Backend
```powershell
# U root folderu projekta
npm start
```
✅ Backend će biti dostupan na: **http://localhost:8787**

### 2. Pokreni Frontend
```powershell
# U novom terminalu
cd frontend
npm run dev
```
✅ Frontend će biti dostupan na: **http://localhost:5173**

---

## 🔍 Kako Pretražiti Film

1. **Otvori browser**: http://localhost:5173
2. **Upiši naziv filma**: npr. "Inception", "Matrix", "Interstellar"
3. **Čekaj 500ms**: Automatska pretraga posle pauze
4. **Vidi rezultate**!

---

## 📊 Šta Ćeš Videti

### 🎬 Osnovni Podaci (TMDB)
- Naslov filma
- Godina izlaska
- Poster (slika)
- Opis filma

### 🤖 AI Pregled (Groq)
- 3 zanimljivosti o filmu
- Generisano AI-jem na srpskom jeziku
- Ljubičasta sekcija sa ✨ ikonama

### ✅ Besplatni Streaming (Watchmode)
- Top 5 legalnih izvora
- Linkovi ka Tubi, Pluto TV, itd.
- Zelena sekcija sa clickable linkovima

### 🏴‍☠️ Torrent Linkovi (Torrent Search)
- Top 5 magnet linkova
- Prikazuje: naziv, veličinu, seedere, peers
- Narandžasta sekcija
- **Legal u Švajcarskoj za ličnu upotrebu** 🇨🇭

---

## 💡 Saveti

### ⚡ Performanse
- **Debouncing**: Pretraga se pokreće tek nakon 500ms pauze u kucanju
- **Lazy loading**: Slike se učitavaju postepeno
- **Animacije**: Smooth entrance/exit efekti

### 🎨 Dizajn
- **Tamna tema**: Crna pozadina sa narandžastim akcentima
- **Neon glow**: Narandžasti glow efekti na naslovimaa
- **Hover efekti**: Linkovi se uvećavaju na hover
- **Responsive**: Radi na mobilnim uređajima

### 🔧 Troubleshooting

#### Backend se ne pokreće
```powershell
# Proveri da li je port 8787 zauzet
netstat -ano | findstr :8787

# Zaustavi sve Node procese
Stop-Process -Name node -Force
```

#### Frontend ne prikazuje podatke
```powershell
# Proveri da li backend radi
Invoke-WebRequest -Uri http://localhost:8787/api/movies/search/Matrix

# Restartuj frontend
cd frontend
npm run dev
```

#### Greška "CORS"
✅ Backend već ima `cors` middleware - ovo ne bi trebalo da se dogodi

#### Nema torrent linkova
⚠️ Torrent pretraga može biti spora ili nedostupna
- Providers mogu biti blokirani
- Može da traje 10-30 sekundi
- Rezultat: prazna lista (normalno)

---

## 🎯 Primer Toka

```
1. User upisuje "Inception" ✍️
   └─> Debounce wait (500ms) ⏱️

2. Frontend šalje zahtev ka backendu 📡
   └─> GET /api/movies/search/Inception

3. Backend paralelno poziva:
   ├─> TMDB API (osnovni podaci) 🎬
   ├─> Groq AI (AI pregled) 🤖
   ├─> Watchmode (streaming) ✅
   └─> Torrent Search (magnet linkovi) 🏴‍☠️

4. Backend vraća JSON sa svim podacima 📦

5. Frontend prikazuje:
   ├─> Loading spinner (dok čeka) 🔄
   ├─> Fade-in animacija 🎭
   ├─> Movie Card sa svim sekcijama
   └─> Smooth hover efekti
```

---

## 📱 Primer Rezultata

### Input: "Inception"

**AI Pregled (Groq):**
- ✨ Inception je vizuelno spektakularan SF triler Christophera Nolana
- ✨ Leonardo DiCaprio igra lopova koji krade tajne kroz snove
- ✨ Film je dobio 4 Oscara za vizuelne i zvučne efekte

**Besplatni Streaming:**
- ✅ Tubi TV → https://tubitv.com/...
- ✅ Pluto TV → https://pluto.tv/...

**Torrent Linkovi:**
- 🏴‍☠️ Inception 2010 1080p BluRay (2.5 GB, 150 seeds)
- 🏴‍☠️ Inception (2010) [YTS.MX] (1.8 GB, 85 seeds)

---

## 🌟 Bonus Features

### Keyboard Shortcuts
- **Enter** u search fieldu: Ručna pretraga
- **Refresh page**: Briše rezultate

### Visual Feedback
- 🔍 Search icon kad nema loading-a
- 🎬 Movie icon u input fieldu tokom pretrage
- ⚠️ Error message ako backend nije pokrenut
- ❌ "Nema rezultata" poruka ako film ne postoji

### Animacije
- Preloader spinner na početku (1.5s)
- Fade-in ulazak za sve komponente
- Slide-up za movie karticu
- Scale hover efekat na linkovima
- Glow efekat na naslovima

---

## 🎨 Prilagođavanje Teme

### Boje se mogu promeniti u:
`frontend/tailwind.config.js`

```javascript
colors: {
  'neon-orange': '#ff6b35',    // Promeni ovu boju
  'dark-orange': '#f97316',
  'cyber-black': '#0a0a0a',
  'cyber-gray': '#1a1a1a',
}
```

### Animacije se menjaju u:
`frontend/src/components/*.jsx`

```javascript
// Primer: Promeni brzinu animacije
transition={{ duration: 0.4 }} // bilo 0.4, probaj 0.2
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
TMDB_BEARER=...           # TMDB Read Access Token
WATCHMODE_API_KEY=...     # Watchmode API Key
GROQ_API_KEY=...          # Groq AI API Key
PORT=8787                 # Server port (default)
```

### Frontend (Vite Proxy)
Automatski prosleđuje `/api/*` zahteve ka `http://localhost:8787`

---

## 🎊 Enjoy the App!

**Made with ❤️ using:**
- React + Vite
- Tailwind CSS
- Framer Motion
- Express.js
- Groq AI
- TMDB API
- Watchmode API

**Legal under Swiss law** 🇨🇭
