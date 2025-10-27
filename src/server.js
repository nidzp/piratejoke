const express = require('express');
const GroqSDK = require('groq-sdk');
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

// GET /api/movies/search/:title - Search movie details + legal streaming metadata
app.get('/api/movies/search/:title', async (req, res) => {
  const title = req.params.title;

  try {
    const movieData = await searchMovieOnTMDB(title);
    if (!movieData) {
      return res.json(buildEmptyResponse(title));
    }

    const freeSources = await getFreeSources(movieData.id);
    const aiHighlights = await getAiHighlights(movieData);

    res.json({
      naziv: movieData.title,
      godina: movieData.year,
      opis: movieData.description,
      poster_url: movieData.poster_url,
      top5_besplatno: freeSources,
      ai_pregled: aiHighlights,
    });
  } catch (error) {
    console.error('Error handling movie search request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Fetch movie details from TMDB using the provided title.
 * Returns a normalized data object or null if no match is found.
 */
async function searchMovieOnTMDB(title) {
  if (!process.env.TMDB_BEARER) {
    throw new Error('TMDB_BEARER is not defined in environment variables.');
  }

  const url = new URL(`${TMDB_BASE_URL}/search/movie`);
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
  const firstResult = payload.results?.[0];

  if (!firstResult) {
    return null;
  }

  const releaseYear = firstResult.release_date
    ? Number.parseInt(firstResult.release_date.substring(0, 4), 10)
    : null;

  return {
    id: firstResult.id,
    title: firstResult.title || firstResult.original_title || title,
    year: Number.isFinite(releaseYear) ? releaseYear : null,
    description: firstResult.overview || '',
    poster_url: firstResult.poster_path
      ? `${TMDB_IMAGE_BASE}${firstResult.poster_path}`
      : '',
  };
}

/**
 * Query Watchmode for free streaming sources available for the TMDB movie ID.
 * Returns up to five unique URLs of legal free providers.
 */
async function getFreeSources(tmdbId) {
  if (!process.env.WATCHMODE_API_KEY) {
    throw new Error(
      'WATCHMODE_API_KEY is not defined in environment variables.'
    );
  }

  const url = `${WATCHMODE_BASE_URL}/title/movie-${tmdbId}/sources/?apiKey=${process.env.WATCHMODE_API_KEY}`;

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
            `Opis: ${movieData.description || 'Nema opisa'}`,
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
    top5_besplatno: [],
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
