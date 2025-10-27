import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SearchBar from './components/SearchBar';
import MovieCard from './components/MovieCard';
import Loader from './components/Loader';
import { searchMovies } from './api';

function App() {
  const [query, setQuery] = useState('');
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Animated preloader pri inicijalnom mount-u
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Funkcija za pokretanje pretrage
  const handleSearch = async (searchText) => {
    setQuery(searchText);
    if (!searchText) {
      setMovie(null);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchMovies(searchText);
      setMovie(data);
    } catch (err) {
      console.error('Greška pri fetch-u:', err);
      setError('Greška pri pretrazi. Proverite da li je backend pokrenut.');
      setMovie(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial preloader
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-black via-black to-cyber-gray text-gray-200 px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-2 glow-text text-neon-orange">
          🎬 Pretraži Filmove
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Pronađi filmove i gledaj besplatno ili preuzmi torrent linkove
        </p>

        {/* SearchBar sa debouncing-om */}
        <SearchBar onSearch={handleSearch} loading={loading} />
      </motion.div>

      {/* Loading indikator tokom pretrage */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center mt-12"
        >
          <Loader />
        </motion.div>
      )}

      {/* Poruka o grešci */}
      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto mt-12"
        >
          <div className="glass-effect rounded-lg p-6 border-2 border-red-500">
            <p className="text-center text-red-400 text-lg">❌ {error}</p>
          </div>
        </motion.div>
      )}

      {/* Poruka ako nema rezultata */}
      {!loading && !error && query && movie && !movie.naziv && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto mt-12"
        >
          <div className="glass-effect rounded-lg p-6 border-2 border-yellow-500">
            <p className="text-center text-yellow-400 text-lg">
              🔍 Nema rezultata za "{query}"
            </p>
          </div>
        </motion.div>
      )}

      {/* Prikaz rezultata */}
      <AnimatePresence mode="wait">
        {!loading && movie && movie.naziv && (
          <motion.div
            key={movie.naziv}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-6xl mx-auto mt-12"
          >
            <MovieCard movie={movie} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-16 pb-8 text-gray-500 text-sm"
      >
        <p>Made with ❤️ using React, Vite & Tailwind CSS</p>
        <p className="mt-2">Legal under Swiss law 🇨🇭</p>
      </motion.footer>
    </div>
  );
}

export default App;
