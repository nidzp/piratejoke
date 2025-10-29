import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const PACKAGES = [
  { id: 'starter', label: 'Starter', tokens: 25, price: '4.99 USD' },
  { id: 'binge', label: 'Binge', tokens: 60, price: '9.99 USD' },
  { id: 'pro', label: 'Pro', tokens: 150, price: '19.99 USD' },
];

function TokenModal({ isOpen, onClose }) {
  const { buyTokens } = useAuth();

  const handlePurchase = async (packageId) => {
    try {
      await buyTokens({ packageId });
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-effect w-full max-w-lg rounded-2xl border border-cyan-400/40 p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-300">Dopuna tokena</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-300 mb-4">
              Ovo je simulirana kupovina za MVP. Odaberi paket i odmah ćemo dodati tokene na tvoj nalog.
            </p>

            <div className="grid gap-4">
              {PACKAGES.map((pack) => (
                <div
                  key={pack.id}
                  className="glass-effect border border-cyan-500/40 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-cyan-200">{pack.label}</h3>
                    <p className="text-sm text-gray-400">
                      {pack.tokens} tokena • {pack.price}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handlePurchase(pack.id)}
                    className="px-4 py-2 rounded-full bg-cyan-500 text-black font-semibold shadow-lg hover:bg-cyan-400 transition"
                  >
                    Kupi
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TokenModal;
