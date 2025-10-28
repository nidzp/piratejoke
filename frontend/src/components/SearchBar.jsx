import React, { useState } from 'react';
import { motion } from 'framer-motion';

function SearchBar({ onSearch, loading }) {
  const [input, setInput] = useState('');

  const handleChange = (event) => {
    const value = event.target.value;
    setInput(value);

    if (value.trim() === '') {
      onSearch('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(input.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative max-w-2xl mx-auto"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4"
      >
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full glass-effect text-neon-orange placeholder-gray-500 
                       rounded-full py-4 px-6 text-lg
                       focus:outline-none focus:border-neon-orange focus:shadow-neon-sm
                       transition-all duration-300"
            placeholder="Unesite naziv filma... (npr. Inception)"
            value={input}
            onChange={handleChange}
          />
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={loading ? {} : { scale: 1.02 }}
          whileTap={loading ? {} : { scale: 0.97 }}
          className="w-full sm:w-auto glass-effect border border-neon-orange/70 bg-neon-orange/90 text-black 
                     font-semibold rounded-full px-6 py-3 text-lg shadow-neon-sm
                     flex items-center justify-center gap-2 transition-all duration-200
                     hover:bg-neon-orange hover:text-black disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && (
            <span className="inline-block w-5 h-5 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></span>
          )}
          <span>{loading ? 'Pretraga...' : 'Pretraži'}</span>
        </motion.button>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-gray-500 text-sm mt-3"
      >
        Kliknite dugme "Pretraži" ili pritisnite Enter.
      </motion.p>
    </motion.div>
  );
}

export default SearchBar;
