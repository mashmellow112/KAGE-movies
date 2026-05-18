import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Play } from 'lucide-react';

interface LocationState {
  url?: string;
  title?: string;
}

export default function Trailer() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  // Use provided URL or fallback to the one requested by user
  const rawUrl = state?.url || "https://www.youtube.com/watch?v=r2u9GifyDg0";
  const title = state?.title || "Movie Trailer";

  // Helper function to extract the YouTube ID safely
  const getYouTubeId = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch {
      return null;
    }
  };

  const videoId = getYouTubeId(rawUrl);

  if (!videoId) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600 uppercase tracking-tighter">Invalid Trailer URL</h2>
        <p className="text-gray-400 mb-8 max-w-md">The trailer link for this movie seems to be broken or invalid. Please try again later.</p>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black flex flex-col pt-4 md:pt-8"
    >
      {/* Top Header Controls */}
      <div className="px-6 md:px-12 flex items-center justify-between z-10 mb-6 md:mb-10">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md rounded-2xl font-bold transition-all active:scale-95 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">Back to Movies</span>
        </button>

        <div className="hidden md:flex flex-col items-end">
          <span className="text-red-600 font-black uppercase text-[10px] tracking-[0.3em]">Now Playing</span>
          <h1 className="text-white font-black italic uppercase text-lg tracking-tighter line-clamp-1">{title}</h1>
        </div>
      </div>

      {/* Main Video Presentation Layer */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12 md:px-12 md:pb-20">
        <div className="w-full max-w-6xl aspect-video bg-[#0a0a0e] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.15)] border border-white/5 relative group">
          <iframe
            title="Trailer Player"
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Mobile Title View */}
      <div className="md:hidden px-6 pb-20">
        <span className="text-red-500 font-black uppercase text-[10px] tracking-[0.3em]">Now Playing</span>
        <h1 className="text-white font-black italic uppercase text-3xl tracking-tighter">{title}</h1>
      </div>
    </motion.div>
  );
}
