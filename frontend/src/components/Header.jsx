import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/', label: 'Pretraga' },
  { to: '/watchlist', label: 'Watchlista' },
];

function Header({ onLoginClick, onRegisterClick, onOpenTokens }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/70 backdrop-blur-xl border-b border-neon-orange/30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/')}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="h-10 w-10 rounded-full border-2 border-neon-orange flex items-center justify-center text-neon-orange font-bold">
            dY
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neon-orange leading-tight">dYZƎ Hub</h1>
            <p className="text-xs text-gray-400">Cyberstream agregator</p>
          </div>
        </motion.div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm tracking-wide uppercase transition-all duration-200 ${
                  isActive ? 'text-neon-orange font-semibold' : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                type="button"
                onClick={onOpenTokens}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/60 text-cyan-200 text-xs hover:bg-cyan-500/10 transition"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-300 block" />
                Tokeni: {user.tokens ?? 0}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="glass-effect px-4 py-2 rounded-full border border-neon-orange/40 text-sm text-gray-200 hover:text-white transition flex items-center gap-2"
                >
                  <span className="font-semibold text-neon-orange">
                    {user.displayName || user.email}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 13.5 6.75 8.25l1.5-1.5L12 10.5l3.75-3.75 1.5 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-700 bg-black/90 shadow-lg overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/watchlist');
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-neon-orange/10"
                      >
                        Moja watchlista
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenTokens();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-neon-orange/10"
                      >
                        Dopuni tokene
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                      >
                        Odjava
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onLoginClick}
                className="glass-effect px-4 py-2 rounded-full border border-neon-orange/40 text-sm text-gray-200 hover:text-white transition"
              >
                Prijava
              </button>
              <button
                type="button"
                onClick={onRegisterClick}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-neon-orange text-black text-sm font-semibold hover:bg-orange-400 transition"
              >
                Kreiraj nalog
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
