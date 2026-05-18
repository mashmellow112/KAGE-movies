import React from 'react';
import { motion } from 'motion/react';
import { Film } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1, delay: 2.5 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: "easeOut",
          repeat: 1,
          repeatType: "reverse",
          repeatDelay: 0.5
        }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-6 overflow-hidden p-4">
            <img src="/favicon.png" alt="Kage-Movies" className="w-full h-full object-contain" />
          </div>
          <motion.div
             className="absolute inset-0 bg-red-600 blur-3xl opacity-20"
             animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
             transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter uppercase text-white mb-2">
          Kage-Movies
        </h1>
        <p className="text-white/50 font-mono text-xs tracking-widest uppercase">
          Cinema evolved
        </p>
      </motion.div>
    </motion.div>
  );
}
