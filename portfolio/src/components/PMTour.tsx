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
      "3 concurrent PM roles, driving measurable impact through AI-powered solutions, community growth, and operational excellence.",
    targetSection: "hero",
    icon: <FiBriefcase className="w-5 h-5" />,
    color: "from-purple-600 to-pink-600",
    duration: 7000, // +2 seconds
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
      "Every decision backed by metrics: 30% community growth, 50% engagement lift, 20% waste reduction, 35% test score improvement.",
    targetSection: "timeline",
    icon: <FiTrendingUp className="w-5 h-5" />,
    color: "from-blue-600 to-cyan-600",
    duration: 8000, // +2 seconds
    highlights: ["30% Growth", "50% Engagement", "20% Waste Reduction"],
    position: "top-right",
  },
  {
    id: "leadership",
    title: "👥 Cross-Functional Leadership",
    content:
      "Led teams across engineering, design, and business. From Motorola's embedded systems to startup founder managing full product lifecycle.",
    targetSection: "timeline",
    icon: <FiUsers className="w-5 h-5" />,
    color: "from-green-600 to-teal-600",
    duration: 8500, // +3 seconds
    highlights: ["Team Leadership", "Stakeholder Management", "GTM Strategy"],
    position: "bottom-right",
  },
  {
    id: "ai-innovation",
    title: "🤖 AI Product Innovation",
    content:
      "Built CV + GPT platforms, automated workflows saving 15hrs/week, and created AI-driven decision tools reducing time by 26%.",
    targetSection: "projects",
    icon: <FiActivity className="w-5 h-5" />,
    color: "from-orange-600 to-red-600",
    duration: 8000, // +2 seconds
    highlights: ["Computer Vision", "GPT Integration", "15hrs/week Saved"],
    position: "bottom-left",
  },
  {
    id: "customer-focus",
    title: "🎯 Customer-Centric Approach",
    content:
      "250+ shopper surveys, 15 executive interviews, 95% customer satisfaction. I obsess over user needs and translate them into features.",
    targetSection: "projects",
    icon: <FiTarget className="w-5 h-5" />,
    color: "from-indigo-600 to-purple-600",
    duration: 8500, // +3 seconds
    highlights: ["250+ Surveys", "User Research", "95% CSAT"],
    position: "top-left",
  },
  {
    id: "execution",
    title: "⚡ Rapid Execution",
    content:
      "From ideation to launch: Built MVP in 3 months, secured pilot opportunities, won venture competitions. I ship fast and iterate faster.",
    targetSection: "projects",
    icon: <FiStar className="w-5 h-5" />,
    color: "from-pink-600 to-rose-600",
    duration: 7000, // +2 seconds
    highlights: ["3-Month MVP", "McGinnis Finalist", "Giant Eagle Pilot"],
    position: "bottom-center",
  },
];

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

  // New states for popup flow
  const [showTourHoverPopup, setShowTourHoverPopup] = useState(false);
  const [popupsDisabled, setPopupsDisabled] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Calculate total tour duration
  const totalDuration = tourSteps.reduce((sum, step) => sum + step.duration, 0);
  const totalSeconds = Math.ceil(totalDuration / 1000);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
    setShowFinalCTA(false);
    setReadingProgress(0);
    setHighlightedIndex(0);
    setShowTourHoverPopup(false);
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Start with first step after a delay
    setTimeout(() => {
      scrollToSection(tourSteps[0].targetSection);
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
      scrollToSection(tourSteps[nextStepIndex].targetSection);
    } else {
      // Tour complete, show final CTA
      setShowFinalCTA(true);
      setIsActive(false);
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
      scrollToSection(tourSteps[prevStepIndex].targetSection);
    }
  };

  const closeTour = () => {
    setIsActive(false);
    setShowFinalCTA(false);
    setReadingProgress(0);
  };

  const handleTourHoverPopupExit = () => {
    setShowTourHoverPopup(false);
    setPopupsDisabled(true);
  };

  const handleIconHover = () => {
    if (!popupsDisabled && !isActive && !showFinalCTA) {
      setIsHovering(true);
      setTimeout(() => {
        if (isHovering) {
          setShowTourHoverPopup(true);
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

    // Close tour
    closeTour();

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
    }, 1000);
  };

  // Reading progress animation
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setReadingProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 100 / (tourSteps[currentStep].duration / 100);
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isActive, currentStep]);

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
    if (isActive) {
      const timer = setTimeout(() => {
        nextStep();
      }, tourSteps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep]);

  // Auto-close final CTA after 15 seconds
  useEffect(() => {
    if (showFinalCTA) {
      const timer = setTimeout(() => {
        setShowFinalCTA(false);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [showFinalCTA]);

  return (
    <>
      {/* Single Elegant Icon */}
      {!isActive && !showFinalCTA && (
        <div className="relative">
          <motion.div
            onMouseEnter={handleIconHover}
            onMouseLeave={handleIconLeave}
            onClick={() => setShowTourHoverPopup(true)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: popupsDisabled ? 1 : [1, 1.05, 1], // Reduced animation
              rotate: popupsDisabled ? 0 : [0, 5, -5, 0], // Reduced rotation
            }}
            transition={{
              duration: popupsDisabled ? 0.3 : 3, // Slower animation
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
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className="absolute bottom-16 right-0 w-80 sm:w-96 md:w-[420px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 z-50 overflow-hidden max-w-[calc(100vw-2rem)] sm:max-w-none"
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
                          Explore & Connect
                        </h3>
                        <p className="text-blue-100 text-sm font-medium">
                          Choose your journey with Lawrence
                        </p>
                      </div>
                    </div>

                    <p className="text-blue-50 text-sm leading-relaxed">
                      Take a guided{" "}
                      <span className="font-semibold text-white">
                        {totalSeconds}s
                      </span>{" "}
                      PM showcase, chat with my AI assistant, or connect
                      directly!
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
            className="fixed z-50 max-w-md"
            style={getPopupPosition(tourSteps[currentStep].position)}
          >
            <div
              className={`bg-gradient-to-br ${tourSteps[currentStep].color} p-1 rounded-2xl shadow-2xl`}
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 relative">
                <button
                  onClick={closeTour}
                  className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <FiX className="w-4 h-4 text-gray-500" />
                </button>

                {/* Back Button */}
                <motion.button
                  onClick={prevStep}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-1/2 -left-4 -translate-y-1/2 p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                  title={currentStep === 0 ? "Restart tour" : "Previous step"}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </motion.button>

                {/* Skip Button */}
                <motion.button
                  onClick={nextStep}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-1/2 -right-4 -translate-y-1/2 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                  title="Skip to next step"
                >
                  <FiChevronRight className="w-4 h-4" />
                </motion.button>

                <div className="flex items-start gap-3 mb-4">
                  <motion.div
                    animate={{ rotate: [0, 3, -3, 0] }} // Reduced rotation
                    transition={{ duration: 4, repeat: Infinity }} // Slower animation
                    className={`p-3 bg-gradient-to-br ${tourSteps[currentStep].color} rounded-xl text-white`}
                  >
                    {tourSteps[currentStep].icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {tourSteps[currentStep].title}
                    </h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8 }} // Slower fade-in
                      className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed"
                    >
                      {tourSteps[currentStep].content}
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
                          className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${tourSteps[currentStep].color} text-white`}
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
                  <div className="flex gap-2">
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

      {/* Final CTA */}
      <AnimatePresence>
        {showFinalCTA && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeTour}
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
