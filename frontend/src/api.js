import { apiClient } from './apiClient';

function buildFilterParams(filters = {}) {
  const params = {};
  if (!filters) {
    return params;
  }

  if (filters.genre) {
    params.genre = Array.isArray(filters.genre)
      ? filters.genre.join(',')
      : filters.genre;
  }
  if (filters.year) {
    params.year = filters.year;
  }
  if (filters.rating) {
    params.rating = filters.rating;
  }
  if (filters.actor) {
    params.actor = filters.actor;
  }
  if (filters.director) {
    params.director = filters.director;
  }
  if (filters.mediaType) {
    params.mediaType = filters.mediaType;
  }

  return params;
}

function handleApiError(error, fallbackMessage) {
  const message =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    fallbackMessage;
  const err = new Error(message);
  err.status = error?.response?.status;
  throw err;
}

export async function searchMovies(title, filters = {}) {
  try {
    const params = buildFilterParams(filters);
    const path = title
      ? `/api/movies/search/${encodeURIComponent(title)}`
      : '/api/movies/search';
    const { data } = await apiClient.get(path, { params });
    return data;
  } catch (error) {
    handleApiError(error, 'Neuspešna pretraga filmova.');
  }
}

export async function getTrendingTop3(params = {}) {
  try {
    const { period = 'day', lang = 'sr' } = params;
    const query = { period, lang };
    const { data } = await apiClient.get('/api/trending/top3', { params: query });
    return data;
  } catch (error) {
    handleApiError(error, 'Ne možemo da učitamo trending sadržaj.');
  }
}

export async function getTvSchedule(params = {}) {
  try {
    const { country = 'RS', date } = params;
    const query = { country };
    if (date) {
      query.date = date;
    }
    const { data } = await apiClient.get('/api/tv/schedule', { params: query });
    return data;
  } catch (error) {
    handleApiError(error, 'Ne možemo da učitamo TV raspored.');
  }
}

export async function getDisclaimer() {
  try {
    const { data } = await apiClient.get('/api/disclaimer');
    return data;
  } catch (error) {
    handleApiError(error, 'Disclaimer nije dostupan.');
  }
}

export async function registerUser(payload) {
  try {
    const { data } = await apiClient.post('/api/auth/register', payload);
    return data;
  } catch (error) {
    handleApiError(error, 'Registracija nije uspela.');
  }
}

export async function loginUser(payload) {
  try {
    const { data } = await apiClient.post('/api/auth/login', payload);
    return data;
  } catch (error) {
    handleApiError(error, 'Prijava nije uspela.');
  }
}

export async function fetchCurrentUser() {
  try {
    const { data } = await apiClient.get('/api/auth/me');
    return data;
  } catch (error) {
    handleApiError(error, 'Verifikacija korisnika nije uspela.');
  }
}

export async function getWatchlist() {
  try {
    const { data } = await apiClient.get('/api/watchlist');
    return data;
  } catch (error) {
    handleApiError(error, 'Neuspešno učitavanje watchliste.');
  }
}

export async function addWatchlistItem(payload) {
  try {
    const { data } = await apiClient.post('/api/watchlist', payload);
    return data;
  } catch (error) {
    handleApiError(error, 'Dodavanje na watchlistu nije uspelo.');
  }
}

export async function removeWatchlistItem(tmdbId) {
  try {
    const { data } = await apiClient.delete(`/api/watchlist/${tmdbId}`);
    return data;
  } catch (error) {
    handleApiError(error, 'Uklanjanje sa watchliste nije uspelo.');
  }
}

export async function fetchPricing(tmdbId, mediaType) {
  try {
    const { data } = await apiClient.get(`/api/movies/pricing/${tmdbId}`, {
      params: { mediaType },
    });
    return data;
  } catch (error) {
    handleApiError(error, 'Neuspešno preuzimanje cena i dostupnosti.');
  }
}

export async function fetchRecommendations(payload = {}) {
  try {
    const { data } = await apiClient.post('/api/recommendations', payload);
    return data;
  } catch (error) {
    handleApiError(error, 'AI preporuke nisu dostupne.');
  }
}

export async function purchaseTokens(payload) {
  try {
    const { data } = await apiClient.post('/api/billing/purchase', payload);
    return data;
  } catch (error) {
    handleApiError(error, 'Kupovina tokena nije uspela.');
  }
}
