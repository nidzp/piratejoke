# Movie Search API

Express.js backend API za pretragu filmova sa legalnim streaming izvorima i torrent linkovima.

## 🎬 Funkcionalnosti

- **Pretraga filmova** preko TMDB API
- **Legalni streaming izvori** putem Watchmode API (top 5 besplatnih izvora)
- **Torrent izvori** putem torrent-search-api (legalno u Švajcarskoj - top 5 magnet linkova)
- **JSON odgovori** sa poljima na srpskom jeziku

## 🚀 Instalacija

1. Instaliraj zavisnosti:
```bash
npm install
```

2. Konfiguriši `.env` fajl (već kreiran sa API ključevima)

3. Pokreni server:
```bash
npm start
```

Za development sa auto-reload:
```bash
npm run dev
```

## 📡 API Endpoints

### Pretraga filma
```
GET /api/movies/search/:title
```

**Primer zahteva:**
```
GET http://localhost:8787/api/movies/search/Inception
```

**Primer odgovora:**
```json
{
  "naziv": "Inception",
  "godina": 2010,
  "opis": "Cobb, a skilled thief who commits corporate espionage...",
  "poster_url": "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  "top5_besplatno": [
    {
      "name": "Tubi TV",
      "url": "https://tubitv.com/movies/12345",
      "type": "free"
    }
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
  ]
}
```

### Health Check
```
GET /
```

## 🔑 API Ključevi

Svi API ključevi su već konfigurisani u `.env` fajlu:

- **TMDB_BEARER**: eyJhbGciOiJIUzI1NiJ9... (TMDB Read Access Token)
- **WATCHMODE_API_KEY**: mCzqvjsJnOOUijDAzG7qk0b1l0kD6usakkJenvqE
- **GROQ_API_KEY**: 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 (optional)

## 📁 Struktura Projekta

```
piratejoke/
├── src/
│   ├── routes/
│   │   └── movieRoutes.js          # API rute
│   ├── controllers/
│   │   └── movieController.js      # Kontroleri za obradu zahteva
│   └── services/
│       ├── tmdbService.js          # TMDB API integracija
│       ├── watchmodeService.js     # Watchmode API integracija
│       └── torrentService.js       # Torrent search integracija
├── .github/
│   └── copilot-instructions.md     # Copilot pravila
├── server.js                        # Express server setup
├── package.json
├── .env                             # API ključevi
└── README.md
```

## ⚖️ Legalni Napomene

- **Streaming izvori**: Samo legalni besplatni servisi (Tubi, Pluto TV, itd.)
- **Torrent linkovi**: Legalni za ličnu upotrebu u Švajcarskoj
- API ne promoviše pirateriju niti ilegalne aktivnosti

## 🛠️ Tehnologije

- **Express.js** - Web framework
- **Axios** - HTTP klijent
- **TMDB API** - Filmska baza podataka
- **Watchmode API** - Streaming izvori
- **torrent-search-api** - Torrent pretraga
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment varijable

## 📝 Licenca

ISC

---

**Napomena**: Projekat je razvijen u skladu sa zakonima Švajcarske i služi isključivo u edukativne svrhe.
