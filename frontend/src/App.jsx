import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import AuthModal from './components/AuthModal.jsx';
import TokenModal from './components/TokenModal.jsx';
import Loader from './components/Loader.jsx';
import Home from './pages/Home.jsx';
import Watchlist from './pages/Watchlist.jsx';
import { useAuth } from './context/AuthContext.jsx';

function App() {
  const { initializing, user } = useAuth();
  const location = useLocation();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleRequireAuth = () => openAuthModal('login');

  const handleOpenTokens = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setTokenModalOpen(true);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-black via-black to-cyber-gray text-gray-200">
      <Header
        onLoginClick={() => openAuthModal('login')}
        onRegisterClick={() => openAuthModal('register')}
        onOpenTokens={handleOpenTokens}
      />

      <AnimatePresence mode="wait">
        <motion.div key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home onRequireAuth={handleRequireAuth} />} />
            <Route path="/watchlist" element={<Watchlist onRequireAuth={handleRequireAuth} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <AuthModal
        isOpen={authModalOpen}
        mode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSwitchMode={(mode) => setAuthMode(mode)}
      />

      <TokenModal isOpen={tokenModalOpen} onClose={() => setTokenModalOpen(false)} />
    </div>
  );
}

export default App;
