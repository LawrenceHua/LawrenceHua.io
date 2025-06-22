"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTarget,
  FiX,
  FiMessageCircle,
  FiCalendar,
  FiStar,
} from "react-icons/fi";

interface PMTourProps {
  onSendMessage: () => void;
  onScheduleMeeting: () => void;
}

interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSection: string;
  icon: React.ReactNode;
  color: string;
}

const tourSteps: TourStep[] = [
  {
    id: "experience",
    title: "🚀 Product Management Experience",
    content:
      "I've scaled communities by 30%, led A/B testing programs, and built AI-powered platforms that reduce waste by 20%. Let me show you my journey!",
    targetSection: "timeline",
    icon: <FiTarget className="w-5 h-5" />,
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "projects",
    title: "🎯 PM Projects & Impact",
    content:
      "From Expired Solutions (AI grocery platform) to PM Happy Hour community growth - I turn ideas into measurable results!",
    targetSection: "projects",
    icon: <FiStar className="w-5 h-5" />,
    color: "from-green-500 to-blue-600",
  },
];

export default function PMTour({
  onSendMessage,
  onScheduleMeeting,
}: PMTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showFinalCTA, setShowFinalCTA] = useState(false);

  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
    setShowFinalCTA(false);
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

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      scrollToSection(tourSteps[nextStepIndex].targetSection);
    } else {
      // Tour complete, show final CTA
      setShowFinalCTA(true);
      setIsActive(false);
    }
  };

  const closeTour = () => {
    setIsActive(false);
    setShowFinalCTA(false);
  };

  // Auto-advance steps after 4 seconds
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        nextStep();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep]);

  // Auto-close final CTA after 10 seconds
  useEffect(() => {
    if (showFinalCTA) {
      const timer = setTimeout(() => {
        setShowFinalCTA(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showFinalCTA]);

  return (
    <>
      {/* Tour Trigger Button */}
      {!isActive && !showFinalCTA && (
        <motion.button
          onClick={startTour}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
            <FiTarget className="w-4 h-4" />
          </div>
          <span>See My PM Value in Action! ✨</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </motion.button>
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
            className="fixed top-20 right-6 z-50 max-w-sm"
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

                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`p-3 bg-gradient-to-br ${tourSteps[currentStep].color} rounded-xl text-white`}
                  >
                    {tourSteps[currentStep].icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {tourSteps[currentStep].title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {tourSteps[currentStep].content}
                    </p>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep
                            ? "bg-blue-500"
                            : index < currentStep
                              ? "bg-green-500"
                              : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    {currentStep + 1} of {tourSteps.length}
                  </span>
                </div>

                {/* Cute loading animation */}
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      />
                    ))}
                  </div>
                  <span className="ml-3 text-xs text-gray-500">
                    Auto-advancing...
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
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md mx-auto text-center relative shadow-2xl border-2 border-gradient-to-r from-purple-500 to-blue-500"
            >
              <button
                onClick={closeTour}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>

              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  So, am I what you're looking for?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Ready to bring this PM energy to your team? Let's talk! 🚀
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={() => {
                    onSendMessage();
                    closeTour();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  Send Message
                </motion.button>
                <motion.button
                  onClick={() => {
                    onScheduleMeeting();
                    closeTour();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FiCalendar className="w-4 h-4" />
                  Schedule Meeting
                </motion.button>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                This popup will close automatically in 10 seconds
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
