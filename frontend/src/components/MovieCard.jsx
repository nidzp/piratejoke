import React from 'react';
import { motion } from 'framer-motion';

function MovieCard({ movie }) {
  const { 
    naziv, 
    godina, 
    opis, 
    poster_url, 
    top5_besplatno = [], 
    top5_piratizovano = [] 
  } = movie;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="glass-effect rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-800 hover:border-neon-orange transition-all duration-300"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Poster sekcija */}
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
            <div className="w-full h-96 flex items-center justify-center bg-cyber-gray">
              <span className="text-6xl">🎬</span>
            </div>
          )}
          
          {/* Godina overlay */}
          {godina && (
            <div className="absolute top-4 right-4 bg-neon-orange text-black font-bold px-4 py-2 rounded-full shadow-neon-sm">
              {godina}
            </div>
          )}
        </div>

        {/* Sadržaj sekcija */}
        <div className="lg:w-2/3 p-6 lg:p-8">
          {/* Naslov */}
          <h2 className="text-3xl lg:text-4xl font-bold text-neon-orange mb-4 glow-text-sm">
            {naziv}
          </h2>

          {/* Opis */}
          <p className="text-gray-300 mb-6 leading-relaxed">
            {opis || 'Nema dostupnog opisa za ovaj film.'}
          </p>

          {/* Besplatni linkovi */}
          <div className="mb-6">
            <h3 className="font-bold text-xl text-green-400 mb-3 flex items-center gap-2">
              <span>✅</span> Besplatni Streaming Linkovi
            </h3>
            {top5_besplatno.length > 0 ? (
              <ul className="space-y-2">
                {top5_besplatno.slice(0, 5).map((link, idx) => (
                  <motion.li
                    key={idx}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 glass-effect px-4 py-3 rounded-lg 
                               hover:bg-green-900/20 hover:border-green-500 border border-transparent
                               transition-all duration-200 group"
                    >
                      <span className="text-green-400 font-mono text-sm">#{idx + 1}</span>
                      <span className="text-green-300 group-hover:text-green-200 flex-1">
                        {link.name || 'Streaming Link'}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">
                        {link.type || 'free'}
                      </span>
                      <span className="text-green-400 group-hover:translate-x-1 transition-transform">→</span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="glass-effect px-4 py-3 rounded-lg border border-gray-700">
                <p className="text-gray-500 text-center">❌ Nema dostupnih besplatnih linkova</p>
              </div>
            )}
          </div>

          {/* Piratski linkovi */}
          <div>
            <h3 className="font-bold text-xl text-neon-orange mb-3 flex items-center gap-2">
              <span>🏴‍☠️</span> Torrent Linkovi (Magnet)
            </h3>
            {top5_piratizovano.length > 0 ? (
              <ul className="space-y-2">
                {top5_piratizovano.slice(0, 5).map((link, idx) => (
                  <motion.li
                    key={idx}
                    whileHover={{ scale: 1.02, x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
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
                        <span className="text-neon-orange group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                      <div className="flex gap-4 ml-8 text-xs text-gray-500">
                        {link.size && <span>📦 {link.size}</span>}
                        {link.seeds !== undefined && <span className="text-green-400">🌱 {link.seeds}</span>}
                        {link.peers !== undefined && <span className="text-blue-400">👥 {link.peers}</span>}
                        {link.provider && <span className="text-purple-400">📡 {link.provider}</span>}
                      </div>
                    </a>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="glass-effect px-4 py-3 rounded-lg border border-gray-700">
                <p className="text-gray-500 text-center">❌ Nema dostupnih torrent linkova</p>
              </div>
            )}
          </div>

          {/* Legal notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg"
          >
            <p className="text-xs text-yellow-200">
              ⚠️ <strong>Legal Notice:</strong> Torrent linkovi su legalni za ličnu upotrebu u Švajcarskoj 🇨🇭. 
              Proverite lokalne zakone pre preuzimanja.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default MovieCard;
