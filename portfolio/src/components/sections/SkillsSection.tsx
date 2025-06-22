"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface Skill {
  name: string;
  level: "expert" | "proficient" | "familiar";
  category: "business" | "data" | "engineering" | "design";
  icon: string;
  experience: string;
  projects: number;
  achievement: string;
  endorsements: string[];
}

const skillsData: Record<string, Skill[]> = {
  business: [
    {
      name: "Product Strategy",
      level: "expert",
      category: "business",
      icon: "🎯",
      experience: "3+ years",
      projects: 8,
      achievement:
        "Led AI grocery platform strategy reducing food waste by 20%",
      endorsements: [
        "PM Happy Hour Manager",
        "Giant Eagle Leadership",
        "Carnegie Mellon Faculty",
      ],
    },
    {
      name: "Roadmap Planning",
      level: "expert",
      category: "business",
      icon: "📋",
      experience: "3+ years",
      projects: 6,
      achievement: "Planned roadmaps for 3 startups and enterprise tools",
      endorsements: [
        "PanPalz Team",
        "Expired Solutions Advisors",
        "Kearney Consultants",
      ],
    },
    {
      name: "A/B Testing",
      level: "proficient",
      category: "business",
      icon: "⚡",
      experience: "2+ years",
      projects: 5,
      achievement: "Improved UI usability by 40% through systematic testing",
      endorsements: ["PanPalz Design Team", "Carnegie Mellon Researchers"],
    },
    {
      name: "User Research",
      level: "proficient",
      category: "business",
      icon: "🔍",
      experience: "2+ years",
      projects: 4,
      achievement:
        "Conducted 250+ shopper surveys validating product-market fit",
      endorsements: ["Giant Eagle Executives", "McGinnis Competition Judges"],
    },
    {
      name: "Agile/Scrum",
      level: "expert",
      category: "business",
      icon: "🔄",
      experience: "3+ years",
      projects: 7,
      achievement:
        "Led agile teams at Motorola reducing integration delays by 25%",
      endorsements: ["Motorola Engineering Teams", "Kearney Project Leads"],
    },
    {
      name: "Stakeholder Management",
      level: "expert",
      category: "business",
      icon: "🤝",
      experience: "3+ years",
      projects: 8,
      achievement: "Pitched to 15+ executives securing enterprise partnerships",
      endorsements: [
        "Giant Eagle C-Suite",
        "Kearney Partners",
        "Carnegie Mellon Leadership",
      ],
    },
  ],
  data: [
    {
      name: "Machine Learning",
      level: "proficient",
      category: "data",
      icon: "🤖",
      experience: "2+ years",
      projects: 6,
      achievement: "Built AI models saving 15+ hours/week operational time",
      endorsements: ["Carnegie Mellon AI Lab", "Tutora Engineering Team"],
    },
    {
      name: "Python",
      level: "expert",
      category: "data",
      icon: "🐍",
      experience: "4+ years",
      projects: 12,
      achievement: "Developed 50+ TI-BASIC programs improving test scores 35%",
      endorsements: [
        "Motorola Development Team",
        "University of Florida IT",
        "Tutora Students",
      ],
    },
    {
      name: "SQL",
      level: "expert",
      category: "data",
      icon: "🗄️",
      experience: "4+ years",
      projects: 10,
      achievement: "Optimized database queries for 15,000+ device deployments",
      endorsements: ["Motorola Data Team", "Giant Eagle Analytics"],
    },
    {
      name: "Data Analysis",
      level: "expert",
      category: "data",
      icon: "📊",
      experience: "3+ years",
      projects: 8,
      achievement:
        "Analyzed sales patterns reducing grocery shrink by 1% in 30 days",
      endorsements: [
        "Giant Eagle Operations",
        "Carnegie Mellon Statistics Faculty",
      ],
    },
    {
      name: "GPT/LLMs",
      level: "proficient",
      category: "data",
      icon: "🧠",
      experience: "2+ years",
      projects: 5,
      achievement:
        "Built enterprise LLM tool cutting decision time 18 hrs/week",
      endorsements: ["Kearney Tech Team", "OpenAI Implementation Partners"],
    },
    {
      name: "Computer Vision",
      level: "proficient",
      category: "data",
      icon: "👁️",
      experience: "1+ years",
      projects: 3,
      achievement:
        "Implemented CV system for automated grocery markdown detection",
      endorsements: [
        "Expired Solutions Technical Advisors",
        "Azure Vision AI Team",
      ],
    },
    {
      name: "TensorFlow",
      level: "familiar",
      category: "data",
      icon: "🔥",
      experience: "1+ years",
      projects: 2,
      achievement: "Deployed TF models for food freshness classification",
      endorsements: ["Carnegie Mellon ML Researchers"],
    },
    {
      name: "PyTorch",
      level: "familiar",
      category: "data",
      icon: "⚡",
      experience: "1+ years",
      projects: 2,
      achievement: "Built neural networks for gaming cryptocurrency analysis",
      endorsements: ["Carnegie Mellon Crypto Lab"],
    },
  ],
  engineering: [
    {
      name: "JavaScript",
      level: "expert",
      category: "engineering",
      icon: "⚡",
      experience: "4+ years",
      projects: 15,
      achievement: "Built APX NEXT features deployed to 15,000+ field units",
      endorsements: [
        "Motorola Solutions Engineering",
        "Various Web Development Teams",
      ],
    },
    {
      name: "React/Next.js",
      level: "expert",
      category: "engineering",
      icon: "⚛️",
      experience: "3+ years",
      projects: 8,
      achievement: "Developed portfolio website and multiple startup platforms",
      endorsements: [
        "PanPalz Development Team",
        "Expired Solutions Tech Advisors",
      ],
    },
    {
      name: "TypeScript",
      level: "proficient",
      category: "engineering",
      icon: "📘",
      experience: "2+ years",
      projects: 6,
      achievement: "Enhanced code quality and reduced runtime errors by 60%",
      endorsements: ["Modern Web Development Teams"],
    },
    {
      name: "Node.js",
      level: "proficient",
      category: "engineering",
      icon: "💚",
      experience: "3+ years",
      projects: 7,
      achievement: "Built backend APIs serving thousands of concurrent users",
      endorsements: ["Full-Stack Development Teams"],
    },
    {
      name: "Cloud (Azure)",
      level: "proficient",
      category: "engineering",
      icon: "☁️",
      experience: "2+ years",
      projects: 4,
      achievement: "Deployed AI platform infrastructure supporting CV + GPT",
      endorsements: ["Microsoft Azure Partners", "Cloud Architecture Teams"],
    },
    {
      name: "Git/GitHub",
      level: "expert",
      category: "engineering",
      icon: "🔀",
      experience: "4+ years",
      projects: 20,
      achievement: "Managed version control for enterprise-scale projects",
      endorsements: ["All Engineering Teams", "Open Source Community"],
    },
    {
      name: "REST APIs",
      level: "expert",
      category: "engineering",
      icon: "🔌",
      experience: "3+ years",
      projects: 10,
      achievement:
        "Designed APIs handling millions of requests for radio systems",
      endorsements: ["Motorola API Development", "Backend Engineering Teams"],
    },
    {
      name: "Docker",
      level: "familiar",
      category: "engineering",
      icon: "🐳",
      experience: "1+ years",
      projects: 3,
      achievement: "Containerized applications for scalable deployment",
      endorsements: ["DevOps Teams"],
    },
  ],
  design: [
    {
      name: "Figma",
      level: "proficient",
      category: "design",
      icon: "🎨",
      experience: "2+ years",
      projects: 6,
      achievement: "Refined 100+ frames improving UI consistency by 40%",
      endorsements: ["PanPalz Design Team", "UX Research Groups"],
    },
    {
      name: "UI/UX Design",
      level: "proficient",
      category: "design",
      icon: "✨",
      experience: "2+ years",
      projects: 5,
      achievement:
        "Created user-centered designs for nonprofit social platform",
      endorsements: ["Design Teams", "User Experience Researchers"],
    },
    {
      name: "Prototyping",
      level: "proficient",
      category: "design",
      icon: "🔧",
      experience: "2+ years",
      projects: 4,
      achievement: "Won 1st place at Motorola Hackathon with NFC prototype",
      endorsements: ["Motorola Innovation Team", "Product Design Leaders"],
    },
    {
      name: "Design Systems",
      level: "familiar",
      category: "design",
      icon: "📐",
      experience: "1+ years",
      projects: 2,
      achievement: "Established consistent design patterns across platforms",
      endorsements: ["Design System Teams"],
    },
    {
      name: "User Testing",
      level: "proficient",
      category: "design",
      icon: "👥",
      experience: "2+ years",
      projects: 3,
      achievement:
        "Conducted usability testing improving user satisfaction 25%",
      endorsements: ["UX Research Teams", "Product Validation Groups"],
    },
  ],
};

const categories = [
  { key: "all", label: "All Skills", color: "blue" },
  { key: "business", label: "Product & Business", color: "purple" },
  { key: "data", label: "Data & AI", color: "green" },
  { key: "engineering", label: "Engineering", color: "orange" },
  { key: "design", label: "Design & UX", color: "pink" },
];

const levels = [
  { key: "all", label: "All Levels", color: "blue" },
  { key: "expert", label: "Expert", color: "green" },
  { key: "proficient", label: "Proficient", color: "orange" },
  { key: "familiar", label: "Familiar", color: "blue" },
];

export function SkillsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
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

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const filteredSkills = React.useMemo(() => {
    let skills = Object.values(skillsData).flat();

    if (activeCategory !== "all") {
      skills = skills.filter((skill) => skill.category === activeCategory);
    }

    if (activeLevel !== "all") {
      skills = skills.filter((skill) => skill.level === activeLevel);
    }

    return skills;
  }, [activeCategory, activeLevel]);

  const containerVariants = {
    hidden: { opacity: isMobile ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0, // Set stagger to 0 to make them appear at once
        duration: isMobile ? 0 : 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: isMobile ? 1 : 0,
      y: isMobile ? 0 : prefersReducedMotion ? 15 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0 : prefersReducedMotion ? 0.3 : 0.6,
        ease: "easeOut",
      },
    },
  };

  const skillVariants = {
    hidden: {
      opacity: isMobile ? 1 : 0,
      scale: isMobile ? 1 : prefersReducedMotion ? 1 : 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: isMobile ? 0 : prefersReducedMotion ? 0.2 : 0.4,
        ease: "easeOut",
      },
    },
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "expert":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "proficient":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "familiar":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getLevelFilterColor = (level: string, isActive: boolean) => {
    if (isActive) {
      switch (level) {
        case "expert":
          return "bg-green-600/20 border-green-500/80 text-green-600 dark:text-green-400 shadow-lg shadow-green-500/20";
        case "proficient":
          return "bg-orange-600/20 border-orange-500/80 text-orange-600 dark:text-orange-400 shadow-lg shadow-orange-500/20";
        case "familiar":
          return "bg-blue-600/20 border-blue-500/80 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20";
        default:
          return "bg-blue-600/20 border-blue-500/80 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20";
      }
    }
    return "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50";
  };

  return (
    <section
      id="skills"
      ref={ref}
      className="relative py-20 bg-slate-50 dark:bg-slate-900 overflow-hidden"
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
          <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
            Skills &{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Expertise
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            A comprehensive toolkit spanning product management, AI/ML
            technologies, and full-stack development. Hover over any skill to
            see detailed experience.
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={itemVariants}
          className="mb-12 flex flex-col items-center gap-6"
        >
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 rounded-full bg-white/50 dark:bg-slate-800/50 p-2 shadow-inner-lg backdrop-blur-sm">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.key
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-md"
                    : "text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          {/* Level Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {levels.map((level) => (
              <button
                key={level.key}
                onClick={() => setActiveLevel(level.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${getLevelFilterColor(
                  level.key,
                  activeLevel === level.key
                )}`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Skills Cloud */}
        <motion.div
          variants={containerVariants}
          className="relative w-full max-w-none mx-auto"
        >
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 px-4">
            {filteredSkills.map((skill, index) => {
              // Create organic cloud positioning with varied sizes - SMALLER SIZES
              const sizes = [
                "text-xs px-2 py-1",
                "text-xs px-2 py-1.5",
                "text-sm px-3 py-1.5",
                "text-sm px-3 py-2",
              ];
              const sizeIndex =
                skill.level === "expert"
                  ? 3
                  : skill.level === "proficient"
                    ? 2
                    : 1;
              const skillSize = sizes[sizeIndex] || sizes[1];

              return (
                <motion.div
                  key={skill.name}
                  id={`skill-${skill.name.toLowerCase().replace(/ /g, "-").replace(/\//g, "-")}`}
                  variants={skillVariants}
                  layout
                  onHoverStart={() => !isMobile && setHoveredSkill(skill.name)}
                  onHoverEnd={() => !isMobile && setHoveredSkill(null)}
                  onMouseMove={(e) => {
                    if (!isMobile) {
                      setMousePosition({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onClick={() => {
                    if (isMobile) {
                      // On mobile, click toggles tooltip
                      setHoveredSkill(
                        hoveredSkill === skill.name ? null : skill.name
                      );
                      setMousePosition({
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                      });
                    }
                  }}
                  className="group relative"
                  style={
                    !isMobile && !prefersReducedMotion
                      ? {
                          // Add slight random positioning for cloud effect - desktop only
                          transform: `rotate(${Math.sin(index * 1.3) * 3}deg)`,
                        }
                      : {}
                  }
                >
                  {/* Skill Bubble */}
                  <div
                    className={`relative overflow-hidden rounded-full bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer border-2 ${skillSize} ${
                      skill.level === "expert"
                        ? "border-green-400 hover:border-green-500"
                        : skill.level === "proficient"
                          ? "border-orange-400 hover:border-orange-500"
                          : "border-blue-400 hover:border-blue-500"
                    } ${
                      !isMobile && !prefersReducedMotion
                        ? "hover:shadow-xl hover:-translate-y-2 hover:scale-110 hover:shadow-green-500/20"
                        : "hover:shadow-lg"
                    }`}
                  >
                    {/* Skill Content */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-base">{skill.icon}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {skill.name}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Hover Tooltip - Smart Positioned Outside */}
                  {hoveredSkill === skill.name && (
                    <div
                      className={`fixed bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm shadow-2xl border border-slate-200 dark:border-slate-600 max-w-xs sm:max-w-sm ${
                        isMobile ? "inset-x-4 top-20" : ""
                      }`}
                      style={
                        isMobile
                          ? {
                              pointerEvents: "auto",
                              zIndex: 999999,
                            }
                          : {
                              left: mousePosition.x,
                              bottom: window.innerHeight - mousePosition.y,
                              transform: `translate(${
                                mousePosition.x > window.innerWidth / 2
                                  ? "-100%"
                                  : "0%"
                              }, 0%)`,
                              pointerEvents: "none",
                              zIndex: 999999,
                            }
                      }
                    >
                      {/* Mobile close button */}
                      {isMobile && (
                        <button
                          onClick={() => setHoveredSkill(null)}
                          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          ✕
                        </button>
                      )}

                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-600 pb-2">
                          <span className="text-2xl">{skill.icon}</span>
                          <div>
                            <div className="font-bold text-lg">
                              {skill.name}
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full inline-block ${getLevelBadgeColor(
                                skill.level
                              )}`}
                            >
                              {skill.level.toUpperCase()} • {skill.experience} •{" "}
                              {skill.projects}+ projects
                            </div>
                          </div>
                        </div>

                        {/* Achievement */}
                        <div>
                          <div className="font-semibold text-sm mb-1 text-yellow-400 dark:text-yellow-600">
                            🏆 Key Achievement:
                          </div>
                          <div className="text-sm leading-relaxed">
                            {skill.achievement}
                          </div>
                        </div>

                        {/* Endorsements */}
                        <div>
                          <div className="font-semibold text-sm mb-2 text-blue-400 dark:text-blue-600">
                            ✨ Endorsed by:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {skill.endorsements
                              .slice(0, 3)
                              .map((endorsement, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-1 rounded-full"
                                >
                                  {endorsement}
                                </span>
                              ))}
                            {skill.endorsements.length > 3 && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                +{skill.endorsements.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Arrow pointing to skill */}
                      <div
                        className={`absolute w-0 h-0 border-l-4 border-r-4 border-transparent ${
                          mousePosition.y > window.innerHeight - 200
                            ? "-top-2 border-b-4 border-b-white dark:border-b-slate-800"
                            : "-bottom-2 border-t-4 border-t-white dark:border-t-slate-800"
                        } ${
                          mousePosition.x > window.innerWidth / 2
                            ? "right-4"
                            : "left-4"
                        }`}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom anchor for tour targeting */}
      <div id="skills-bottom" className="h-1 w-full" />
    </section>
  );
}
