import React, { useState } from 'react';
import { Search, User as UserIcon, LogOut, Bell, Film, Crown } from 'lucide-react';
import { auth, logOut } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';

interface NavbarProps {
  onSearch: (query: string) => void;
  onUpgrade: () => void;
  user: User | null;
}

export default function Navbar({ onSearch, onUpgrade, user }: NavbarProps) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="fixed top-0 left-0 md:left-20 right-0 z-50 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between pointer-events-none">
      <div className="flex items-center w-full max-w-7xl mx-auto pointer-events-auto gap-4">
        <div className="relative group flex-1 max-w-sm md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search Kage..."
            onChange={(e) => onSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 w-full focus:outline-none focus:border-red-600/50 backdrop-blur-md transition-all text-xs md:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 md:gap-6 ml-auto">
          <button 
            onClick={onUpgrade}
            className="flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-600/20"
          >
            <Crown className="w-3.5 h-3.5 md:w-3 md:h-3" />
            <span className="hidden sm:inline">Upgrade</span>
          </button>
          
          <div className="hidden sm:flex items-center gap-2 px-4 md:px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white/60">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {user?.displayName?.split(' ')[0]}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl border border-white/10 hover:border-red-600 overflow-hidden transition-all active:scale-95 shadow-xl"
            >
            <img 
              referrerPolicy="no-referrer"
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 glass-morphism bg-[#111] rounded-2xl p-2 z-20 shadow-2xl"
                >
                  <div className="px-4 py-3 border-b border-white/10 mb-2">
                    <p className="text-sm font-semibold truncate">{user?.displayName}</p>
                    <p className="text-xs text-white/40 truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={logOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </nav>
  );
}
