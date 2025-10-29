const db = require('../db');

function recordBillingEvent({
  userId,
  provider,
  providerReference = null,
  tokens,
  amount = null,
  currency = null,
}) {
  db.prepare(
    `
      INSERT INTO billing_events (user_id, provider, provider_reference, tokens, amount, currency)
      VALUES (@userId, @provider, @providerReference, @tokens, @amount, @currency)
    `
  ).run({ userId, provider, providerReference, tokens, amount, currency });
}

module.exports = {
  recordBillingEvent,
};
