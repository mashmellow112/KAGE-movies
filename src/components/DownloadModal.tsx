import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

export default function DownloadModal({ isOpen, onClose, movie }: DownloadModalProps) {
  if (!movie) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-[#0a0a0e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-600/20 rounded-3xl flex items-center justify-center">
                  <Download className="w-10 h-10 text-red-600" />
                </div>
              </div>

              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white text-center mb-2">
                Download Movie?
              </h3>
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest text-center mb-8">
                Do you want to download <span className="text-white">"{movie.title}"</span> for offline viewing?
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (movie.trailerUrl) {
                      window.open(movie.trailerUrl, '_blank');
                    } else {
                      alert("Download link not available.");
                    }
                    onClose();
                  }}
                  className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95 shadow-xl shadow-red-600/20 flex items-center justify-center gap-3"
                >
                  Download via Mega <Download className="w-4 h-4" />
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-5 bg-white/5 hover:bg-white/10 text-white/60 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center gap-3 text-white/20">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-[8px] font-black uppercase tracking-[0.2em]">High speed server connection established</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
