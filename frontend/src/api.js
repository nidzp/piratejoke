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
