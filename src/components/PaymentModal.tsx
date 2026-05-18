import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, CreditCard, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Movie } from '../types';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface PaymentModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ movie, isOpen, onClose }: PaymentModalProps) {
  const [provider, setProvider] = useState<'airtel' | 'mtn' | null>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'selection' | 'details' | 'success' | 'download_prompt'>('selection');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  
  if (!movie) return null;

  const handlePayment = async () => {
    if (!provider || !phone || !auth.currentUser) return;
    
    // Sanitize phone number: remove spaces and non-numeric chars except +
    const sanitizedPhone = phone.replace(/[^\d+]/g, '');

    try {
      // Calculate expiry date (30 days from now)
      const now = new Date();
      const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await addDoc(collection(db, 'payments'), {
        userId: auth.currentUser.uid,
        phoneNumber: sanitizedPhone,
        provider: provider,
        amount: 4000,
        status: 'completed',
        createdAt: serverTimestamp(),
        expiryDate: expiry.toISOString()
      });
      setStep('success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'payments');
    }
  };

  const startDownload = () => {
    setDownloading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setDownloading(false);
          onClose();
        }, 1000);
      }
      setDownloadProgress(progress);
    }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0e] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
          >
            <div className="p-8 flex items-center justify-between border-b border-white/5">
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  {step === 'selection' ? 'Choose Network' : 'Monthly Premium Pass'}
                </h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-mono">30 Days Unlimited Access • Ugx 4,000</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {step === 'selection' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        setProvider('airtel');
                        setStep('details');
                      }}
                      className={cn(
                        "p-6 rounded-2xl flex flex-col items-center justify-center transition-all border-2",
                        provider === 'airtel' ? "bg-red-600/10 border-red-600" : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-black italic text-xs mb-3">Air</div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Airtel Money</span>
                    </button>

                    <button
                      onClick={() => {
                        setProvider('mtn');
                        setStep('details');
                      }}
                      className={cn(
                        "p-6 rounded-2xl flex flex-col items-center justify-center transition-all border-2",
                        provider === 'mtn' ? "bg-yellow-500/10 border-yellow-500" : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center font-black italic text-xs mb-3 text-black">MTN</div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">MTN MoMo</span>
                    </button>
                  </div>
                </div>
              )}

              {step === 'details' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Phone Number</label>
                      <button 
                        onClick={() => setStep('selection')}
                        className="text-[10px] font-bold uppercase text-red-600 hover:underline tracking-widest"
                      >
                        Change Method
                      </button>
                    </div>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        autoFocus
                        type="tel"
                        placeholder="07XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg font-mono focus:outline-none focus:border-red-600 transition-all placeholder:text-white/10 text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={phone.length < 9}
                    className={cn(
                      "w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 shadow-xl",
                      provider === 'airtel' ? "bg-red-600 hover:bg-red-700 shadow-red-600/20" : "bg-yellow-500 text-black hover:bg-yellow-600 shadow-yellow-500/20"
                    )}
                  >
                    Pay with {provider?.toUpperCase()}
                  </button>
                  
                  <p className="text-[10px] text-center text-gray-600 uppercase font-bold tracking-widest">
                    Secure transaction via Kage-Movies Payments
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                  <h4 className="text-2xl font-bold mb-2">Subscription Active!</h4>
                  <p className="text-white/60 mb-8">You now have 30 days of unlimited downloads.</p>
                  <button
                    onClick={() => setStep('download_prompt')}
                    className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {step === 'download_prompt' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CreditCard className="w-10 h-10 text-red-600" />
                  </div>
                  <h4 className="text-2xl font-bold mb-4">Download Movie?</h4>
                  <p className="text-white/60 mb-8 px-4">Do you want to download <strong>{movie.title}</strong> for offline viewing? This will take up approx. 2.4 GB.</p>
                  
                  {downloading ? (
                    <div className="space-y-4">
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-red-600" 
                          initial={{ width: 0 }}
                          animate={{ width: `${downloadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                        Downloading... {Math.round(downloadProgress)}%
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={startDownload}
                        className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95"
                      >
                        Yes, Download Now
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95"
                      >
                        No, Watch Later
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
