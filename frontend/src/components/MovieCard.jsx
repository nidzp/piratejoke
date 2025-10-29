import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { fetchPricing } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function MovieCard({ movie, onRequireAuth }) {
  const {
    naziv,
    godina,
    opis,
    poster_url: posterUrl,
    tip,
    reference_tmdb_id: tmdbId,
    reference_url: referenceUrl,
    alternativni_rezultati: alternatives = [],
    top5_besplatno: freeLinks = [],
    top5_piratizovano: torrentLinks = [],
    ai_pregled: aiHighlights = [],
  } = movie;

  const mediaType = tip === 'tv' ? 'tv' : 'movie';

  const { user, isInWatchlist, addToWatchlist, removeFromWatchlist, updateTokenBalance } =
    useAuth();

  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricingState, setPricingState] = useState({
    loading: false,
    providers: [],
    error: null,
    loaded: false,
  });

  const isSaved = useMemo(() => isInWatchlist(tmdbId), [isInWatchlist, tmdbId]);

  const handleWatchlistToggle = async () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }

    try {
      if (isSaved) {
        await removeFromWatchlist({ tmdbId, title: naziv });
      } else {
        await addToWatchlist({
          tmdbId,
          title: naziv,
          mediaType,
          posterUrl,
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loadPricing = async () => {
    if (!user) {
      onRequireAuth?.();
      return;
    }

    if (pricingState.loaded || pricingState.loading) {
      return;
    }

    setPricingState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchPricing(tmdbId, mediaType);
      setPricingState({
        providers: response.providers || [],
        loading: false,
        error: null,
        loaded: true,
      });
      if (typeof response.tokens === 'number') {
        updateTokenBalance(response.tokens);
      }
    } catch (error) {
      setPricingState({
        providers: [],
        loading: false,
        error: error.message,
        loaded: true,
      });
      toast.error(error.message);
    }
  };

  const togglePricing = () => {
    setPricingOpen((prev) => {
      const next = !prev;
      if (next) {
        loadPricing();
      }
      return next;
    });
  };

  const friendlyType = mediaType === 'tv' ? 'Serija' : 'Film';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-effect rounded-2xl overflow-hidden shadow-2xl border border-gray-800 hover:border-neon-orange transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/3 relative overflow-hidden bg-cyber-gray">
          {posterUrl ? (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={posterUrl}
              alt={`${naziv} poster`}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-cyber-gray text-6xl text-neon-orange">
              dYZƎ
            </div>
          )}

          {godina && (
            <div className="absolute top-4 right-4 bg-neon-orange text-black font-bold px-4 py-2 rounded-full shadow-neon-sm">
              {godina}
            </div>
          )}
        </div>

        <div className="lg:w-2/3 p-6 lg:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neon-orange mb-2 glow-text-sm">
                {naziv}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                <span className="px-3 py-1 rounded-full border border-neon-orange/60 text-neon-orange/90 uppercase tracking-wide">
                  {friendlyType}
                </span>
                {tmdbId && (
                  <span className="px-3 py-1 rounded-full border border-gray-700">
                    TMDB ID: {tmdbId}
                  </span>
                )}
                {referenceUrl && (
                  <a
                    href={referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-full border border-blue-500/60 text-blue-300 hover:text-blue-200 transition-colors"
                  >
                    Otvori na TMDB
                  </a>
                )}
              </div>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWatchlistToggle}
              className={`self-start px-4 py-2 rounded-full border ${
                isSaved
                  ? 'border-cyan-500 text-cyan-300 hover:bg-cyan-500/10'
                  : 'border-neon-orange text-neon-orange hover:bg-neon-orange/10'
              } transition`}
            >
              {isSaved ? 'Ukloni sa watchliste' : 'Dodaj na watchlistu'}
            </motion.button>
          </div>

          <p className="text-gray-300 leading-relaxed">
            {opis || 'Nema dostupnog opisa za ovaj naslov.'}
          </p>

          {aiHighlights.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg">
              <h3 className="font-bold text-xl text-purple-400 mb-3 flex items-center gap-2">
                <span>⚡</span> AI pregled (Groq)
              </h3>
              <ul className="space-y-2">
                {aiHighlights.map((highlight, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2 text-purple-200"
                  >
                    <span className="text-purple-400 mt-1">✶</span>
                    <span>{highlight}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={togglePricing}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10 transition"
            >
              <span>Pricing & Dostupnost</span>
              <span>{pricingOpen ? '−' : '+'}</span>
            </button>
            <AnimatePresence>
              {pricingOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3">
                    {pricingState.loading && (
                      <p className="text-sm text-gray-400 animate-pulse">
                        Učitavamo ponude i trošimo 1 token...
                      </p>
                    )}
                    {pricingState.error && (
                      <p className="text-sm text-red-400">{pricingState.error}</p>
                    )}
                    {!pricingState.loading && !pricingState.error && (
                      <ul className="space-y-2">
                        {pricingState.providers.map((provider, idx) => (
                          <li key={`${provider.provider_name}-${idx}`}>
                            <a
                              href={provider.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col sm:flex-row sm:items-center gap-2 glass-effect px-4 py-3 rounded-lg border border-cyan-500/30 hover:border-cyan-400 transition"
                            >
                              <div className="flex-1">
                                <p className="text-cyan-200 font-semibold">
                                  {provider.provider_name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Tip: {provider.type} • Kvalitet: {provider.quality || 'n/a'}
                                </p>
                              </div>
                              <span className="text-sm text-gray-300">
                                {provider.price != null
                                  ? `${provider.price} ${provider.currency || 'USD'}`
                                  : 'Cena prema platformi'}
                              </span>
                            </a>
                          </li>
                        ))}
                        {pricingState.providers.length === 0 && (
                          <p className="text-sm text-gray-400">
                            Trenutno nemamo tačne podatke, prikazujemo kreativni stub.
                          </p>
                        )}
                      </ul>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {alternatives.length > 0 && (
            <div>
              <h3 className="font-bold text-xl text-cyan-400 mb-3">Povezani rezultati</h3>
              <ul className="space-y-2">
                {alternatives.map((item) => (
                  <motion.li
                    key={`${item.media_type}-${item.tmdb_id}`}
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ type: 'spring', stiffness: 260 }}
                  >
                    <a
                      href={item.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 glass-effect px-4 py-3 rounded-lg hover:bg-cyan-900/20 hover:border-cyan-400 border border-transparent transition-all duration-200 group"
                    >
                      <span className="text-cyan-300 group-hover:text-cyan-100 flex-1">
                        {item.title} ({item.year || 'n/a'})
                      </span>
                      <span className="text-xs text-gray-500 uppercase">
                        {item.media_type === 'tv' ? 'serija' : 'film'}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="font-bold text-xl text-green-400 mb-3">Besplatni streaming linkovi</h3>
              {freeLinks.length > 0 ? (
                <ul className="space-y-2">
                  {freeLinks.slice(0, 5).map((link, idx) => {
                    const href = typeof link === 'string' ? link : link?.url;
                    const name =
                      typeof link === 'string' ? `Link #${idx + 1}` : link?.name || 'Streaming link';
                    const typeLabel =
                      typeof link === 'string' ? 'free' : link?.type || 'free';
                    return (
                      <motion.li key={idx} whileHover={{ scale: 1.02, x: 5 }}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 glass-effect px-4 py-3 rounded-lg hover:bg-green-900/20 hover:border-green-500 border border-transparent transition-all duration-200 group"
                        >
                          <span className="text-green-400 font-mono text-sm">#{idx + 1}</span>
                          <span className="text-green-300 group-hover:text-green-200 flex-1">
                            {name}
                          </span>
                          <span className="text-xs text-gray-500 uppercase">{typeLabel}</span>
                        </a>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <div className="glass-effect px-4 py-3 rounded-lg border border-gray-700 text-center text-gray-500">
                  Nema dostupnih besplatnih linkova
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-xl text-neon-orange mb-3">Torrent linkovi (magnet)</h3>
              {torrentLinks.length > 0 ? (
                <ul className="space-y-2">
                  {torrentLinks.slice(0, 5).map((link, idx) => (
                    <motion.li key={idx} whileHover={{ scale: 1.02, x: 5 }}>
                      <a
                        href={link.magnet}
                        className="flex flex-col glass-effect px-4 py-3 rounded-lg hover:bg-orange-900/20 hover:border-neon-orange border border-transparent transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-neon-orange font-mono text-sm">#{idx + 1}</span>
                          <span className="text-orange-300 group-hover:text-orange-200 flex-1 truncate">
                            {link.title || 'Torrent link'}
                          </span>
                        </div>
                        <div className="flex gap-4 ml-8 text-xs text-gray-500 flex-wrap">
                          {link.size && <span>Veličina: {link.size}</span>}
                          {link.seeds !== undefined && (
                            <span className="text-green-400">Seed: {link.seeds}</span>
                          )}
                          {link.peers !== undefined && (
                            <span className="text-blue-400">Peer: {link.peers}</span>
                          )}
                          {link.provider && (
                            <span className="text-purple-400">Izvor: {link.provider}</span>
                          )}
                        </div>
                      </a>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="glass-effect px-4 py-3 rounded-lg border border-gray-700 text-center text-gray-500">
                  Nema dostupnih torrent linkova
                </div>
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg text-xs text-yellow-200"
          >
            <strong>Legal notice:</strong> Torrent linkovi su legalni za ličnu upotrebu u određenim
            državama. Proverite lokalne zakone pre preuzimanja.
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default MovieCard;
