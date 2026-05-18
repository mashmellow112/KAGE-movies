import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './Navbar';
import MovieCard from './MovieCard';
import MovieDetailModal from './MovieDetailModal';
import DownloadModal from './DownloadModal';
import SubscriptionModal from './SubscriptionModal';
import { MOVIES } from '../constants/movies';
import { Movie } from '../types';
import { TrendingUp, Clock, Star, Film, Play, User as UserIcon, Download, Crown, ChevronRight } from 'lucide-react';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { User } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface MainPageProps {
  user: User | null;
}

export default function MainPage({ user }: MainPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showDownload, setShowDownload] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [downloadMovie, setDownloadMovie] = useState<Movie | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'hot' | 'favs' | 'me'>('home');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'payments'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const hasActive = snapshot.docs.some(doc => {
        const data = doc.data();
        if (data.status !== 'completed' || !data.expiryDate) return false;
        const expiry = new Date(data.expiryDate);
        return expiry > now;
      });
      setIsSubscribed(hasActive);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'payments');
    });

    return () => unsubscribe();
  }, [user]);

  const filteredMovies = MOVIES.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'hot') return matchesSearch && movie.rating >= 8.8;
    if (activeTab === 'favs') return matchesSearch && favorites.includes(movie.id);
    return matchesSearch;
  });

  const handlePlayTrailer = (movie: Movie) => {
    navigate('/trailer', { state: { url: movie.trailerUrl, title: movie.title } });
  };

  const handleDownload = (movie: Movie) => {
    setDownloadMovie(movie);
    setShowDownload(true);
  };

  const handleWatchMovie = (movie: Movie) => {
    // If user is subscribed, maybe they want to watch the actual movie?
    // But user's request is specific about trailer playing.
    // Let's stick to their provided Trailer page for now.
    navigate('/trailer', { state: { url: movie.trailerUrl, title: movie.title } });
  };

  const handleShowDetails = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowDetails(true);
  };

  const toggleFavorite = (movieId: string) => {
    setFavorites(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId) 
        : [...prev, movieId]
    );
  };

  return (
    <div className="flex min-h-screen bg-[#050507]">
      {/* Sidebar Navigation - Hidden on Mobile */}
      <aside className="hidden md:flex w-20 bg-[#0a0a0e] border-r border-white/5 flex-col items-center py-8 space-y-10 fixed h-full z-[55]">
          <div 
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center cursor-pointer overflow-hidden p-2"
            onClick={() => setActiveTab('home')}
          >
            <img src="/favicon.png" alt="Kage-Movies" className="w-full h-full object-contain" />
          </div>
        <div className="space-y-8 flex flex-col items-center opacity-40">
          <Film 
            className={`w-6 h-6 cursor-pointer transition-colors ${activeTab === 'home' ? 'text-red-600' : 'text-white hover:text-red-500'}`} 
            onClick={() => setActiveTab('home')}
          />
          <TrendingUp 
            className={`w-6 h-6 cursor-pointer transition-colors ${activeTab === 'hot' ? 'text-red-600' : 'text-white hover:text-red-500'}`} 
            onClick={() => setActiveTab('hot')}
          />
          <Star 
            className={`w-6 h-6 cursor-pointer transition-colors ${activeTab === 'favs' ? 'text-red-600' : 'text-white hover:text-red-500'}`} 
            onClick={() => setActiveTab('favs')}
          />
        </div>
        <div className="mt-auto">
          <div 
            className={`w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-600 border border-white/20 cursor-pointer transition-transform active:scale-95 ${activeTab === 'me' ? 'ring-2 ring-red-600 ring-offset-2 ring-offset-[#050507]' : ''}`}
            onClick={() => setActiveTab('me')}
          />
        </div>
      </aside>

      <div className="flex-1 md:ml-20 flex flex-col">
        <Navbar 
          onSearch={setSearchQuery} 
          onUpgrade={() => setShowSubscription(true)}
          user={user}
          isSubscribed={isSubscribed}
        />
        
        <main className="pt-24 md:pt-28 px-4 md:px-8 pb-32 md:pb-20 max-w-7xl mx-auto w-full">
          {activeTab === 'me' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/5 p-8 md:p-12 rounded-[3rem] border border-white/10 mb-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-32 h-32 rounded-3xl bg-white flex items-center justify-center text-4xl font-black text-white italic shadow-2xl overflow-hidden p-6">
                    <img src="/favicon.png" alt="Kage-Movies" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-stroke">
                      {user?.displayName || 'Kage-Movies User'}
                    </h2>
                    <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold tracking-tight mb-8">My Library</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {MOVIES.map(movie => (
                  <MovieCard 
                    key={movie.id} 
                    movie={movie} 
                    onDownload={(m) => handleDownload(m)}
                    onWatch={(m) => handleWatchMovie(m)}
                    onClick={(m) => handleShowDetails(m)}
                    onFavorite={(m) => toggleFavorite(m.id)}
                    isFavorite={favorites.includes(movie.id)}
                    isPremium={isSubscribed}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Gold Member Banner */}
              {isSubscribed && activeTab === 'home' && (
                <section className="mb-12">
                   <div 
                    onClick={() => navigate('/unlimited')}
                    className="bg-gradient-to-r from-red-600 to-orange-500 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group hover:scale-[1.01] transition-all shadow-2xl shadow-red-600/30 border border-white/20"
                   >
                     <div className="flex flex-col md:flex-row items-center text-center md:text-left gap-4 md:gap-8">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-xl shadow-lg">
                          <Crown className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div>
                           <h3 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-1">Gold Library Access</h3>
                           <p className="text-white/80 text-xs md:text-sm font-bold uppercase tracking-widest">You have unlimited access to every movie in our catalog</p>
                        </div>
                     </div>
                     <div className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-black/20 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] group-hover:bg-black/40 transition-colors border border-white/10">
                        Enter Premium Library <ChevronRight className="w-4 h-4" />
                     </div>
                   </div>
                </section>
              )}
              {/* Hero Section - Only show on home tab */}
              {activeTab === 'home' && searchQuery === '' && (
                <section className="relative h-[300px] md:h-[450px] rounded-3xl md:rounded-[2.5rem] overflow-hidden mb-8 md:mb-12 group shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.2),transparent)]" />
                  
                  <img 
                    src={MOVIES[0].posterUrl} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
                    alt="Hero Backdrop"
                  />

                  <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 z-20">
                    <span className="text-red-500 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs mb-2 md:mb-4">New Release</span>
                    <h2 className="text-4xl md:text-7xl font-black uppercase italic leading-[0.9] mb-4 md:mb-6 tracking-tighter text-white">
                      {MOVIES[0].title}
                    </h2>
                    <p className="max-w-xs md:max-w-md text-gray-400 text-xs md:text-base mb-6 md:mb-10 leading-relaxed line-clamp-3 md:line-clamp-none">
                      {MOVIES[0].description}
                    </p>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      <button 
                        onClick={() => handleDownload(MOVIES[0])}
                        className="px-6 md:px-8 py-3 md:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl md:rounded-2xl font-bold flex items-center space-x-2 transition-all active:scale-95 text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button 
                        onClick={() => handlePlayTrailer(MOVIES[0])}
                        className="px-6 md:px-8 py-3 md:py-4 bg-white text-black rounded-xl md:rounded-2xl font-bold flex items-center space-x-2 transition-all active:scale-95 text-sm"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Trailer</span>
                      </button>
                      <button 
                        onClick={() => handleShowDetails(MOVIES[0])}
                        className="px-6 md:px-8 py-3 md:py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl md:rounded-2xl font-bold transition-all active:scale-95 text-sm"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </section>
              )}

              <section className="mb-12">
                <div className="flex items-center justify-between mb-6 md:mb-8">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-1 h-5 md:h-6 bg-red-600 rounded-full" />
                    <h2 className="text-lg md:text-2xl font-bold tracking-tight">
                      {activeTab === 'home' ? 'Kage-Movies Recommendations' : activeTab === 'hot' ? 'Trending Now' : 'My Favorites'}
                    </h2>
                  </div>
                  {activeTab !== 'home' && (
                    <span 
                      onClick={() => setActiveTab('home')}
                      className="text-red-500 text-[10px] md:text-xs font-bold uppercase cursor-pointer tracking-wider hover:underline"
                    >
                      Back to Home
                    </span>
                  )}
                </div>
                
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                      {filteredMovies.map((movie) => (
                        <MovieCard 
                          key={movie.id} 
                          movie={movie} 
                          onDownload={(m) => { handleDownload(m); }}
                          onWatch={(m) => handleWatchMovie(m)}
                          onClick={(m) => handleShowDetails(m)}
                          onFavorite={(m) => toggleFavorite(m.id)}
                          isFavorite={favorites.includes(movie.id)}
                        />
                      ))}
                    </div>
                
                {filteredMovies.length === 0 && (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 mb-12">
                    <p className="text-white/40 text-lg">No movies found here.</p>
                    <button 
                      onClick={() => { setActiveTab('home'); setSearchQuery(''); }}
                      className="mt-4 text-red-600 hover:underline font-bold"
                    >
                      Explore Library
                    </button>
                  </div>
                )}
              </section>

              {activeTab === 'home' && (
                <section className="grid md:grid-cols-2 gap-8 md:gap-12 mb-20">
                  <div className="bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center mb-6">
                        <Star className="text-red-600 w-6 h-6" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold italic uppercase tracking-tighter mb-4 text-stroke">Premium Quality</h3>
                      <p className="text-gray-400 text-sm md:text-lg leading-relaxed mb-6">Stream in stunning 4K Ultra HD with cinematic surround sound.</p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                        <Film className="text-white w-6 h-6" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold italic uppercase tracking-tighter mb-4 text-stroke">Offline Mode</h3>
                      <p className="text-gray-400 text-sm md:text-lg leading-relaxed mb-6">Download movies to your device and watch anytime, anywhere. Free for all.</p>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-1 left-0 right-0 z-50 bg-[#0a0a0e]/80 backdrop-blur-xl border border-white/5 rounded-3xl mx-4 px-6 pt-4 pb-6 flex items-center justify-between shadow-2xl">
        <button 
          onClick={() => setActiveTab('home')}
          className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <Film className={`w-5 h-5 ${activeTab === 'home' ? 'text-red-600' : 'text-white/40'}`} />
          <span className={`text-[8px] font-bold uppercase ${activeTab === 'home' ? 'text-white' : 'text-white/20'}`}>Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('hot')}
          className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <TrendingUp className={`w-5 h-5 ${activeTab === 'hot' ? 'text-red-600' : 'text-white/40'}`} />
          <span className={`text-[8px] font-bold uppercase ${activeTab === 'hot' ? 'text-white' : 'text-white/20'}`}>Hot</span>
        </button>
        <button 
          onClick={() => setActiveTab('favs')}
          className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <Star className={`w-5 h-5 ${activeTab === 'favs' ? 'text-red-600' : 'text-white/40'}`} />
          <span className={`text-[8px] font-bold uppercase ${activeTab === 'favs' ? 'text-white' : 'text-white/20'}`}>Favs</span>
        </button>
        <button 
          onClick={() => setActiveTab('me')}
          className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
        >
          <UserIcon className={`w-5 h-5 ${activeTab === 'me' ? 'text-red-600' : 'text-white/40'}`} />
          <span className={`text-[8px] font-bold uppercase ${activeTab === 'me' ? 'text-white' : 'text-white/20'}`}>Me</span>
        </button>
      </div>

      <MovieDetailModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        movie={selectedMovie}
        onDownload={handleDownload}
        onWatch={handleWatchMovie}
      />

      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
      />

      <DownloadModal
        isOpen={showDownload}
        onClose={() => setShowDownload(false)}
        movie={downloadMovie}
      />
    </div>
  );
}
