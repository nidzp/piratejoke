const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { addTokens } = require('../services/userService');
const { recordBillingEvent } = require('../services/billingService');

const router = express.Router();

const TOKEN_PACKAGES = {
  starter: { tokens: 25, price: 4.99, currency: 'USD', label: 'Starter pack' },
  binge: { tokens: 60, price: 9.99, currency: 'USD', label: 'Binge pack' },
  pro: { tokens: 150, price: 19.99, currency: 'USD', label: 'Pro pack' },
};

router.post('/purchase', requireAuth, (req, res) => {
  const { packageId = 'starter', mock = true } = req.body || {};
  const pack = TOKEN_PACKAGES[packageId];

  if (!pack) {
    return res.status(400).json({ error: 'Nepoznat paket tokena.' });
  }

  // Stripe integration placeholder - currently mocked for MVP
  const provider = mock ? 'mock' : 'stripe-test';

  const newBalance = addTokens(req.user.id, pack.tokens);
  recordBillingEvent({
    userId: req.user.id,
    provider,
    providerReference: mock ? `mock-${Date.now()}` : null,
    tokens: pack.tokens,
    amount: Math.round(pack.price * 100),
    currency: pack.currency,
  });

  res.json({
    success: true,
    tokens: newBalance,
    package: {
      id: packageId,
      ...pack,
    },
  });
});

module.exports = router;
