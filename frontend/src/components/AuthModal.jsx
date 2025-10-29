import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const modalVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

function AuthModal({ isOpen, mode = 'login', onClose, onSwitchMode }) {
  const { login, register } = useAuth();
  const [formMode, setFormMode] = useState(mode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: '', email: '', password: '' });
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (formMode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    const nextMode = formMode === 'login' ? 'register' : 'login';
    setFormMode(nextMode);
    onSwitchMode?.(nextMode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md glass-effect border border-neon-orange/40 rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neon-orange">
                {formMode === 'login' ? 'Prijava' : 'Registracija'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                ×
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {formMode === 'register' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1" htmlFor="name">
                    Ime ili nadimak
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-lg bg-black/40 border border-gray-700 px-4 py-3 text-gray-100 focus:border-neon-orange focus:outline-none"
                    placeholder="Cyber gusar"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-black/40 border border-gray-700 px-4 py-3 text-gray-100 focus:border-neon-orange focus:outline-none"
                  placeholder="nesto@piratehub.rs"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1" htmlFor="password">
                  Lozinka
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-black/40 border border-gray-700 px-4 py-3 text-gray-100 focus:border-neon-orange focus:outline-none"
                  placeholder="••••••"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full rounded-lg bg-neon-orange text-black font-semibold py-3 shadow-neon-sm hover:bg-orange-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Obrada...'
                  : formMode === 'login'
                  ? 'Prijavi se'
                  : 'Kreiraj nalog'}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400">
              {formMode === 'login' ? 'Nemaš nalog?' : 'Već imaš nalog?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-neon-orange hover:text-orange-300 transition underline"
              >
                {formMode === 'login' ? 'Registruj se' : 'Prijavi se'}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
