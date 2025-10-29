const { getGroqClient } = require('./groqClient');
const { fetchFn } = require('../utils/http');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function resolveTitleToTmdbId(title) {
  if (!process.env.TMDB_BEARER || !title) {
    return null;
  }

  try {
    const url = new URL(`${TMDB_BASE_URL}/search/multi`);
    url.searchParams.set('query', title);
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', '1');

    const response = await fetchFn(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_BEARER}`,
        'Content-Type': 'application/json;charset=utf-8',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const first = (payload.results || []).find((item) =>
      ['movie', 'tv'].includes(item.media_type)
    );
    return first ? first.id : null;
  } catch (error) {
    console.warn('TMDB resolve failed:', error.message);
    return null;
  }
}

async function groqRecommend({ watchlist, lastSearch }) {
  const groq = getGroqClient();
  if (!groq) {
    return null;
  }

  const seedLines = [];
  if (watchlist?.length) {
    seedLines.push(
      'Watchlist:',
      ...watchlist.slice(0, 8).map(
        (item) => `- ${item.title} (${item.mediaType || 'unknown'})`
      )
    );
  }

  if (lastSearch) {
    seedLines.push(`Last search: ${lastSearch}`);
  }

  if (!seedLines.length) {
    seedLines.push('No context provided, suggest acclaimed recent titles.');
  }

  const prompt = [
    'Predlozi do pet filmova ili serija u JSON formatu.',
    'Svaka stavka mora biti objekat sa kljucevima: tmdb_id (broj ili null), title (string), explanation (string).',
    'Koristi srpski jezik za explanation, kratak opis dve recenice maksimalno.',
    'Ako ne znas TMDB ID, koristi null.',
    ...seedLines,
  ].join('\n');

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_RECOMMENDER_MODEL || 'llama3-70b-8192',
    temperature: 0.7,
    max_tokens: 600,
    messages: [
      {
        role: 'system',
        content:
          'Ti si kosmicki filmski kurator koji pise na srpskom jeziku i vraca ciste JSON odgovore bez objasnjenja.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const match = raw.match(/\[[\s\S]+\]/);
    if (!match) {
      return null;
    }
    try {
      parsed = JSON.parse(match[0]);
    } catch (err) {
      return null;
    }
  }

  if (!Array.isArray(parsed)) {
    return null;
  }

  const results = [];
  for (const item of parsed.slice(0, 5)) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const title = item.title || item.name;
    const explanation = item.explanation || item.reason || '';
    let tmdbId = item.tmdb_id || item.tmdbId || null;

    if (!tmdbId && title) {
      tmdbId = await resolveTitleToTmdbId(title);
    }

    if (!title) {
      continue;
    }

    results.push({
      tmdb_id: tmdbId,
      title,
      explanation,
    });
  }

  return results;
}

function buildStubRecommendations({ watchlist, lastSearch }) {
  const seeds = watchlist?.slice(0, 2).map((item) => item.title) || [];
  if (lastSearch) {
    seeds.push(lastSearch);
  }

  const base = seeds.length ? seeds.join(', ') : 'popularni SF naslovi';

  return [
    {
      tmdb_id: 603,
      title: 'The Matrix',
      explanation: `Ako ti se dopada ${base}, Matrix ostaje kultna cyberpunk referenca.`,
    },
    {
      tmdb_id: 27205,
      title: 'Inception',
      explanation: 'Nolanova misaona SF avantura sa snovima unutar snova.',
    },
  ];
}

async function getRecommendations(input) {
  try {
    const aiResults = await groqRecommend(input);
    if (aiResults && aiResults.length) {
      return aiResults;
    }
  } catch (error) {
    console.warn('Groq recommendation failed:', error.message);
  }

  return buildStubRecommendations(input);
}

module.exports = {
  getRecommendations,
};
