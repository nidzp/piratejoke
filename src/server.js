const express = require('express');
const GroqSDK = require('groq-sdk');
const cors = require('cors');
const TorrentSearchApi = require('torrent-search-api');
require('dotenv').config();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

// Use global fetch when available, otherwise lazily import node-fetch.
const fetchFn = global.fetch
  ? global.fetch.bind(global)
  : (...args) =>
      import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const port = process.env.PORT || 8787;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Enable torrent search providers
TorrentSearchApi.enablePublicProviders();

const GroqClientCtor =
  typeof GroqSDK === 'function' ? GroqSDK : GroqSDK.Groq || GroqSDK.default;
let groqClientInstance = null;

function getGroqClient() {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  if (!GroqClientCtor) {
    console.warn('Groq SDK unavailable; skipping AI highlights.');
    return null;
  }

  if (!groqClientInstance) {
    groqClientInstance = new GroqClientCtor({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClientInstance;
}

// GET /api/movies/search/:title - Search movies/series + metadata
app.get('/api/movies/search/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const catalogResults = await searchTitlesOnTMDB(title);
    if (catalogResults.length === 0) {
      return res.json(buildEmptyResponse(title));
    }

    const primary = catalogResults[0];

    const [freeSources, piratedSources, aiHighlights] = await Promise.all([
      getFreeSources(primary.tmdb_id, primary.media_type),
      getPiratedSources(primary.title, primary.year),
      getAiHighlights(primary),
    ]);

    res.json({
      naziv: primary.title,
      godina: primary.year,
      opis: primary.description,
      poster_url: primary.poster_url,
      tip: primary.media_type,
      reference_tmdb_id: primary.tmdb_id,
      reference_url: primary.reference_url,
      alternativni_rezultati: catalogResults.slice(1),
      top5_besplatno: freeSources,
      top5_piratizovano: piratedSources,
      ai_pregled: aiHighlights,
    });
  } catch (error) {
    console.error('Error handling movie search request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/trending/top3?period=day|week&lang=sr-RS
app.get('/api/trending/top3', async (req, res) => {
  try {
    if (!process.env.TMDB_BEARER) {
      return res.status(400).json({ error: 'TMDB_BEARER nije postavljen' });
    }
    const period = (req.query.period === 'week' ? 'week' : 'day');
    const lang = req.query.lang || 'sr';
    const headers = {
      Authorization: `Bearer ${process.env.TMDB_BEARER}`,
      'Content-Type': 'application/json;charset=utf-8',
    };
    const movieUrl = new URL(`${TMDB_BASE_URL}/trending/movie/${period}`);
    movieUrl.searchParams.set('language', lang);
    const tvUrl = new URL(`${TMDB_BASE_URL}/trending/tv/${period}`);
    tvUrl.searchParams.set('language', lang);

    const [mRes, tRes] = await Promise.all([
      fetchFn(movieUrl.toString(), { headers }),
      fetchFn(tvUrl.toString(), { headers }),
    ]);

    if (!mRes.ok || !tRes.ok) {
      return res.status(502).json({ error: 'TMDB trending neuspeh' });
    }
    const movies = (await mRes.json()).results || [];
    const tv = (await tRes.json()).results || [];

    res.json({
      filmovi_top3: movies.slice(0, 3).map((x) => ({
        id: x.id,
        naslov: x.title || x.name || x.original_title || x.original_name,
        ocena: x.vote_average,
      })),
      serije_top3: tv.slice(0, 3).map((x) => ({
        id: x.id,
        naslov: x.name || x.title || x.original_name || x.original_title,
        ocena: x.vote_average,
      })),
      period,
      jezik: lang,
      izvor: 'TMDB',
    });
  } catch (err) {
    console.error('Trending error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/tv/schedule?country=RS&date=YYYY-MM-DD
app.get('/api/tv/schedule', async (req, res) => {
  try {
    const country = (req.query.country || 'RS').toUpperCase();
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const url = `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}&date=${encodeURIComponent(date)}`;
    const r = await fetchFn(url);
    if (!r.ok) {
      const body = await safeJson(r);
      return res.status(502).json({ error: 'TVmaze neuspeh', details: body });
    }
    const items = await r.json();
    res.json({
      country,
      date,
      izvor: 'TVmaze',
      stavke: (Array.isArray(items) ? items : []).slice(0, 50).map((e) => ({
        vreme: e.airtime || e.airdate || null,
        naziv: e.show?.name || null,
        kanal: e.show?.network?.name || e.show?.webChannel?.name || null,
      })),
    });
  } catch (err) {
    console.error('TV schedule error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/disclaimer
app.get('/api/disclaimer', (_req, res) => {
  res.json({
    copyright: `© ${new Date().getFullYear()} Autor ili Kompanija. Sva prava zadržana.`,
    poruka:
      'Ovaj servis ne hostuje niti linkuje torrent/magnet sadržaj. Metapodaci i slike: TMDB i/ili TVmaze. Ovaj proizvod koristi TMDB API ali nije odobren niti sertifikovan od strane TMDB.',
  });
});

/**
 * Fetch movie/series details from TMDB using the provided title.
 * Returns an array of normalized data objects ordered by relevance.
 */
async function searchTitlesOnTMDB(title) {
  if (!process.env.TMDB_BEARER) {
    throw new Error('TMDB_BEARER is not defined in environment variables.');
  }

  const url = new URL(`${TMDB_BASE_URL}/search/multi`);
  url.searchParams.set('query', title);
  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', '1');

  const response = await fetchFn(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.TMDB_BEARER}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });

  if (!response.ok) {
    const body = await safeJson(response);
    throw new Error(
      `TMDB search failed: ${response.status} ${response.statusText} - ${JSON.stringify(
        body
      )}`
    );
  }

  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];

  return results
    .filter((item) =>
      item && ['movie', 'tv'].includes(item.media_type || 'movie')
    )
    .map((item) => normalizeTmdbItem(item, title))
    .filter((item) => item !== null)
    .slice(0, 8);
}

function normalizeTmdbItem(item, fallbackTitle) {
  const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
  const tmdbId = item.id;

  if (!tmdbId) {
    return null;
  }

  const title =
    item.title ||
    item.name ||
    item.original_title ||
    item.original_name ||
    fallbackTitle;

  const releaseDate = item.release_date || item.first_air_date || null;
  const year = releaseDate ? Number.parseInt(releaseDate.substring(0, 4), 10) : null;

  return {
    tmdb_id: tmdbId,
    title,
    year: Number.isFinite(year) ? year : null,
    description: item.overview || '',
    poster_url: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : '',
    media_type: mediaType,
    reference_url: `https://www.themoviedb.org/${mediaType}/${tmdbId}`,
  };
}

/**
 * Query Watchmode for free streaming sources available for the TMDB movie ID.
 * Returns up to five unique URLs of legal free providers.
 */
async function getFreeSources(tmdbId, mediaType) {
  if (!process.env.WATCHMODE_API_KEY) {
    throw new Error(
      'WATCHMODE_API_KEY is not defined in environment variables.'
    );
  }

  const watchmodeType = mediaType === 'tv' ? 'tv' : 'movie';
  const url = `${WATCHMODE_BASE_URL}/title/${watchmodeType}-${tmdbId}/sources/?apiKey=${process.env.WATCHMODE_API_KEY}`;

  const response = await fetchFn(url);
  if (!response.ok) {
    const body = await safeJson(response);
    console.warn(
      `Watchmode source lookup failed: ${response.status} ${response.statusText} - ${JSON.stringify(
        body
      )}`
    );
    return [];
  }

  const sources = await response.json();

  if (!Array.isArray(sources)) {
    return [];
  }

  const freeSources = sources
    .filter((source) => isFreeSource(source))
    .map((source) => source.web_url)
    .filter(Boolean);

  // Return unique URLs in original order, limited to five.
  return [...new Set(freeSources)].slice(0, 5);
}

/**
 * Get pirated sources (torrent magnet links) for a movie
 * Legal under Swiss law for personal use
 */
async function getPiratedSources(title, year) {
  if (process.env.NODE_ENV === 'test') {
    return [];
  }

  try {
    const searchQuery = year ? `${title} ${year}` : title;
    const torrents = await TorrentSearchApi.search(searchQuery, 'Movies', 10);

    if (!torrents || torrents.length === 0) {
      return [];
    }

    const magnetLinks = [];
    for (let i = 0; i < Math.min(5, torrents.length); i++) {
      try {
        const magnet = await TorrentSearchApi.getMagnet(torrents[i]);
        if (magnet) {
          magnetLinks.push({
            title: torrents[i].title,
            magnet: magnet,
            size: torrents[i].size || 'N/A',
            seeds: torrents[i].seeds || 0,
            peers: torrents[i].peers || 0,
            provider: torrents[i].provider,
          });
        }
      } catch (err) {
        console.warn(`Failed to get magnet for torrent ${i}:`, err.message);
      }
    }

    return magnetLinks;
  } catch (error) {
    console.warn('Torrent search error:', error.message);
    return [];
  }
}

/**
 * Produce a short set of AI highlights in the user's regional language using Groq.
 */
async function getAiHighlights(movieData) {
  const groqClient = getGroqClient();
  if (!groqClient) {
    console.warn('GROQ client unavailable; skipping AI highlights.');
    return [];
  }

  try {
    const completion = await groqClient.chat.completions.create({
      model: 'llama3-8b-8192',
      temperature: 0.6,
      max_tokens: 180,
      messages: [
        {
          role: 'system',
          content:
            'You are a movie concierge that responds in Serbian using short bullet-like lines without numbering.',
        },
        {
          role: 'user',
          content: [
            `Naslov: ${movieData.title}`,
            `Godina: ${movieData.year ?? 'nepoznata'}`,
            `Tip: ${movieData.media_type === 'tv' ? 'serija' : 'film'}`,
            `Opis: ${movieData.description || 'Nema opisa'}`,
            movieData.reference_url
              ? `Referenca: ${movieData.reference_url}`
              : 'Referenca: nema dostupne reference',
            'Pripremi do tri kratke preporuke ili zanimljivosti za gledaoce.',
          ].join('\n'),
        },
      ],
    });

    const aiText = completion.choices?.[0]?.message?.content || '';
    return aiText
      .split('\n')
      .map((line) => line.replace(/^[\-\*\d\.\s]+/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, 3);
  } catch (error) {
    console.warn('Groq AI highlights failed:', error.message);
    return [];
  }
}

/**
 * Identify if a Watchmode source entry counts as a free source.
 */
function isFreeSource(source) {
  if (!source) {
    return false;
  }

  const type = (source.type || '').toLowerCase();
  const price = source.price ?? source.hd_price ?? null;

  return type === 'free' || type === 'tve' || price === 0;
}

function buildEmptyResponse(title) {
  return {
    naziv: title,
    godina: null,
    opis: '',
    poster_url: '',
    tip: null,
    reference_tmdb_id: null,
    reference_url: '',
    alternativni_rezultati: [],
    top5_besplatno: [],
    top5_piratizovano: [],
    ai_pregled: [],
  };
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return { error: 'Unable to parse JSON body.' };
  }
}

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Movie API server listening on port ${port}`);
  });
}

module.exports = app;
