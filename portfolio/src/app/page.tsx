"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBriefcase,
  FiTrendingUp,
  FiUsers,
  FiActivity,
  FiTarget,
  FiStar,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
  FiCalendar,
} from "react-icons/fi";
import { ModernNavigation } from "../components/ModernNavigation";
import { HeroSection } from "../components/sections/HeroSection";
import { AboutSection } from "../components/sections/AboutSection";
import { SkillsSection } from "../components/sections/SkillsSection";
import { TimelineSection } from "../components/sections/TimelineSection";
import { ProjectsSection } from "../components/sections/ProjectsSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { ContactSection } from "../components/sections/ContactSection";
import { FloatingChatbot } from "../components/FloatingChatbot";

interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSection: string;
  icon: React.ReactNode;
  color: string;
  duration: number;
  highlights?: string[];
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
    duration: 11000,
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
    duration: 11500,
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
    duration: 12000,
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
    duration: 11500,
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
    duration: 12000,
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
    duration: 11000,
    highlights: ["3-Month MVP", "McGinnis Finalist", "Giant Eagle Pilot"],
    position: "center",
  },
];

export default function ModernHome() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [contactFormType, setContactFormType] = useState<
    "none" | "message" | "calendar"
  >("message");

  // Tour state
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showFinalCTA, setShowFinalCTA] = useState(false);

  // Helper function to render highlighted text
  const renderHighlightedText = (text: string, highlightIndex: number) => {
    const characters = text.split("");
    return (
      <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {characters.map((char, index) => (
          <span
            key={index}
            className={`transition-all duration-300 ease-out ${
              highlightIndex === -1
                ? "text-gray-600 dark:text-gray-300" // All highlights cleared
                : index <= highlightIndex
                  ? "text-white dark:text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] dark:drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]"
                  : "text-gray-400 dark:text-gray-500 opacity-60"
            }`}
          >
            {char}
          </span>
        ))}
      </span>
    );
  };

  const handleSendMessage = () => {
    setIsChatbotOpen(true);
    // Wait for chatbot to open, then trigger message flow
    setTimeout(() => {
      // This will trigger the /message command in the chatbot
      const event = new CustomEvent("triggerChatbotCommand", {
        detail: { command: "message" },
      });
      window.dispatchEvent(event);
    }, 500);
  };

  const handleScheduleMeeting = () => {
    setIsChatbotOpen(true);
    // Wait for chatbot to open, then trigger meeting flow
    setTimeout(() => {
      // This will trigger the /meeting command in the chatbot
      const event = new CustomEvent("triggerChatbotCommand", {
        detail: { command: "meeting" },
      });
      window.dispatchEvent(event);
    }, 500);
  };

  const handleContactFormToggle = (formType: "message" | "calendar") => {
    setContactFormType(formType);
  };

  // Tour functions
  const startTour = () => {
    setIsActive(true);
    setCurrentStep(0);
    setShowFinalCTA(false);
    setHighlightedIndex(0);
    setCountdown(0);
    setCurrentCharacterIndex(0);
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
      setHighlightedIndex(0);
      setCountdown(0);
      setCurrentCharacterIndex(0);
      scrollToSection(tourSteps[nextStepIndex].targetSection);
    } else {
      // Tour complete, scroll to testimonials first then show final CTA
      const testimonialsSection = document.getElementById("testimonials");
      if (testimonialsSection) {
        const elementPosition = testimonialsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - 120;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }

      setIsActive(false);
      // Show final CTA after scroll completes
      setTimeout(() => {
        setShowFinalCTA(true);
      }, 800);
    }
  };

  const prevStep = () => {
    if (currentStep === 0) {
      // Restart tour
      startTour();
    } else {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      setHighlightedIndex(0);
      setCountdown(0);
      setCurrentCharacterIndex(0);
      scrollToSection(tourSteps[prevStepIndex].targetSection);
    }
  };

  const closeTour = () => {
    setIsActive(false);
    setShowFinalCTA(false);
    setCountdown(0);
    setCurrentCharacterIndex(0);
  };

  const handleFinalCTAAction = (action: "message" | "meeting") => {
    // Close tour
    closeTour();

    // Trigger the appropriate action immediately since we're already at testimonials
    if (action === "message") {
      handleSendMessage();
    } else {
      handleScheduleMeeting();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Tour effects
  useEffect(() => {
    if (isActive) {
      const currentStepData = tourSteps[currentStep];
      const characters = currentStepData.content.split("");
      const totalCharacters = characters.length;
      const highlightDuration = currentStepData.duration - 3000; // Reserve 3 seconds for pause
      const intervalTime = 50; // 50ms per character for smooth highlighting
      const totalIntervals = highlightDuration / intervalTime;
      const charactersPerInterval = totalCharacters / totalIntervals;

      let currentCharacterCount = 0;

      const interval = setInterval(() => {
        currentCharacterCount += charactersPerInterval;
        setCurrentCharacterIndex(Math.floor(currentCharacterCount));

        if (currentCharacterCount >= totalCharacters) {
          clearInterval(interval);
          // After highlighting is complete, clear highlights and show countdown
          setTimeout(() => {
            setCurrentCharacterIndex(-1); // Clear all highlights

            // Start 1.5-second countdown
            let countdownValue = 1.5;
            setCountdown(countdownValue);

            const countdownInterval = setInterval(() => {
              countdownValue -= 0.1;
              setCountdown(Math.max(0, countdownValue));

              if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                nextStep();
              }
            }, 100);
          }, 100);
        }
      }, intervalTime);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (isActive && tourSteps[currentStep].highlights) {
      const interval = setInterval(() => {
        setHighlightedIndex(
          (prev) =>
            (prev + 1) % (tourSteps[currentStep].highlights?.length || 1)
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (showFinalCTA) {
      const timer = setTimeout(() => {
        setShowFinalCTA(false);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [showFinalCTA]);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* Modern Navigation */}
      <ModernNavigation tourActive={isActive} />

      {/* Modern Hero Section */}
      <HeroSection onStartTour={startTour} tourActive={isActive} />

      {/* Modern About Section */}
      <AboutSection />

      {/* Modern Skills Section */}
      <SkillsSection />

      {/* Timeline Section */}
      <TimelineSection tourActive={isActive} />

      {/* Projects Section */}
      <ProjectsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Contact Section */}
      <ContactSection
        externalFormType={contactFormType}
        onFormTypeChange={setContactFormType}
        tourActive={isActive}
      />

      {/* Floating Chatbot */}
      <FloatingChatbot
        isOpen={isChatbotOpen}
        onOpenChange={setIsChatbotOpen}
        tourActive={isActive}
      />

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
                  className="absolute top-3 right-3 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  STOP
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
                  <div
                    className={`p-3 bg-gradient-to-br ${tourSteps[currentStep].color} rounded-xl text-white`}
                  >
                    {tourSteps[currentStep].icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {tourSteps[currentStep].title}
                    </h3>
                    {renderHighlightedText(
                      tourSteps[currentStep].content,
                      currentCharacterIndex
                    )}
                  </div>
                </div>

                {/* Key highlights */}
                {tourSteps[currentStep].highlights && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {tourSteps[currentStep].highlights.map(
                      (highlight, index) => (
                        <span
                          key={highlight}
                          className={`px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${tourSteps[currentStep].color} text-white ${
                            highlightedIndex === index
                              ? "opacity-100"
                              : "opacity-70"
                          }`}
                        >
                          {highlight}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* Step indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentStep
                            ? `bg-gradient-to-r ${tourSteps[currentStep].color} scale-110`
                            : index < currentStep
                              ? "bg-green-500"
                              : "bg-gray-300 opacity-30"
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
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeTour}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-md mx-auto text-center relative shadow-2xl border-2 border-purple-500"
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
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 left-4 z-40 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        title="Back to top"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </main>
  );
}
