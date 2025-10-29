import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GENRES } from '../constants/genres.js';

const ratingOptions = ['', 5, 6, 7, 8, 9];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1979 }, (_, idx) => currentYear - idx);

function SearchBar({ onSearch, loading, filters = {}, onFiltersChange }) {
  const [query, setQuery] = useState('');
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const submitDisabled = useMemo(
    () => loading || (!query.trim() && !Object.values(localFilters).some(Boolean)),
    [loading, query, localFilters]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  const handleFilterChange = (name, value) => {
    const sanitized = value || undefined;
    const nextFilters = { ...localFilters, [name]: sanitized };
    setLocalFilters(nextFilters);
    onFiltersChange?.(nextFilters);
  };

  const resetFilters = () => {
    const cleared = {
      genre: undefined,
      year: undefined,
      rating: undefined,
      actor: '',
      director: '',
    };
    setLocalFilters(cleared);
    onFiltersChange?.(cleared);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative max-w-5xl mx-auto space-y-6"
    >
      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            className="w-full glass-effect text-neon-orange placeholder-gray-500 rounded-full py-4 px-6 text-lg focus:outline-none focus:border-neon-orange focus:shadow-neon-sm transition-all duration-300"
            placeholder="Unesite naziv filma ili serije..."
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              if (!value.trim()) {
                onSearch('');
              }
            }}
          />
        </div>

        <motion.button
          type="submit"
          disabled={submitDisabled}
          whileHover={submitDisabled ? {} : { scale: 1.02 }}
          whileTap={submitDisabled ? {} : { scale: 0.97 }}
          className="w-full lg:w-auto glass-effect border border-neon-orange/70 bg-neon-orange/90 text-black font-semibold rounded-full px-6 py-3 text-lg shadow-neon-sm flex items-center justify-center gap-2 transition-all duration-200 hover:bg-neon-orange hover:text-black disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && (
            <span className="inline-block w-5 h-5 border-4 border-t-black border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          )}
          <span>{loading ? 'Pretraga...' : 'Pretraži'}</span>
        </motion.button>
      </form>

      <div className="glass-effect border border-gray-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-200">
        <div className="flex flex-col">
          <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Žanr</label>
          <select
            value={localFilters.genre ?? ''}
            onChange={(event) => handleFilterChange('genre', event.target.value)}
            className="rounded-lg bg-black/40 border border-gray-700 py-2 px-3 focus:outline-none focus:border-neon-orange"
          >
            {GENRES.map((genre) => (
              <option key={genre.id || 'all'} value={genre.id}>
                {genre.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Godina</label>
          <select
            value={localFilters.year ?? ''}
            onChange={(event) => handleFilterChange('year', event.target.value)}
            className="rounded-lg bg-black/40 border border-gray-700 py-2 px-3 focus:outline-none focus:border-neon-orange"
          >
            <option value="">Sve godine</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Minimalna ocena</label>
          <select
            value={localFilters.rating ?? ''}
            onChange={(event) => handleFilterChange('rating', event.target.value)}
            className="rounded-lg bg-black/40 border border-gray-700 py-2 px-3 focus:outline-none focus:border-neon-orange"
          >
            <option value="">Sve ocene</option>
            {ratingOptions
              .filter((option) => option !== '')
              .map((rating) => (
                <option key={rating} value={rating}>
                  {rating}+
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Glumac</label>
          <input
            type="text"
            value={localFilters.actor ?? ''}
            onChange={(event) => handleFilterChange('actor', event.target.value)}
            className="rounded-lg bg-black/40 border border-gray-700 py-2 px-3 focus:outline-none focus:border-neon-orange"
            placeholder="npr. Keanu Reeves"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Režiser</label>
          <input
            type="text"
            value={localFilters.director ?? ''}
            onChange={(event) => handleFilterChange('director', event.target.value)}
            className="rounded-lg bg-black/40 border border-gray-700 py-2 px-3 focus:outline-none focus:border-neon-orange"
            placeholder="npr. Christopher Nolan"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs text-gray-400 hover:text-neon-orange transition underline"
          >
            Resetuj filtere
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default SearchBar;
