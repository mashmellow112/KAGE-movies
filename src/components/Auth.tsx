import React from 'react';
import { motion } from 'motion/react';
import { Film } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export default function Auth() {
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Failed to sign in. Please check if popups are enabled for this site.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 cinematic-gradient opacity-50" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 text-center max-w-md w-full"
      >
        <div className="mb-12 inline-flex flex-col items-center">
          <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.3)] mb-6">
            <span className="text-5xl font-black text-white italic">K</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tighter uppercase">Kage Movies</h2>
        </div>
        
        <h1 className="text-5xl font-black italic tracking-tighter mb-6 uppercase text-stroke">Experience Cinema.</h1>
        <p className="text-gray-400 mb-10 text-lg leading-relaxed">The ultimate destination for premium storytelling. Sign in to start your journey.</p>
        
        <button
          onClick={handleSignIn}
          disabled={isAuthenticating}
          className="w-full h-16 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 cursor-pointer shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAuthenticating ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          )}
          {isAuthenticating ? "Authenticating..." : "Continue with Google"}
        </button>
        
        <p className="mt-8 text-white/40 text-xs text-center px-4 leading-relaxed">
          Before using this app, you can review Kage Movie’s <span className="text-white/60 hover:underline cursor-pointer">Privacy Policy</span> and <span className="text-white/60 hover:underline cursor-pointer">Terms of Service</span>.
        </p>
      </motion.div>
    </div>
  );
}
