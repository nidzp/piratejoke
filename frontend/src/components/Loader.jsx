import React from 'react';
import { motion } from 'framer-motion';

function Loader({ size = 'medium' }) {
  const sizeClasses = {
    small: 'w-8 h-8 border-4',
    medium: 'w-16 h-16 border-4',
    large: 'w-24 h-24 border-8'
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizeClasses[size]} border-t-neon-orange border-r-transparent border-b-transparent border-l-transparent rounded-full`}
        style={{ 
          filter: 'drop-shadow(0 0 10px #ff6b35)' 
        }}
      />
      
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-neon-orange glow-text-sm font-semibold"
      >
        Učitavanje...
      </motion.p>
    </div>
  );
}

export default Loader;
