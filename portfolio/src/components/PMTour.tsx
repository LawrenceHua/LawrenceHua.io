"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTarget,
  FiX,
  FiMessageCircle,
  FiCalendar,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiLayers,
  FiActivity,
  FiBriefcase,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";


interface PMTourProps {
  onSendMessage: () => void;
  onScheduleMeeting: () => void;
  onContactFormToggle?: (formType: "message" | "calendar") => void;
}

interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSection: string;
  icon: React.ReactNode;
  color: string;
  duration: number; // Dynamic duration in milliseconds
  highlights?: string[]; // Key metrics/achievements to highlight
  position:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "center"
    | "bottom-center";
}

const tourSteps: TourStep[] = [
  {
    id: "overview",
    title: "🚀 My PM Journey",
    content:
      "Juggling 3 PM roles simultaneously. AI-first products, data-driven growth, measurable impact at every turn.",
    targetSection: "hero",
    icon: <FiBriefcase className="w-5 h-5" />,
    color: "from-purple-600 to-pink-600",
    duration: 7000,
    highlights: [
      "3 Concurrent Roles",
      "AI Product Consultant",
      "Founder & CEO",
    ],
    position: "top-right",
  },
  {
    id: "metrics",
    title: "📊 Data-Driven Results",
    content:
      "Numbers don't lie. 30% growth, 50% engagement boost, 20% waste reduction. Every metric tells our success story.",
    targetSection: "timeline",
    icon: <FiTrendingUp className="w-5 h-5" />,
    color: "from-blue-600 to-cyan-600",
    duration: 8000,
    highlights: ["30% Growth", "50% Engagement", "20% Waste Reduction"],
    position: "top-right",
  },
  {
    id: "leadership",
    title: "👥 Cross-Functional Leadership",
    content:
      "From Motorola engineer to startup CEO. Cross-functional leadership across the entire product journey, from embedded systems to market launch.",
    targetSection: "timeline",
    icon: <FiUsers className="w-5 h-5" />,
    color: "from-green-600 to-teal-600",
    duration: 8500,
    highlights: ["Team Leadership", "Stakeholder Management", "GTM Strategy"],
    position: "bottom-right",
  },
  {
    id: "ai-innovation",
    title: "🤖 AI Product Innovation",
    content:
      "Computer Vision meets GPT magic. 15hrs/week saved through smart automation, 26% faster decisions via AI-powered tools.",
    targetSection: "timeline",
    icon: <FiActivity className="w-5 h-5" />,
    color: "from-orange-600 to-red-600",
    duration: 8000,
    highlights: ["Computer Vision", "GPT Integration", "15hrs/week Saved"],
    position: "bottom-left",
  },
  {
    id: "customer-focus",
    title: "🎯 Customer-Centric Approach",
    content:
      "250+ user interviews, 95% satisfaction rate. I turn customer pain points into breakthrough product features that users actually love.",
    targetSection: "projects",
    icon: <FiTarget className="w-5 h-5" />,
    color: "from-indigo-600 to-purple-600",
    duration: 8500,
    highlights: ["250+ Surveys", "User Research", "95% CSAT"],
    position: "top-left",
  },
  {
    id: "execution",
    title: "⚡ Rapid Execution",
    content:
      "Idea to MVP in 3 months. Competition winner, pilot secured, users delighted. Ship fast, iterate faster, scale smarter.",
    targetSection: "projects",
    icon: <FiStar className="w-5 h-5" />,
    color: "from-pink-600 to-rose-600",
    duration: 7000,
    highlights: ["3-Month MVP", "McGinnis Finalist", "Giant Eagle Pilot"],
    position: "bottom-center",
  },
];



// Tour analytics tracking
const trackTourEvent = async (
  eventType: 'tour_start' | 'tour_step' | 'tour_complete' | 'tour_abandon' | 'tour_cta_action',
  stepId: string,
  stepIndex: number,
  ctaAction?: string
) => {
  try {
    const sessionId = sessionStorage.getItem('sessionId') || 
                     localStorage.getItem('sessionId') || 
                     'tour-' + Date.now();
    
    const response = await fetch('/api/track-tour-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tourStep: stepId,
        action: eventType,
        sessionId,
        timeOnStep: stepIndex * 1000, // Convert to milliseconds
        metadata: {
          stepIndex,
          ctaAction: ctaAction || null,
          userAgent: navigator.userAgent
        }
      }),
    });
    
    if (response.ok) {
      console.log(`🎯 Tour event tracked: ${eventType} - ${stepId}`);
    } else {
      console.error('Failed to track tour event:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking tour event:', error);
  }
};

export default function PMTour({
  onSendMessage,
  onScheduleMeeting,
  onContactFormToggle,
}: PMTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalCTA, setShowFinalCTA] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // New states for popup flow
  const [showTourHoverPopup, setShowTourHoverPopup] = useState(false);
  const [popupsDisabled, setPopupsDisabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasShownAutoPopup, setHasShownAutoPopup] = useState(false);
  const [isAutoPopup, setIsAutoPopup] = useState(false);

  // Calculate total tour duration
  const totalDuration = tourSteps.reduce((sum, step) => sum + step.duration, 0);
  const totalSeconds = Math.ceil(totalDuration / 1000);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
    setShowFinalCTA(false);
    setReadingProgress(0);
    setHighlightedIndex(0);
    setTypedText("");
    setIsTypingComplete(false);
    setShowTourHoverPopup(false);
    setHasShownAutoPopup(true);
    
    // Track tour start
    trackTourEvent('tour_start', tourSteps[0].id, 0);
    
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Start with first step after a delay
    setTimeout(() => {
      scrollToSection(tourSteps[0].targetSection);
      // Track first step view
      trackTourEvent('tour_step', tourSteps[0].id, 0);
    }, 1000);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for fixed header
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  const getPopupPosition = (position: string) => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // On mobile, position all popups consistently in the center-bottom area
    // to ensure they're always visible and don't interfere with content
    if (isMobile) {
      return {
        bottom: "120px", // Above the mobile navigation
        left: "50%",
        transform: "translateX(-50%)",
        right: "auto",
      };
    }

    // Desktop positioning (unchanged)
    switch (position) {
      case "top-left":
        return { top: "80px", left: "24px", right: "auto" };
      case "top-right":
        return { top: "80px", right: "24px", left: "auto" };
      case "bottom-left":
        return { bottom: "80px", left: "24px", right: "auto" };
      case "bottom-right":
        return { bottom: "80px", right: "24px", left: "auto" };
      case "bottom-center":
        return {
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          right: "auto",
        };
      case "center":
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          right: "auto",
        };
      default:
        return { top: "80px", right: "24px", left: "auto" };
    }
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setReadingProgress(0);
      setHighlightedIndex(0);
      setTypedText("");
      setIsTypingComplete(false);
      scrollToSection(tourSteps[nextStepIndex].targetSection);
      
      // Track step view
      trackTourEvent('tour_step', tourSteps[nextStepIndex].id, nextStepIndex);
    } else {
      // Tour complete, show final CTA
      setShowFinalCTA(true);
      setIsActive(false);
      
      // Track tour completion
      trackTourEvent('tour_complete', tourSteps[currentStep].id, currentStep);
    }
  };

  const prevStep = () => {
    if (currentStep === 0) {
      // Restart tour
      startTour();
    } else {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      setReadingProgress(0);
      setHighlightedIndex(0);
      setTypedText("");
      setIsTypingComplete(false);
      scrollToSection(tourSteps[prevStepIndex].targetSection);
    }
  };

  const closeTour = () => {
    // Track tour abandonment if tour was active
    if (isActive) {
      trackTourEvent('tour_abandon', tourSteps[currentStep].id, currentStep);
    }
    
    setIsActive(false);
    setShowFinalCTA(false);
    setReadingProgress(0);
    setIsPaused(false);
    setHighlightedIndex(0);
    setCurrentStep(0);
    setTypedText("");
    setIsTypingComplete(false);
  };

  const togglePause = () => {
    const wasPaused = isPaused;
    setIsPaused(!isPaused);

    // If resuming from pause, scroll back to current step position
    if (wasPaused && isActive) {
      setTimeout(() => {
        scrollToSection(tourSteps[currentStep].targetSection);
      }, 100);
    }
  };

  const handleTourHoverPopupExit = () => {
    setShowTourHoverPopup(false);
    setPopupsDisabled(true);
    setHasShownAutoPopup(true);
  };

  const handleIconHover = () => {
    // Don't allow hover popup until auto-popup has been shown or timer expired
    if (!popupsDisabled && !isActive && !showFinalCTA && hasShownAutoPopup) {
      setIsHovering(true);
      setTimeout(() => {
        if (isHovering) {
          setShowTourHoverPopup(true);
          setIsAutoPopup(false);
        }
      }, 500); // Small delay before showing popup
    }
  };

  const handleIconLeave = () => {
    setIsHovering(false);
    setTimeout(() => {
      if (!isHovering) {
        setShowTourHoverPopup(false);
      }
    }, 300); // Small delay before hiding popup
  };

  const handleFinalCTAAction = (action: "message" | "meeting") => {
    // Track CTA action
    trackTourEvent('tour_cta_action', 'final_cta', tourSteps.length, action);
    
    // Close tour first to unlock screen
    closeTour();

    // Small delay to ensure screen is unlocked before scrolling
    setTimeout(() => {
      // Scroll to contact section
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        const elementPosition = contactSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 120;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      // Toggle the appropriate contact form
      if (onContactFormToggle) {
        if (action === "message") {
          onContactFormToggle("message");
        } else {
          onContactFormToggle("calendar");
        }
      }

      // Trigger the appropriate action after a delay for scroll
      setTimeout(() => {
        if (action === "message") {
          onSendMessage();
        } else {
          onScheduleMeeting();
        }
      }, 800);
    }, 100);
  };

  // Reading progress animation
  useEffect(() => {
    if (isActive && !isPaused) {
      const interval = setInterval(() => {
        setReadingProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 100 / (tourSteps[currentStep].duration / 100);
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, currentStep, isPaused]);

  // Highlight animation for key metrics
  useEffect(() => {
    if (isActive && tourSteps[currentStep].highlights) {
      const interval = setInterval(() => {
        setHighlightedIndex(
          (prev) =>
            (prev + 1) % (tourSteps[currentStep].highlights?.length || 1)
        );
      }, 2000); // Slower highlight rotation

      return () => clearInterval(interval);
    }
  }, [isActive, currentStep]);

  // Auto-advance steps based on dynamic duration
  useEffect(() => {
    if (isActive && !isPaused) {
      const timer = setTimeout(() => {
        nextStep();
      }, tourSteps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep, isPaused]);

  // Auto-close final CTA after 15 seconds
  useEffect(() => {
    if (showFinalCTA) {
      const timer = setTimeout(() => {
        setShowFinalCTA(false);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [showFinalCTA]);

  // Typing animation with punctuation pauses
  useEffect(() => {
    if (isActive && !isPaused) {
      const content = tourSteps[currentStep].content;
      let charIndex = 0;
      setTypedText("");
      setIsTypingComplete(false);

      const typeCharacter = () => {
        if (charIndex < content.length) {
          const currentChar = content[charIndex];
          setTypedText((prev) => prev + currentChar);
          charIndex++;

          let delay = 50; // Base typing speed

          // Add punctuation pauses
          if (currentChar === ".") {
            delay = 500; // 0.5 seconds for periods
          } else if (currentChar === ",") {
            delay = 250; // 0.25 seconds for commas
          }

          setTimeout(typeCharacter, delay);
        } else {
          setIsTypingComplete(true);
        }
      };

      // Start typing after a small delay
      const startTyping = setTimeout(typeCharacter, 500);

      return () => {
        clearTimeout(startTyping);
      };
    }
  }, [isActive, currentStep, isPaused]);

  // Screen locking functionality - lock to current step position
  useEffect(() => {
    const body = document.body;

    if (isActive && !isPaused) {
      // Lock scroll to current step position
      const preventDefault = (e: Event) => {
        e.preventDefault();
      };

      // Prevent all scroll events
      window.addEventListener("scroll", preventDefault, { passive: false });
      window.addEventListener("wheel", preventDefault, { passive: false });
      window.addEventListener("touchmove", preventDefault, { passive: false });
      document.addEventListener("keydown", (e) => {
        // Prevent arrow keys, page up/down, space, home, end
        if (
          [
            "ArrowUp",
            "ArrowDown",
            "PageUp",
            "PageDown",
            "Space",
            "Home",
            "End",
          ].includes(e.code)
        ) {
          e.preventDefault();
        }
      });

      return () => {
        window.removeEventListener("scroll", preventDefault);
        window.removeEventListener("wheel", preventDefault);
        window.removeEventListener("touchmove", preventDefault);
        document.removeEventListener("keydown", preventDefault);
      };
    } else if (showFinalCTA) {
      // Lock screen for final CTA popup
      const scrollY = window.scrollY;
      const documentElement = document.documentElement;

      // More robust background locking
      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      body.style.touchAction = "none";

      // Also lock document element
      documentElement.style.overflow = "hidden";
      documentElement.style.touchAction = "none";

      // Prevent scroll events on window
      const preventScroll = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      window.addEventListener("wheel", preventScroll, { passive: false });
      window.addEventListener("touchmove", preventScroll, { passive: false });
      window.addEventListener("scroll", preventScroll, { passive: false });

      return () => {
        // Restore styles
        body.style.position = "";
        body.style.top = "";
        body.style.left = "";
        body.style.right = "";
        body.style.width = "";
        body.style.overflow = "";
        body.style.touchAction = "";

        documentElement.style.overflow = "";
        documentElement.style.touchAction = "";

        // Remove scroll event listeners
        window.removeEventListener("wheel", preventScroll);
        window.removeEventListener("touchmove", preventScroll);
        window.removeEventListener("scroll", preventScroll);

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isActive, isPaused, showFinalCTA]);

  // Auto-show tour popup after 10 seconds
  useEffect(() => {
    if (!hasShownAutoPopup && !isActive && !showFinalCTA && !popupsDisabled) {
      console.log("🎯 Auto-popup timer started - 10 seconds countdown...");

      const autoPopupTimer = setTimeout(() => {
        console.log("🎯 Auto-popup triggered!");
        setShowTourHoverPopup(true);
        setHasShownAutoPopup(true);
        setIsAutoPopup(true);
      }, 5000); // 10 seconds delay

      // Also set hasShownAutoPopup after the timer period even if conditions change
      const fallbackTimer = setTimeout(() => {
        console.log(
          "🎯 Auto-popup period ended - manual interactions now enabled"
        );
        setHasShownAutoPopup(true);
      }, 5000);

      return () => {
        console.log("🎯 Auto-popup timer cleared");
        clearTimeout(autoPopupTimer);
        clearTimeout(fallbackTimer);
      };
    }
  }, [hasShownAutoPopup, isActive, showFinalCTA, popupsDisabled]);

  return (
    <>
      {/* Single Elegant Icon */}
      {!isActive && !showFinalCTA && (
        <div className="relative">
          <motion.div
            onMouseEnter={handleIconHover}
            onMouseLeave={handleIconLeave}
            onClick={() => {
              // Only allow manual click after auto-popup period
              if (hasShownAutoPopup) {
                setShowTourHoverPopup(true);
                setIsAutoPopup(false);
              }
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: popupsDisabled
                ? 1
                : hasShownAutoPopup
                  ? [1, 1.05, 1]
                  : [1, 1.02, 1], // Subtle animation during wait
              rotate: popupsDisabled
                ? 0
                : hasShownAutoPopup
                  ? [0, 5, -5, 0]
                  : [0, 2, -2, 0], // Reduced rotation during wait
            }}
            transition={{
              duration: popupsDisabled ? 0.3 : hasShownAutoPopup ? 3 : 4, // Slower during wait
              repeat: popupsDisabled ? 0 : Infinity,
              ease: "easeInOut",
            }}
            className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <span className="text-xl">🎯</span>
          </motion.div>

          {/* Single Consolidated Popup */}
          <AnimatePresence>
            {showTourHoverPopup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: isAutoPopup ? [1, 1.02, 1] : 1,
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{
                  type: "spring",
                  damping: 25,
                  stiffness: 400,
                  scale: isAutoPopup ? { duration: 2, repeat: 2 } : {},
                }}
                className={`absolute bottom-16 right-0 w-80 sm:w-96 md:w-[420px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 z-50 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none ${
                  isAutoPopup
                    ? "ring-2 ring-purple-400/50 ring-offset-2 ring-offset-white/20"
                    : ""
                }`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={handleIconLeave}
              >
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
                  <button
                    onClick={handleTourHoverPopupExit}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
                  >
                    <FiX className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" />
                  </button>

                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{
                          duration: 20,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"
                      >
                        <span className="text-2xl">✨</span>
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {hasShownAutoPopup
                            ? "Explore & Connect"
                            : "👋 Welcome!"}
                        </h3>
                        <p className="text-blue-100 text-sm font-medium">
                          {hasShownAutoPopup
                            ? "Choose your journey with Lawrence"
                            : "Ready to explore Lawrence's PM expertise?"}
                        </p>
                      </div>
                    </div>

                    <p className="text-blue-50 text-sm leading-relaxed">
                      {hasShownAutoPopup
                        ? `Take a guided ${totalSeconds}s PM showcase, chat with my AI assistant, or connect directly!`
                        : `Discover how I approach product challenges! Take a ${totalSeconds}s interactive tour or ask my AI assistant anything.`}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 sm:p-6 space-y-3">
                  {/* Primary Actions Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={startTour}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-400/20 min-h-[80px] sm:min-h-[90px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-base sm:text-lg">🎯</span>
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">
                          PM Tour
                        </span>
                        <span className="text-xs opacity-90 hidden sm:block">
                          Interactive Demo
                        </span>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        onSendMessage();
                        setShowTourHoverPopup(false);
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-400/20 min-h-[80px] sm:min-h-[90px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-base sm:text-lg">💬</span>
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">
                          Ask AI
                        </span>
                        <span className="text-xs opacity-90 hidden sm:block">
                          Chat Assistant
                        </span>
                      </div>
                    </motion.button>
                  </div>

                  {/* Secondary Actions Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => {
                        if (onContactFormToggle) onContactFormToggle("message");
                        const contactSection =
                          document.getElementById("contact");
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: "smooth" });
                        }
                        setShowTourHoverPopup(false);
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-400/20 min-h-[80px] sm:min-h-[90px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-base sm:text-lg">📧</span>
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">
                          Message
                        </span>
                        <span className="text-xs opacity-90 hidden sm:block">
                          Send Email
                        </span>
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        if (onContactFormToggle)
                          onContactFormToggle("calendar");
                        const contactSection =
                          document.getElementById("contact");
                        if (contactSection) {
                          contactSection.scrollIntoView({ behavior: "smooth" });
                        }
                        setShowTourHoverPopup(false);
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-400/20 min-h-[80px] sm:min-h-[90px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative z-10 flex flex-col items-center gap-1 sm:gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-base sm:text-lg">📅</span>
                        </div>
                        <span className="font-semibold text-xs sm:text-sm">
                          Meet
                        </span>
                        <span className="text-xs opacity-90 hidden sm:block">
                          Schedule Call
                        </span>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tour Step Popups */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`fixed z-50 max-w-md pointer-events-auto ${
              isPaused ? "backdrop-blur-sm" : ""
            }`}
            style={{
              ...getPopupPosition(tourSteps[currentStep].position),
              maxWidth:
                window.innerWidth < 768 ? "calc(100vw - 2rem)" : "28rem",
              position: "fixed", // Always fixed positioning
            }}
          >
            <div
              className={`bg-gradient-to-br ${tourSteps[currentStep].color} p-1 rounded-2xl shadow-2xl ${
                isPaused ? "backdrop-blur-sm" : ""
              }`}
            >
              <div
                className={`bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-6 relative transition-all duration-300 ${
                  isPaused
                    ? "backdrop-blur-md bg-white/95 dark:bg-gray-900/95"
                    : ""
                }`}
              >
                <button
                  onClick={closeTour}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1 sm:p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50"
                  aria-label="Close tour"
                >
                  <FiX className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                </button>

                {/* Pause/Resume Button */}
                <motion.button
                  onClick={togglePause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`absolute top-2 right-10 sm:top-3 sm:right-12 px-2 py-1 sm:px-3 sm:py-1 text-xs font-medium rounded-full transition-all duration-200 shadow-sm border ${
                    isPaused
                      ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-300 animate-pulse"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300"
                  }`}
                >
                  {isPaused ? "▶️ Resume" : "⏸️ Pause"}
                </motion.button>

                {/* Back Button - Fixed positioning relative to card */}
                <motion.button
                  onClick={prevStep}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`absolute top-1/2 -left-3 sm:-left-4 -translate-y-1/2 p-2 sm:p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 ${
                    isPaused ? "opacity-90" : ""
                  }`}
                  title={currentStep === 0 ? "Restart tour" : "Previous step"}
                  style={{ position: "absolute" }}
                >
                  <FiChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.button>

                {/* Skip Button - Fixed positioning relative to card */}
                <motion.button
                  onClick={nextStep}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`absolute top-1/2 -right-3 sm:-right-4 -translate-y-1/2 p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10 ${
                    isPaused ? "opacity-90" : ""
                  }`}
                  title="Skip to next step"
                  style={{ position: "absolute" }}
                >
                  <FiChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </motion.button>

                <div className="flex items-start gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 3, -3, 0] }} // Reduced rotation
                    transition={{ duration: 4, repeat: Infinity }} // Slower animation
                    className={`p-2 sm:p-3 bg-gradient-to-br ${tourSteps[currentStep].color} rounded-xl text-white flex-shrink-0`}
                  >
                    {tourSteps[currentStep].icon}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-2">
                      {tourSteps[currentStep].title}
                    </h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                    >
                      {typedText}
                      {!isTypingComplete && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5"
                        />
                      )}
                    </motion.p>
                  </div>
                </div>

                {/* Key highlights */}
                {tourSteps[currentStep].highlights && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tourSteps[currentStep].highlights.map(
                      (highlight, index) => (
                        <motion.span
                          key={highlight}
                          initial={{ scale: 0.9, opacity: 0.6 }}
                          animate={{
                            scale: highlightedIndex === index ? 1.05 : 1, // Reduced scale
                            opacity: highlightedIndex === index ? 1 : 0.7,
                          }}
                          transition={{ duration: 0.5 }} // Slower transition
                          className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${tourSteps[currentStep].color} text-white`}
                        >
                          {highlight}
                        </motion.span>
                      )
                    )}
                  </div>
                )}

                {/* Reading progress bar */}
                <div className="mb-3">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${readingProgress}%` }}
                      className={`h-full bg-gradient-to-r ${tourSteps[currentStep].color}`}
                    />
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 sm:gap-2">
                    {tourSteps.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0.9 }}
                        animate={{
                          scale: index === currentStep ? 1.1 : 1, // Reduced scale
                          opacity: index <= currentStep ? 1 : 0.3,
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentStep
                            ? `bg-gradient-to-r ${tourSteps[currentStep].color}`
                            : index < currentStep
                              ? "bg-green-500"
                              : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paused State Indicator */}
      <AnimatePresence>
        {isActive && isPaused && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 z-40 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-xl shadow-lg border border-green-300 dark:border-green-700 animate-pulse"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>🟢</span>
              <span>Tour paused - You can scroll freely!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final CTA */}
      <AnimatePresence>
        {showFinalCTA && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              // Only close if clicking the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                closeTour();
              }
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              animate={{ scale: [1, 1.01, 1] }} // Reduced pulse
              transition={{ duration: 3, repeat: Infinity }} // Slower pulse
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md mx-auto text-center relative shadow-2xl border-2 border-gradient-to-r from-purple-500 to-blue-500"
            >
              <button
                onClick={closeTour}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>

              <div className="mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }} // Slower rotation
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-2xl">🎯</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  That's the PM Experience
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  You just experienced how I approach product challenges:
                  structured storytelling, data-driven insights, and
                  customer-focused solutions. Ready to discuss how this applies
                  to your team?
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-4">
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    onClick={() => handleFinalCTAAction("message")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    Send Message
                  </motion.button>
                  <motion.button
                    onClick={() => handleFinalCTAAction("meeting")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <FiCalendar className="w-4 h-4" />
                    Schedule Meeting
                  </motion.button>
                </div>

                <motion.button
                  onClick={startTour}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                >
                  <span>🔄</span>
                  <span>That was fun, do it again!</span>
                </motion.button>
              </div>

              <p className="text-xs text-gray-400">
                This popup will close automatically in 15 seconds
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
