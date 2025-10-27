const axios = require('axios');

const WATCHMODE_BASE_URL = 'https://api.watchmode.com/v1';

/**
 * Get free streaming sources from Watchmode for a given TMDB movie ID
 * @param {number} tmdbId - TMDB movie ID
 * @param {string} movieTitle - Movie title (fallback for search)
 * @returns {Array} Array of up to 5 free streaming source URLs
 */
async function getFreeSources(tmdbId, movieTitle) {
    try {
        // First, search for the movie on Watchmode to get Watchmode ID
        const searchResponse = await axios.get(`${WATCHMODE_BASE_URL}/search/`, {
            params: {
                apiKey: process.env.WATCHMODE_API_KEY,
                search_field: 'name',
                search_value: movieTitle
            }
        });

        if (!searchResponse.data.title_results || searchResponse.data.title_results.length === 0) {
            console.log('No Watchmode results found for:', movieTitle);
            return [];
        }

        // Get the first matching movie
        const watchmodeId = searchResponse.data.title_results[0].id;

        // Get sources for this movie
        const sourcesResponse = await axios.get(`${WATCHMODE_BASE_URL}/title/${watchmodeId}/sources/`, {
            params: {
                apiKey: process.env.WATCHMODE_API_KEY
            }
        });

        if (!sourcesResponse.data || sourcesResponse.data.length === 0) {
            return [];
        }

        // Filter for free sources and extract URLs
        const freeSources = sourcesResponse.data
            .filter(source => {
                // Filter for free sources (type: 'free' or 'sub' with free trials)
                return source.type === 'free' || 
                       (source.type === 'sub' && source.name && 
                        (source.name.toLowerCase().includes('free') || 
                         source.name.toLowerCase().includes('tubi') ||
                         source.name.toLowerCase().includes('pluto')));
            })
            .map(source => ({
                name: source.name,
                url: source.web_url,
                type: source.type
            }))
            .slice(0, 5); // Top 5 only

        return freeSources;
    } catch (error) {
        console.error('Watchmode API error:', error.message);
        // Return empty array instead of throwing to allow graceful degradation
        return [];
    }
}

module.exports = {
    getFreeSources
};
