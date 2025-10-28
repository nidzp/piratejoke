const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

module.exports = async function handler(req, res) {
  try {
    const title = decodeURIComponent(req.query.title || '').trim();
    if (!title) return res.status(400).json({ error: 'title param je obavezan' });

    const results = await searchTitlesOnTMDB(title);
    if (results.length === 0) return res.json(buildEmptyResponse(title));

    const primary = results[0];
    const [freeSources, aiHighlights] = await Promise.all([
      getFreeSources(primary.tmdb_id, primary.media_type).catch(() => []),
      getAiHighlights(primary).catch(() => []),
    ]);

    res.json({
      naziv: primary.title,
      godina: primary.year,
      opis: primary.description,
      poster_url: primary.poster_url,
      tip: primary.media_type,
      reference_tmdb_id: primary.tmdb_id,
      reference_url: primary.reference_url,
      alternativni_rezultati: results.slice(1),
      top5_besplatno: freeSources,
      top5_piratizovano: [], // Torrenti su onemogućeni u serverless okruženju
      ai_pregled: aiHighlights,
    });
  } catch (err) {
    console.error('movies/search error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

async function searchTitlesOnTMDB(title) {
  if (!process.env.TMDB_BEARER) {
    throw new Error('TMDB_BEARER nije definisan');
  }
  const url = new URL(`${TMDB_BASE_URL}/search/multi`);
  url.searchParams.set('query', title);
  url.searchParams.set('include_adult', 'false');
  url.searchParams.set('language', 'sr');
  url.searchParams.set('page', '1');
  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_BEARER}`,
      'Content-Type': 'application/json;charset=utf-8',
    },
  });
  if (!response.ok) {
    let body = {}; try { body = await response.json(); } catch {}
    throw new Error(`TMDB search failed: ${response.status} ${response.statusText} ${JSON.stringify(body)}`);
  }
  const payload = await response.json();
  const results = Array.isArray(payload.results) ? payload.results : [];
  return results
    .filter((item) => item && ['movie', 'tv'].includes(item.media_type || 'movie'))
    .map((item) => normalizeTmdbItem(item, title))
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeTmdbItem(item, fallbackTitle) {
  const mediaType = item.media_type === 'tv' ? 'tv' : 'movie';
  const tmdbId = item.id;
  if (!tmdbId) return null;
  const title = item.title || item.name || item.original_title || item.original_name || fallbackTitle;
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

async function getFreeSources(tmdbId, mediaType) {
  if (!process.env.WATCHMODE_API_KEY) return [];
  const watchmodeType = mediaType === 'tv' ? 'tv' : 'movie';
  const url = `${WATCHMODE_BASE_URL}/title/${watchmodeType}-${tmdbId}/sources/?apiKey=${process.env.WATCHMODE_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const sources = await response.json();
  if (!Array.isArray(sources)) return [];
  const freeSources = sources
    .filter((source) => isFreeSource(source))
    .map((source) => source.web_url)
    .filter(Boolean);
  return [...new Set(freeSources)].slice(0, 5);
}

function isFreeSource(source) {
  if (!source) return false;
  const type = (source.type || '').toLowerCase();
  const price = source.price ?? source.hd_price ?? null;
  return type === 'free' || type === 'tve' || price === 0;
}

async function getAiHighlights(movieData) {
  if (!process.env.GROQ_API_KEY) return [];
  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        temperature: 0.6,
        max_tokens: 180,
        messages: [
          { role: 'system', content: 'You are a movie concierge that responds in Serbian using short bullet-like lines without numbering.' },
          { role: 'user', content: [
            `Naslov: ${movieData.title}`,
            `Godina: ${movieData.year ?? 'nepoznata'}`,
            `Tip: ${movieData.media_type === 'tv' ? 'serija' : 'film'}`,
            `Opis: ${movieData.description || 'Nema opisa'}`,
            movieData.reference_url ? `Referenca: ${movieData.reference_url}` : 'Referenca: nema dostupne reference',
            'Pripremi do tri kratke preporuke ili zanimljivosti za gledaoce.',
          ].join('\n') }
        ]
      })
    });
    const data = await r.json();
    const aiText = data.choices?.[0]?.message?.content || '';
    return aiText
      .split('\n')
      .map((line) => line.replace(/^[\-\*\d\.\s]+/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, 3);
  } catch {
    return [];
  }
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

