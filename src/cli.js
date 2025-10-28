// Minimalni CLI za TMDB trendove i TVmaze raspored (srpski)
// Koristi postojece .env vrednosti i globalni fetch (Node 18+)

require('dotenv').config();

const fetchFn = global.fetch
  ? global.fetch.bind(global)
  : (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

function help() {
  console.log(`Upotreba:
  node src/cli.js trending [--period=day|week] [--lang=sr-RS]
  node src/cli.js schedule [--country=RS] [--date=YYYY-MM-DD]
  node src/cli.js disclaimer

Primeri:
  node src/cli.js trending --period=day --lang=sr
  node src/cli.js schedule --country=US --date=2025-01-01
`);
}

function parseArgs() {
  const [, , cmd, ...rest] = process.argv;
  const args = {};
  for (const part of rest) {
    const m = part.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return { cmd, args };
}

async function tmdbTrending({ period = 'day', lang = 'sr' } = {}) {
  if (!process.env.TMDB_BEARER) {
    throw new Error('TMDB_BEARER nije postavljen u .env');
  }
  const headers = {
    Authorization: `Bearer ${process.env.TMDB_BEARER}`,
    'Content-Type': 'application/json;charset=utf-8',
  };
  const movieUrl = new URL(`${TMDB_BASE_URL}/trending/movie/${period}`);
  movieUrl.searchParams.set('language', lang);
  const tvUrl = new URL(`${TMDB_BASE_URL}/trending/tv/${period}`);
  tvUrl.searchParams.set('language', lang);

  const [mRes, tRes] = await Promise.all([fetchFn(movieUrl, { headers }), fetchFn(tvUrl, { headers })]);
  if (!mRes.ok || !tRes.ok) {
    const mBody = await safeJson(mRes);
    const tBody = await safeJson(tRes);
    throw new Error(`TMDB trending neuspeh: movies=${mRes.status} ${mRes.statusText} ${JSON.stringify(mBody)}; tv=${tRes.status} ${tRes.statusText} ${JSON.stringify(tBody)}`);
  }
  const movies = (await mRes.json()).results || [];
  const tv = (await tRes.json()).results || [];

  console.log('Top 3 filmovi:');
  movies.slice(0, 3).forEach((x, i) => {
    const title = x.title || x.name || x.original_title || x.original_name;
    console.log(`${i + 1}. ${title} (TMDB #${x.id}) — ocena: ${x.vote_average}`);
  });

  console.log('\nTop 3 serije:');
  tv.slice(0, 3).forEach((x, i) => {
    const name = x.name || x.title || x.original_name || x.original_title;
    console.log(`${i + 1}. ${name} (TMDB #${x.id}) — ocena: ${x.vote_average}`);
  });
}

async function tvmazeSchedule({ country = 'RS', date } = {}) {
  const d = date || new Date().toISOString().slice(0, 10);
  const url = `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}&date=${encodeURIComponent(d)}`;
  const res = await fetchFn(url);
  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(`TVmaze raspored neuspeh: ${res.status} ${res.statusText} ${JSON.stringify(body)}`);
  }
  const items = await res.json();
  console.log(`Raspored za ${country} na datum ${d}:`);
  items.slice(0, 10).forEach((e) => {
    const time = e.airtime || e.airdate || '—';
    const title = e.show?.name || 'Nepoznato';
    const ch = e.show?.network?.name || e.show?.webChannel?.name || '—';
    console.log(`- ${time} — ${title} (${ch})`);
  });
}

function disclaimer() {
  console.log('© ' + new Date().getFullYear() + ' Vaše Ime ili Kompanija. Sva prava zadržana.');
  console.log('Ovaj alat ne hostuje niti linkuje torrent/magnet sadržaj.');
  console.log('Metapodaci i slike: The Movie Database (TMDB) i/ili TVmaze.');
  console.log('Ovaj proizvod koristi TMDB API ali nije odobren niti sertifikovan od strane TMDB.');
}

async function safeJson(r) {
  try { return await r.json(); } catch { return {}; }
}

(async () => {
  const { cmd, args } = parseArgs();
  try {
    if (cmd === 'trending') await tmdbTrending(args);
    else if (cmd === 'schedule') await tvmazeSchedule(args);
    else if (cmd === 'disclaimer') disclaimer();
    else help();
  } catch (err) {
    console.error('Greška:', err.message);
    process.exitCode = 1;
  }
})();

