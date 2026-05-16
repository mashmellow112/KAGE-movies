import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Volume2, Settings, SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { Movie } from '../types';

interface MoviePlayerProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MoviePlayer({ movie, isOpen, onClose }: MoviePlayerProps) {
  if (!movie) return null;

  // Convert Mega or YouTube link
  const isMegaUrl = (url: string) => url.includes('mega.nz');
  
  const getStreamUrl = (url: string) => {
    if (isMegaUrl(url)) {
      return `/api/stream?url=${encodeURIComponent(url)}`;
    }
    return null;
  };

  const getEmbedUrl = (url: string) => {
    try {
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        // Adding origin parameter helps with some embed issues
        const origin = window.location.origin;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${origin}`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const streamUrl = getStreamUrl(movie.trailerUrl);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Top Bar - More prominent */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/95 via-black/70 to-transparent">
            <div className="flex items-center gap-6 text-left">
              <button 
                onClick={onClose}
                className="p-4 bg-white/10 hover:bg-red-600 rounded-full backdrop-blur-xl transition-all active:scale-90 border border-white/10 group"
              >
                <X className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <div className="space-y-1">
                <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl md:text-3xl drop-shadow-2xl">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">Playing Now</span>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 bg-white/5 rounded border border-white/10">
                    {movie.genre.join(' • ')}
                  </p>
                  <span className="text-white/40 text-[10px] font-bold">({movie.year})</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-white font-black text-xs uppercase tracking-widest leading-none mb-1">ULTRA HD</span>
                <span className="text-red-500 font-bold text-[8px] uppercase tracking-widest">Dolby Atmos</span>
              </div>
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/40 border border-white/20">
                <Play className="w-6 h-6 text-white fill-current" />
              </div>
            </div>
          </div>

          {/* Video Container - Optimized for fill */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
              {streamUrl ? (
                <video
                  src={streamUrl}
                  className="w-full h-full max-h-screen object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <iframe
                  src={getEmbedUrl(movie.trailerUrl)}
                  className="w-full h-full border-0 shadow-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  title={movie.title}
                ></iframe>
              )}
            </div>
          </div>

          {/* Bottom Controls Overlay - Better visibility on hover and touch */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent group/controls">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Progress Bar */}
              <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-visible group/progress cursor-pointer">
                <div className="absolute top-0 left-0 h-full w-[45%] bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                <div className="absolute top-1/2 left-[45%] -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-0 group-hover/progress:scale-100 transition-transform border-2 border-red-600" />
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-8">
                    <SkipBack className="w-7 h-7 text-white/70 cursor-pointer hover:text-white transition-all transform active:scale-90" />
                    <button className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all text-white shadow-xl shadow-red-600/30 border-2 border-white/20">
                      <Pause className="w-8 h-8 fill-current translate-x-[1px]" />
                    </button>
                    <SkipForward className="w-7 h-7 text-white/70 cursor-pointer hover:text-white transition-all transform active:scale-90" />
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-6 h-6 text-white/70 cursor-pointer hover:text-white" />
                      <div className="w-32 h-1.5 bg-white/10 rounded-full relative overflow-hidden group/volume cursor-pointer">
                        <div className="absolute top-0 left-0 h-full w-[70%] bg-white rounded-full group-hover/volume:bg-red-500 transition-colors" />
                      </div>
                    </div>
                    <span className="text-white/80 font-mono text-sm tracking-wider tabular-nums bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
                      45:22 <span className="text-white/20 px-1">/</span> 02:14:00
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center">
                    <Settings className="w-6 h-6 text-white/70 cursor-pointer hover:text-white hover:rotate-90 transition-all duration-500" />
                    <span className="text-[8px] text-white/40 font-black uppercase mt-1 tracking-widest">Settings</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Maximize2 className="w-6 h-6 text-white/70 cursor-pointer hover:text-white transition-all transform active:scale-90" />
                    <span className="text-[8px] text-white/40 font-black uppercase mt-1 tracking-widest">Fullscreen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
