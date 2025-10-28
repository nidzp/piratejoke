import React from 'react';
import { motion } from 'framer-motion';

function MovieCard({ movie }) {
  const {
    naziv,
    godina,
    opis,
    poster_url,
    tip,
    reference_tmdb_id,
    reference_url,
    alternativni_rezultati = [],
    top5_besplatno = [],
    top5_piratizovano = [],
    ai_pregled = [],
  } = movie;

  const friendlyType = tip === 'tv' ? 'Serija' : tip === 'movie' ? 'Film' : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-effect rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800 hover:border-neon-orange transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Poster */}
        <div className="lg:w-1/3 relative overflow-hidden bg-cyber-gray">
          {poster_url ? (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              src={poster_url}
              alt={`${naziv} poster`}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-96 flex items-center justify-center bg-cyber-gray text-6xl">
              🎬
            </div>
          )}

          {godina && (
            <div className="absolute top-4 right-4 bg-neon-orange text-black font-bold px-4 py-2 rounded-full shadow-neon-sm">
              {godina}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="lg:w-2/3 p-6 lg:p-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-neon-orange mb-4 glow-text-sm">
            {naziv}
          </h2>

          {(friendlyType || reference_tmdb_id || reference_url) && (
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-400">
              {friendlyType && (
                <span className="px-3 py-1 rounded-full border border-neon-orange/60 text-neon-orange/90 uppercase tracking-wide">
                  {friendlyType}
                </span>
              )}
              {reference_tmdb_id && (
                <span className="px-3 py-1 rounded-full border border-gray-700">
                  TMDB ID: {reference_tmdb_id}
                </span>
              )}
              {reference_url && (
                <a
                  href={reference_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full border border-blue-500/60 text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Otvori referencu
                </a>
              )}
            </div>
          )}

          <p className="text-gray-300 mb-6 leading-relaxed">
            {opis || 'Nema dostupnog opisa za ovaj naslov.'}
          </p>

          {ai_pregled.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg">
              <h3 className="font-bold text-xl text-purple-400 mb-3 flex items-center gap-2">
                <span>✨</span> AI Pregled (Groq)
              </h3>
              <ul className="space-y-2">
                {ai_pregled.map((highlight, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-purple-200"
                  >
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{highlight}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {alternativni_rezultati.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-xl text-cyan-400 mb-3 flex items-center gap-2">
                <span>🔎</span> Povezani rezultati
              </h3>
              <ul className="space-y-2">
                {alternativni_rezultati.map((item) => (
                  <motion.li
                    key={`${item.media_type}-${item.tmdb_id}`}
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ type: 'spring', stiffness: 260 }}
                  >
                    <a
                      href={item.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 glass-effect px-4 py-3 rounded-lg 
                                 hover:bg-cyan-900/20 hover:border-cyan-400 border border-transparent
                                 transition-all duration-200 group"
                    >
                      {item.poster_url ? (
                        <img
                          src={item.poster_url}
                          alt={item.title}
                          loading="lazy"
                          className="w-12 h-16 object-cover rounded-md border border-gray-800 group-hover:border-cyan-400 transition-colors"
                        />
                      ) : (
                        <div className="w-12 h-16 flex items-center justify-center bg-cyber-gray rounded-md text-xl">
                          🎬
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-cyan-200 font-semibold group-hover:text-cyan-100">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.media_type === 'tv' ? 'Serija' : 'Film'}
                          {item.year ? ` • ${item.year}` : ''}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="text-cyan-300 group-hover:translate-x-1 transition-transform">
                        ➜
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-bold text-xl text-green-400 mb-3 flex items-center gap-2">
              <span>✅</span> Besplatni Streaming Linkovi
            </h3>
            {top5_besplatno.length > 0 ? (
              <ul className="space-y-2">
                {top5_besplatno.slice(0, 5).map((link, idx) => {
                  const href = typeof link === 'string' ? link : link?.url;
                  const name =
                    typeof link === 'string' ? `Link #${idx + 1}` : link?.name || 'Streaming Link';
                  const typeLabel =
                    typeof link === 'string' ? 'free' : link?.type || 'free';

                  return (
                    <motion.li
                      key={idx}
                      whileHover={{ scale: 1.02, x: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 glass-effect px-4 py-3 rounded-lg 
                                   hover:bg-green-900/20 hover:border-green-500 border border-transparent
                                   transition-all duration-200 group"
                      >
                        <span className="text-green-400 font-mono text-sm">#{idx + 1}</span>
                        <span className="text-green-300 group-hover:text-green-200 flex-1">
                          {name}
                        </span>
                        <span className="text-xs text-gray-500 uppercase">
                          {typeLabel}
                        </span>
                        <span className="text-green-400 group-hover:translate-x-1 transition-transform">
                          ➜
                        </span>
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
            <h3 className="font-bold text-xl text-neon-orange mb-3 flex items-center gap-2">
              <span>⚓</span> Torrent Linkovi (Magnet)
            </h3>
            {top5_piratizovano.length > 0 ? (
              <ul className="space-y-2">
                {top5_piratizovano.slice(0, 5).map((link, idx) => (
                  <motion.li
                    key={idx}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <a
                      href={link.magnet}
                      className="flex flex-col glass-effect px-4 py-3 rounded-lg 
                                 hover:bg-orange-900/20 hover:border-neon-orange border border-transparent
                                 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-neon-orange font-mono text-sm">#{idx + 1}</span>
                        <span className="text-orange-300 group-hover:text-orange-200 flex-1 truncate">
                          {link.title || 'Torrent Link'}
                        </span>
                        <span className="text-neon-orange group-hover:translate-x-1 transition-transform">
                          ➜
                        </span>
                      </div>
                      <div className="flex gap-4 ml-8 text-xs text-gray-500 flex-wrap">
                        {link.size && <span>📦 {link.size}</span>}
                        {link.seeds !== undefined && <span className="text-green-400">🌱 {link.seeds}</span>}
                        {link.peers !== undefined && <span className="text-blue-400">🔗 {link.peers}</span>}
                        {link.provider && <span className="text-purple-400">📡 {link.provider}</span>}
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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg text-xs text-yellow-200"
          >
            <strong>Legal notice:</strong> Torrent linkovi su legalni za ličnu upotrebu u Švajcarskoj. Proverite lokalne
            zakone pre preuzimanja.
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default MovieCard;

