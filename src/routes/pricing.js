const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getPricingForTitle } = require('../services/pricingService');
const { deductTokens } = require('../services/userService');

const router = express.Router({ mergeParams: true });

router.get('/:tmdbId', requireAuth, async (req, res) => {
  const { tmdbId } = req.params;
  const mediaType = req.query.mediaType || 'movie';

  if (!tmdbId) {
    return res.status(400).json({ error: 'tmdbId is required' });
  }

  if ((req.user.tokens ?? 0) <= 0) {
    return res
      .status(402)
      .json({ error: 'Nema dovoljno tokena. Kupite paket da nastavite.' });
  }

  try {
    const providers = await getPricingForTitle({ tmdbId, mediaType });

    const deduction = deductTokens(req.user.id, 1);
    if (!deduction.success) {
      return res
        .status(402)
        .json({ error: 'Nema dovoljno tokena', balance: deduction.balance });
    }

    req.user.tokens = deduction.balance;

    res.json({
      providers,
      tokens: deduction.balance,
    });
  } catch (error) {
    console.error('Pricing route failed:', error);
    res.status(500).json({ error: 'Pricing lookup failed' });
  }
});

module.exports = router;
