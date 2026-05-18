import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Volume2, Settings, SkipBack, SkipForward, Play, Pause, Volume1, VolumeX } from 'lucide-react';
import ReactPlayer from 'react-player';
import { Movie } from '../types';

interface TrailerPlayerProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TrailerPlayer({ movie, isOpen, onClose }: TrailerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const playerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<any>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, isMuted, volume]);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setCurrentTime(0);
      setIsLoading(true);
      setIsReady(false);
      setError(null);

      // Safety timeout for loader
      const loaderTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 12000);
      return () => clearTimeout(loaderTimeout);
    }
  }, [isOpen, movie]);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setIsReady(false);
    }
  }, [isOpen]);

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
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    if (state.playedSeconds !== currentTime) {
      setCurrentTime(state.playedSeconds);
    }
    if (playerRef.current && (!duration || duration <= 0)) {
      try {
        const d = playerRef.current.getDuration();
        if (d > 0) setDuration(d);
      } catch (e) {}
    }
  };

  const handleDuration = (d: number) => {
    if (d > 0 && d !== duration) {
      setDuration(d);
    }
  };

  const Player = (ReactPlayer as any).default || ReactPlayer;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playerRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      playerRef.current.seekTo(newTime, 'seconds');
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newVolume = Math.max(0, Math.min(1, x / rect.width));
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const playerElement = document.querySelector('#trailer-player-container');
    if (playerElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerElement.requestFullscreen();
      }
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleVideoError = (e: any) => {
    console.error("Trailer Playback Error:", e);
    setIsLoading(false);
    setError("Unable to play this trailer.");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
          id="trailer-player-container"
        >
          {/* Ambient Backdrop */}
          <div 
            className="absolute inset-0 z-0 opacity-30 blur-[100px] pointer-events-none scale-150"
            style={{ 
              backgroundImage: `url(${movie.posterUrl})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
          <div className="absolute inset-0 bg-black/80 z-[1]" />

          {/* Top Bar */}
          <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black via-black/40 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-4 md:gap-6 text-left">
              <button 
                onClick={onClose}
                className="p-3 bg-white/10 hover:bg-red-600 rounded-full backdrop-blur-xl transition-all active:scale-90 border border-white/10 group flex-shrink-0"
              >
                <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <div className="space-y-0.5 md:space-y-1">
                <h3 className="text-white font-black italic uppercase tracking-tighter text-lg md:text-2xl drop-shadow-2xl">
                  {movie.title} <span className="text-red-500 text-sm md:text-base italic ml-2">(Trailer)</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Video Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center bg-black group/video cursor-none"
            onClick={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
          >
            {/* Loading Spinner */}
            {isLoading && !error && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-white/10 border-t-red-600 rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
                <p className="mt-4 text-white font-black italic uppercase tracking-[0.3em] text-[10px] animate-pulse">Streaming Trailer...</p>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 z-[40] flex flex-col items-center justify-center bg-black/95 p-8 text-center backdrop-blur-xl">
                <h4 className="text-white font-black italic uppercase tracking-tighter text-xl mb-4">Trailer Unavailable</h4>
                <button 
                  onClick={() => window.open(movie.trailerUrl, '_blank')}
                  className="px-8 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all active:scale-95 shadow-xl shadow-red-600/30"
                >
                  Watch on YouTube
                </button>
              </div>
            )}

            <div className="w-full h-full flex items-center justify-center">
              <Player
                key={movie.trailerUrl}
                ref={playerRef}
                url={movie.trailerUrl}
                width="100%"
                height="100%"
                playing={isOpen && isPlaying && isReady}
                volume={volume}
                muted={isMuted}
                onProgress={(state: any) => handleProgress(state)}
                onReady={() => {
                  setIsLoading(false);
                  setIsReady(true);
                  if (playerRef.current) {
                    try {
                      const d = playerRef.current.getDuration();
                      if (d > 0) handleDuration(d);
                    } catch (err) {}
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                onError={handleVideoError}
                config={{
                  youtube: {
                    playerVars: { 
                      autoplay: 1,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      controls: 0,
                      disablekb: 1,
                      enablejsapi: 1,
                      origin: window.location.origin
                    }
                  }
                }}
              />
            </div>
            
            <div 
              className="absolute inset-0 z-[10] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            />
          </div>

          {/* Controls Overlay */}
          <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-12 z-30 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Progress Bar */}
              <div 
                className="group/progress-container py-4 -my-4 cursor-pointer"
                onClick={handleSeek}
              >
                <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-visible">
                  <div 
                    className="absolute top-0 left-0 h-full bg-red-600 rounded-full" 
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-100 md:scale-0 group-hover/progress-container:scale-100 transition-transform border-2 border-red-600"
                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                    className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all text-white shadow-xl shadow-red-600/30"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-[1px]" />}
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <div onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="cursor-pointer text-white/70 hover:text-white">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </div>
                    <div 
                      onClick={(e) => { e.stopPropagation(); handleVolumeChange(e); }}
                      className="hidden sm:block w-24 h-1 bg-white/10 rounded-full relative overflow-hidden group/volume cursor-pointer"
                    >
                      <div 
                        className="absolute top-0 left-0 h-full bg-white rounded-full group-hover/volume:bg-red-500 transition-colors" 
                        style={{ width: `${volume * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-white/60 font-mono text-xs tabular-nums bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                    {formatTime(currentTime)} <span className="text-white/20">/</span> {formatTime(duration)}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center cursor-pointer group" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}>
                    <Maximize2 className="w-5 h-5 text-white/70 group-hover:text-white transition-all transform active:scale-90" />
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
