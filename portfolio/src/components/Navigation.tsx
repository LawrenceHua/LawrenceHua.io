"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-gray-900/80 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div />

          {/* Desktop Navigation - Hidden on mobile, visible on desktop */}
          <div className="hidden space-x-8 md:flex">
            <Link
              href="/#about"
              className="text-gray-300 transition-colors hover:text-white"
            >
              About
            </Link>
            <Link
              href="#timeline"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Experience
            </Link>
            <Link
              href="#projects"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Projects
            </Link>
            <Link
              href="/#contact"
              className="text-gray-300 transition-colors hover:text-white"
            >
              Contact
            </Link>
          </div>

          {/* Empty div for mobile - no hamburger menu */}
          <div className="md:hidden">
            {/* Mobile navigation is handled by the floating navigation on the left */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
