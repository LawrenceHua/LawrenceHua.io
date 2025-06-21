"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FiFileText, FiMessageCircle, FiArrowDown } from "react-icons/fi";
import { FaLinkedin } from "react-icons/fa";

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Dynamic text gallery with mobile-friendly versions
  const textGallery = [
    {
      text: "Impactful Digital Experiences",
      mobileText: "Digital Experiences",
      gradient: "from-blue-400 via-purple-400 to-pink-400",
    },
    {
      text: "Intelligent Automation Systems",
      mobileText: "AI Automation",
      gradient: "from-green-400 via-emerald-400 to-teal-400",
    },
    {
      text: "Data-Driven Business Insights",
      mobileText: "Business Insights",
      gradient: "from-orange-400 via-red-400 to-pink-400",
    },
    {
      text: "Scalable Product Platforms",
      mobileText: "Product Platforms",
      gradient: "from-cyan-400 via-blue-400 to-purple-400",
    },
    {
      text: "Innovative User Journeys",
      mobileText: "User Journeys",
      gradient: "from-yellow-400 via-orange-400 to-red-400",
    },
    {
      text: "Strategic Growth Solutions",
      mobileText: "Growth Solutions",
      gradient: "from-purple-400 via-violet-400 to-blue-400",
    },
    {
      text: "Seamless AI Integrations",
      mobileText: "AI Integrations",
      gradient: "from-emerald-400 via-green-400 to-cyan-400",
    },
    {
      text: "Market Opportunities",
      mobileText: "Market Growth",
      gradient: "from-pink-400 via-rose-400 to-red-400",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!prefersReducedMotion) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % textGallery.length);
      }, 3000); // Slower for better mobile experience

      return () => clearInterval(interval);
    }
  }, [textGallery.length, prefersReducedMotion]);

  // Simplified animations for mobile
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.1 : 0.2,
        duration: isMobile ? 0.3 : 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: isMobile ? 15 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0.3 : 0.6,
        ease: "easeOut",
      },
    },
  };

  const pulseVariants = {
    animate:
      prefersReducedMotion || isMobile
        ? {}
        : {
            scale: [1, 1.05, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          },
  };

  const textVariants = {
    initial: {
      opacity: 0,
      y: isMobile ? 10 : 20,
      scale: isMobile ? 1 : 0.8,
      filter: isMobile ? "blur(0px)" : "blur(10px)",
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: isMobile ? 0.3 : 0.6,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: isMobile ? -10 : -20,
      scale: isMobile ? 1 : 1.1,
      filter: isMobile ? "blur(0px)" : "blur(10px)",
      transition: {
        duration: isMobile ? 0.2 : 0.4,
        ease: "easeIn",
      },
    },
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950"
    >
      {/* Simplified Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-400/5 to-purple-400/5 blur-2xl" />

        {/* Dynamic Background Elements - Desktop only */}
        {!isMobile && !prefersReducedMotion && (
          <>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className={`absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-gradient-to-r ${textGallery[currentIndex].gradient} blur-3xl`}
            />
            <motion.div
              key={`${currentIndex}-alt`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.05, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              className={`absolute bottom-1/3 left-1/3 h-32 w-32 rounded-full bg-gradient-to-r ${textGallery[currentIndex].gradient} blur-2xl`}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center"
      >
        {/* Profile Image */}
        <motion.div
          variants={itemVariants}
          className="mb-6 sm:mb-8 flex justify-center"
        >
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="relative h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 overflow-hidden rounded-full border-4 border-blue-400/50 bg-white shadow-2xl shadow-blue-500/25"
          >
            <Image
              src="/profile.jpg"
              alt="Lawrence Hua"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-blue-500/20 to-transparent" />
          </motion.div>
        </motion.div>

        {/* Name and Title */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6 relative">
          <h1 className="mb-2 sm:mb-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            Lawrence W.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Hua
            </span>
          </h1>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-blue-200">
            AI Product Manager
          </div>
        </motion.div>

        {/* Enhanced Dynamic Value Proposition */}
        <motion.div
          variants={itemVariants}
          className="mb-8 sm:mb-12 text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed"
        >
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center px-2"
            >
              Building human-centered AI solutions that transform ideas into
            </motion.div>

            {/* Dynamic Animated Text Gallery */}
            <div className="relative h-12 sm:h-16 md:h-20 lg:h-24 flex items-center justify-center w-full max-w-4xl px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.span
                    className={`font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r ${textGallery[currentIndex].gradient} bg-clip-text text-transparent text-center leading-tight`}
                    animate={
                      !isMobile && !prefersReducedMotion
                        ? {
                            backgroundPosition: [
                              "0% 50%",
                              "100% 50%",
                              "0% 50%",
                            ],
                          }
                        : {}
                    }
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundSize: "200% 200%",
                      wordBreak: "break-word",
                      hyphens: "auto",
                    }}
                  >
                    {isMobile
                      ? textGallery[currentIndex].mobileText
                      : textGallery[currentIndex].text}
                  </motion.span>
                </motion.div>
              </AnimatePresence>

              {/* Animated Underline - Desktop only */}
              {!isMobile && !prefersReducedMotion && (
                <motion.div
                  key={`underline-${currentIndex}`}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={`absolute bottom-0 h-1 bg-gradient-to-r ${textGallery[currentIndex].gradient} rounded-full max-w-sm mx-auto`}
                />
              )}

              {/* Sparkle Effects - Desktop only */}
              {!isMobile &&
                !prefersReducedMotion &&
                [...Array(2)].map((_, i) => (
                  <motion.div
                    key={`sparkle-${currentIndex}-${i}`}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.2 + i * 0.3,
                      ease: "easeInOut",
                    }}
                    className={`absolute w-2 h-2 bg-gradient-to-r ${textGallery[currentIndex].gradient} rounded-full`}
                    style={{
                      left: `${30 + i * 40}%`,
                      top: `${15 + i * 20}%`,
                    }}
                  />
                ))}
            </div>
          </div>
        </motion.div>

        {/* Key Highlights */}
        <motion.div
          variants={itemVariants}
          className="mb-8 sm:mb-14 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400 px-2"
        >
          <button
            onClick={() => {
              const timelineSection = document.getElementById("timeline");
              timelineSection?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center space-x-1 sm:space-x-2 rounded-full bg-white/5 px-2 sm:px-4 py-1 sm:py-2 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:scale-105"
          >
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-400" />
            <span className="whitespace-nowrap">Carnegie Mellon MISM '24</span>
          </button>
          <button
            onClick={() => {
              const timelineSection = document.getElementById("timeline");
              timelineSection?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center space-x-1 sm:space-x-2 rounded-full bg-white/5 px-2 sm:px-4 py-1 sm:py-2 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:scale-105"
          >
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400" />
            <span className="whitespace-nowrap">AI/ML Product Experience</span>
          </button>
          <Link
            href="https://www.expiredsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 sm:space-x-2 rounded-full bg-white/5 px-2 sm:px-4 py-1 sm:py-2 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:scale-105"
          >
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-purple-400" />
            <span className="whitespace-nowrap">Startup Founder</span>
          </Link>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mb-8 sm:mb-14 flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-center px-4"
        >
          <Link
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <FiFileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
            Download Resume
          </Link>

          <Link
            href="https://www.linkedin.com/in/lawrencehua"
            target="_blank"
            className="group flex items-center justify-center rounded-lg bg-gradient-to-r from-[#0077B5] to-[#006399] px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <FaLinkedin className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
            LinkedIn
          </Link>
        </motion.div>

        {/* Main CTA */}
        <motion.div variants={itemVariants} className="mb-8 relative px-4">
          <motion.button
            onClick={() => {
              const contactSection = document.getElementById("contact");
              if (contactSection) {
                const elementPosition =
                  contactSection.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - 120;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                });
              }
            }}
            whileHover={!isMobile ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-lg rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg lg:text-xl font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/25"
          >
            🚀 Looking for an AI Product Manager? Let's connect!
          </motion.button>
        </motion.div>

        {/* Left Side Scroll Indicator - Desktop only */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
            className="absolute -left-16 top-1/2 -translate-y-1/2 -translate-x-8 flex flex-col items-center space-y-4 z-20 md:-left-12 md:-translate-x-6 hidden lg:flex"
          >
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
              <button
                onClick={() => {
                  const aboutSection = document.getElementById("about");
                  if (aboutSection) {
                    const elementPosition =
                      aboutSection.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.pageYOffset - 120;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
                className="group flex flex-col items-center justify-center space-y-2 text-slate-400 hover:text-blue-400 transition-all duration-300 cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="transform -rotate-90 whitespace-nowrap text-xs font-medium tracking-wider uppercase flex items-center justify-center"
                >
                  Explore my work
                </motion.div>
                <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent group-hover:from-blue-300 transition-colors duration-300 mx-auto"></div>
                <div className="flex items-center justify-center">
                  <FiArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform duration-300" />
                </div>
              </button>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
            </motion.div>
          </motion.div>
        )}

        {/* Main Scroll Indicator - Mobile */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center lg:hidden w-full"
        >
          <button
            onClick={() => {
              const aboutSection = document.getElementById("about");
              if (aboutSection) {
                const elementPosition =
                  aboutSection.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - 120;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth",
                });
              }
            }}
            className="mb-3 text-sm text-slate-400 hover:text-blue-400 transition-colors duration-200 cursor-pointer text-center"
          >
            Explore my work
          </button>
          <motion.div
            animate={
              !prefersReducedMotion
                ? {
                    y: [0, 10, 0],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center w-full"
          >
            <button
              onClick={() => {
                const aboutSection = document.getElementById("about");
                if (aboutSection) {
                  const elementPosition =
                    aboutSection.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - 120;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="flex items-center justify-center"
            >
              <FiArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 hover:text-blue-300 transition-colors duration-200" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
