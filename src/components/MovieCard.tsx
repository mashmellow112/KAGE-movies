import React from 'react';
import { Play, ShoppingCart, Star, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onBuy: (movie: Movie) => void;
  onClick: (movie: Movie) => void;
  onFavorite: (movie: Movie) => void;
  isFavorite: boolean;
}

export default function MovieCard({ movie, onPlay, onBuy, onClick, onFavorite, isFavorite }: MovieCardProps) {
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
      <div className="absolute top-3 left-3 right-3 z-20 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onFavorite(movie); }}
          className={`p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all active:scale-95 ${isFavorite ? 'bg-red-600 text-white border-red-500' : 'bg-black/60 text-white hover:bg-red-600'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>
        <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 group-hover:bg-red-600 transition-colors duration-500">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 group-hover:text-white group-hover:fill-white font-bold" />
          <span className="text-[10px] font-black text-white">{movie.rating}</span>
        </div>
      </div>
      
      {/* Bottom Gradient - Persistent */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Content Area */}
      <div className="absolute inset-0 p-4 md:p-5 flex flex-col justify-end z-10">
        <div className="transform group-hover:-translate-y-2 transition-transform duration-500">
          <h3 className="text-base md:text-lg font-black uppercase italic tracking-tighter text-white mb-0.5 line-clamp-1 group-hover:line-clamp-none drop-shadow-md">
            {movie.title}
          </h3>
          <p className="text-[8px] md:text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium mb-3 drop-shadow-sm">
            {movie.genre[0]} • {movie.year}
          </p>
        </div>
        
        {/* Actions - Slide up on hover */}
        <div className="h-0 group-hover:h-10 opacity-0 group-hover:opacity-100 transition-all duration-500 flex gap-2 overflow-hidden">
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(movie); }}
            className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-white" />
            Trailer
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); onBuy(movie); }}
            className="flex-1 py-2 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-gray-200 transition-all active:scale-95"
          >
            Get Pass
          </button>
        </div>
      </div>
    </motion.div>
  );
}
