import React from 'react';
import { Download, ShoppingCart, Star, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onDownload: (movie: Movie) => void;
  onWatch: (movie: Movie) => void;
  onClick: (movie: Movie) => void;
  onFavorite: (movie: Movie) => void;
  isFavorite: boolean;
  isPremium?: boolean;
}

export default function MovieCard({ movie, onDownload, onWatch, onClick, onFavorite, isFavorite, isPremium }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      onClick={() => onClick(movie)}
      className="group relative aspect-[2/3] rounded-2xl overflow-hidden glass-morphism shadow-2xl cursor-pointer"
    >
      <img
        src={movie.posterUrl}
        alt={movie.title}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-20 flex justify-end items-start md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 md:group-hover:bg-red-600 transition-colors duration-500">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 md:group-hover:text-white md:group-hover:fill-white font-bold" />
          <span className="text-[10px] font-black text-white">{movie.rating}</span>
        </div>
      </div>
      
      {/* Bottom Gradient - Persistent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content Area */}
      <div className="absolute inset-0 p-3 md:p-5 flex flex-col justify-end z-10">
        <div className="md:transform md:group-hover:-translate-y-2 transition-transform duration-500">
          <h3 className="text-sm md:text-lg font-black uppercase italic tracking-tighter text-white mb-0.5 line-clamp-1 md:group-hover:line-clamp-none drop-shadow-md leading-tight">
            {movie.title}
          </h3>
          <p className="text-[7px] md:text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium mb-2 md:mb-3 drop-shadow-sm">
            {movie.genre[0]} • {movie.year}
          </p>
        </div>
        
        {/* Actions - Visible on mobile, slide up on desktop hover */}
        <div className="h-8 md:h-0 md:group-hover:h-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex gap-2 overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(movie); }}
            className="flex-1 py-1.5 md:py-2 bg-red-600 text-white rounded-lg md:rounded-xl font-bold text-[8px] md:text-[10px] uppercase tracking-wider hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-1 md:gap-1.5"
          >
            <Download className="w-2.5 h-2.5 md:w-3 h-3" />
            Download
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); onWatch(movie); }}
            className="flex-1 py-1.5 md:py-2 bg-white text-black rounded-lg md:rounded-xl font-bold text-[8px] md:text-[10px] uppercase tracking-wider hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
          >
            {isPremium ? 'Watch Now' : 'Trailer'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
