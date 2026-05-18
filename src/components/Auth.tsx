import React from 'react';
import { motion } from 'motion/react';
import { Film, X } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';

export default function Auth() {
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [showPrivacy, setShowPrivacy] = React.useState(false);
  const [showTerms, setShowTerms] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Sign-in error:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("The sign-in popup was blocked by your browser. Please allow popups for this site or click the 'Open in new tab' button at the top right of the preview.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User closed the popup, no need for an alert
      } else if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(`ACCESS DENIED: The domain "${domain}" is not authorized.\n\nTo fix this:\n1. Open your Firebase Console: https://console.firebase.google.com/project/gen-lang-client-0543228870/authentication/settings\n2. Look for the "Authorized domains" section.\n3. Click "Add domain" and enter: ${domain}\n4. Wait 1 minute and try again.`);
      } else {
        alert(`Sign-in error: ${error.message || "Unknown error"}. If you're in the AI Studio preview, try opening the app in a new tab.`);
      }
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
          <h2 className="text-4xl font-bold tracking-tighter uppercase">Kage-movies</h2>
        </div>
        
        <h1 className="text-5xl font-black italic tracking-tighter mb-6 uppercase text-stroke">Experience Cinema.</h1>
        <p className="text-gray-400 mb-10 text-lg leading-relaxed">Stream your favorite movies with Kage-movies. High-speed streaming and premium quality, all in one place.</p>
        
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
          Before using this app, you can review Kage-movies’ 
          <button 
            onClick={() => setShowPrivacy(true)}
            className="text-white/60 hover:underline cursor-pointer focus:outline-none"
          >
            Privacy Policy
          </button> 
          {' '}and{' '}
          <button 
            onClick={() => setShowTerms(true)}
            className="text-white/60 hover:underline cursor-pointer focus:outline-none"
          >
            Terms of Service
          </button>.
        </p>
      </motion.div>

      {/* Legal Modals */}
      <LegalModal 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
        title="Privacy Policy"
      >
        <div className="space-y-4 text-white/70 text-sm leading-relaxed">
          <p>Your privacy is important to us. It is Kage-movies' policy to respect your privacy regarding any information we may collect from you across our website.</p>
          <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
          <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
          <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
        </div>
      </LegalModal>

      <LegalModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title="Terms of Service"
      >
        <div className="space-y-4 text-white/70 text-sm leading-relaxed">
          <p>By accessing the website at Kage-movies, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
          <p>The materials on Kage-movies' website are provided on an 'as is' basis. Kage-movies makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
          <p>In no event shall Kage-movies or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Kage-movies' website.</p>
        </div>
      </LegalModal>
    </div>
  );
}

function LegalModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 bg-zinc-900 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="text-white font-bold uppercase tracking-widest text-sm">{title}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
        <div className="p-6 border-t border-white/10 flex justify-end bg-white/5">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors"
          >
            I Understand
          </button>
        </div>
      </motion.div>
    </div>
  );
}
