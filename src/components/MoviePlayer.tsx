import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Volume2, Settings, SkipBack, SkipForward, Play, Pause, Volume1, VolumeX } from 'lucide-react';
import { Movie } from '../types';

interface MoviePlayerProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MoviePlayer({ movie, isOpen, onClose }: MoviePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setCurrentTime(0);
      setIsLoading(true);
    }
  }, [isOpen, movie]);

  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  if (!movie) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const skip = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, x / rect.width));
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMute = !isMuted;
      setIsMuted(newMute);
      videoRef.current.muted = newMute;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement?.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Convert Mega or YouTube link
  const isMegaUrl = (url: string) => url.includes('mega.nz');
  
  const getStreamUrl = (url: string) => {
    if (isMegaUrl(url)) {
      const key = import.meta.env.VITE_STREAM_API_KEY || 'MY_SUPER_SECRET_APP_TOKEN_123';
      return `/api/stream?url=${encodeURIComponent(url)}&key=${key}`;
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
          <div className={`absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/95 via-black/70 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
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
              <div 
                onClick={togglePlay}
                className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/40 border border-white/20 cursor-pointer hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white fill-current" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-current" />
                )}
              </div>
            </div>
          </div>

          {/* Video Container - Optimized for fill */}
          <div className="relative w-full h-full flex items-center justify-center bg-black group/video">
            {/* Loading Spinner Overaly */}
            {streamUrl && isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="w-16 h-16 border-4 border-white/10 border-t-red-600 rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
                <p className="mt-6 text-white font-black italic uppercase tracking-[0.3em] text-sm animate-pulse">Loading Movie...</p>
              </div>
            )}

            <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
              {streamUrl ? (
                <video
                  ref={videoRef}
                  src={streamUrl}
                  className="w-full h-full max-h-screen object-contain"
                  autoPlay
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={togglePlay}
                  onPlaying={() => setIsLoading(false)}
                  onWaiting={() => setIsLoading(true)}
                  onCanPlay={() => setIsLoading(false)}
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
          <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-12 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Progress Bar */}
              <div 
                onClick={handleSeek}
                className="relative h-1.5 w-full bg-white/10 rounded-full overflow-visible group/progress cursor-pointer"
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-0 group-hover/progress:scale-100 transition-transform border-2 border-red-600"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                />
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-10">
                  <div className="flex items-center gap-8">
                    <SkipBack 
                      onClick={() => skip(-10)}
                      className="w-7 h-7 text-white/70 cursor-pointer hover:text-white transition-all transform active:scale-90" 
                    />
                    <button 
                      onClick={togglePlay}
                      className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all text-white shadow-xl shadow-red-600/30 border-2 border-white/20"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 fill-current translate-x-[1px]" />
                      ) : (
                        <Play className="w-8 h-8 fill-current translate-x-[1px]" />
                      )}
                    </button>
                    <SkipForward 
                      onClick={() => skip(10)}
                      className="w-7 h-7 text-white/70 cursor-pointer hover:text-white transition-all transform active:scale-90" 
                    />
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <div onClick={toggleMute} className="cursor-pointer text-white/70 hover:text-white">
                        {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : volume < 0.5 ? <Volume1 className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                      </div>
                      <div 
                        onClick={handleVolumeChange}
                        className="w-32 h-1.5 bg-white/10 rounded-full relative overflow-hidden group/volume cursor-pointer"
                      >
                        <div 
                          className="absolute top-0 left-0 h-full bg-white rounded-full group-hover/volume:bg-red-500 transition-colors" 
                          style={{ width: `${volume * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-white/80 font-mono text-sm tracking-wider tabular-nums bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
                      {formatTime(currentTime)} <span className="text-white/20 px-1">/</span> {formatTime(duration)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center">
                    <Settings className="w-6 h-6 text-white/70 cursor-pointer hover:text-white hover:rotate-90 transition-all duration-500" />
                    <span className="text-[8px] text-white/40 font-black uppercase mt-1 tracking-widest">Settings</span>
                  </div>
                  <div className="flex flex-col items-center" onClick={toggleFullscreen}>
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
