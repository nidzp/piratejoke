const TorrentSearchApi = require('torrent-search-api');

/**
 * Get pirated sources (torrent magnet links) for a movie
 * Legal under Swiss law for personal use
 * @param {string} title - Movie title
 * @param {number} year - Movie release year
 * @returns {Array} Array of up to 5 torrent magnet links
 */
async function getPiratedSources(title, year) {
    try {
        // Enable public torrent providers
        TorrentSearchApi.enablePublicProviders();

        // Alternatively, enable specific providers known for movies
        // Common providers: ThePirateBay, 1337x, YTS, TorrentGalaxy
        const providers = ['ThePirateBay', '1337x', 'YTS', 'TorrentGalaxy'];
        
        providers.forEach(provider => {
            try {
                TorrentSearchApi.enableProvider(provider);
            } catch (err) {
                // Provider might not be available, skip silently
            }
        });

        // Search for the movie with year for better accuracy
        const searchQuery = year ? `${title} ${year}` : title;
        const torrents = await TorrentSearchApi.search(searchQuery, 'Movies', 10);

        if (!torrents || torrents.length === 0) {
            console.log('No torrents found for:', searchQuery);
            return [];
        }

        // Get magnet links for top 5 results
        const magnetLinks = [];
        
        for (let i = 0; i < Math.min(5, torrents.length); i++) {
            try {
                const magnet = await TorrentSearchApi.getMagnet(torrents[i]);
                
                if (magnet) {
                    magnetLinks.push({
                        title: torrents[i].title,
                        magnet: magnet,
                        size: torrents[i].size || 'N/A',
                        seeds: torrents[i].seeds || 0,
                        peers: torrents[i].peers || 0,
                        provider: torrents[i].provider
                    });
                }
            } catch (err) {
                console.error(`Failed to get magnet for torrent ${i}:`, err.message);
                // Continue with next torrent
            }
        }

        return magnetLinks;
    } catch (error) {
        console.error('Torrent search error:', error.message);
        // Return empty array instead of throwing to allow graceful degradation
        return [];
    }
}

module.exports = {
    getPiratedSources
};
