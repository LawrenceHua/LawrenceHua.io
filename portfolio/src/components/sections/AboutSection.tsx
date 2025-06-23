"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
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

  const containerVariants = {
    hidden: { opacity: isMobile ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0.3,
        duration: isMobile ? 0 : 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0 : 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-20 bg-white dark:bg-slate-950 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative z-10 mx-auto max-w-6xl px-6"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lawrence
            </span>
          </h2>
          <div className="mx-auto h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
        </motion.div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Story Section */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 shadow-xl">
              <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white text-center">
                My Journey in AI & Product
              </h3>

              <div className="space-y-4 text-slate-700 dark:text-slate-300 max-w-4xl mx-auto">
                <p className="text-lg leading-relaxed">
                  It all started when I realized that the most impactful AI
                  solutions aren't just about the technology—they're about
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {" "}
                    understanding human needs
                  </span>{" "}
                  and translating them into
                  <span className="font-semibold text-purple-600 dark:text-purple-400 underline decoration-purple-400/50">
                    {" "}
                    meaningful experiences
                  </span>
                  .
                </p>

                <p>
                  With a{" "}
                  <strong className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1 rounded">
                    Master's in Information Systems Management from Carnegie
                    Mellon
                  </strong>
                  , I've <span className="font-semibold">bridged the gap</span>{" "}
                  between technical AI capabilities and real-world product
                  applications. My journey spans from
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    {" "}
                    software engineering foundations
                  </span>{" "}
                  to founding{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    AI-driven startups
                  </span>
                  .
                </p>

                <p>
                  As the{" "}
                  <strong className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-1 rounded">
                    Founder & CEO of Expired Solutions
                  </strong>
                  , I built an AI platform that reduces grocery waste by{" "}
                  <span className="font-bold text-green-600 dark:text-green-400">
                    up to 20%
                  </span>{" "}
                  using{" "}
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    computer vision
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    GPT
                  </span>
                  . This experience taught me that successful AI products
                  require both{" "}
                  <span className="underline decoration-blue-400/50">
                    technical excellence
                  </span>{" "}
                  and{" "}
                  <span className="underline decoration-purple-400/50">
                    deep user empathy
                  </span>
                  .
                </p>

                <p>
                  Today, I'm passionate about creating AI solutions that don't
                  just{" "}
                  <span className="text-orange-600 dark:text-orange-400">
                    automate processes
                  </span>
                  , but{" "}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    genuinely improve lives
                  </span>
                  . I believe the future belongs to product managers who can
                  speak both languages—
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    technical AI
                  </span>{" "}
                  and{" "}
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    human experience
                  </span>
                  .
                </p>
              </div>

              {/* Icon Formula */}
              <motion.div
                className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                  {/* AI Expertise */}
                  <motion.div
                    className="flex flex-col items-center group"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-200 border border-blue-200/50 dark:border-blue-700/50 group-hover:border-blue-300 dark:group-hover:border-blue-600">
                      <Image
                        src="/logos/AI_expertise_icon_white.png"
                        alt="AI Expertise"
                        fill
                        className="object-contain group-hover:scale-110 transition-all duration-200"
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      AI Expertise
                    </span>
                  </motion.div>

                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                    +
                  </span>

                  {/* Data Strategy */}
                  <motion.div
                    className="flex flex-col items-center group"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative rounded-full bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-200 border border-purple-200/50 dark:border-purple-700/50 group-hover:border-purple-300 dark:group-hover:border-purple-600">
                      <Image
                        src="/logos/data_strategy_icon_white.png"
                        alt="Data Strategy"
                        fill
                        className="object-contain group-hover:scale-110 transition-all duration-200"
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      Data Strategy
                    </span>
                  </motion.div>

                  <span className="text-purple-600 dark:text-purple-400 font-bold text-xl">
                    +
                  </span>

                  {/* Human Insight */}
                  <motion.div
                    className="flex flex-col items-center group"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative rounded-full bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-200 border border-green-200/50 dark:border-green-700/50 group-hover:border-green-300 dark:group-hover:border-green-600">
                      <Image
                        src="/logos/human_insight_icon_white.png"
                        alt="Human Insight"
                        fill
                        className="object-contain group-hover:scale-110 transition-all duration-200"
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      Human Insight
                    </span>
                  </motion.div>

                  <span className="text-green-600 dark:text-green-400 font-bold text-2xl">
                    =
                  </span>

                  {/* Result */}
                  <motion.div
                    className="flex flex-col items-center group"
                    whileHover={{ scale: 1.15, y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 mb-2 relative rounded-full bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-800/20 p-5 sm:p-6 shadow-xl group-hover:shadow-2xl transition-all duration-200 border border-yellow-200/50 dark:border-yellow-700/50 group-hover:border-yellow-300 dark:group-hover:border-yellow-600">
                      <Image
                        src="/logos/Product_Leader_Icon_white.png"
                        alt="Innovative Product Leader"
                        fill
                        className="object-contain group-hover:scale-110 transition-all duration-200"
                      />
                    </div>
                    <span className="text-sm font-bold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text whitespace-nowrap">
                      Innovative Product Leader
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* What I Bring and Core Values */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Key Facts */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-blue-950 p-8 shadow-xl">
                <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                  What I Bring
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        <span className="text-blue-600 dark:text-blue-400">
                          AI Technical Foundation
                        </span>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Hands-on experience with{" "}
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          ML models
                        </span>
                        ,{" "}
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          computer vision
                        </span>
                        , and
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {" "}
                          GPT integrations
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        <span className="text-purple-600 dark:text-purple-400">
                          Product Strategy
                        </span>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        From{" "}
                        <span className="font-medium">roadmap planning</span> to{" "}
                        <span className="font-medium">A/B testing</span>,
                        driving{" "}
                        <span className="font-bold text-green-600 dark:text-green-400">
                          20%+ adoption improvements
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        <span className="text-green-600 dark:text-green-400">
                          Cross-functional Leadership
                        </span>
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Leading{" "}
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          engineering teams
                        </span>
                        , managing{" "}
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          stakeholders
                        </span>
                        , and driving{" "}
                        <span className="font-medium text-green-600 dark:text-green-400">
                          consensus
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Values */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-slate-900 dark:to-green-950 p-8 shadow-xl">
                <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
                  Core Values
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🎯</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      User-Centric
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🚀</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Innovation
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl">📊</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Data-Driven
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🤝</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      Collaborative
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Beyond the Resume - Full Width */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-purple-950 p-8 shadow-xl">
              <h3 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white text-center">
                Beyond the Resume
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-4xl mx-auto text-center leading-relaxed">
                When I'm not building AI products, you'll find me{" "}
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  exploring the latest ML research
                </span>
                ,{" "}
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  mentoring fellow product managers
                </span>
                , or working on{" "}
                <span className="font-medium text-green-600 dark:text-green-400">
                  side projects that bridge technology and social impact
                </span>
                . I believe the best products come from{" "}
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  curiosity
                </span>
                ,
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {" "}
                  empathy
                </span>
                , and a{" "}
                <span className="font-semibold text-purple-600 dark:text-purple-400 underline decoration-purple-400/50">
                  relentless focus on making things better
                </span>
                .
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
          <p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
            Ready to build the next AI-driven solution together?
          </p>
          <motion.button
            onClick={() => {
              const skillsSection = document.getElementById("skills");
              if (skillsSection) {
                const elementPosition =
                  skillsSection.getBoundingClientRect().top;
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
            Explore My Skills
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
