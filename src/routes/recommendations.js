const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getWatchlist } = require('../services/watchlistService');
const {
  deductTokens,
  getLastSearch,
} = require('../services/userService');
const { getRecommendations } = require('../services/recommendationService');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  if ((req.user.tokens ?? 0) <= 0) {
    return res
      .status(402)
      .json({ error: 'Nema dovoljno tokena. Kupite paket da nastavite.' });
  }

  const payload = req.body || {};
  const watchlist = getWatchlist(req.user.id);
  const lastSearch = payload.lastSearch || getLastSearch(req.user.id);

  try {
    const recommendations = await getRecommendations({
      watchlist,
      lastSearch,
    });

    const deduction = deductTokens(req.user.id, 1);
    if (!deduction.success) {
      return res
        .status(402)
        .json({ error: 'Nema dovoljno tokena', balance: deduction.balance });
    }

    req.user.tokens = deduction.balance;

    res.json({
      recommendations,
      tokens: deduction.balance,
    });
  } catch (error) {
    console.error('Recommendations failed:', error);
    res.status(500).json({ error: 'AI preporuke nisu dostupne trenutno.' });
  }
});

module.exports = router;
