const tmdbService = require('../services/tmdbService');
const watchmodeService = require('../services/watchmodeService');
const torrentService = require('../services/torrentService');

/**
 * Search for a movie and return streaming sources
 * GET /api/movies/search/:title
 */
exports.searchMovie = async (req, res) => {
    const title = req.params.title;

    try {
        // 1. Fetch movie details from TMDB by title
        const movieData = await tmdbService.searchMovieOnTMDB(title);
        
        if (!movieData) {
            // If no movie found, return empty fields
            return res.json({
                naziv: title,
                godina: null,
                opis: "",
                poster_url: "",
                top5_besplatno: [],
                top5_piratizovano: []
            });
        }

        // 2. Get top 5 free streaming sources from Watchmode (parallel execution)
        // 3. Get top 5 pirated sources (torrent magnet links)
        const [freeSources, piratedSources] = await Promise.all([
            watchmodeService.getFreeSources(movieData.id, movieData.title).catch(err => {
                console.error('Watchmode error:', err.message);
                return [];
            }),
            torrentService.getPiratedSources(movieData.title, movieData.year).catch(err => {
                console.error('Torrent search error:', err.message);
                return [];
            })
        ]);

        // 4. Construct the response object with Serbian field names
        const response = {
            naziv: movieData.title,
            godina: movieData.year,
            opis: movieData.description,
            poster_url: movieData.poster_url,
            top5_besplatno: freeSources,
            top5_piratizovano: piratedSources
        };

        res.json(response);
    } catch (err) {
        console.error('Movie search error:', err);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: err.message 
        });
    }
};
