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
  FiArrowDown,
  FiArrowUp,
  FiArrowLeft,
  FiArrowRight,
  FiUser,
  FiTool,
  FiBookOpen,
  FiPause,
  FiPlay,
} from "react-icons/fi";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ModernNavigation } from "../components/ModernNavigation";
import { HeroSection } from "../components/sections/HeroSection";
import { AboutSection } from "../components/sections/AboutSection";
import { SkillsSection } from "../components/sections/SkillsSection";
import { TimelineSection } from "../components/sections/TimelineSection";
import { ProjectsSection } from "../components/sections/ProjectsSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { ContactSection } from "../components/sections/ContactSection";
import { FloatingChatbot } from "../components/FloatingChatbot";

// Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

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
    | "bottom-center"
    | "work-experience-top"
    | "education-left"
    | "bottom-right-lower"
    | "education-below";
}

const tourSteps: TourStep[] = [
  {
    id: "intro",
    title: "👋 Welcome! I'm Lawrence Hua.",
    content:
      "A Product Manager with a passion for building innovative, user-centric AI products. Let's take a quick tour of my work.",
    targetSection: "hero",
    icon: <FiUser className="w-5 h-5" />,
    color: "from-purple-600 to-pink-600",
    duration: 8000,
    position: "top-right",
  },
  {
    id: "skills",
    title: "🛠️ My Core Skills",
    content:
      "I specialize in the full product lifecycle, from deep data analysis to full-stack development. My expertise lies in Product Management, Data Analysis, and hands-on Engineering.",
    targetSection: "skills",
    icon: <FiTool className="w-5 h-5" />,
    color: "from-blue-600 to-cyan-600",
    duration: 10000,
    highlights: [
      "Product Management",
      "Data Analysis",
      "Full-Stack Development",
    ],
    position: "top-left",
  },
  {
    id: "education",
    title: "🎓 Technical Foundations",
    content:
      "My journey started with a strong technical education, from a Top-5 public university at UF to the #1 ranked graduate programs at Carnegie Mellon University.",
    targetSection: "timeline",
    icon: <FiBookOpen className="w-5 h-5" />,
    color: "from-green-600 to-teal-600",
    duration: 10000,
    highlights: ["Carnegie Mellon", "University of Florida"],
    position: "work-experience-top",
  },
  {
    id: "experience",
    title: "💼 Professional Journey",
    content:
      "I've built a diverse skillset through roles like an Embedded Android Engineer at Motorola, an AI Product Consultant, and multiple PM internships.",
    targetSection: "timeline",
    icon: <FiBriefcase className="w-5 h-5" />,
    color: "from-orange-600 to-red-600",
    duration: 12000,
    highlights: ["Android Engineer", "AI Consultant", "Product Internships"],
    position: "education-below",
  },
  {
    id: "project-expired-solutions",
    title: "💡 Featured Project: Expired Solutions",
    content:
      "I founded and led the development of an AI platform that helps grocery stores reduce food waste. We pitched this solution and secured pilot opportunities with major retailers.",
    targetSection: "projects",
    icon: <FiTarget className="w-5 h-5" />,
    color: "from-indigo-600 to-purple-600",
    duration: 10000,
    highlights: [
      "Founder & CEO",
      "AI-Powered Platform",
      "20% Shrink Reduction",
    ],
    position: "bottom-right-lower",
  },
  {
    id: "project-bbw",
    title: "💡 Featured Project: BBW Demo",
    content:
      "An enterprise decision-support tool I built for a Kearney consulting engagement that reduced decision-making time by 18 hours/week using LLM technology.",
    targetSection: "projects",
    icon: <FiTrendingUp className="w-5 h-5" />,
    color: "from-pink-600 to-rose-600",
    duration: 10000,
    highlights: ["LLM Technology", "18hrs/week saved", "Enterprise Tool"],
    position: "bottom-left",
  },
];

// Tour Arrows Component
const TourArrows = ({
  isActive,
  currentStep,
}: {
  isActive: boolean;
  currentStep: number;
}) => {
  if (!isActive) return null;

  // Define which timeline experiences each step points to
  const stepTargets = {
    0: [], // Step 1: Intro - no arrows
    1: [
      "skill-product-strategy",
      "skill-data-analysis",
      "skill-stakeholder-management",
    ], // Step 2: Skills - pointing to the 3 specific skill titles
    2: [
      "timeline-carnegie-mellon-university",
      "timeline-university-of-florida",
    ], // Step 3: Education - pointing to degree titles
    3: ["work-experience-title"], // Step 4: Work Experience - single arrow at title
    4: ["project-expired-solutions"], // Step 5: Expired Solutions Project - pointing to project card
    5: ["project-bbw"], // Step 6: BBW Project
  };

  const targets = stepTargets[currentStep as keyof typeof stepTargets] || [];

  return (
    <AnimatePresence>
      {targets.map((target, index) => (
        <motion.div
          key={`${currentStep}-${target}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ delay: index * 0.2, duration: 0.4 }}
          className={`${currentStep === 3 ? "absolute" : "fixed"} z-50 pointer-events-none`}
          style={getArrowPosition(target, currentStep)}
        >
          <div className="relative">
            {/* Animated Arrow - Responsive sizing */}
            <motion.div
              animate={{
                y: [0, -8, 0], // Reduced animation distance for mobile
                scale: [1, 1.15, 1], // Reduced scale animation
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`flex items-center justify-center w-8 h-8 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${tourSteps[currentStep].color} text-white shadow-lg md:shadow-2xl border-2 md:border-4 border-white`}
            >
              <FiArrowDown className="w-4 h-4 md:w-8 md:h-8" />
            </motion.div>

            {/* Arrow tail/line - Responsive sizing */}
            <div
              className={`absolute top-6 md:top-12 left-1/2 transform -translate-x-1/2 w-0.5 md:w-1 bg-gradient-to-b ${tourSteps[currentStep].color} rounded-full`}
              style={{ height: window.innerWidth < 768 ? "30px" : "60px" }}
            />

            {/* Pulse effect - Responsive sizing */}
            <motion.div
              animate={{
                scale: [1, 1.8, 1], // Reduced scale for mobile
                opacity: [0.6, 0, 0.6], // Reduced opacity for mobile
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute inset-0 w-8 h-8 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${tourSteps[currentStep].color}`}
            />
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

// Helper function to get arrow positions for different timeline elements
const getArrowPosition = (targetId: string, currentStep: number) => {
  if (typeof window === "undefined") {
    return { top: "50%", left: "50%", right: "auto" };
  }

  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    // Mobile: smaller arrows (32px), less spacing
    // Desktop: larger arrows (64px), more spacing
    const arrowSize = isMobile ? 16 : 32; // Half of actual arrow size for centering
    const topOffset = isMobile ? 40 : 70; // Less spacing above target on mobile

    // For step 4 (work experience), use absolute positioning since scroll is enabled
    if (currentStep === 3) {
      const absoluteTop = rect.top + window.pageYOffset - topOffset;
      const absoluteLeft =
        rect.left + window.pageXOffset + rect.width / 2 - arrowSize;

      return {
        top: `${absoluteTop}px`,
        left: `${absoluteLeft}px`,
        right: "auto",
      };
    }

    // For all other steps, anchor arrows to their target elements
    // This ensures arrows are always attached to specific items, not screen positions
    const top = rect.top - topOffset;
    const left = rect.left + rect.width / 2 - arrowSize;

    return { top: `${top}px`, left: `${left}px`, right: "auto" };
  }

  // Fallback if element not found (e.g., during transitions)
  return { top: "-500px", left: "-500px", right: "auto" };
};

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
  const [isPaused, setIsPaused] = useState(false);

  // Tour invitation popup state
  const [showTourInvitation, setShowTourInvitation] = useState(false);
  const [tourInvitationDismissed, setTourInvitationDismissed] = useState(false);

  // Firebase state
  const [db, setDb] = useState<any>(null);

  // Mobile debug logging function
  const debugLog = async (message: string, data?: any) => {
    console.log(message, data); // Keep console log for desktop
    try {
      await fetch("/api/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          data: data ? JSON.stringify(data) : undefined,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.error("Failed to send debug log:", error);
    }
  };

  // Component mount debugging
  useEffect(() => {
    console.log("🏠 ModernHome component mounted");
    return () => {
      console.log("🏠 ModernHome component unmounting");
    };
  }, []);

  // Initialize Firebase and start tracking
  useEffect(() => {
    if (typeof window !== "undefined") {
      let app;
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        console.log("🔥 Firebase app initialized");
      } else {
        app = getApps()[0];
        console.log("🔥 Using existing Firebase app");
      }
      const firestore = getFirestore(app);
      setDb(firestore);
      console.log("🔥 Firestore database ready");

      // Start page view tracking
      trackPageView(firestore);
    }
  }, []);

  // Tour tracking functions
  const getSessionId = () => {
    if (typeof window === "undefined") return "ssr-session";
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  };

  const trackTourEvent = async (
    eventType:
      | "tour_start"
      | "tour_step"
      | "tour_complete"
      | "tour_abandon"
      | "tour_cta_action",
    stepId?: string,
    stepIndex?: number,
    ctaAction?: "message" | "meeting" | "restart"
  ) => {
    console.log(
      `📊 trackTourEvent called with: ${eventType}, stepId: ${stepId}, stepIndex: ${stepIndex}`
    );

    if (!db) {
      console.warn("❌ Firebase not initialized, cannot track tour event");
      return;
    }

    try {
      console.log("📊 Creating tour event object...");
      // Create base tour event (geolocation is optional)
      const tourEvent: any = {
        sessionId: getSessionId(),
        eventType,
        stepId,
        stepIndex,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || "direct",
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
      };

      // Only add ctaAction if it has a value
      if (ctaAction !== undefined) {
        tourEvent.ctaAction = ctaAction;
      }

      console.log("📊 Base tour event created:", {
        ...tourEvent,
        timestamp: "serverTimestamp()",
      });

      // Try to add geolocation, but don't fail if it doesn't work
      try {
        console.log("🌍 Fetching geolocation...");
        const geoResponse = await fetch("/api/geolocation");
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          tourEvent.country = geoData.country_name || "Unknown";
          tourEvent.region = geoData.region || "Unknown";
          tourEvent.city = geoData.city || "Unknown";
          console.log("🌍 Geolocation added:", {
            country: tourEvent.country,
            region: tourEvent.region,
            city: tourEvent.city,
          });
        } else {
          console.log(
            "🌍 Geolocation API response not ok:",
            geoResponse.status
          );
        }
      } catch (geoError) {
        console.log("🌍 Geolocation fetch failed, using defaults:", geoError);
      }

      console.log("📊 Saving to Firebase...");
      const docRef = await addDoc(collection(db, "tour_events"), tourEvent);
      console.log(`✅ Tour event tracked successfully: ${eventType}`, {
        docId: docRef.id,
        eventData: { ...tourEvent, timestamp: "serverTimestamp()" },
      });
    } catch (error) {
      console.error("❌ Error tracking tour event:", error);
    }
  };

  // Page view tracking function with time tracking
  const trackPageView = async (firestore: any) => {
    if (!firestore) {
      console.warn("❌ Firestore not initialized, cannot track page view");
      return;
    }

    const startTime = Date.now();
    let pageViewDocRef: any = null;

    try {
      console.log("📊 Tracking page view...");

      // Get geolocation data (optional)
      let geoData = null;
      try {
        console.log("🌍 Fetching geolocation...");
        const geoResponse = await fetch("/api/geolocation");
        if (geoResponse.ok) {
          geoData = await geoResponse.json();
          console.log("🌍 Geolocation data obtained");
        }
      } catch (geoError) {
        console.log("🌍 Geolocation fetch failed, using defaults:", geoError);
      }

      const pageView = {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer || "direct",
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timeOnPage: 0,
        sessionId: getSessionId(),
        timestamp: serverTimestamp(),
        country: geoData?.country_name || "Unknown",
        region: geoData?.region || "Unknown",
        city: geoData?.city || "Unknown",
        latitude: geoData?.latitude || null,
        longitude: geoData?.longitude || null,
        timezone: geoData?.timezone || "Unknown",
        ip: geoData?.ip || "Unknown",
      };

      pageViewDocRef = await addDoc(
        collection(firestore, "page_views"),
        pageView
      );
      console.log("✅ Page view tracked successfully", {
        docId: pageViewDocRef.id,
        userAgent: navigator.userAgent,
        isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
      });

      // Track time spent on page
      const updateTimeOnPage = async () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds
        if (timeSpent > 5 && pageViewDocRef) {
          // Only update if spent more than 5 seconds
          try {
            const { updateDoc } = await import("firebase/firestore");
            await updateDoc(pageViewDocRef, { timeOnPage: timeSpent });
            console.log(`⏱️ Updated time on page: ${timeSpent}s`);
          } catch (error) {
            console.error("❌ Error updating time on page:", error);
          }
        }
      };

      // Update time when user leaves page
      const handleBeforeUnload = () => {
        updateTimeOnPage();
      };

      // Update time when page becomes hidden (mobile app switching, etc.)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          updateTimeOnPage();
        }
      };

      // Update time periodically (every 30 seconds) for long sessions
      const timeUpdateInterval = setInterval(updateTimeOnPage, 30000);

      // Add event listeners
      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup function (though this won't run on page unload)
      setTimeout(
        () => {
          clearInterval(timeUpdateInterval);
        },
        30 * 60 * 1000
      ); // Stop after 30 minutes max
    } catch (error) {
      console.error("❌ Error tracking page view:", error);
    }
  };

  // Helper function to render highlighted text
  const renderHighlightedText = (text: string, highlightIndex: number) => {
    const characters = text.split("");
    return (
      <span className="text-gray-600 dark:text-gray-300 leading-relaxed">
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
    console.log("🚀 Starting tour...");
    console.log("🔥 Firebase DB status:", db ? "Ready" : "Not initialized");

    setIsActive(true);
    setCurrentStep(0);
    setShowFinalCTA(false);
    setHighlightedIndex(0);
    setCountdown(0);
    setCurrentCharacterIndex(0);
    setIsPaused(false);

    // Track tour start
    console.log("📊 About to track tour_start event...");
    trackTourEvent("tour_start", tourSteps[0].id, 0);

    // Scroll to top first
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Start with first step after a delay
    setTimeout(() => {
      scrollToSection(tourSteps[0].targetSection);
    }, 1000);
  };

  const scrollToSection = (sectionId: string) => {
    debugLog(`🔧 scrollToSection called`, {
      sectionId,
      currentStep: currentStep + 1,
      isMobile: window.innerWidth < 768,
    });

    const element = document.getElementById(sectionId);
    if (element) {
      const isMobile = window.innerWidth < 768;
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;

      // For mobile, center the content in the viewport for better visibility
      if (isMobile) {
        debugLog(
          `🎯 Mobile detected (width: ${window.innerWidth}), Step: ${currentStep + 1}, Section: ${sectionId}`
        );
        const viewportHeight = window.innerHeight;
        const elementHeight = elementRect.height;

        // Calculate position to center the element in viewport
        const centerOffset = (viewportHeight - elementHeight) / 2;
        const finalScrollPosition =
          absoluteElementTop - Math.max(centerOffset, 100);

        // Debug step 4 condition before special handling
        if (sectionId === "timeline" && currentStep === 3) {
          debugLog("🔍 Checking Step 4 condition", {
            sectionId,
            currentStep,
            condition: "timeline && currentStep === 3",
            match: true,
          });
        } else if (sectionId === "timeline") {
          debugLog("❌ Timeline but wrong step", {
            sectionId,
            currentStep,
            expectedStep: 3,
          });
        }

        // Special handling for specific sections on mobile
        if (sectionId === "timeline" && currentStep === 2) {
          // Education step - focus on bottom of education gallery
          // Find the last education item to position at the bottom of education section
          const educationItems = document.querySelectorAll(
            '[id^="timeline-university"], [id^="timeline-carnegie"], [id^="timeline-spanish"]'
          );
          if (educationItems.length > 0) {
            const lastEducationItem = educationItems[educationItems.length - 1];
            const lastItemRect = lastEducationItem.getBoundingClientRect();
            const lastItemAbsoluteTop = lastItemRect.top + window.pageYOffset;
            // Position to show the bottom of the education section
            const finalPosition =
              lastItemAbsoluteTop + lastItemRect.height - 200;
            window.scrollTo({ top: finalPosition, behavior: "smooth" });
            return;
          }
          // Fallback positioning
          const finalPosition = absoluteElementTop - 150;
          window.scrollTo({ top: finalPosition, behavior: "smooth" });
          return;
        } else if (sectionId === "timeline" && currentStep === 3) {
          // Work experience step - position to show work experience section (reduced scroll distance)
          debugLog("✅ STEP 4 CONDITION MET: timeline + currentStep === 3");
          debugLog("🎯 Mobile Step 4: Looking for work-experience-title");
          debugLog("🎯 Mobile Step 4: Current step details", {
            currentStep,
            stepId: tourSteps[currentStep]?.id,
            stepTitle: tourSteps[currentStep]?.title,
            targetSection: sectionId,
          });

          // Try to find the work experience title element
          const workExperienceTitle = document.getElementById(
            "work-experience-title"
          );
          if (workExperienceTitle) {
            const workTitleRect = workExperienceTitle.getBoundingClientRect();
            const workTitleAbsoluteTop = workTitleRect.top + window.pageYOffset;
            // Position the work experience title with reduced offset for mobile (was -150, now -75)
            const finalPosition = workTitleAbsoluteTop - 75;
            debugLog(
              "🎯 Mobile Step 4: Found work-experience-title, scrolling to:",
              { finalPosition, workTitleAbsoluteTop, offset: -75 }
            );
            window.scrollTo({ top: finalPosition, behavior: "smooth" });
            return;
          }

          debugLog(
            "🎯 Mobile Step 4: work-experience-title not found, using timeline fallback"
          );
          // Fallback: Look for any work experience elements in the timeline
          const timelineSection = document.getElementById("timeline");
          if (timelineSection) {
            const timelineRect = timelineSection.getBoundingClientRect();
            const timelineAbsoluteTop = timelineRect.top + window.pageYOffset;
            // Position with reduced scroll distance (was +300, now +150)
            const finalPosition = timelineAbsoluteTop + 150;
            debugLog(
              "🎯 Mobile Step 4: Using timeline fallback, scrolling to:",
              { finalPosition, timelineAbsoluteTop, offset: 150 }
            );
            window.scrollTo({ top: finalPosition, behavior: "smooth" });
            return;
          }

          debugLog("🎯 Mobile Step 4: Using final fallback");
          // Final fallback - more conservative positioning (was +150, now +75)
          const finalPosition = absoluteElementTop + 75;
          debugLog("🎯 Mobile Step 4: Final fallback, scrolling to:", {
            finalPosition,
            absoluteElementTop,
            offset: 75,
          });
          window.scrollTo({ top: finalPosition, behavior: "smooth" });
          return;
        } else if (sectionId === "projects") {
          // Projects step - center on projects section
          const finalPosition = absoluteElementTop - 100;
          window.scrollTo({ top: finalPosition, behavior: "smooth" });
          return;
        } else {
          // Default mobile case
          debugLog("🔄 Mobile default case", {
            sectionId,
            currentStep: currentStep + 1,
          });
        }

        window.scrollTo({
          top: finalScrollPosition,
          behavior: "smooth",
        });
        return;
      } else {
        // Desktop/non-mobile case
        debugLog("🖥️ Desktop detected", {
          width: window.innerWidth,
          currentStep: currentStep + 1,
          sectionId,
        });
      }

      // Desktop handling (unchanged)
      // Special handling for step 4 (experience) targeting timeline - position to show work experience
      if (sectionId === "timeline" && isActive && currentStep === 3) {
        const offset = 750; // Desktop offset to show work experience section
        const finalScrollPosition = absoluteElementTop + offset;

        window.scrollTo({
          top: finalScrollPosition,
          behavior: "smooth",
        });
        return;
      }

      // Special handling for work-experience-bottom to show all work items
      if (sectionId === "work-experience-bottom") {
        const offset = 100; // Desktop offset
        const finalScrollPosition = absoluteElementTop - offset;

        window.scrollTo({
          top: finalScrollPosition,
          behavior: "smooth",
        });
        return;
      }

      // Default desktop positioning
      const offset = 100;
      const finalScrollPosition = absoluteElementTop - offset;

      window.scrollTo({
        top: finalScrollPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToSpecificElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const isMobile = window.innerWidth < 768;
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;

      if (isMobile) {
        // On mobile, position the specific element in the upper portion of the viewport
        // so it's clearly visible above the tour popup
        const finalPosition = absoluteElementTop - 150;
        window.scrollTo({ top: finalPosition, behavior: "smooth" });
      } else {
        // Desktop handling
        const offset = 100;
        const finalScrollPosition = absoluteElementTop - offset;
        window.scrollTo({
          top: finalScrollPosition,
          behavior: "smooth",
        });
      }
    }
  };

  const getPopupPosition = (position: string) => {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // Special positioning for Step 4 (Work Experience) on mobile
      if (position === "education-below" && isActive && currentStep === 3) {
        // Position the popup near the "Work Experience" title that we just scrolled to
        return {
          top: "20vh", // Position in upper portion of viewport
          left: "50vw",
          transform: "translate(-50%, 0)",
          right: "auto",
        };
      }

      // On mobile, position cards in the center of the visible viewport as overlay
      return {
        top: "50vh",
        left: "50vw",
        transform: "translate(-50%, -50%)",
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
      case "work-experience-top":
        // Position on top of the work experience section
        return {
          top: "300px",
          right: "24px",
          left: "auto",
        };
      case "education-left":
        // Position on the left side for education
        return {
          top: "400px",
          left: "24px",
          right: "auto",
        };
      case "bottom-right-lower":
        // Position lower than normal bottom-right for step 5
        return { bottom: "20px", right: "24px", left: "auto" };
      case "education-below":
        // Position below the education section (left side, middle-low)
        return { top: "500px", left: "24px", right: "auto" };
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
      setIsPaused(false);

      // Track tour step progression
      trackTourEvent("tour_step", tourSteps[nextStepIndex].id, nextStepIndex);

      // Debug logging for step advancement
      debugLog(`🔄 Advancing to Step ${nextStepIndex + 1}`, {
        stepId: tourSteps[nextStepIndex].id,
        targetSection: tourSteps[nextStepIndex].targetSection,
      });

      // Special handling for project steps to scroll to specific project cards
      if (nextStepIndex === 4) {
        // Step 5: Expired Solutions project
        debugLog("🚀 Step 5: Scrolling to Expired Solutions project");
        scrollToSpecificElement("project-expired-solutions");
      } else if (nextStepIndex === 5) {
        // Step 6: BBW project - scroll to BBW card specifically
        debugLog("🚀 Step 6: Scrolling to BBW project");
        scrollToSpecificElement("project-bbw");
      } else {
        debugLog(
          `🚀 Step ${nextStepIndex + 1}: Scrolling to ${tourSteps[nextStepIndex].targetSection}`
        );
        scrollToSection(tourSteps[nextStepIndex].targetSection);
      }
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

      // Track tour completion
      trackTourEvent("tour_complete", "final", tourSteps.length);

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
      setIsPaused(false);

      // Special handling for project steps to scroll to specific project cards
      if (prevStepIndex === 4) {
        // Step 5: Expired Solutions project
        scrollToSpecificElement("project-expired-solutions");
      } else if (prevStepIndex === 5) {
        // Step 6: BBW project - scroll to BBW card specifically
        scrollToSpecificElement("project-bbw");
      } else {
        scrollToSection(tourSteps[prevStepIndex].targetSection);
      }
    }
  };

  const closeTour = () => {
    // Track tour abandonment if not at the end
    if (currentStep < tourSteps.length - 1) {
      trackTourEvent("tour_abandon", tourSteps[currentStep].id, currentStep);
    }

    setIsActive(false);
    setShowFinalCTA(false);
    setCountdown(0);
    setCurrentCharacterIndex(0);
    setIsPaused(false);

    // Ensure scrolling is restored
    document.body.style.overflow = "unset";
    document.documentElement.style.overflow = "unset";
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleFinalCTAAction = (action: "message" | "meeting") => {
    // Track CTA action
    trackTourEvent("tour_cta_action", "final_cta", tourSteps.length, action);

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
    if (isActive && !isPaused) {
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
          // Skip auto-advance for Step 4 (Work Experience) - let user manually control
          if (currentStep === 3) {
            debugLog("🎯 Step 4 auto-advance disabled - manual control only");
            setCurrentCharacterIndex(-1); // Clear highlights but don't advance
            return;
          }
          // After highlighting is complete, immediately move to next step
          setTimeout(() => {
            setCurrentCharacterIndex(-1); // Clear all highlights
            nextStep();
          }, 100);
        }
      }, intervalTime);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isActive, currentStep, isPaused]);

  // Scroll lock effect
  useEffect(() => {
    // Allow scrolling during step 4 (work experience) - currentStep === 3 (0-indexed)
    const shouldLockScroll = isActive && !isPaused && currentStep !== 3;

    if (shouldLockScroll) {
      // Lock scrolling
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      // Allow scrolling
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    // Cleanup function to ensure scrolling is restored
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isActive, isPaused, currentStep]);

  useEffect(() => {
    if (isActive && tourSteps[currentStep].highlights && !isPaused) {
      const interval = setInterval(() => {
        setHighlightedIndex(
          (prev) =>
            (prev + 1) % (tourSteps[currentStep].highlights?.length || 1)
        );
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isActive, currentStep, isPaused]);

  useEffect(() => {
    if (showFinalCTA) {
      const timer = setTimeout(() => {
        setShowFinalCTA(false);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [showFinalCTA]);

  // Tour invitation popup effect
  useEffect(() => {
    if (!isActive && !tourInvitationDismissed && !showFinalCTA) {
      const timer = setTimeout(() => {
        setShowTourInvitation(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isActive, tourInvitationDismissed, showFinalCTA]);

  const handleTourInvitationAccept = () => {
    console.log("🎯 Tour invitation accepted! Starting tour...");
    setShowTourInvitation(false);
    setTourInvitationDismissed(true);
    startTour();
  };

  const handleTourInvitationDismiss = () => {
    setShowTourInvitation(false);
    setTourInvitationDismissed(true);
  };

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
      <TimelineSection tourActive={isActive} currentStep={currentStep} />

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

      {/* Tour Arrows */}
      <TourArrows isActive={isActive} currentStep={currentStep} />

      {/* Tour Invitation Popup */}
      <AnimatePresence>
        {showTourInvitation && !isActive && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed top-1/2 right-6 -translate-y-1/2 z-50 max-w-sm"
          >
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-1 rounded-2xl shadow-2xl">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 relative">
                {/* Close button */}
                <button
                  onClick={handleTourInvitationDismiss}
                  className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>

                {/* Content */}
                <div className="text-center">
                  {/* Header with Icon */}
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3">
                      <span className="text-2xl">👋</span>
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                      Hey there!
                    </h3>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={handleTourInvitationAccept}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <div className="text-sm opacity-90">Let me show you</div>
                      <div className="text-lg font-bold text-yellow-300">
                        4+ Years Of Achievements
                      </div>
                      <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/30">
                        <span className="text-sm font-bold">In 1 Minute</span>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Small dismiss option */}
                <button
                  onClick={handleTourInvitationDismiss}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors w-full text-center"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Step Popups */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed z-50 max-w-xs md:max-w-md"
            style={getPopupPosition(tourSteps[currentStep].position)}
            onClick={togglePause}
          >
            <div
              className={`bg-gradient-to-br ${tourSteps[currentStep].color} p-1 rounded-2xl shadow-2xl cursor-pointer`}
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl p-3 md:p-6 relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTour();
                  }}
                  className="absolute top-1.5 right-1.5 md:top-3 md:right-3 px-1.5 py-0.5 md:px-3 md:py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors min-h-[24px] min-w-[32px] md:min-h-[32px] md:min-w-[44px] flex items-center justify-center"
                >
                  STOP
                </button>

                {/* Pause Indicator */}
                {isPaused && (
                  <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 flex items-center gap-1 md:gap-2 text-blue-600 dark:text-blue-400">
                    <FiPause className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs font-semibold hidden md:inline">
                      PAUSED - You can scroll
                    </span>
                    <span className="text-xs font-semibold md:hidden">
                      PAUSED
                    </span>
                  </div>
                )}

                {/* Mobile Navigation Buttons - Bottom */}
                <div className="flex md:hidden justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevStep();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-md shadow-md transition-all duration-300"
                  >
                    <FiChevronLeft className="w-3 h-3" />
                    <span className="text-xs">
                      {currentStep === 0 ? "Restart" : "Back"}
                    </span>
                  </motion.button>
                  <span className="text-xs text-gray-500 px-2">
                    {currentStep + 1}/{tourSteps.length}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextStep();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md shadow-md transition-all duration-300"
                  >
                    <span className="text-xs">Next</span>
                    <FiChevronRight className="w-3 h-3" />
                  </motion.button>
                </div>

                {/* Desktop Navigation Buttons - Side */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevStep();
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="hidden md:block absolute top-1/2 -left-4 -translate-y-1/2 p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                  title={currentStep === 0 ? "Restart tour" : "Previous step"}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextStep();
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                  title="Skip to next step"
                >
                  <FiChevronRight className="w-4 h-4" />
                </motion.button>

                <div className="flex items-start gap-1.5 md:gap-3 mb-2 md:mb-4">
                  <div
                    className={`p-1.5 md:p-3 bg-gradient-to-br ${tourSteps[currentStep].color} rounded-md md:rounded-xl text-white flex-shrink-0`}
                  >
                    <div className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center">
                      {tourSteps[currentStep].icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-lg text-gray-900 dark:text-white mb-1 md:mb-2 line-clamp-2">
                      {tourSteps[currentStep].title}
                    </h3>
                    <div className="text-xs md:text-base leading-tight md:leading-relaxed">
                      {renderHighlightedText(
                        tourSteps[currentStep].content,
                        currentCharacterIndex
                      )}
                    </div>
                  </div>
                </div>

                {/* Key highlights */}
                {tourSteps[currentStep].highlights && (
                  <div className="mb-2 md:mb-4 flex flex-wrap gap-1 md:gap-2">
                    {tourSteps[currentStep].highlights.map(
                      (highlight, index) => (
                        <span
                          key={highlight}
                          className={`px-1.5 py-0.5 md:px-3 md:py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${tourSteps[currentStep].color} text-white ${
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

                {/* Step indicator - Desktop only */}
                <div className="hidden md:flex items-center justify-between">
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
                    Step {currentStep + 1} of {tourSteps.length} • Click to{" "}
                    <span className="hidden md:inline">
                      {isPaused ? "resume" : "pause & scroll"}
                    </span>
                    <span className="md:hidden">
                      {isPaused ? "resume" : "pause"}
                    </span>
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
              className="bg-white dark:bg-gray-900 rounded-xl md:rounded-3xl p-3 md:p-8 max-w-xs md:max-w-md mx-auto text-center relative shadow-2xl border-2 border-purple-500"
            >
              <button
                onClick={closeTour}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>

              <div className="mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">🎯</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                  That's the PM Experience
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  You just experienced how I approach product challenges:
                  structured storytelling, data-driven insights, and
                  customer-focused solutions. Ready to discuss how this applies
                  to your team?
                </p>
              </div>

              <div className="flex flex-col gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  <motion.button
                    onClick={() => handleFinalCTAAction("message")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-4 py-3 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px]"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span className="text-sm md:text-base">Send Message</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleFinalCTAAction("meeting")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-4 py-3 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px]"
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm md:text-base">
                      Schedule Meeting
                    </span>
                  </motion.button>
                </div>

                <motion.button
                  onClick={startTour}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-4 py-2 md:py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm min-h-[44px]"
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
        className="fixed bottom-20 left-3 md:left-4 z-40 p-2.5 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
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
