import React from 'react';
import { motion } from 'motion/react';

export default function WhatsAppBubble() {
  const whatsappUrl = "https://whatsapp.com/channel/0029VaF1t2Z6BIEoT0J0Dk1w";
  const iconUrl = "https://i.pinimg.com/736x/b6/f0/89/b6f089b20d29f5757fdcddc4f13f34d9.jpg";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.5 }}
      className="fixed bottom-6 right-6 z-[60] group"
    >
      {/* Pop-up Message Tooltip - Moved outside overflow-hidden */}
      <div className="absolute -top-24 right-0 bg-white text-gray-800 px-5 py-4 rounded-2xl text-[13px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0 pointer-events-none whitespace-nowrap shadow-[0_20px_50px_-20px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col gap-1 min-w-[300px]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" />
          <span className="text-[11px] font-bold text-[#25D366] uppercase tracking-wider">Kage-movies</span>
        </div>
        <p className="text-gray-700 leading-tight">
          Not seeing the movie you want, Request that for that Movie
        </p>
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-gray-100" />
      </div>

      {/* Background Pulse Animation */}
      <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-20" />
      
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(37,211,102,0.5)] cursor-pointer border-2 border-white/20 overflow-hidden"
      >
        {/* User Provided WhatsApp Icon */}
        <img 
          src={iconUrl} 
          alt="WhatsApp" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.a>
    </motion.div>
  );
}
