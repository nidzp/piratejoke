# 🎬 Movie Search API - Primeri Korišćenja

## Pokretanje Servera

### Opcija 1: npm script
```bash
npm start
```

### Opcija 2: Development mode (auto-reload)
```bash
npm run dev
```

### Opcija 3: VS Code Task
Pritisni `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Movie API Server"

## 📡 Test API Endpoints

### 1. Health Check
```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:8787/ | Select-Object -Expand Content

# curl (ako je instaliran)
curl http://localhost:8787/
```

**Očekivani odgovor:**
```json
{
  "status": "OK",
  "message": "Movie Search API is running",
  "endpoints": {
    "search": "/api/movies/search/:title"
  }
}
```

### 2. Pretraga Filma - Inception
```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:8787/api/movies/search/Inception | Select-Object -Expand Content

# curl
curl http://localhost:8787/api/movies/search/Inception
```

### 3. Pretraga Filma - The Matrix
```bash
Invoke-WebRequest -Uri http://localhost:8787/api/movies/search/The%20Matrix | Select-Object -Expand Content
```

### 4. Pretraga Filma - Interstellar
```bash
Invoke-WebRequest -Uri http://localhost:8787/api/movies/search/Interstellar | Select-Object -Expand Content
```

## 🔧 Testiranje u Browseru

Otvori u browseru:
- Health Check: http://localhost:8787/
- Pretraga: http://localhost:8787/api/movies/search/Inception

## 📊 Primer JSON Odgovora

```json
{
  "naziv": "Inception",
  "godina": 2010,
  "opis": "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\", the implantation of another person's idea into a target's subconscious.",
  "poster_url": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  "top5_besplatno": [
    {
      "name": "Tubi TV",
      "url": "https://tubitv.com/movies/123456",
      "type": "free"
    },
    {
      "name": "Pluto TV",
      "url": "https://pluto.tv/movies/inception",
      "type": "free"
    }
  ],
  "top5_piratizovano": [
    {
      "title": "Inception 2010 1080p BluRay x264",
      "magnet": "magnet:?xt=urn:btih:...",
      "size": "2.5 GB",
      "seeds": 150,
      "peers": 20,
      "provider": "ThePirateBay"
    },
    {
      "title": "Inception (2010) [1080p] [YTS.MX]",
      "magnet": "magnet:?xt=urn:btih:...",
      "size": "1.8 GB",
      "seeds": 85,
      "peers": 12,
      "provider": "YTS"
    }
  ]
}
```

## 🧪 Testiranje sa Postman / Insomnia

1. Kreiraj novi GET zahtev
2. URL: `http://localhost:8787/api/movies/search/Inception`
3. Send
4. Proveri JSON odgovor

## 🛠️ Troubleshooting

### Server se ne pokreće
```bash
# Proveri da li je port 8787 zauzet
netstat -ano | findstr :8787

# Promeni port u .env fajlu
PORT=3000
```

### TMDB API greška
- Proveri da li je `TMDB_BEARER` token validan u `.env`
- Token: eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYmMxYTI3ZTk3NjZkMTJjMDgzOWRlZWZhYWMzMzNkNCIsIm5iZiI6MTc2MTM1NDcxMS4zNCwic3ViIjoiNjhmYzIzZDdkYjMyMzg3YTczNmE3MmI3Iiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.sLFMfh_HK4-EQ09D4nAhxhIhznggAfM-ypq8C1_A-2A

### Watchmode API greška
- Proveri `WATCHMODE_API_KEY` u `.env`
- Free tier: ~1000 zahteva mesečno
- Key: mCzqvjsJnOOUijDAzG7qk0b1l0kD6usakkJenvqE

### Torrent pretraga ne radi
- Neki torrent provideri mogu biti nedostupni
- API će vratiti praznu listu umesto greške
- Providers: ThePirateBay, 1337x, YTS, TorrentGalaxy

## 📝 Napomene

- **Prazna polja**: Ako se film ne pronađe ili nema izvora, API vraća prazne nizove
- **Rate Limiting**: TMDB i Watchmode imaju ograničenja zahteva
- **Legalnost**: Torrent linkovi su legalni za ličnu upotrebu u Švajcarskoj

---

**Srećno testiranje! 🎉**
