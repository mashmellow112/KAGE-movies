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
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        case 'arrowright':
          e.preventDefault();
          skip(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          skip(-10);
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
      setError(null);
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

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
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
      const apiKey = import.meta.env.VITE_STREAM_API_KEY || 'KageSuperSecretToken2026!';
      const origin = window.location.origin;
      return `${origin}/api/stream?url=${encodeURIComponent(url)}&key=${apiKey}`;
    }
    return null;
  };

  const getEmbedUrl = (url: string) => {
    try {
      // YouTube
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        const origin = window.location.origin;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${origin}`;
      }

      // Google Drive
      if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
        let fileId = '';
        if (url.includes('/d/')) {
          fileId = url.split('/d/')[1]?.split('/')[0];
        } else if (url.includes('id=')) {
          fileId = url.split('id=')[1]?.split('&')[0];
        }
        
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }
      
      return url;
    } catch (e) {
      return url;
    }
  };

  const streamUrl = getStreamUrl(movie.trailerUrl);

  const handleVideoError = (e: any) => {
    const videoError = videoRef.current?.error;
    console.error("Video Playback Error:", videoError);
    setIsLoading(false);
    
    let message = "Unable to play this movie in the current player.";
    if (videoError) {
      if (videoError.code === 1) message = "Playback aborted by user.";
      if (videoError.code === 2) message = "Network error occurred while fetching the movie.";
      if (videoError.code === 3) message = "Decoding error. Your browser might not support this file format.";
      if (videoError.code === 4) message = "This movie format is not supported by your browser.";
    }
    
    setError(`${message} The native desktop shell is initializing the pipeline. If loading stalls, please verify your server is awake.`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Enhanced Ambient Backdrop */}
          <div 
            className="absolute inset-0 z-0 opacity-40 blur-[100px] pointer-events-none scale-150"
            style={{ 
              backgroundImage: `url(${movie.posterUrl})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
          <div className="absolute inset-0 bg-black/60 z-[1]" />

          {/* Top Bar - More prominent */}
          <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-30 bg-gradient-to-b from-black/95 via-black/70 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-4 md:gap-6 text-left overflow-hidden">
              <button 
                onClick={onClose}
                className="p-3 md:p-4 bg-white/10 hover:bg-red-600 rounded-full backdrop-blur-xl transition-all active:scale-90 border border-white/10 group flex-shrink-0"
              >
                <X className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <div className="space-y-0.5 md:space-y-1 truncate">
                <h3 className="text-white font-black italic uppercase tracking-tighter text-lg md:text-3xl drop-shadow-2xl truncate">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-red-500 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Playing Now</span>
                  <p className="text-white/60 text-[8px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] px-1.5 py-0.5 bg-white/5 rounded border border-white/10 truncate max-w-[150px] md:max-w-none">
                    {movie.genre.join(' • ')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-white font-black text-xs uppercase tracking-widest leading-none mb-1">ULTRA HD</span>
                <span className="text-red-500 font-bold text-[8px] uppercase tracking-widest">Dolby Atmos</span>
              </div>
              <div 
                onClick={togglePlay}
                className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/40 border border-white/20 cursor-pointer hover:scale-105 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 md:w-6 md:h-6 text-white fill-current" />
                ) : (
                  <Play className="w-5 h-5 md:w-6 md:h-6 text-white fill-current" />
                )}
              </div>
            </div>
          </div>

          {/* Video Container - Optimized for fill */}
          <div 
            className="relative w-full h-full flex items-center justify-center bg-black group/video"
            onClick={() => setShowControls(true)}
          >
            {/* Loading Spinner Overaly */}
            {streamUrl && isLoading && !error && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white/10 border-t-red-600 rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
                <p className="mt-4 md:mt-6 text-white font-black italic uppercase tracking-[0.3em] text-xs md:text-sm animate-pulse">Loading Movie...</p>
              </div>
            )}

            {/* Error Overlay */}
            {error && (
              <div className="absolute inset-0 z-[40] flex flex-col items-center justify-center bg-black/95 p-8 text-center backdrop-blur-xl">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6 md:mb-8 border border-red-600/30">
                  <X className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
                </div>
                <h4 className="text-white font-black italic uppercase tracking-tighter text-xl md:text-2xl mb-4">Playback Error</h4>
                <p className="text-white/60 text-xs md:text-sm max-w-md mb-8 leading-relaxed px-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-6">
                  <button 
                    onClick={() => window.open(movie.trailerUrl, '_blank')}
                    className="w-full sm:w-auto px-10 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-600/30"
                  >
                    Open External Link
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full sm:w-auto px-10 py-5 bg-white/5 text-white/60 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white/10 transition-all"
                  >
                    Close Player
                  </button>
                </div>
              </div>
            )}

            <div className="w-full h-full max-w-full max-h-full flex items-center justify-center">
              {streamUrl ? (
                <video
                  ref={videoRef}
                  id="movie-player"
                  className="w-full h-full max-h-screen object-contain"
                  autoPlay
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    if (x < rect.width / 2) {
                      skip(-10);
                    } else {
                      skip(10);
                    }
                  }}
                  onPlaying={() => setIsLoading(false)}
                  onWaiting={() => setIsLoading(true)}
                  onCanPlay={() => setIsLoading(false)}
                  onLoadedData={() => setIsLoading(false)}
                  onEnded={() => setIsPlaying(false)}
                >
                  <source src={streamUrl} type="video/mp4" />
                  Your desktop installation container framework does not support direct hardware decoding.
                </video>
              ) : (
                <iframe
                  src={getEmbedUrl(movie.trailerUrl)}
                  className="w-full h-full border-0 shadow-2xl transition-opacity duration-700"
                  onLoad={() => setIsLoading(false)}
                  allow="autoplay; encrypted-media; accelerometer; clipboard-write; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  frameBorder="0"
                  scrolling="no"
                  title={movie.title}
                  style={{ border: 'none', display: 'block' }}
                ></iframe>
              )}
            </div>
          </div>

          {/* Bottom Controls Overlay - Better visibility on hover and touch */}
          <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-12 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
              {/* Progress Bar Container with larger hit area */}
              <div 
                className="group/progress-container py-4 -my-4 cursor-pointer"
                onClick={handleSeek}
              >
                <div className="relative h-1.5 md:h-2 w-full bg-white/10 rounded-full overflow-visible">
                  <div 
                    className="absolute top-0 left-0 h-full bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-2xl scale-100 md:scale-0 group-hover/progress-container:scale-100 transition-transform border-2 border-red-600"
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full md:w-auto">
                  <div className="flex items-center justify-center gap-8 w-full md:w-auto">
                    <SkipBack 
                      onClick={(e) => { e.stopPropagation(); skip(-10); }}
                      className="w-8 h-8 md:w-7 md:h-7 text-white/70 cursor-pointer hover:text-white transition-all transform active:scale-90" 
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      className="w-14 h-14 md:w-16 md:h-16 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all text-white shadow-xl shadow-red-600/30 border-2 border-white/20 flex-shrink-0"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 md:w-8 md:h-8 fill-current translate-x-[1px]" />
                      )}
                    </button>
                    <SkipForward 
                      onClick={(e) => { e.stopPropagation(); skip(10); }}
                      className="w-8 h-8 md:w-7 md:h-7 text-white/70 cursor-pointer hover:text-white transition-all transform active:scale-90" 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6 w-full md:w-auto">
                    <div className="flex items-center gap-3">
                      <div onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="cursor-pointer text-white/70 hover:text-white flex-shrink-0">
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : volume < 0.5 ? <Volume1 className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
                      </div>
                      <div 
                        onClick={(e) => { e.stopPropagation(); handleVolumeChange(e); }}
                        className="hidden xs:block w-24 md:w-32 h-1.5 bg-white/10 rounded-full relative overflow-hidden group/volume cursor-pointer"
                      >
                        <div 
                          className="absolute top-0 left-0 h-full bg-white rounded-full group-hover/volume:bg-red-500 transition-colors" 
                          style={{ width: `${volume * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-white/80 font-mono text-xs md:text-sm tracking-wider tabular-nums bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md flex-shrink-0">
                      {formatTime(currentTime)} <span className="text-white/20 px-1">/</span> {formatTime(duration)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-8 w-full md:w-auto">
                  <div className="relative">
                    <div 
                      className="flex flex-col items-center cursor-pointer group" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(!showSettings);
                      }}
                    >
                      <Settings className={`w-5 h-5 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-all duration-500 ${showSettings ? 'rotate-90 text-red-500' : ''}`} />
                      <span className="text-[8px] text-white/40 font-black uppercase mt-1 tracking-widest group-hover:text-white/60 transition-colors">Settings</span>
                    </div>
                    
                    {/* Settings Dropdown */}
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className="absolute bottom-full right-0 mb-4 w-48 bg-black/90 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-2 z-50"
                        >
                          <div className="px-3 py-2 border-b border-white/5">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Playback Speed</p>
                          </div>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={() => changePlaybackSpeed(speed)}
                              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-between ${playbackSpeed === speed ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                            >
                              <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                              {playbackSpeed === speed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col items-center cursor-pointer group" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}>
                    <Maximize2 className="w-5 h-5 md:w-6 md:h-6 text-white/70 group-hover:text-white transition-all transform active:scale-90" />
                    <span className="text-[8px] text-white/40 font-black uppercase mt-1 tracking-widest group-hover:text-white/60 transition-colors">Fullscreen</span>
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
