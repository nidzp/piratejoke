import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

function Watchlist({ onRequireAuth }) {
  const { user, watchlist, removeFromWatchlist, refreshWatchlist } = useAuth();

  useEffect(() => {
    if (user) {
      refreshWatchlist().catch((error) => console.warn('Watchlist refresh failed:', error.message));
    }
  }, [user, refreshWatchlist]);

  const handleRemove = async (item) => {
    try {
      await removeFromWatchlist({ tmdbId: item.tmdbId || item.tmdb_id, title: item.title });
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!user) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto glass-effect border border-neon-orange/40 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-semibold text-neon-orange mb-4">Watchlista je zaključana</h2>
          <p className="text-gray-300 mb-6">
            Prijavi se ili kreiraj nalog kako bi čuvao omiljene naslove i sinkronizovao ih na svim
            uređajima.
          </p>
          <button
            type="button"
            onClick={onRequireAuth}
            className="inline-flex items-center px-5 py-3 rounded-full bg-neon-orange text-black font-semibold hover:bg-orange-400 transition"
          >
            Otvori prijavu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-neon-orange mb-2">Moja watchlista</h1>
            <p className="text-gray-400">
              {watchlist.length
                ? 'Upravljaj naslovima koje pratiš i koristi ih za AI preporuke.'
                : 'Dodaj naslove iz pretrage i vrati se da ih pregledaš kasnije.'}
            </p>
          </div>
          <div className="glass-effect border border-neon-orange/40 rounded-full px-5 py-2 text-gray-200">
            Ukupno naslova: {watchlist.length}
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="glass-effect border border-gray-800 rounded-2xl p-8 text-center text-gray-300">
            Još uvek nema sačuvanih filmova ili serija. Dodaj ih putem dugmeta „Dodaj na watchlistu“
            na kartici rezultata.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {watchlist.map((item) => {
              const poster = item.posterUrl || item.poster_url;
              const mediaType = item.mediaType || item.media_type || 'movie';
              return (
                <motion.div
                  key={`${item.tmdbId || item.tmdb_id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect border border-gray-800 rounded-xl overflow-hidden flex flex-col"
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={item.title}
                      className="w-full h-60 object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-60 bg-black/60 flex items-center justify-center text-neon-orange text-2xl">
                      Bez postera
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-neon-orange mb-2">{item.title}</h3>
                    <p className="text-xs uppercase text-gray-500 mb-3">
                      {mediaType === 'tv' ? 'Serija' : 'Film'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="mt-auto inline-flex items-center justify-center rounded-full border border-red-500/60 text-red-300 hover:bg-red-500/10 px-4 py-2 text-sm transition"
                    >
                      Ukloni
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
