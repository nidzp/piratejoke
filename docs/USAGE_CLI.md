# CLI upotreba (TMDB/TVmaze)

Minimalni CLI alat omogućava:
- TMDB trendove (Top 3 filmova i serija)
- TVmaze raspored po zemlji i datumu
- Ispis disklajmera/atribucije

## Preduslovi
- Node 18+ (preporučeno 20+/22+)
- `.env` sa popunjenim `TMDB_BEARER`

## Komande

```
node src/cli.js trending [--period=day|week] [--lang=sr]
node src/cli.js schedule [--country=RS] [--date=YYYY-MM-DD]
node src/cli.js disclaimer
```

### Primeri
```
# Top 3 danas (srpski)
node src/cli.js trending --period=day --lang=sr

# TV raspored za Srbiju za današnji datum
node src/cli.js schedule --country=RS

# TV raspored za SAD za konkretan datum
node src/cli.js schedule --country=US --date=2025-01-01
```

## Napomene
- TMDB: obavezna atribucija; proizvod koristi TMDB API ali nije odobren niti sertifikovan od strane TMDB.
- TVmaze: javni API; poštujte rate‑limit i ToS.
- Alat ne hostuje niti linkuje torrent/magnet sadržaj.

