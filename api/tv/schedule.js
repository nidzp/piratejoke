module.exports = async function handler(req, res) {
  try {
    const country = (req.query.country || 'RS').toUpperCase();
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const url = `https://api.tvmaze.com/schedule?country=${encodeURIComponent(country)}&date=${encodeURIComponent(date)}`;
    const r = await fetch(url);
    if (!r.ok) {
      let details = {};
      try { details = await r.json(); } catch {}
      return res.status(502).json({ error: 'TVmaze neuspeh', details });
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
    console.error('TV schedule serverless error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

