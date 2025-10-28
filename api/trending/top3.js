const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

module.exports = async function handler(req, res) {
  try {
    if (!process.env.TMDB_BEARER) {
      return res.status(400).json({ error: 'TMDB_BEARER nije postavljen' });
    }
    const period = req.query.period === 'week' ? 'week' : 'day';
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
      fetch(movieUrl, { headers }),
      fetch(tvUrl, { headers }),
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
    console.error('Trending serverless error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

