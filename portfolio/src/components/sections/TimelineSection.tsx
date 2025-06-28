"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

interface TimelineEvent {
  type: "education" | "experience";
  year: string;
  title: string;
  org: string;
  date: string;
  logo: string;
  category?: string;
  bullets?: string[];
  details?: string[];
}

const timelineData: TimelineEvent[] = [
  // Education
  {
    type: "education",
    year: "2024",
    title: "Master's degree, Information Systems Management",
    org: "Carnegie Mellon University",
    date: "Aug 2023 - Dec 2024",
    logo: "/logos/carnegie_mellon_university_logo.jpeg",
    details: [
      "Learned to bridge the gap between human needs and cutting-edge technology to create meaningful change.",
      "Relevant Coursework: New Product Management, Lean Entrepreneurship, Agile Methods, A/B Testing & Design Analytics, Machine Learning in Production",
      "Awards: Finalist – McGinnis Venture Competition (2025), Gerhalt Sandbox Fund Scholar (2025) (GPA 3.55)",
    ],
  },
  {
    type: "education",
    year: "2021",
    title: "Bachelor's degree, Computer Science",
    org: "University of Florida",
    date: "Aug 2017 - May 2021",
    logo: "/logos/UF logo.jpeg",
    details: [
      "Discovered that the most powerful code isn't just functional—it's transformational.",
      "Relevant Coursework: Software Engineering, Data Structures & Algorithms, Operating Systems, Network Analytics & Machine Learning",
      "Awards: President's Honor Roll (Spring 2020), Cum Laude Graduate (GPA 3.65)",
    ],
  },
  {
    type: "education",
    year: "2017",
    title: "High School Diploma",
    org: "Spanish River Community High School",
    date: "Aug 2013 - May 2017",
    logo: "/logos/srhs_logo.jpeg",
    details: [
      "Learned that true leadership means building harmony from diverse voices and creating communities where everyone belongs.",
      "Founded Asian American Club - 250 members, $10K cashflow management",
      "Founded Autism Awareness Club - Organized 5 community service events",
    ],
  },
  // Experience (Most Recent First)
  {
    type: "experience",
    year: "2025",
    title: "External Expert – AI Model Evaluation",
    org: "Amazon Mechanical Turk Experts Program · Contract · Qualification Rating: Expert",
    date: "Jun 2025 - Present",
    logo: "/logos/mturk logo.png",
    category: "product",
    bullets: [
      "Evaluated and improved AI-generated code and natural language responses for real-world reliability, accuracy, and ethical alignment",
      "Performed high-impact prompt assessments and human-vs-AI demonstrations to enhance large language model performance",
      "Provided expert feedback on model behavior to support the development of safer, more human-aligned AI systems",
      "Contributing human expertise to train and refine the next generation of responsible, high-precision AI systems",
    ],
  },
  {
    type: "experience",
    year: "2024",
    title: "Product Manager Intern",
    org: "PM Happy Hour · Internship",
    date: "Mar 2024 - Present",
    logo: "/logos/pm_happy_hour_logo.jpeg",
    category: "product",
    bullets: [
      "Spearheaded AI content roadmap, growing Discord engagement by 30% through automated content workflows using tools like Notion AI and Sora",
      "Created a viral MBTI campaign with 75+ community reactions by designing assets in under 30 mins using prompt engineering",
      "Improved user retention by 20% by running A/B tests and incorporating live feedback into iterative feature releases",
    ],
  },
  {
    type: "experience",
    year: "2024",
    title: "CoFounder",
    org: "Expired Solutions, LLC · Full-time",
    date: "Aug 2024 - Present",
    logo: "/logos/expired_solutions_logo.jpeg",
    category: "product",
    bullets: [
      "Led product strategy for a multimodal AI system that combined Vision AI and a fine-tuned Azure-hosted LLM, unlocking $200M+ in projected value",
      "Shipped a prerelease iOS app that reduced quality check time by 50%, using YOLO for product detection and LLM powered classification",
      "Forecasted a 20% shrink reduction and 50% improvement in markdown sell-through by proposing and pitching an 8-week pilot to Giant Eagle executives",
      "Spent 4 months working in-store as a produce manager to uncover shrink patterns and frontline pain points, directly informing product roadmap",
    ],
  },
  {
    type: "experience",
    year: "2021",
    title: "AI Product Consultant",
    org: "Tutora · Part-time",
    date: "Mar 2021 - Present",
    logo: "/logos/Tutora Logo.jpeg",
    category: "product",
    bullets: [
      "Built AI-powered tools that automated scheduling, invoicing, and grading, saving 15+ hours per week by integrating OpenAI API, Google App Scripts, Excel, and Zoom",
      "Improved math scores by 35% for 50+ students by designing and deploying 100+ TI-BASIC programs tailored to personalized tutoring workflows",
    ],
  },
  {
    type: "experience",
    year: "2025",
    title: "Produce Assistant Team Leader",
    org: "Giant Eagle · Full-time",
    date: "Feb 2025 - May 2025",
    logo: "/logos/giant_eagle_logo.jpeg",
    category: "retail",
    bullets: [
      "Cut produce shrink 1% in 30 days, tripled Flashfoods adoption, doubled Periscope audits, optimized ordering, boosted compliance 80%",
      "Reduced shrink by 1% in produce within 30 days by optimizing markdown execution and inventory rotation strategy",
      "Increased Flashfoods adoption by 300% and Periscope audits by 200%, improving freshness visibility",
      "Optimized ordering decisions using sales trends, weather forecasts, and shrink reports",
    ],
  },
  {
    type: "experience",
    year: "2024",
    title: "Product Manager",
    org: "PanPalz · Internship",
    date: "Aug 2024 - Jan 2025",
    logo: "/logos/Panpalz logo.jpeg",
    category: "product",
    bullets: [
      "Owned roadmap, refined 100+ Figma frames (+40% UI usability), prepped GTM and brand alignment",
      "Led roadmap planning and UI design for nonprofit social media platform",
      "Refined 100+ Figma frames, improving UI consistency and usability by 40%",
      "Supported GTM planning for world's first nonprofit social app launch",
    ],
  },
  {
    type: "experience",
    year: "2024",
    title: "Consultant (Capstone), Technical Lead",
    org: "Kearney and Bath and Body Works",
    date: "Aug 2024 - Dec 2024",
    logo: "/logos/kearney_logo.jpeg",
    category: "product",
    bullets: [
      "Prioritized the feature set for a net-new product by translating stakeholder pain points into a clear PRD, resulting in a 3-month prototype",
      "Built a RAG-enabled Generative AI interface in Flask + React that replaced manual analysis, cutting enterprise decision-making time by 26%",
      "Launched an interactive dashboard that enabled senior leadership to identify and prioritize the most critical decision-making pain points",
    ],
  },
  {
    type: "experience",
    year: "2024",
    title: "Cryptocurrency Researcher",
    org: "Carnegie Mellon University · Internship",
    date: "Jul 2024 - Aug 2024",
    logo: "/logos/carnegie_mellon_university_logo.jpeg",
    category: "engineering",
    bullets: [
      "Crafted launch plan, competitor & compliance analysis, delivered final deck",
      "Researched and defined go-to-market strategy for gaming-focused cryptocurrency",
      "Led collaboration across regulatory, technical, and product leads",
      "Created and delivered final presentation to university stakeholders",
    ],
  },
  {
    type: "experience",
    year: "2023",
    title: "Embedded Android Engineer",
    org: "Motorola Solutions, Inc. · Full-time",
    date: "Aug 2021 - Aug 2023",
    logo: "/logos/Motorola logo.jpeg",
    category: "engineering",
    bullets: [
      "Built GPS, messaging, and UI features for 15,000+ public safety radios, improving real-time communication reliability for first responders",
      "Cut integration delays by 25% by resolving 80+ firmware and app issues through global debugging and JIRA coordination",
      "Won 1st place in Motorola's internal hackathon by prototyping NFC-based enhancements that sped up push-to-talk response time",
    ],
  },
  {
    type: "experience",
    year: "2020",
    title: "Android Software Developer",
    org: "Motorola Solutions · Internship",
    date: "Jun 2020 - Aug 2020",
    logo: "/logos/Motorola logo.jpeg",
    category: "engineering",
    bullets: [
      "Built APX NEXT features, presented end-to-end solutions in virtual agile setting",
      "Developed and updated Android Applications in the APX NEXT device",
      "Learned how to adapt quickly in a completely virtual agile development setting",
      "Created and presented end-to-end solutions for developer applications",
    ],
  },
  {
    type: "experience",
    year: "2021",
    title: "System Administrator",
    org: "University of Florida · Part-time",
    date: "May 2019 - Jun 2021",
    logo: "/logos/UF logo.jpeg",
    category: "engineering",
    bullets: [
      "Maintained 95% CSAT for 200+ users, built Power Apps asset tracker (-60% errors), led 20-person tech team",
      "Provided IT support and system management for academic labs and research teams",
      "Designed and deployed Microsoft Power Platform app to track 100+ laptops and lab devices",
      "Supervised and trained a 20-person tech team, streamlining onboarding procedures",
    ],
  },
  {
    type: "experience",
    year: "2018",
    title: "Store Cashier",
    org: "5-Spice Asian Street Market · Full-time",
    date: "Jan 2016 - Jan 2018",
    logo: "/logos/5spice_logo.jpeg",
    category: "retail",
    bullets: [
      "Handled orders, multi-role duties (barista, cleaner), ensured accurate billing and positive CX",
      "Family-owned restaurant business, started working as an unpaid intern at age 6",
      "Orders taken using Point-of-Sale software to secure communication with the chef",
      "Demonstrated flexibility through a range of jobs such as barista, tip calculator, and dining hall cleaner",
    ],
  },
];

const categories = [
  { key: "all", label: "All" },
  { key: "product", label: "Product Management" },
  { key: "engineering", label: "Engineering" },
  { key: "retail", label: "Retail" },
];

interface TimelineSectionProps {
  tourActive?: boolean;
  currentStep?: number;
}

const generateId = (item: TimelineEvent) => {
  const orgSlug = item.org
    .toLowerCase()
    .replace(/ /g, "-")
    .split("·")[0]
    .replace(/-+$/, "");
  return `timeline-${orgSlug}`;
};

export function TimelineSection({
  tourActive = false,
  currentStep = -1,
}: TimelineSectionProps = {}) {
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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filteredTimeline = React.useMemo(() => {
    // Special filtering for tour step 4 - show specific experiences in priority order
    if (tourActive && currentStep === 3) {
      const allExperiences = timelineData.filter(
        (item) => item.type === "experience"
      );

      // Define the priority 4 experiences in the requested order
      const priorityExperiences: TimelineEvent[] = [];

      // 1. PM Happy Hour · Internship (Product Manager) - Mar 2025 - Present
      const pmHappyHour = allExperiences.find(
        (item) =>
          item.title === "Product Manager" && item.org.includes("PM Happy Hour")
      );
      if (pmHappyHour) priorityExperiences.push(pmHappyHour);

      // 2. Tutora · Part-time (AI Product Consultant & CS Instructor) - Mar 2021 - Present
      const tutora = allExperiences.find(
        (item) =>
          item.title === "AI Product Consultant & CS Instructor" &&
          item.org.includes("Tutora")
      );
      if (tutora) priorityExperiences.push(tutora);

      // 3. Kearney (Student Consultant, Technical Lead) - Sep 2024 - Dec 2024
      const kearney = allExperiences.find(
        (item) =>
          item.title === "Student Consultant, Technical Lead" &&
          item.org.includes("Kearney")
      );
      if (kearney) priorityExperiences.push(kearney);

      // 4. Motorola Solutions · Full-time (Embedded Android Engineer) - Aug 2021 - Aug 2023
      const motorola = allExperiences.find(
        (item) =>
          item.title === "Embedded Android Engineer" &&
          item.org.includes("Motorola Solutions")
      );
      if (motorola) priorityExperiences.push(motorola);

      // Get the rest of the experiences (excluding the priority 4)
      const priorityTitlesAndOrgs = priorityExperiences.map((exp) => ({
        title: exp.title,
        org: exp.org,
      }));

      const remainingExperiences = allExperiences.filter((item) => {
        return !priorityTitlesAndOrgs.some(
          (priority) =>
            priority.title === item.title && priority.org === item.org
        );
      });

      // Return priority experiences first, then the rest
      return [...priorityExperiences, ...remainingExperiences];
    }

    return timelineData.filter(
      (item) =>
        activeCategory === "all" ||
        item.category === activeCategory ||
        item.type === "education"
    );
  }, [activeCategory, tourActive, currentStep]);

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 10;
    setShowScrollIndicator(!isAtBottom);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;

    // Check if scrolling up and already at top
    if (e.deltaY < 0 && scrollTop === 0) {
      return; // Allow page scroll
    }

    // Check if scrolling down and already at bottom
    if (e.deltaY > 0 && scrollTop >= scrollHeight - clientHeight) {
      return; // Allow page scroll
    }

    // Prevent page scroll and handle container scroll
    e.preventDefault();
    e.stopPropagation();
    container.scrollTo({
      top: scrollTop + e.deltaY,
      behavior: "auto",
    });
  };

  const containerVariants = tourActive
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : {
        hidden: { opacity: isMobile ? 1 : 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: isMobile ? 0 : 0.1,
            duration: isMobile ? 0 : 0.6,
          },
        },
      };

  const itemVariants = tourActive
    ? {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
      }
    : {
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

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "product":
        return "from-blue-500 to-purple-500";
      case "engineering":
        return "from-green-500 to-blue-500";
      case "retail":
        return "from-orange-500 to-red-500";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  return (
    <section
      id="timeline"
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
        className="relative z-10 mx-auto max-w-7xl px-6"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
            Professional{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Journey
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            From software engineering to AI product management.
            <br />
            <span className="font-bold">
              11 career milestones, 16 projects, 3 degrees
            </span>
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
        </motion.div>

        {/* Filter Controls */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex flex-wrap justify-center gap-3">
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
                {category.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Split Timeline: Education & Work Experience */}
        <motion.div
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-12"
        >
          {/* Education Column */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Education
            </h3>
            <div className="space-y-6">
              {timelineData
                .filter((item) => item.type === "education")
                .map((item) => {
                  const cardId = `${item.type}-${item.year}-${item.title}`;
                  const isExpanded = expandedCards.has(cardId);
                  const timelineId = generateId(item);

                  return (
                    <motion.div
                      key={cardId}
                      id={timelineId}
                      variants={itemVariants}
                      className="relative"
                    >
                      <motion.div
                        onClick={() => toggleCard(cardId)}
                        className="group relative cursor-pointer rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 shadow-md border border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:scale-[1.02] hover:bg-white dark:hover:bg-slate-800"
                      >
                        {/* Header */}
                        <div className="flex items-center space-x-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white shadow-md flex-shrink-0">
                            <Image
                              src={item.logo}
                              alt={item.org}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                              {item.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-1">
                                {item.org}
                              </p>
                              <span className="text-xs text-slate-400">•</span>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                {item.date}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          >
                            <svg
                              className="w-4 h-4 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        <div
                          className={`overflow-hidden ${isExpanded ? "block" : "hidden"}`}
                        >
                          <div className="mt-4 space-y-2">
                            {item.details?.map((detail, idx) => (
                              <div
                                key={idx}
                                className="flex items-start space-x-2"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  {detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>

          {/* Work Experience Column */}
          <motion.div variants={itemVariants} className="relative">
            <h3
              id="work-experience-title"
              className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center"
            >
              Work Experience
            </h3>
            <div className="relative">
              {/* Gallery Container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onWheel={handleWheel}
                className="relative space-y-6 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent pr-4 -mr-4"
              >
                {filteredTimeline
                  .filter((item) => item.type === "experience")
                  .map((item) => {
                    const cardId = `${item.type}-${item.year}-${item.title}`;
                    const isExpanded = expandedCards.has(cardId);
                    const timelineId = generateId(item);

                    return (
                      <motion.div
                        key={cardId}
                        id={timelineId}
                        variants={itemVariants}
                        className="relative"
                      >
                        <motion.div
                          onClick={() => toggleCard(cardId)}
                          className="group relative cursor-pointer rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1"
                        >
                          {/* Category Badge */}
                          {item.category && (
                            <div
                              className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(item.category)}`}
                            >
                              {item.category}
                            </div>
                          )}

                          {/* Header */}
                          <div className="flex items-start space-x-4">
                            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white shadow-lg flex-shrink-0">
                              <Image
                                src={item.logo}
                                alt={item.org}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {item.title}
                              </h4>
                              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {item.org}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500">
                                {item.date}
                              </p>
                            </div>
                            <div
                              className={`transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            >
                              <svg
                                className="w-5 h-5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Expandable Content */}
                          <div
                            className={`overflow-hidden ${isExpanded ? "block" : "hidden"}`}
                          >
                            <div className="mt-4 space-y-2">
                              {item.bullets?.map((bullet, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start space-x-2"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                  <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {bullet}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
              </div>

              {/* Enhanced Scroll Indicator */}
              {showScrollIndicator && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-slate-600 dark:text-slate-300 z-20 pointer-events-none"
                >
                  <div className="flex flex-col items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-3 shadow-xl border border-slate-200/50 dark:border-slate-700/50">
                    <span className="text-xs font-semibold mb-1">
                      Scroll for more
                    </span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
