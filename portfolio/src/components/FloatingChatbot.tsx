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
      const scrollThreshold = 200; // Show popup after scrolling 200px

      if (
        scrollTop > scrollThreshold &&
        !hasScrolled &&
        !hasBeenOpened &&
        !permanentlyDismissed
      ) {
        setHasScrolled(true);
        setShowPopup(true);

        // Hide popup after 20 seconds
        setTimeout(() => {
          setShowPopup(false);
        }, 20000);
      }

      // Show popup again after more scrolling if dismissed fewer than 2 times
      if (
        scrollTop > 800 &&
        dismissCount < 2 &&
        !showPopup &&
        hasScrolled &&
        !hasBeenOpened &&
        !permanentlyDismissed
      ) {
        setShowPopup(true);

        // Hide popup after 15 seconds
        setTimeout(() => {
          setShowPopup(false);
        }, 15000);
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
        className="fixed bottom-6 right-6 z-40"
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
              className="absolute bottom-16 right-0 mb-2"
            >
              <div className="relative">
                <div
                  onClick={openChatbot}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 sm:p-6 w-72 sm:w-80 max-w-[calc(100vw-3rem)] border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissPopup();
                    }}
                    className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 z-10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <div className="pr-6 sm:pr-8">
                    <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                      👋 Hi there!
                    </p>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-2 sm:mb-3 leading-relaxed italic">
                      Let me tell you my story
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Help you learn more about my experience in AI Product
                      Management! Click anywhere to start chatting.
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
