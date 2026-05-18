import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MOVIES } from '../constants/movies';
import { Movie } from '../types';
import MovieCard from './MovieCard';
import Navbar from './Navbar';
import SubscriptionModal from './SubscriptionModal';
import DownloadModal from './DownloadModal';
import MoviePlayer from './MoviePlayer';
import WhatsAppBubble from './WhatsAppBubble';
import { auth } from '../lib/firebase';
import { User } from 'firebase/auth';
import { Crown, Sparkles, Filter, ChevronLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnlimitedLibraryProps {
  user: User | null;
}

export default function UnlimitedLibrary({ user }: UnlimitedLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSubscription, setShowSubscription] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [downloadMovie, setDownloadMovie] = useState<Movie | null>(null);
  const [watchingMovie, setWatchingMovie] = useState<Movie | null>(null);
  const navigate = useNavigate();

  const handleDownload = (movie: Movie) => {
    setDownloadMovie(movie);
    setShowDownload(true);
  };

  const handleWatchMovie = (movie: Movie) => {
    setWatchingMovie(movie);
    setShowPlayer(true);
  };

  const filteredMovies = MOVIES.filter(movie => 
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      <Navbar 
        onSearch={setSearchQuery} 
        onUpgrade={() => setShowSubscription(true)}
        user={user} 
        isSubscribed={true}
      />
      
      <main className="pt-28 px-4 md:px-8 pb-20 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/40 hover:text-red-500 transition-colors uppercase font-black text-[10px] tracking-widest mb-6"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20">
                <Crown className="w-6 h-6" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Unlimited Library</h1>
            </div>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
              Streaming <span className="text-red-500">Premium 4K Content</span> • {MOVIES.length} Movies Available
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-xs font-black uppercase tracking-widest">Kage-movies Gold Member</span>
          </div>
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
           {filteredMovies.map((movie, idx) => (
             <motion.div
               key={movie.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
             >
               <MovieCard 
                 movie={movie}
                 onDownload={(m) => handleDownload(m)}
                 onWatch={(m) => handleWatchMovie(m)}
                 onClick={() => {}}
                 onFavorite={() => {}}
                 isFavorite={false}
                 isPremium={true}
               />
             </motion.div>
           ))}
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-40 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <Filter className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/40">No movies match your search</h3>
          </div>
        )}
      </main>

      <SubscriptionModal 
        isOpen={showSubscription} 
        onClose={() => setShowSubscription(false)} 
      />

      <DownloadModal
        isOpen={showDownload}
        onClose={() => setShowDownload(false)}
        movie={downloadMovie}
      />

      <MoviePlayer
        isOpen={showPlayer}
        onClose={() => setShowPlayer(false)}
        movie={watchingMovie}
      />

      <WhatsAppBubble />
    </div>
  );
}
