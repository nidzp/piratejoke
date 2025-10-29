const db = require('../db');

function mapWatchlistRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    tmdbId: row.tmdb_id,
    title: row.title,
    mediaType: row.media_type,
    posterUrl: row.poster_url,
    addedAt: row.added_at,
  };
}

function getWatchlist(userId) {
  const rows = db
    .prepare(
      `
      SELECT id, user_id, tmdb_id, title, media_type, poster_url, added_at
      FROM watchlists
      WHERE user_id = ?
      ORDER BY added_at DESC
    `
    )
    .all(userId);

  return rows.map(mapWatchlistRow);
}

function addToWatchlist({ userId, tmdbId, title, mediaType, posterUrl }) {
  const stmt = db.prepare(
    `
      INSERT INTO watchlists (user_id, tmdb_id, title, media_type, poster_url)
      VALUES (@userId, @tmdbId, @title, @mediaType, @posterUrl)
      ON CONFLICT(user_id, tmdb_id) DO UPDATE SET
        title = excluded.title,
        media_type = excluded.media_type,
        poster_url = excluded.poster_url,
        added_at = CURRENT_TIMESTAMP
      RETURNING *
    `
  );

  const row = stmt.get({ userId, tmdbId, title, mediaType, posterUrl });
  return mapWatchlistRow(row);
}

function removeFromWatchlist({ userId, tmdbId }) {
  const result = db
    .prepare('DELETE FROM watchlists WHERE user_id = ? AND tmdb_id = ?')
    .run(userId, tmdbId);

  return result.changes > 0;
}

function isInWatchlist({ userId, tmdbId }) {
  const row = db
    .prepare(
      'SELECT id FROM watchlists WHERE user_id = ? AND tmdb_id = ? LIMIT 1'
    )
    .get(userId, tmdbId);

  return Boolean(row);
}

module.exports = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
};
