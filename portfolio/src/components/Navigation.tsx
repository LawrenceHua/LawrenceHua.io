"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on navigation
  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <nav
      className={`fixed z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white/80 shadow-sm backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div />

          <div className="hidden space-x-8 md:flex">
            <Link
              href="/#about"
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              About
            </Link>
            <Link
              href="#timeline"
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              Experience
            </Link>
            <Link
              href="#projects"
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              Projects
            </Link>
            <Link
              href="/#contact"
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              Contact
            </Link>
            <Link
              href="/analytics"
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              Analytics
            </Link>
          </div>

          <div className="md:hidden">
            <button
              className="text-gray-600 transition-colors hover:text-blue-600"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex md:hidden">
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-gray-900 shadow-xl h-full flex flex-col p-6 gap-6">
            <button
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <svg
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <nav className="flex flex-col gap-6 mt-8 text-lg font-semibold">
              <Link
                href="/#about"
                onClick={handleNavClick}
                className="text-gray-700 dark:text-gray-100 hover:text-blue-600"
              >
                About
              </Link>
              <Link
                href="#timeline"
                onClick={handleNavClick}
                className="text-gray-700 dark:text-gray-100 hover:text-blue-600"
              >
                Experience
              </Link>
              <Link
                href="#projects"
                onClick={handleNavClick}
                className="text-gray-700 dark:text-gray-100 hover:text-blue-600"
              >
                Projects
              </Link>
              <Link
                href="/#contact"
                onClick={handleNavClick}
                className="text-gray-700 dark:text-gray-100 hover:text-blue-600"
              >
                Contact
              </Link>
              <Link
                href="/analytics"
                onClick={handleNavClick}
                className="text-gray-700 dark:text-gray-100 hover:text-blue-600"
              >
                Analytics
              </Link>
            </nav>
          </div>
          {/* Click outside to close */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </nav>
  );
};

export default Navigation;
