import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchBar from '../components/SearchBar.jsx';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import {
  fetchRecommendations,
  getDisclaimer,
  getTrendingTop3,
  getTvSchedule,
  searchMovies,
} from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

function Home({ onRequireAuth }) {
  const { user, watchlist, updateTokenBalance } = useAuth();

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trending, setTrending] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [disclaimer, setDisclaimer] = useState(null);

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);
  const [recommendationsBlocked, setRecommendationsBlocked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [trendingData, scheduleData, disclaimerData] = await Promise.all([
          getTrendingTop3({ period: 'day', lang: 'sr' }).catch(() => null),
          getTvSchedule({ country: 'RS' }).catch(() => null),
          getDisclaimer().catch(() => null),
        ]);
        setTrending(trendingData);
        setSchedule(scheduleData);
        setDisclaimer(disclaimerData);
      } catch (e) {
        console.warn('Initial sections failed:', e.message);
      } finally {
        setTimeout(() => setInitialLoading(false), 800);
      }
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setRecommendations([]);
      setRecommendationsError(null);
      setRecommendationsBlocked(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && user.tokens > 0) {
      setRecommendationsBlocked(false);
    }
  }, [user?.tokens]);

  const shouldFetchRecommendations = useMemo(() => {
    if (!user) {
      return false;
    }
    if (recommendationsBlocked) {
      return false;
    }
    return Boolean(watchlist.length || movie || query);
  }, [user, watchlist.length, movie?.reference_tmdb_id, query, recommendationsBlocked]);

  useEffect(() => {
    if (!shouldFetchRecommendations) {
      return;
    }

    setRecommendationsLoading(true);
    setRecommendationsError(null);

    fetchRecommendations({
      lastSearch: query || movie?.naziv || '',
    })
      .then((response) => {
        setRecommendations(response.recommendations || []);
        if (typeof response.tokens === 'number') {
          updateTokenBalance(response.tokens);
        }
      })
      .catch((err) => {
        setRecommendations([]);
        setRecommendationsError(err.message);
        if (err.status === 402) {
          setRecommendationsBlocked(true);
        }
      })
      .finally(() => {
        setRecommendationsLoading(false);
      });
  }, [
    shouldFetchRecommendations,
    query,
    movie?.reference_tmdb_id,
    updateTokenBalance,
  ]);

  const handleSearch = async (searchText) => {
    setQuery(searchText);

    if (!searchText && !Object.values(filters).some(Boolean)) {
      setMovie(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchMovies(searchText, filters);
      if (!data?.naziv) {
        setMovie(null);
        setError('Nema rezultata za izabrani upit.');
        return;
      }
      setMovie(data);
      setError(null);
    } catch (err) {
      console.error('Greška pri pretrazi:', err);
      setError(err.message);
      setMovie(null);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-2 glow-text text-neon-orange">
          dYZƎ Cyber Pretraga
        </h1>
        <p className="text-gray-400">
          Pronađi savršen film ili seriju, proveri dostupnost i dodaj na watchlistu.
        </p>
      </motion.div>

      <SearchBar
        onSearch={handleSearch}
        loading={loading}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-12">
          <Loader />
        </motion.div>
      )}

      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto mt-12"
        >
          <div className="glass-effect rounded-lg p-6 border-2 border-red-500">
            <p className="text-center text-red-400 text-lg">{error}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!loading && movie && (
          <motion.div
            key={movie.reference_tmdb_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-6xl mx-auto mt-12"
          >
            <MovieCard movie={movie} onRequireAuth={onRequireAuth} />
          </motion.div>
        )}
      </AnimatePresence>

      <section className="max-w-6xl mx-auto mt-16">
        <div className="glass-effect border border-purple-500/40 rounded-2xl p-6 lg:p-8">
          <h2 className="text-2xl font-semibold text-purple-300 mb-4">
            Preporučeni filmovi/serije
          </h2>
          {!user && (
            <div className="text-gray-400">
              <p>
                Kreiraj nalog da otključaš AI preporuke temeljene na tvojoj watchlisti i istoriji
                pretrage.
              </p>
              <button
                type="button"
                onClick={onRequireAuth}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-neon-orange text-black font-semibold hover:bg-orange-400 transition"
              >
                Registruj se
              </button>
            </div>
          )}

          {user && (
            <div className="space-y-4">
              {recommendationsLoading && (
                <p className="text-sm text-gray-400 animate-pulse">
                  AI analiziramo tvoju watchlistu...
                </p>
              )}
              {recommendationsError && (
                <p className="text-sm text-red-400">{recommendationsError}</p>
              )}
              {!recommendationsLoading && !recommendationsError && recommendations.length === 0 && (
                <p className="text-sm text-gray-400">
                  Dodaj naslove na watchlistu ili pokreni pretragu da bismo generisali preporuke.
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {recommendations.map((item) => (
                  <div
                    key={`${item.tmdb_id || item.title}`}
                    className="glass-effect border border-purple-500/40 rounded-xl p-4 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-purple-200">{item.title}</h3>
                      {item.tmdb_id && (
                        <a
                          href={`https://www.themoviedb.org/movie/${item.tmdb_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-300 underline hover:text-purple-100"
                        >
                          TMDB
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-2">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto mt-16 grid gap-6 lg:grid-cols-3">
        <div className="glass-effect border border-cyan-500/40 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-cyan-300 mb-4">Trending top 3</h3>
          {trending ? (
            <>
              <p className="text-sm text-gray-400 uppercase">Filmovi</p>
              <ul className="space-y-2 mb-4">
                {(trending.filmovi_top3 || []).map((item) => (
                  <li key={item.id} className="text-gray-200">
                    {item.title} ({item.year || 'n/a'})
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-400 uppercase">Serije</p>
              <ul className="space-y-2">
                {(trending.serije_top3 || []).map((item) => (
                  <li key={item.id} className="text-gray-200">
                    {item.title} ({item.year || 'n/a'})
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-400 text-sm">Trenutno nema podataka.</p>
          )}
        </div>

        <div className="glass-effect border border-green-500/40 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-green-300 mb-4">TV raspored (RS)</h3>
          {schedule ? (
            <ul className="space-y-3">
              {(schedule.programi || []).slice(0, 6).map((item) => (
                <li key={`${item.kanal}-${item.vreme}`} className="text-gray-200 text-sm">
                  <span className="text-green-300">{item.vreme}</span> — {item.naziv} (
                  {item.kanal})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">Raspored nije dostupan.</p>
          )}
        </div>

        <div className="glass-effect border border-yellow-500/40 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-yellow-300 mb-4">Disclaimer</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {disclaimer?.tekst ||
              'Koristite aplikaciju odgovorno. Sadržaj se preuzima sa javnih izvora i ne garantujemo dostupnost.'}
          </p>
        </div>
      </section>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16 pb-8 text-gray-500 text-sm"
      >
        <p>© 2025. Ovaj proizvod koristi TMDB API ali nije odobren niti sertifikovan od strane TMDB.</p>
      </motion.footer>
    </div>
  );
}

export default Home;
