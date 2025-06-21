"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";

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
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative py-20 bg-white dark:bg-slate-950 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative z-10 mx-auto max-w-7xl px-6"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            What colleagues and mentors say about my{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              work and character
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Testimonials from leaders and colleagues who have worked closely
            with Lawrence across product management, engineering, and leadership
            roles
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={cardVariants}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-blue-100/30 dark:text-blue-900/30">
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>

                {/* Testimonial Content */}
                <div className="relative">
                  {/* Quote */}
                  <blockquote
                    className="mb-6 text-lg leading-relaxed text-slate-500 dark:text-slate-400 opacity-80"
                    dangerouslySetInnerHTML={{
                      __html: `"${formatTestimonialText(testimonial.quote)}"`,
                    }}
                  />

                  {/* Author Info */}
                  <div className="flex items-center space-x-4">
                    <Link
                      href={testimonial.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-16 w-16 overflow-hidden rounded-full bg-white shadow-lg flex-shrink-0 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                      title={`View ${testimonial.name}'s LinkedIn profile`}
                    >
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                          {testimonial.name}
                        </h4>
                        <Link
                          href={testimonial.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0077B5] hover:text-[#006399] transition-colors"
                        >
                          <FaLinkedin className="h-5 w-5" />
                        </Link>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {testimonial.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-500">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hover Gradient Border */}
                <div
                  className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                  style={{ padding: "2px" }}
                >
                  <div className="h-full w-full rounded-3xl bg-white dark:bg-slate-800" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated Background Testimonials (Infinite Scroll) */}
        <motion.div
          variants={itemVariants}
          className="mt-16 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 p-8"
        >
          <div className="flex animate-scroll space-x-8">
            {/* Duplicate testimonials for infinite scroll effect */}
            {[...testimonialsData, ...testimonialsData].map(
              (testimonial, index) => (
                <div
                  key={`scroll-${index}`}
                  className="flex-shrink-0 w-80 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-lg"
                >
                  <div className="flex items-start space-x-4">
                    <Link
                      href={testimonial.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-12 w-12 overflow-hidden rounded-full flex-shrink-0 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                      title={`View ${testimonial.name}'s LinkedIn profile`}
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
                        className="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: `"${formatTestimonialText(testimonial.quote.slice(0, 120))}..."`,
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">
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

        {/* Call to Action */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25"
          >
            Work With Lawrence
          </motion.button>
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
        .animate-scroll {
          animation: scroll 30s linear infinite;
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
