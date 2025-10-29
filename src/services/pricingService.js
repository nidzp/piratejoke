const { fetchFn } = require('../utils/http');

const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

function normalizePriceEntry(entry) {
  return {
    provider_name: entry.name || entry.source || entry.display_name || 'Unknown Provider',
    type: (entry.type || entry.source_type || 'unknown').toLowerCase(),
    price: entry.price ?? entry.hd_price ?? entry.sd_price ?? null,
    currency: entry.currency || 'USD',
    quality: entry.quality || entry.format || null,
    url: entry.web_url || entry.url || null,
  };
}

async function fetchWatchmodePricing({ tmdbId, mediaType }) {
  if (!process.env.WATCHMODE_API_KEY) {
    return [];
  }

  const slug = `${mediaType}-${tmdbId}`;
  const url = new URL(`${WATCHMODE_BASE_URL}/title/${slug}/sources/`);
  url.searchParams.set('apiKey', process.env.WATCHMODE_API_KEY);

  const response = await fetchFn(url.toString());
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      `Watchmode pricing failed: ${response.status} ${response.statusText} - ${JSON.stringify(
        body
      )}`
    );
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(normalizePriceEntry)
    .filter((item) => item.url)
    .slice(0, 15);
}

function buildStubPricing(tmdbId) {
  return [
    {
      provider_name: 'Neon Stream',
      type: 'subscription',
      price: 0,
      currency: 'USD',
      quality: 'HD',
      url: `https://stream.example.com/title/${tmdbId}`,
    },
    {
      provider_name: 'CyberRent',
      type: 'rental',
      price: 3.99,
      currency: 'USD',
      quality: '4K',
      url: `https://rent.example.com/title/${tmdbId}`,
    },
  ];
}

async function getPricingForTitle({ tmdbId, mediaType = 'movie' }) {
  try {
    const entries = await fetchWatchmodePricing({ tmdbId, mediaType });
    if (!entries.length) {
      return buildStubPricing(tmdbId);
    }
    return entries;
  } catch (error) {
    console.warn('Pricing lookup failed, switching to stub data:', error.message);
    return buildStubPricing(tmdbId);
  }
}

module.exports = {
  getPricingForTitle,
};
