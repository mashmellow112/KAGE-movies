import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ShoppingCart, Star, Calendar, Clock, Tag, Download } from 'lucide-react';
import { Movie } from '../types';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (movie: Movie) => void;
  onBuy: (movie: Movie) => void;
  onWatch: (movie: Movie) => void;
  isSubscribed: boolean;
}

export default function MovieDetailModal({ movie, isOpen, onClose, onDownload, onBuy, onWatch, isSubscribed }: MovieDetailModalProps) {
  if (!movie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
          >
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto">
              {/* Poster Section */}
              <div className="w-full md:w-2/5 aspect-[2/3] md:aspect-auto relative group">
                <img 
                  src={movie.posterUrl} 
                  alt={movie.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
              </div>

              {/* Content Section */}
              <div className="w-full md:w-3/5 p-6 md:p-14 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
                  {movie.genre.map(g => (
                    <span key={g} className="px-3 py-1 md:px-4 md:py-1.5 bg-white/5 rounded-lg text-[8px] md:text-[10px] font-bold tracking-[0.2em] uppercase border border-white/10 text-white/50">
                      {g}
                    </span>
                  ))}
                </div>

                <h2 className="text-3xl md:text-7xl font-black italic mb-6 md:mb-8 leading-none tracking-tighter uppercase text-stroke">
                  {movie.title}
                </h2>

                <div className="flex items-center gap-6 md:gap-10 mb-8 md:mb-10 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Star className="w-3 md:w-4 h-3 md:h-4 text-red-600 fill-red-600" />
                    <span className="text-white">{movie.rating} Rating</span>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3">
                    <Calendar className="w-3 md:w-4 h-3 md:h-4" />
                    <span>Year {movie.year}</span>
                  </div>
                </div>

                <p className="text-sm md:text-lg text-gray-400 leading-relaxed mb-10 md:mb-12 max-w-lg">
                  {movie.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button
                    onClick={() => onDownload(movie)}
                    className="flex-1 h-14 md:h-16 bg-red-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-600/20"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => onWatch(movie)}
                    className="flex-1 h-14 md:h-16 bg-white text-black rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Watch Now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
