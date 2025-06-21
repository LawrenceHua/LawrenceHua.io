"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import Chatbot from "./Chatbot";

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [permanentlyDismissed, setPermanentlyDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const isMobile = window.innerWidth < 768;
      const scrollThreshold = isMobile ? 400 : 200; // Higher threshold on mobile

      if (
        scrollTop > scrollThreshold &&
        !hasScrolled &&
        !hasBeenOpened &&
        !permanentlyDismissed
      ) {
        setHasScrolled(true);
        setShowPopup(true);

        // Hide popup after shorter time on mobile
        setTimeout(
          () => {
            setShowPopup(false);
          },
          isMobile ? 10000 : 20000
        );
      }

      // Show popup again after more scrolling if dismissed fewer than 1 time (reduced from 2)
      if (
        scrollTop > (isMobile ? 1000 : 800) &&
        dismissCount < 1 &&
        !showPopup &&
        hasScrolled &&
        !hasBeenOpened &&
        !permanentlyDismissed
      ) {
        setShowPopup(true);

        // Hide popup after shorter time
        setTimeout(
          () => {
            setShowPopup(false);
          },
          isMobile ? 8000 : 15000
        );
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    hasScrolled,
    dismissCount,
    showPopup,
    hasBeenOpened,
    permanentlyDismissed,
  ]);

  // Show popup again after 30 seconds of page time if not opened yet
  useEffect(() => {
    if (dismissCount < 1 && !hasBeenOpened && !permanentlyDismissed) {
      const timer = setTimeout(() => {
        if (!isOpen && !showPopup) {
          setShowPopup(true);

          // Hide popup after 15 seconds
          setTimeout(() => {
            setShowPopup(false);
          }, 15000);
        }
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, showPopup, dismissCount, hasBeenOpened, permanentlyDismissed]);

  const dismissPopup = () => {
    setShowPopup(false);
    setDismissCount((prev) => prev + 1);
    setPermanentlyDismissed(true); // Never show popups again after first dismissal
  };

  const openChatbot = () => {
    setIsOpen(true);
    setShowPopup(false);
    setHasBeenOpened(true);
  };

  const closeChatbot = () => {
    setIsOpen(false);
    // Reset the opened state so the chatbot can show prompts again
    setHasBeenOpened(false);
    setDismissCount(0);
    setHasScrolled(false);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        {/* Scroll Popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 10 }}
              className="absolute bottom-16 right-0 mb-2 sm:bottom-16 sm:right-0"
            >
              <div className="relative">
                <div
                  onClick={openChatbot}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-3 sm:p-4 w-64 sm:w-72 max-w-[calc(100vw-2rem)] border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissPopup();
                    }}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="pr-5 sm:pr-6">
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                      💼 Open to AI PM/APM roles!
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Ask me about my experience in AI Product Management or
                      schedule a meeting!
                    </p>
                  </div>
                </div>
                {/* Arrow pointing to button */}
                <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-slate-800"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Button */}
        <motion.button
          onClick={openChatbot}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={
            !hasBeenOpened
              ? {
                  boxShadow: [
                    "0 4px 14px 0 rgba(59, 130, 246, 0.3)",
                    "0 4px 20px 0 rgba(147, 51, 234, 0.4)",
                    "0 4px 14px 0 rgba(59, 130, 246, 0.3)",
                  ],
                }
              : {}
          }
          transition={
            !hasBeenOpened
              ? {
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }
              : {}
          }
        >
          <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
        </motion.button>

        {/* Pulse Ring Animation */}
        {!hasBeenOpened && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-400 pointer-events-none"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>

      {/* Chatbot Modal */}
      <Chatbot isOpen={isOpen} onClose={closeChatbot} />
    </>
  );
}
