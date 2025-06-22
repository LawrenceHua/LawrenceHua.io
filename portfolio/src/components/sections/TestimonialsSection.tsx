"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaLinkedin, FaQuoteLeft, FaPause, FaPlay } from "react-icons/fa";

interface Testimonial {
  name: string;
  title: string;
  company: string;
  image: string;
  quote: string;
  linkedinUrl: string;
}

const testimonialsData: Testimonial[] = [
  {
    name: "JJ Xu",
    title: "Founder & CEO",
    company: "TalkMeUp",
    image: "/logos/JJ.jpeg",
    quote:
      "Lawrence approached every challenge with **curiosity, grit, and a clear desire to create something meaningful**. He combined his **technical background with a strong product mindset**, conducting **thoughtful customer discovery** and **iterating quickly based on feedback**.",
    linkedinUrl: "https://www.linkedin.com/in/jj-jiaojiao-xu/",
  },
  {
    name: "Casey Justus",
    title: "Director - Strategic Sourcing",
    company: "Bath & Body Works",
    image: "/logos/casey.png",
    quote:
      "Lawrence approached every conversation with **enthusiasm, curiosity, and a strong technical foundation** that helped **bridge the gap between strategy and implementation**. He quickly **established himself as a team leader** and took the time to understand our sourcing challenges, working closely with us to **shape an AI-driven supplier evaluation approach**.",
    linkedinUrl: "https://www.linkedin.com/in/casey-justus-a7189736/",
  },
  {
    name: "Wendy Williams",
    title: "IT Director",
    company: "University of Florida",
    image: "/logos/Wendy.jpeg",
    quote:
      "Lawrence was **one of my top System Administrators**. He is a **conscientious worker** and was **ready to take on any task**. He has a **very pleasant demeanor** and **got along well with all the office staff and administration**.",
    linkedinUrl: "https://www.linkedin.com/in/wendy-williams-873b7538",
  },
  {
    name: "Shyam Sundar",
    title: "Android Frameworks Engineer",
    company: "Motorola Solutions",
    image: "/logos/Shyam.jpeg",
    quote:
      "Lawrence exhibited **great skills** with his **ability to solve complex issues on the front-end**, **dedication to stay motivated** even through a fully online program and **adapt to Motorola's technology quickly**.",
    linkedinUrl: "https://www.linkedin.com/in/shyamsundarn/",
  },
];

// Function to format testimonial text with bold markdown
const formatTestimonialText = (text: string) => {
  return text.replace(
    /\*\*(.*?)\*\*/g,
    "<strong class='text-slate-700 dark:text-slate-200 font-semibold'>$1</strong>"
  );
};

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isPaused, setIsPaused] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        duration: 0.8,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.25, 0.25, 0.75],
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.25, 0.25, 0.75],
      },
    },
  };

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative py-24 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-purple-400/10 to-blue-400/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-blue-300/5 to-purple-300/5 blur-2xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
      >
        {/* Enhanced Section Header */}
        <motion.div variants={itemVariants} className="mb-20 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/50 mb-8">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              ✨ Client Testimonials
            </span>
          </div>

          <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-tight">
            What colleagues and mentors say about my{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-size-200 animate-gradient">
              work and character
            </span>
          </h2>

          <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
            Testimonials from leaders and colleagues who have worked closely
            with Lawrence across product management, engineering, and leadership
            roles
          </p>

          <div className="flex items-center justify-center mt-8">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent to-blue-600 rounded-full" />
            <div className="h-1 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-2" />
            <div className="h-1 w-16 bg-gradient-to-r from-purple-600 to-transparent rounded-full" />
          </div>
        </motion.div>

        {/* Symmetrical 2x2 Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16"
        >
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className="group relative h-full"
            >
              {/* Main Card */}
              <div className="relative h-full overflow-hidden rounded-2xl bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col">
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-blue-500/20 dark:text-blue-400/20 group-hover:text-blue-500/40 dark:group-hover:text-blue-400/40 transition-colors duration-300">
                  <FaQuoteLeft className="h-8 w-8" />
                </div>

                {/* Card Content */}
                <div className="relative z-10 p-8 flex flex-col flex-1">
                  {/* Quote Content */}
                  <div className="flex-1 mb-8">
                    <blockquote
                      className="text-lg leading-relaxed text-slate-600 dark:text-slate-300"
                      dangerouslySetInnerHTML={{
                        __html: `"${formatTestimonialText(testimonial.quote)}"`,
                      }}
                    />
                  </div>

                  {/* Author Section */}
                  <div className="flex items-center space-x-4 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                    {/* Profile Image */}
                    <Link
                      href={testimonial.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-16 w-16 overflow-hidden rounded-full bg-white shadow-lg flex-shrink-0 hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer ring-2 ring-transparent hover:ring-blue-400/50"
                      title={`View ${testimonial.name}'s LinkedIn profile`}
                    >
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </Link>

                    {/* Author Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                          {testimonial.name}
                        </h4>
                        <Link
                          href={testimonial.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0077B5] hover:text-[#006399] transition-all duration-200 hover:scale-110"
                        >
                          <FaLinkedin className="h-5 w-5" />
                        </Link>
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {testimonial.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 p-[2px]">
                  <div className="h-full w-full rounded-2xl bg-white dark:bg-slate-800" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Scrolling Testimonials Banner */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/80 via-purple-50/80 to-blue-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-8 cursor-pointer"
          onClick={() => setIsPaused(!isPaused)}
        >
          {/* Small Pause/Play Button - Top Left */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused(!isPaused);
            }}
            className="absolute top-3 left-3 z-20 w-6 h-6 rounded-full bg-gray-400/80 hover:bg-gray-500/80 dark:bg-gray-600/80 dark:hover:bg-gray-500/80 flex items-center justify-center transition-all duration-200 hover:scale-110 touch-manipulation"
            aria-label={isPaused ? "Resume testimonials" : "Pause testimonials"}
          >
            {isPaused ? (
              <FaPlay className="w-2.5 h-2.5 text-white ml-0.5" />
            ) : (
              <FaPause className="w-2.5 h-2.5 text-white" />
            )}
          </button>

          <div className={`flex space-x-8 ${isPaused ? "" : "animate-scroll"}`}>
            {[...testimonialsData, ...testimonialsData].map(
              (testimonial, index) => (
                <div
                  key={`scroll-${index}`}
                  className="flex-shrink-0 w-96 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-200/30 dark:border-slate-700/30"
                >
                  <div className="flex items-start space-x-4">
                    <Link
                      href={testimonial.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-12 w-12 overflow-hidden rounded-full flex-shrink-0 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                      title={`View ${testimonial.name}'s LinkedIn profile`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-3 leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: `"${formatTestimonialText(testimonial.quote.slice(0, 140))}..."`,
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <span className="text-slate-400">•</span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>

        {/* Enhanced Call to Action */}
        <motion.div variants={itemVariants} className="mt-20 text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 border border-slate-200/50 dark:border-slate-700/50">
            <p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
              Want to add your testimonial?
            </p>
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
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform"
            >
              Work With Lawrence
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-scroll {
          animation: scroll 35s linear infinite;
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .bg-size-200 {
          background-size: 200% 200%;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}
