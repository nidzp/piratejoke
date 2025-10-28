import axios from 'axios';

/**
 * Search movies from Express backend
 * @param {string} title - Movie title to search
 * @returns {Promise<Object>} Movie data with streaming sources
 */
export async function searchMovies(title) {
  try {
    const response = await axios.get(`/api/movies/search/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch movie data');
  }
}

export async function getTrendingTop3(params = {}) {
  const { period = 'day', lang = 'sr' } = params;
  const url = `/api/trending/top3?period=${encodeURIComponent(period)}&lang=${encodeURIComponent(lang)}`;
  const { data } = await axios.get(url);
  return data;
}

export async function getTvSchedule(params = {}) {
  const { country = 'RS', date } = params;
  const q = new URLSearchParams({ country, ...(date ? { date } : {}) }).toString();
  const { data } = await axios.get(`/api/tv/schedule?${q}`);
  return data;
}

export async function getDisclaimer() {
  const { data } = await axios.get('/api/disclaimer');
  return data;
}
