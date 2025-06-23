"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, Star, Award } from "lucide-react";

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  linkText: string;
  linkIcon: "external" | "github";
  featured?: boolean;
  achievements?: string[];
}

const projectsData = {
  all: [
    {
      title: "Expired Solutions - AI Grocery Platform",
      description:
        "AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT with Azure-based solution and mobile companion app. Pitched pilot to Giant Eagle C-Suite and reached McGinnis Venture Competition finals.",
      image: "/logos/expired_solutions_logo.jpeg",
      tags: [
        "AI/ML",
        "Computer Vision",
        "Azure",
        "Product Management",
        "Startup",
      ],
      link: "https://expiredsolutions.com",
      linkText: "Visit Site",
      linkIcon: "external" as const,
      featured: true,
      achievements: [
        "Giant Eagle C-Suite pilot pitch",
        "McGinnis Competition Finalist",
        "20% grocery shrink reduction",
        "250+ shopper surveys validated",
      ],
    },
    {
      title: "Tutora AI Automation Platform",
      description:
        "Built AI-driven scheduling, grading, and substitution flows saving 15+ hours/week with 50+ TI-BASIC math programs improving test scores by 35%.",
      image: "/logos/Tutora Logo.jpeg",
      tags: ["AI", "Automation", "Education", "Python"],
      link: "https://docs.google.com/spreadsheets/d/1ZFDgThJRoqmAiC9YdL8igDN8W07KTzZ__gTo8xfSVLY/edit?usp=sharing",
      linkText: "View Project",
      linkIcon: "external" as const,
    },
    {
      title: "McGinnis Venture Competition Finalist",
      description:
        "Finalist (Top 4, Social Enterprise) at the 2025 McGinnis Venture Competition pitching Expired Solutions AI platform for grocery automation.",
      image: "/logos/Mcginnis.png",
      tags: ["Competition", "AI/ML", "Startup", "Award", "Pitch"],
      link: "https://www.youtube.com/watch?v=WqzHP1G3LO8&ab_channel=CMUSwartzCenterforEntrepreneurship",
      linkText: "Watch Live Pitch",
      linkIcon: "external" as const,
    },
    {
      title: "BBW Demo Presentation",
      description:
        "Enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week using OpenAI APIs, Flask, and JavaScript. Built for Kearney consulting engagement.",
      image: "/logos/bbw.jpg",
      tags: ["Enterprise", "AI", "Consulting", "LLM"],
      link: "https://github.com/LawrenceHua/BBW_POC",
      linkText: "View Project",
      linkIcon: "github" as const,
      featured: true,
      achievements: [
        "18 hours/week time saved",
        "26% faster decisions",
        "OpenAI API integration",
        "Enterprise deployment ready",
      ],
    },
    {
      title: "PanPalz - Nonprofit Social App",
      description:
        "Nonprofit social media platform with roadmap planning and UI design, refining 100+ Figma frames improving UI consistency by 40%.",
      image: "/logos/Panpalz logo.jpeg",
      tags: ["Social Media", "UI/UX", "Nonprofit", "Product Management"],
      link: "https://panpalz.com",
      linkText: "View Project",
      linkIcon: "external" as const,
    },
    {
      title: "Netflix A/B Testing Analysis",
      description:
        "Comprehensive analysis of Netflix's A/B testing methodologies and optimization strategies for data-driven decision making.",
      image: "/logos/abtextingnetflix.png",
      tags: ["Analysis", "A/B Testing", "Data Science"],
      link: "https://docs.google.com/presentation/d/1ii-Se5r_kFOnujyRiOX3i0j58Svz270OvletCi6Dblo/edit?usp=sharing",
      linkText: "View Analysis",
      linkIcon: "external" as const,
    },
    {
      title: "Amazon MTurk External Expert Projects",
      description:
        "AI Model Evaluation projects as External Expert for Amazon's Mechanical Turk Experts Program with Expert qualification rating. Evaluating AI-generated code, performing prompt assessments, and providing feedback for human-AI alignment.",
      image: "/logos/mturk logo.png",
      tags: ["AI Evaluation", "Expert Rating", "Human-AI Alignment", "Amazon"],
      link: "https://www.linkedin.com/in/lawrencehua",
      linkText: "Come back for more in July!",
      linkIcon: "external" as const,
    },
    {
      title: "Netflix Clone with KNN Model",
      description:
        "Developed a KNN model analyzing 10M+ reviews with A/B testing implementation and Grafana visualization.",
      image: "/logos/netflixlogo.jpeg",
      tags: ["Machine Learning", "Data Analysis", "A/B Testing", "KNN"],
      link: "https://docs.google.com/presentation/d/1G8CHLYjhbST7aTZ-ghWIaQ38CgRdV86MnioyHiZanTM/edit?slide=id.g31d10e42dea_0_0#slide=id.g31d10e42dea_0_0",
      linkText: "View Project",
      linkIcon: "external" as const,
    },
    {
      title: "Cryptocurrency Gaming Research",
      description:
        "Researched and defined go-to-market strategy for a new digital asset targeting the gaming industry with compliance and technical alignment.",
      image: "/logos/gamingcrypto.jpeg",
      tags: ["Research", "Strategy", "Crypto", "Gaming"],
      link: "https://docs.google.com/presentation/d/16JXTVzGa05PTkKWciSSzWvvTNbTZ9kaPNtfiEZu0gPU/edit?slide=id.p#slide=id.p",
      linkText: "View Presentation",
      linkIcon: "external" as const,
    },
    {
      title: "NFC Feature Prototype",
      description:
        "NFC-based feature prototype that won 1st place at Motorola Product Hackathon for innovative communication features on mission-critical devices.",
      image: "/logos/nfc.jpeg",
      tags: ["NFC", "Prototype", "Hackathon", "Android"],
      link: "https://www.linkedin.com/posts/lawrencehua_hackathon-firstplace-innovation-activity-6862193706758393856-fjSi?utm_source=share&utm_medium=member_desktop&rcm=ACoAACoaVQoBe5_rWJwAB8-Fm4Zdm96i2nyD8xM",
      linkText: "View LinkedIn Post",
      linkIcon: "external" as const,
    },
    {
      title: "Valohai AI Tutorial",
      description:
        "Reproducible ML pipeline tutorial using Valohai for clean experiment tracking and version control in machine learning workflows.",
      image: "/logos/valohai.png",
      tags: ["ML Pipeline", "Python", "Valohai", "Tutorial"],
      link: "https://github.com/LawrenceHua/Valohai-AI-tutorial",
      linkText: "View Project",
      linkIcon: "github" as const,
    },
    {
      title: "Android + DB + RESTful Webservice",
      description:
        "Distributed systems project combining Android app, database, and RESTful web services for scalable architecture development.",
      image: "/logos/DS project.png",
      tags: ["Android", "Database", "REST API", "Distributed Systems"],
      link: "https://github.com/LawrenceHua/CMU-Projects/blob/main/Spring%202024/Distributed%20Systems/DS%20projects/Project%204%2C%20Android%20%2B%20DB%20%2B%20RESTful%20Webservice/README.pdf",
      linkText: "View Project",
      linkIcon: "external" as const,
    },
    {
      title: "Professional Speaking",
      description:
        "Presented to a class of 30 students receiving an A+ grade while demonstrating strong communication and presentation skills.",
      image: "/logos/professional_speaking.jpg",
      tags: ["Presentation", "Education", "Communication"],
      link: "https://docs.google.com/presentation/d/1A4cpxYo7PuTrZURfcOFTfyF5IDOHKwfxnfmIXerjqVM/edit?usp=sharing",
      linkText: "View Presentation",
      linkIcon: "external" as const,
    },
    {
      title: "ML Playground",
      description:
        "Interactive machine learning simulation featuring models from CMU 10601 including Decision Trees, Neural Networks, and KNN algorithms.",
      image: "/logos/mlplayground.jpeg",
      tags: ["Machine Learning", "Interactive", "Education", "Simulation"],
      link: "/ml-playground",
      linkText: "Play Game",
      linkIcon: "external" as const,
    },
    {
      title: "Portfolio Website",
      description:
        "Personal portfolio website built with Next.js and TailwindCSS featuring interactive timeline, chatbot, and responsive design.",
      image: "/logos/backgroundlogo.png",
      tags: ["Next.js", "React", "TailwindCSS", "TypeScript"],
      link: "https://github.com/LawrenceHua/LawrenceHua.io",
      linkText: "View Source",
      linkIcon: "github" as const,
    },
  ],
};

const getDynamicCategories = () => {
  const featuredProjects = projectsData.all.filter((p) => p.featured);
  const regularProjects = projectsData.all.filter((p) => !p.featured);

  const aiCount =
    featuredProjects.length +
    regularProjects.filter((p) =>
      p.tags.some((tag) =>
        [
          "AI",
          "AI/ML",
          "Machine Learning",
          "ML Pipeline",
          "LLM",
          "Computer Vision",
        ].includes(tag)
      )
    ).length;

  const productCount =
    featuredProjects.length +
    regularProjects.filter((p) =>
      p.tags.some((tag) =>
        ["Product Management", "A/B Testing", "Strategy", "UI/UX"].includes(tag)
      )
    ).length;

  const engineeringCount =
    featuredProjects.length +
    regularProjects.filter((p) =>
      p.tags.some((tag) =>
        [
          "Android",
          "Next.js",
          "React",
          "Database",
          "REST API",
          "Python",
          "TypeScript",
        ].includes(tag)
      )
    ).length;

  return [
    { key: "all", label: "All Projects", count: projectsData.all.length },
    { key: "product", label: "Product", count: productCount },
    { key: "ai", label: "AI/ML", count: aiCount },
    { key: "engineering", label: "Engineering", count: engineeringCount },
  ];
};

export function ProjectsSection() {
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

  const [activeCategory, setActiveCategory] = useState("all");
  const [showAll, setShowAll] = useState(false);

  const categories = getDynamicCategories();

  const getFilteredProjects = () => {
    const featuredProjects = projectsData.all.filter((p) => p.featured);
    const regularProjects = projectsData.all.filter((p) => !p.featured);

    let filteredRegular = regularProjects;

    if (activeCategory === "ai") {
      filteredRegular = regularProjects.filter((p) =>
        p.tags.some((tag) =>
          [
            "AI",
            "AI/ML",
            "Machine Learning",
            "ML Pipeline",
            "LLM",
            "Computer Vision",
          ].includes(tag)
        )
      );
    } else if (activeCategory === "product") {
      filteredRegular = regularProjects.filter((p) =>
        p.tags.some((tag) =>
          ["Product Management", "A/B Testing", "Strategy", "UI/UX"].includes(
            tag
          )
        )
      );
    } else if (activeCategory === "engineering") {
      filteredRegular = regularProjects.filter((p) =>
        p.tags.some((tag) =>
          [
            "Android",
            "Next.js",
            "React",
            "Database",
            "REST API",
            "Python",
            "TypeScript",
          ].includes(tag)
        )
      );
    }

    // Always include featured projects at the beginning, unfiltered
    return [...featuredProjects, ...filteredRegular];
  };

  const allProjectsForDisplay = getFilteredProjects();
  const featuredProjects = projectsData.all.filter((p) => p.featured);

  const projectsToShow = showAll
    ? allProjectsForDisplay
    : allProjectsForDisplay.slice(0, 4);

  const remainingCount = allProjectsForDisplay.length - projectsToShow.length;

  const containerVariants = {
    hidden: { opacity: isMobile ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0.1,
        duration: isMobile ? 0 : 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0 : 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: isMobile ? 1 : 0, scale: isMobile ? 1 : 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: isMobile ? 0 : 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="projects"
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
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
              Featured{" "}
              <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Projects
              </span>
            </h2>
            <Star className="h-8 w-8 text-yellow-500 fill-current" />
          </div>
          <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Spotlight on my two favorite projects that showcase{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              AI innovation
            </span>
            ,
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {" "}
              product leadership
            </span>
            , and{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              real-world impact
            </span>
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full" />
        </motion.div>

        {/* Featured Projects Grid */}
        {featuredProjects.length > 0 && (
          <motion.div variants={containerVariants} className="mb-20">
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredProjects.map((project, index) => {
                const projectId = `project-${project.title
                  .toLowerCase()
                  .split(" ")[0]
                  .replace(/[^a-z0-9-]/g, "")}`;
                return (
                  <motion.div
                    key={project.title}
                    id={
                      project.title.includes("Expired Solutions")
                        ? "project-expired-solutions"
                        : projectId
                    }
                    variants={cardVariants}
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:shadow-yellow-500/10 hover:-translate-y-3"
                  >
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center space-x-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                        <Award className="h-3 w-3" />
                        <span>FEATURED</span>
                      </div>
                    </div>

                    {/* Project Image */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Overlay Link */}
                      <Link
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="flex items-center space-x-2 rounded-full bg-white/90 dark:bg-slate-900/90 px-6 py-3 text-sm font-bold text-slate-900 dark:text-white backdrop-blur-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {project.linkIcon === "github" ? (
                            <Github className="h-5 w-5" />
                          ) : (
                            <ExternalLink className="h-5 w-5" />
                          )}
                          <span>{project.linkText}</span>
                        </div>
                      </Link>
                    </div>

                    {/* Project Content */}
                    <div className="p-8">
                      <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                        {project.title}
                      </h3>

                      <p className="mb-6 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Key Achievements */}
                      {project.achievements && (
                        <div className="mb-6">
                          <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                            Key Achievements
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {project.achievements.map((achievement, idx) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                                <span>{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mb-6 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 px-3 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Project Link */}
                      <Link
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25 hover:scale-105"
                      >
                        <span>{project.linkText}</span>
                        {project.linkIcon === "github" ? (
                          <Github className="h-4 w-4" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* All Projects Grid */}
        {allProjectsForDisplay.length > featuredProjects.length && (
          <motion.div variants={itemVariants} className="mb-16">
            <h3
              id="all-projects-title"
              className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center"
            >
              All Projects
            </h3>
            <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300 text-center mb-8">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                AI-driven solutions
              </span>{" "}
              and{" "}
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                product innovations
              </span>{" "}
              spanning{" "}
              <span className="font-medium text-green-600 dark:text-green-400">
                machine learning
              </span>
              ,{" "}
              <span className="font-medium text-orange-600 dark:text-orange-400">
                enterprise tools
              </span>
              , and{" "}
              <span className="font-medium text-blue-600 dark:text-blue-400">
                scalable platforms
              </span>
            </p>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <motion.button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border backdrop-blur-sm ${
                    activeCategory === category.key
                      ? "bg-blue-600/20 border-blue-500/80 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20"
                      : "bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  }`}
                >
                  {category.label} ({category.count})
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {projectsToShow.map((project, index) => (
            <motion.div
              key={project.title}
              variants={cardVariants}
              layout
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-2"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Project Link Overlay */}
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="flex items-center space-x-2 rounded-full bg-white/90 dark:bg-slate-900/90 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white backdrop-blur-sm">
                    {project.linkIcon === "github" ? (
                      <Github className="h-4 w-4" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    <span>{project.linkText}</span>
                  </div>
                </Link>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {project.title}
                </h3>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-blue-100 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Project Link */}
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <span>{project.linkText}</span>
                  {project.linkIcon === "github" ? (
                    <Github className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Show More Button */}
        {!showAll && remainingCount > 0 && (
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <motion.button
              onClick={() => setShowAll(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/25"
            >
              Show {remainingCount} More Project
              {remainingCount !== 1 ? "s" : ""}
            </motion.button>
          </motion.div>
        )}

        {/* Show Less Button */}
        {showAll && allProjectsForDisplay.length > 4 && (
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <motion.button
              onClick={() => setShowAll(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 px-8 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/25"
            >
              Show {allProjectsForDisplay.length - 4} Less Project
              {allProjectsForDisplay.length - 4 !== 1 ? "s" : ""}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
