import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Film } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show our custom install UI
      
      // Only show if not already installed (checking if display-mode is standalone)
      if (!window.matchMedia('(display-mode: standalone)').matches) {
          // Add a slight delay so it doesn't pop immediately on load
          setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also check if we should show it based on localStorage (don't annoy the user if they dismissed it)
    const dismissed = localStorage.getItem('pwa_prompt_dismissed');
    const lastPrompt = localStorage.getItem('pwa_prompt_last_shown');
    const now = Date.now();
    
    // If dismissed less than 7 days ago, don't show
    if (dismissed && (now - parseInt(dismissed)) < 7 * 24 * 60 * 60 * 1000) {
      // Keep hidden
    } else if (window.matchMedia('(display-mode: standalone)').matches) {
      // Already installed
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We used the prompt, and can't use it again, so clear it
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[200] bg-zinc-900 rounded-2xl border border-white/10 p-5 shadow-2xl shadow-red-600/10 backdrop-blur-xl"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/30">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-white font-bold text-sm">Install Kage-Movies</h4>
              <p className="text-white/60 text-xs leading-relaxed">
                Add Kage-Movies to your home screen for a faster, full-screen streaming experience.
              </p>
              <div className="flex items-center gap-3 pt-3">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Install Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium rounded-lg transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
