import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Maximize2, Volume2, Settings, SkipBack, SkipForward, Play, Pause, Volume1, VolumeX, Download, ShieldCheck } from 'lucide-react';
import ReactPlayer from 'react-player';
import { Movie } from '../types';

interface MoviePremiumPlayerProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MoviePremiumPlayer({ movie, isOpen, onClose }: MoviePremiumPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  
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
      setIsReady(false);
      setError(null);

      const loaderTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 15000);
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
      }, 4000);
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

  const skip = (amount: number) => {
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + amount));
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
    const playerElement = document.querySelector('#premium-player-container');
    if (playerElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerElement.requestFullscreen();
      }
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || time < 0) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStreamUrl = (url: string) => {
    if (url.includes('mega.nz')) {
      const apiKey = import.meta.env.VITE_STREAM_API_KEY || 'KageSuperSecretToken2026!';
      const origin = window.location.origin;
      return `${origin}/api/stream?url=${encodeURIComponent(url)}&key=${apiKey}`;
    }
    return url;
  };

  const activeUrl = getStreamUrl(movie.downloadUrl || movie.trailerUrl);

  const handleVideoError = (e: any) => {
    console.error("Premium Playback Error:", e);
    setIsLoading(false);
    setError("Unable to stream this movie directly. Our servers might be under high load, or your connection is restricted. You can try the external link.");
  };

  const handleDownload = () => {
    window.open(movie.downloadUrl, '_blank');
  };

  const PlayerWrapper = React.forwardRef<HTMLDivElement, any>((props, ref) => {
    const { 
      onDuration, onBuffer, onBufferEnd, onProgress, onReady, onEnded, onError, onStart, onPause, onPlay, onSeek,
      url, playing, loop, controls, volume, muted, playbackRate, width, height, style, progressInterval, playsinline, pip, stopOnUnmount, light, playIcon, previewTabIndex, fallback,
      wrapper, config,
      ...rest 
    } = props;
    return <div {...rest} ref={ref} />;
  });

  const Player = ReactPlayer as any;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
          id="premium-player-container"
        >
          {/* HD Background */}
          <div 
            className="absolute inset-0 z-0 opacity-40 blur-[120px] pointer-events-none scale-150"
            style={{ 
              backgroundImage: `url(${movie.posterUrl})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
          <div className="absolute inset-0 bg-black/70 z-[1]" />

          {/* Top Info Bar */}
          <div className={`absolute top-0 left-0 right-0 p-6 md:p-8 flex items-center justify-between z-30 bg-gradient-to-b from-black/95 via-black/60 to-transparent transition-opacity duration-700 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-6 text-left max-w-[70%]">
              <button 
                onClick={onClose}
                className="p-4 bg-white/10 hover:bg-red-600 rounded-2xl backdrop-blur-2xl transition-all active:scale-90 border border-white/10 group flex-shrink-0"
              >
                <X className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-black italic uppercase tracking-tighter text-xl md:text-4xl truncate">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-600 rounded-lg text-[8px] font-black uppercase tracking-widest text-white shrink-0">
                    <ShieldCheck className="w-3 h-3" /> Premium
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] md:text-xs">
                  <span className="text-red-500 font-black uppercase tracking-widest">Streaming Ultra HD</span>
                  <span className="text-white/40 uppercase tracking-widest truncate">{movie.genre.join(' • ')}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex items-center gap-6">
              <button 
                onClick={handleDownload}
                className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors group"
              >
                <div className="w-12 h-12 bg-white/5 group-hover:bg-red-600/20 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-red-600/40 transition-all">
                  <Download className="w-6 h-6 group-hover:text-red-500" />
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest">Save Offline</span>
              </button>
            </div>
          </div>

          {/* Player Core */}
          <div 
            className="relative w-full h-full flex items-center justify-center bg-black group/video cursor-none"
            onClick={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
          >
            {/* Loading */}
            {isLoading && !error && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                <div className="w-20 h-20 border-4 border-white/5 border-t-red-600 rounded-full animate-spin shadow-[0_0_40px_rgba(220,38,38,0.2)]"></div>
                <p className="mt-8 text-white font-black italic uppercase tracking-[0.5em] text-sm animate-pulse">Initializing Premium Stream...</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="absolute inset-0 z-[40] flex flex-col items-center justify-center bg-black/98 p-12 text-center backdrop-blur-3xl">
                <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-8 border border-red-600/20">
                  <X className="w-12 h-12 text-red-600" />
                </div>
                <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-6">Stream Connection Failed</h4>
                <p className="text-white/40 text-sm max-w-lg mb-12 leading-relaxed uppercase tracking-widest">{error}</p>
                <div className="flex gap-6">
                  <button 
                    onClick={handleDownload}
                    className="px-12 py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-red-700 transition-all active:scale-95 shadow-2xl shadow-red-600/40"
                  >
                    Open Download Link
                  </button>
                  <button 
                    onClick={onClose}
                    className="px-12 py-5 bg-white/5 text-white/40 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white/10 transition-all"
                  >
                    Return to Library
                  </button>
                </div>
              </div>
            )}

            <div className="w-full h-full flex items-center justify-center text-white">
              <Player
                key={activeUrl}
                ref={playerRef}
                url={activeUrl}
                width="100%"
                height="100%"
                playing={isOpen && isPlaying}
                volume={volume}
                muted={isMuted}
                playbackRate={playbackSpeed}
                onProgress={handleProgress}
                onDuration={handleDuration}
                wrapper={PlayerWrapper}
                onReady={() => {
                  setIsLoading(false);
                  setIsReady(true);
                  if (playerRef.current) {
                    try {
                      const d = playerRef.current.getDuration();
                      if (d > 0) setDuration(d);
                    } catch (err) {
                      console.warn("Could not get duration on premium ready", err);
                    }
                  }
                }}
                onBuffer={() => setIsLoading(true)}
                onBufferEnd={() => setIsLoading(false)}
                onEnded={() => setIsPlaying(false)}
                onError={handleVideoError}
                config={{
                  file: {
                    attributes: {
                      crossOrigin: 'anonymous',
                      controlsList: 'nodownload',
                      disablePictureInPicture: true
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

          {/* Premium UI Controls */}
          <div className={`absolute bottom-0 left-0 right-0 p-8 md:p-16 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-700 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Pro Progress Bar */}
              <div 
                className="group/progress-container py-6 -my-6 cursor-pointer"
                onClick={handleSeek}
              >
                <div className="relative h-2 md:h-3 w-full bg-white/5 rounded-full overflow-visible border border-white/5">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full shadow-[0_0_30px_rgba(220,38,38,0.4)]" 
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-xl shadow-2xl scale-100 md:scale-0 group-hover/progress-container:scale-100 transition-all duration-300 border-4 border-red-600"
                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex flex-col lg:flex-row items-center gap-10 w-full lg:w-auto">
                  {/* Transport */}
                  <div className="flex items-center justify-center gap-10 w-full lg:w-auto shrink-0">
                    <SkipBack 
                      onClick={(e) => { e.stopPropagation(); skip(-10); }}
                      className="w-10 h-10 text-white/30 cursor-pointer hover:text-white transition-all transform active:scale-95" 
                    />
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      className="w-20 h-20 bg-red-600 rounded-[2rem] flex items-center justify-center cursor-pointer hover:scale-110 hover:shadow-red-600/40 active:scale-95 transition-all text-white shadow-2xl border-2 border-white/10"
                    >
                      {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-[2px]" />}
                    </button>
                    <SkipForward 
                      onClick={(e) => { e.stopPropagation(); skip(10); }}
                      className="w-10 h-10 text-white/30 cursor-pointer hover:text-white transition-all transform active:scale-95" 
                    />
                  </div>
                  
                  {/* Audio & Time */}
                  <div className="flex items-center justify-between lg:justify-start gap-10 w-full lg:w-auto">
                    <div className="flex items-center gap-4 shrink-0">
                      <div onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="cursor-pointer text-white/40 hover:text-white transition-colors">
                        {isMuted || volume === 0 ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
                      </div>
                      <div 
                        onClick={(e) => { e.stopPropagation(); handleVolumeChange(e); }}
                        className="w-32 h-1.5 bg-white/5 rounded-full relative overflow-hidden group/volume cursor-pointer border border-white/5"
                      >
                        <div 
                          className="absolute top-0 left-0 h-full bg-white rounded-full group-hover/volume:bg-red-500 transition-colors" 
                          style={{ width: `${volume * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-white/90 font-mono text-sm md:text-lg tracking-[0.2em] tabular-nums bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-3xl shrink-0">
                      {formatTime(currentTime)} <span className="text-white/20 mx-2">|</span> {formatTime(duration)}
                    </div>
                  </div>
                </div>
                
                {/* Visual Settings */}
                <div className="flex items-center justify-center gap-12 w-full lg:w-auto">
                  <div className="relative">
                    <div 
                      className="flex flex-col items-center cursor-pointer group" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(!showSettings);
                      }}
                    >
                      <Settings className={`w-8 h-8 text-white/30 group-hover:text-white transition-all duration-700 ${showSettings ? 'rotate-180 text-red-500' : ''}`} />
                      <span className="text-[8px] text-white/30 font-black uppercase mt-2 tracking-[0.3em] group-hover:text-white/60 transition-colors">Speed</span>
                    </div>
                    
                    {/* Settings UI */}
                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 20, scale: 0.95 }}
                          className="absolute bottom-full right-0 mb-8 w-56 bg-black/95 backdrop-blur-3xl rounded-3xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] p-3 z-50"
                        >
                          <div className="px-4 py-3 border-b border-white/5 mb-2">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Cinematic Control</p>
                          </div>
                          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                            <button
                              key={speed}
                              onClick={(e) => { e.stopPropagation(); changePlaybackSpeed(speed); }}
                              className={`w-full text-left px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-between group/btn ${playbackSpeed === speed ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                            >
                              <span>{speed === 1 ? 'Normal' : `${speed}x`}</span>
                              <div className={`w-2 h-2 rounded-full transition-all ${playbackSpeed === speed ? 'bg-white scale-100' : 'bg-red-600 scale-0 group-hover/btn:scale-100'}`} />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col items-center cursor-pointer group" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                    <Download className="w-8 h-8 text-white/30 group-hover:text-white transition-all transform active:scale-95" />
                    <span className="text-[8px] text-white/30 font-black uppercase mt-2 tracking-[0.3em] group-hover:text-white/60 transition-colors">Download</span>
                  </div>

                  <div className="flex flex-col items-center cursor-pointer group" onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}>
                    <Maximize2 className="w-8 h-8 text-white/30 group-hover:text-white transition-all transform active:scale-95" />
                    <span className="text-[8px] text-white/30 font-black uppercase mt-2 tracking-[0.3em] group-hover:text-white/60 transition-colors">Theater Mode</span>
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
