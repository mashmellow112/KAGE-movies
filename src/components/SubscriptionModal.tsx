import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, CreditCard, ChevronRight, CheckCircle2, Crown, Zap } from 'lucide-react';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [provider, setProvider] = useState<'airtel' | 'mtn' | null>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'selection' | 'details' | 'success'>('selection');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!provider || !phone || !auth.currentUser) return;
    
    setLoading(true);
    const sanitizedPhone = phone.replace(/[^\d+]/g, '');

    try {
      const now = new Date();
      const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await addDoc(collection(db, 'payments'), {
        userId: auth.currentUser.uid,
        phoneNumber: sanitizedPhone,
        provider: provider,
        amount: 5000,
        type: 'unlimited_access',
        status: 'completed',
        createdAt: serverTimestamp(),
        expiryDate: expiry.toISOString()
      });
      setStep('success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'payments');
    } finally {
      setLoading(false);
    }
  };

  const handleExplore = () => {
    onClose();
    navigate('/unlimited');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
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
            className="relative w-full max-w-md bg-[#0a0a0e] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-red-600/10"
          >
            {/* Header */}
            <div className="relative p-8 overflow-hidden bg-gradient-to-br from-red-600/20 to-transparent">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/40">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Unlimited Access</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">Kage Gold</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-black italic tracking-tighter">UGX 5,000</span>
                <span className="text-xs text-white/40 mb-1.5 uppercase font-bold tracking-widest">/ 30 Days</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed max-w-[80%] uppercase font-bold tracking-widest">
                Unlock all movies, high-speed streaming, and offline downloads.
              </p>
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
                        "p-6 rounded-3xl flex flex-col items-center justify-center transition-all border-2",
                        provider === 'airtel' ? "bg-red-600/10 border-red-600 ring-4 ring-red-600/20" : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center font-black italic text-sm mb-3 shadow-lg shadow-red-600/20">Air</div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Airtel Money</span>
                    </button>

                    <button
                      onClick={() => {
                        setProvider('mtn');
                        setStep('details');
                      }}
                      className={cn(
                        "p-6 rounded-3xl flex flex-col items-center justify-center transition-all border-2",
                        provider === 'mtn' ? "bg-yellow-500/10 border-yellow-500 ring-4 ring-yellow-500/20" : "bg-white/5 border-white/5 hover:border-white/20"
                      )}
                    >
                      <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center font-black italic text-sm mb-3 text-black shadow-lg shadow-yellow-500/20">MTN</div>
                      <span className="text-[10px] font-black uppercase tracking-widest">MTN MoMo</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Instant activation after approval</p>
                  </div>
                </div>
              )}

              {step === 'details' && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Enter Phone Number</label>
                      <button 
                        onClick={() => setStep('selection')}
                        className="text-[10px] font-black uppercase text-red-600 hover:underline tracking-widest"
                      >
                        Change
                      </button>
                    </div>
                    <div className="relative">
                      <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input
                        autoFocus
                        type="tel"
                        placeholder="07XX XXX XXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl font-mono focus:outline-none focus:border-red-600 transition-all placeholder:text-white/10 text-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading || phone.length < 9}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all active:scale-95 shadow-2xl relative overflow-hidden",
                      provider === 'airtel' ? "bg-red-600 hover:bg-red-700 shadow-red-600/40" : "bg-yellow-500 text-black hover:bg-yellow-600 shadow-yellow-500/40"
                    )}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      `Pay with ${provider?.toUpperCase()}`
                    )}
                  </button>
                  
                  <p className="text-[10px] text-center text-gray-600 uppercase font-black tracking-widest">
                    Your data is safe with Kage Encryption
                  </p>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/20"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </motion.div>
                  <h4 className="text-3xl font-black italic uppercase tracking-tighter mb-3">Welcome to Gold!</h4>
                  <p className="text-white/60 mb-10 text-sm uppercase font-bold tracking-widest mx-auto max-w-[240px]">You now have unlimited access to all movies on Kage.</p>
                  
                  <button
                    onClick={handleExplore}
                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                  >
                    Explore Unlimited Library <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
