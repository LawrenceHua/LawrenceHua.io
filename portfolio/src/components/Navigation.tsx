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
          </div>

          <div className="md:hidden">
            <button className="text-gray-600 transition-colors hover:text-blue-600">
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
    </nav>
  );
};

export default Navigation;
