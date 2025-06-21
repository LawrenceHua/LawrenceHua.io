"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, AlertCircle, Moon, Sun } from "lucide-react";
import { useTheme } from "./providers/ThemeProvider";

interface NavigationProps {
  sections?: Array<{ id: string; label: string; href: string }>;
}

const defaultSections = [
  { id: "hero", label: "Home", href: "#hero" },
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "timeline", label: "Timeline", href: "#timeline" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "testimonials", label: "Testimonials", href: "#testimonials" },
  { id: "contact", label: "Contact", href: "#contact" },
];

export function ModernNavigation({
  sections = defaultSections,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position with improved logic
      const sectionElements = sections.map((section) => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      // Find the section that's currently most visible in the viewport
      let currentSection = "hero"; // default
      let maxVisibility = 0;

      sectionElements.forEach(({ id, element }) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // Calculate how much of the section is visible
          const visibleTop = Math.max(
            0,
            Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
          );
          const visibilityRatio =
            visibleTop / Math.min(rect.height, viewportHeight);

          // Consider a section active if it's significantly visible or if we're near its top
          if (rect.top <= 150 && rect.bottom >= 150) {
            if (visibilityRatio > maxVisibility) {
              maxVisibility = visibilityRatio;
              currentSection = id;
            }
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (href: string) => {
    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Calculate the position with offset for fixed header and to show the title
      const elementPosition = targetElement.getBoundingClientRect().top;
      // Use larger offset for Projects section to ensure proper visibility
      const offset = targetId === "projects" ? 140 : 120;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 dark:bg-slate-950/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Alert */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-start"
          >
            <button
              onClick={() => scrollToSection("#hero")}
              className="text-xl font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              Lawrence
              <span className="text-blue-600 dark:text-blue-400">.</span>
            </button>

            {/* Job Alert Below Name */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-1"
            >
              <motion.button
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 2px 8px 0 rgba(34, 197, 94, 0.2)",
                    "0 4px 12px 0 rgba(34, 197, 94, 0.4)",
                    "0 2px 8px 0 rgba(34, 197, 94, 0.2)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-2 py-1 text-white shadow-md backdrop-blur-md cursor-pointer hover:scale-105 transition-transform duration-200 text-xs"
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
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <AlertCircle className="h-2.5 w-2.5" />
                </motion.div>
                <span className="font-semibold whitespace-nowrap">
                  Open to AI PM/APM roles!
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right Side - Desktop Navigation, Theme Toggle, and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation - Compact horizontal layout */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex items-center space-x-1"
            >
              {sections.map((section, index) => (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => scrollToSection(section.href)}
                  className={`relative px-2 py-1 text-xs font-medium transition-colors duration-200 rounded-md ${
                    activeSection === section.id
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30"
                      : "text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {section.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-200 hover:bg-slate-200 dark:hover:bg-slate-700 lg:hidden"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden lg:hidden"
            >
              <div className="space-y-2 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-6 rounded-b-2xl shadow-lg">
                {/* Mobile Job Alert */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4 flex justify-center"
                >
                  <motion.button
                    animate={{
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 2px 8px 0 rgba(34, 197, 94, 0.2)",
                        "0 4px 12px 0 rgba(34, 197, 94, 0.4)",
                        "0 2px 8px 0 rgba(34, 197, 94, 0.2)",
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 text-white shadow-md backdrop-blur-md cursor-pointer hover:scale-105 transition-transform duration-200 text-sm"
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
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <AlertCircle className="h-3 w-3" />
                    </motion.div>
                    <span className="font-semibold whitespace-nowrap">
                      Open to AI PM/APM roles!
                    </span>
                  </motion.button>
                </motion.div>

                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => scrollToSection(section.href)}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    {section.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
