const axios = require('axios');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

/**
 * Search TMDB for a movie by title and get basic details
 * @param {string} title - Movie title to search for
 * @returns {Object|null} Movie data object or null if not found
 */
async function searchMovieOnTMDB(title) {
    try {
        const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
            params: {
                query: title,
                language: 'en-US',
                page: 1
            },
            headers: {
                'Authorization': `Bearer ${process.env.TMDB_BEARER}`,
                'accept': 'application/json'
            }
        });

        if (!response.data.results || response.data.results.length === 0) {
            return null;
        }

        // Take the first (most relevant) result
        const movie = response.data.results[0];

        // Extract movie details
        const movieData = {
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
            description: movie.overview || '',
            poster_url: movie.poster_path 
                ? `${TMDB_IMAGE_BASE}${movie.poster_path}` 
                : ''
        };

        return movieData;
    } catch (error) {
        console.error('TMDB API error:', error.message);
        throw new Error(`Failed to search TMDB: ${error.message}`);
    }
}

module.exports = {
    searchMovieOnTMDB
};
