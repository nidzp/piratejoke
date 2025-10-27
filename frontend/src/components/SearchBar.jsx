import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState('');

  // Debounce logika: pozovemo onSearch samo nakon 500ms pauze u kucanju
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(input.trim());
    }, 500);

    return () => clearTimeout(handler);
  }, [input, onSearch]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative max-w-2xl mx-auto"
    >
      <div className="relative">
        <input
          type="text"
          className="w-full glass-effect text-neon-orange placeholder-gray-500 
                     rounded-full py-4 px-6 text-lg
                     focus:outline-none focus:border-neon-orange focus:shadow-neon-sm
                     transition-all duration-300"
          placeholder="🔍 Unesite naziv filma... (npr. Inception)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        {/* Spinner unutar inputa dok traje pretraga */}
        {loading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="border-4 border-t-neon-orange border-gray-700 rounded-full w-8 h-8 animate-spin"></div>
          </div>
        )}
        
        {/* Search icon kad nije loading */}
        {!loading && input && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <span className="text-neon-orange text-2xl">🎬</span>
          </div>
        )}
      </div>
      
      {/* Helpful hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-gray-500 text-sm mt-3"
      >
        Automatska pretraga posle 500ms pauze
      </motion.p>
    </motion.div>
  );
}

export default SearchBar;
