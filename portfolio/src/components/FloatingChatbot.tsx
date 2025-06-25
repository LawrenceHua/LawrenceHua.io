"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import Chatbot from "./Chatbot";

// Add Firebase imports for analytics tracking
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let db: any = null;
if (typeof window !== "undefined") {
  try {
    const app = !getApps().length
      ? initializeApp(firebaseConfig)
      : getApps()[0];
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

// Generate session ID for analytics tracking
function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

// Track chatbot events
async function trackChatbotEvent(eventType: string, data: any = {}) {
  if (!db) return;

  try {
    await addDoc(collection(db, "chatbot_analytics"), {
      eventType,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      userAgent: navigator.userAgent,
      page: window.location.pathname,
      ...data,
    });
    console.log(`Tracked chatbot event: ${eventType}`);
  } catch (error) {
    console.error("Error tracking chatbot event:", error);
  }
}

interface FloatingChatbotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  tourActive?: boolean;
}

export function FloatingChatbot({
  isOpen: externalIsOpen,
  onOpenChange,
  tourActive = false,
}: FloatingChatbotProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;
  const [showPopup, setShowPopup] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [permanentlyDismissed, setPermanentlyDismissed] = useState(false);

  // Track when chatbot button becomes visible
  useEffect(() => {
    if (!tourActive) {
      trackChatbotEvent("chatbot_button_loaded", {
        tourActive,
        page: window.location.pathname,
      });
    }
  }, [tourActive]);

  useEffect(() => {
    const handleScroll = () => {
      // Check if skills section is in viewport
      const skillsSection = document.getElementById("skills");
      if (skillsSection && !hasBeenOpened && !permanentlyDismissed) {
        const rect = skillsSection.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.top <= window.innerHeight;

        if (isInViewport && !showPopup) {
          setShowPopup(true);
          setHasScrolled(true);

          // Track popup show event
          trackChatbotEvent("popup_shown", {
            trigger: "scroll_to_skills",
            scrollPosition: window.scrollY,
          });

          // Hide popup after time
          setTimeout(() => {
            setShowPopup(false);
          }, 15000);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasBeenOpened, permanentlyDismissed, showPopup]);

  // Show popup after 20 seconds if still on about/above sections
  useEffect(() => {
    if (dismissCount < 1 && !hasBeenOpened && !permanentlyDismissed) {
      const timer = setTimeout(() => {
        if (!isOpen && !showPopup) {
          // Check if user is still in the upper sections (home/about)
          const aboutSection = document.getElementById("about");
          const skillsSection = document.getElementById("skills");

          if (aboutSection && skillsSection) {
            const skillsRect = skillsSection.getBoundingClientRect();
            // Only show popup if user is still above skills section
            const isInUpperSections = skillsRect.top > 0;

            if (isInUpperSections) {
              setShowPopup(true);

              // Track popup show event
              trackChatbotEvent("popup_shown", {
                trigger: "timer_20s",
                timeOnPage: 20000,
              });

              // Hide popup after 15 seconds
              setTimeout(() => {
                setShowPopup(false);
              }, 15000);
            }
          }
        }
      }, 20000); // Show after 20 seconds

      return () => clearTimeout(timer);
    }
  }, [isOpen, showPopup, dismissCount, hasBeenOpened, permanentlyDismissed]);

  const dismissPopup = () => {
    setShowPopup(false);
    setDismissCount((prev) => prev + 1);
    setPermanentlyDismissed(true); // Never show popups again after first dismissal

    // Track popup dismissal
    trackChatbotEvent("popup_dismissed", {
      dismissCount: dismissCount + 1,
      timeVisible: 15000, // Approximate time visible
    });
  };

  const openChatbot = () => {
    // Prevent opening chatbot when tour is active
    if (tourActive) {
      trackChatbotEvent("chatbot_open_blocked", {
        reason: "tour_active",
      });
      return;
    }

    setIsOpen(true);
    setShowPopup(false);
    setHasBeenOpened(true);

    // Track chatbot open event
    trackChatbotEvent("chatbot_opened", {
      source: showPopup ? "popup_click" : "button_click",
      hasBeenOpenedBefore: hasBeenOpened,
      dismissCount,
    });

    // Pre-load system prompt in the background for faster responses
    fetch("/api/chatbot", { method: "GET" })
      .then((response) => response.json())
      .then((data) => {
        console.log("System prompt pre-loaded:", data.message);
      })
      .catch((error) => {
        console.warn("Pre-loading failed (non-critical):", error);
      });
  };

  const closeChatbot = () => {
    setIsOpen(false);
    
    // Track chatbot close event
    trackChatbotEvent("chatbot_closed", {
      hasBeenOpened: hasBeenOpened,
    });

    // Don't reset permanentlyDismissed - once dismissed, stay dismissed
    // Only reset if user opened the chatbot (which shows they're engaged)
    if (!permanentlyDismissed) {
      setHasBeenOpened(false);
      setDismissCount(0);
      setHasScrolled(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] pointer-events-none"
        initial={tourActive ? false : { scale: 0, opacity: 0 }}
        animate={tourActive ? false : { scale: 1, opacity: 1 }}
        transition={tourActive ? {} : { delay: 1, duration: 0.3 }}
        style={{ pointerEvents: 'none' }}
      >
        {/* Scroll Popup */}
        <AnimatePresence>
          {showPopup && !tourActive && (
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 10 }}
              className="absolute bottom-20 right-0 mb-2 sm:bottom-20 sm:right-0 pointer-events-auto"
              style={{ pointerEvents: 'auto' }}
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
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 p-2 sm:p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 z-10 bg-white/80 dark:bg-slate-800/80 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 flex items-center justify-center"
                    aria-label="Close popup"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                  <div className="pr-8 sm:pr-6">
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
          disabled={tourActive}
          className={`h-14 w-14 rounded-full text-white shadow-lg transition-all duration-300 flex items-center justify-center group relative z-10 ${
            tourActive
              ? "bg-gray-400 cursor-not-allowed opacity-50 pointer-events-none"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl cursor-pointer pointer-events-auto"
          }`}
          whileHover={tourActive ? {} : { scale: 1.1 }}
          whileTap={tourActive ? {} : { scale: 0.9 }}
          title={tourActive ? "Chat is disabled during tour" : "Open chat"}
          style={{ pointerEvents: tourActive ? 'none' : 'auto' }}
        >
          <MessageCircle
            className={`h-6 w-6 transition-transform ${tourActive ? "" : "group-hover:scale-110"}`}
          />
        </motion.button>

        {/* Removed pulse animation for performance */}
      </motion.div>

      {/* Chatbot Modal */}
      <Chatbot isOpen={isOpen} onClose={closeChatbot} />
    </>
  );
}
