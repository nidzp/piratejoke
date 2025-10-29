const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} = require('../services/watchlistService');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const items = getWatchlist(req.user.id);
  res.json({ items });
});

router.get('/:tmdbId', requireAuth, (req, res) => {
  const { tmdbId } = req.params;
  const present = isInWatchlist({ userId: req.user.id, tmdbId });
  res.json({ inWatchlist: present });
});

router.post('/', requireAuth, (req, res) => {
  const { tmdbId, title, mediaType, posterUrl } = req.body || {};
  if (!tmdbId || !title || !mediaType) {
    return res
      .status(400)
      .json({ error: 'tmdbId, title i mediaType su obavezna polja.' });
  }

  try {
    const item = addToWatchlist({
      userId: req.user.id,
      tmdbId: String(tmdbId),
      title,
      mediaType,
      posterUrl: posterUrl || null,
    });
    res.status(201).json({ item });
  } catch (error) {
    console.error('Watchlist insert failed:', error);
    res.status(500).json({ error: 'Unable to update watchlist' });
  }
});

router.delete('/:tmdbId', requireAuth, (req, res) => {
  const { tmdbId } = req.params;
  if (!tmdbId) {
    return res.status(400).json({ error: 'tmdbId is required' });
  }

  const removed = removeFromWatchlist({
    userId: req.user.id,
    tmdbId,
  });

  if (!removed) {
    return res.status(404).json({ error: 'Entry not found in watchlist' });
  }

  res.json({ success: true });
});

module.exports = router;
