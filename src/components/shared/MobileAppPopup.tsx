import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, X, Star } from 'lucide-react';

export const MobileAppPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already dismissed the popup in this session
    const hasDismissed = sessionStorage.getItem('scolara_app_popup_dismissed');
    
    // Show the popup after a short delay for better UX, if not dismissed
    if (!hasDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('scolara_app_popup_dismissed', 'true');
  };

  const handleDownload = () => {
    // The download will happen automatically via the anchor tag's href and download attributes
    // We optionally close the modal after they click download to clear the screen
    setIsVisible(false);
    sessionStorage.setItem('scolara_app_popup_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 shadow-[0_0_50px_-12px_rgba(var(--primary-rgb),0.5)] z-10"
          >
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="p-8 text-center relative z-10">
              {/* App Icon Graphic */}
              <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-2xl p-[2px] mb-6 shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center">
                  <Smartphone className="text-white" size={32} />
                </div>
              </div>

              {/* 5-Star Rating */}
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                Experience Scolara on the Go!
              </h2>
              
              <p className="text-gray-400 text-sm leading-relaxed mb-8 px-2">
                Download the official Scolara Mobile App for uninterrupted access to mock exams, AI coaching, and offline past questions anytime, anywhere.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <a
                  href="https://github.com/theFirstCodeManiac/scolara/releases/latest/download/Scolara.apk"
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                >
                  <Download size={18} />
                  Download App (APK)
                </a>
                
                <button
                  onClick={handleDismiss}
                  className="w-full py-3.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Continue to website
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
