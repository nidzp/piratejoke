# 🎬 Movie Search Frontend

React frontend aplikacija sa tamnom narandžasto-crnom temom za pretragu filmova.

## 🚀 Tehnologije

- **React 18** - UI framework
- **Vite** - Build tool i dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animacije
- **Axios** - HTTP klijent

## 🎨 Features

- ✅ **Tamna tema** sa neon-narandžastim akcentima
- ✅ **Rucno pokretanje pretrage** dugmetom "Pretra�i"
- ✅ **Lazy loading** za slike
- ✅ **Framer Motion** animacije
- ✅ **Responsive** dizajn
- ✅ **Loading states** i skeleton screens
- ✅ **Error handling**
- ✅ **Proxy** ka Express backendu

## 📦 Instalacija

```bash
npm install
```

## 🏃 Pokretanje

```bash
npm run dev
```

Frontend će biti dostupan na: **http://localhost:5173**

## 🔗 Backend Integracija

Frontend očekuje da Express backend radi na `http://localhost:8787`

Vite proxy automatski prosleđuje `/api/*` zahteve ka backendu.

## 📁 Struktura

```
frontend/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx      # Input sa debouncing-om
│   │   ├── MovieCard.jsx      # Prikaz filma
│   │   └── Loader.jsx         # Loading spinner
│   ├── App.jsx                # Glavni layout
│   ├── api.js                 # API calls
│   ├── main.jsx              # Entry point
│   └── index.css             # Tailwind + custom styles
├── index.html
├── vite.config.js
└── tailwind.config.js
```

## 🎭 Animacije

- Fade-in ulazak komponenti
- Slide-up animacije za kartice
- Hover efekti sa scale transformacijom
- Glow efekti na tekstovima i linkovima
- Smooth transitions

## 🌈 Boje

- **Neon Orange**: `#ff6b35`
- **Dark Orange**: `#f97316`
- **Cyber Black**: `#0a0a0a`
- **Cyber Gray**: `#1a1a1a`

## 📝 Napomene

- Rucno pokretanje pretrage klikom na dugme "Pretra�i"
- Prikazuje do 5 besplatnih i 5 torrent linkova
- Legal notice za torrent upotrebu (Swiss law)

---

Made with ❤️ using React, Vite & Tailwind CSS
