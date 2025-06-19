"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Chatbot from "@/components/Chatbot";
import Navigation from "@/components/Navigation";
import DatePicker from "react-datepicker";
import { FaLinkedin } from "react-icons/fa";
import {
  FiAward,
  FiBook,
  FiExternalLink,
  FiFileText,
  FiGithub,
  FiMessageCircle,
  FiSend,
} from "react-icons/fi";

import "react-datepicker/dist/react-datepicker.css";

// useMediaQuery hook (local copy)
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);
  return matches;
}

const timelineData = [
  {
    year: "2025",
    left: null,
    right: {
      title: "Product Manager",
      org: "PM Happy Hour · Internship",
      date: "Mar 2025 - Present · 4 mos",
      logo: "/logos/pm_happy_hour_logo.jpeg",
      bullets: [
        "Scaled PM Happy Hour's community by 30% through a combination of AIGC, targeted engagement campaigns (like MBTI x PM), and continuous feedback loops. Launched interactive content initiatives and analytics workflows to improve user retention and product adoption by 20%.",
        "Led an MBTI-themed campaign to boost community interaction, resulting in 50%+ increase in comment and reaction engagement",
        "Created and iterated on AIGC-driven posts (e.g. polls, storytelling, AI-generated insights), expanding Discord and social channel visibility",
        "Improved feature adoption by 20% via A/B testing and feedback integration from PM community members",
        "Developed content calendar, analytics tracking, and engagement benchmarks to guide strategy",
        "Collaborated across marketing, content, and community leads to optimize growth and retention",
      ],
    },
  },
  {
    year: "2024",
    left: {
      title: "Master's degree, Information Systems Management",
      org: "Carnegie Mellon University",
      date: "Aug 2023 - Dec 2024",
      logo: "/logos/carnegie_mellon_university_logo.jpeg",
      details: [
        "Tepper School of Business & Heinz College",
        "Relevant Coursework: New Product Management, Lean Entrepreneurship, Agile Methods, A/B Testing & Design Analytics, Machine Learning in Production",
        "Awards: Finalist – McGinnis Venture Competition (2025), Gerhalt Sandbox Fund Scholar (2025)",
      ],
    },
    right: {
      title: "Founder",
      org: "Expired Solutions · Full-time",
      date: "Aug 2024 - Present · 11 mos",
      logo: "/logos/expired_solutions_logo.jpeg",
      bullets: [
        "As Founder and CEO, I led strategy, technical buildout, and GTM for Expired, an AI platform using CV + GPT to automate markdowns and reduce grocery shrink by up to 20%. Pitched an 8-week pilot with Giant Eagle and validated the solution through 15+ exec interviews and 250+ shopper surveys. Oversaw product strategy, model deployment, mobile dev, and team ops.",
        "Built an AI-powered freshness scoring platform to automate pricing, placement, and inventory workflows",
        "Launched shopper companion app to improve produce confidence and affordability",
        "Finalist, McGinnis Venture Competition (Top 4 – Social Enterprise Track); Gerhalt Sandbox Fund Scholar",
        "Led business formation, technical development (Azure, GPT, Vision AI), and compliance planning",
        "Created and executed onboarding strategy for pilot retailers",
      ],
    },
  },
  {
    year: "2024",
    left: null,
    right: {
      title: "Product Manager",
      org: "PanPalz · Internship",
      date: "Aug 2024 - Jan 2025 · 6 mos",
      logo: "/logos/Panpalz logo.jpeg",
      bullets: [
        "Led roadmap planning and UI design for PanPalz, a nonprofit social media platform. Improved product readiness through design iteration and alignment with launch goals.",
        "Defined and maintained product roadmap across engineering and design teams",
        "Refined 100+ Figma frames, improving UI consistency and usability by 40%",
        "Supported GTM planning for the launch of the world's first nonprofit social app",
        "Contributed to team alignment and brand messaging prior to release",
      ],
    },
  },
  {
    year: "2024",
    left: null,
    right: {
      title: "Student Consultant, Technical Lead",
      org: "Kearney",
      date: "Sep 2024 - Dec 2024 · 4 mos",
      logo: "/logos/kearney_logo.jpeg",
      bullets: [
        "Built an enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week. Handled research, competitive analysis, and prototyping using OpenAI, Python, and Flask.",
        "Reduced operational decision-making time by 26% with custom GPT-based prototype",
        "Designed and built enterprise tool using OpenAI APIs, Flask, and JavaScript",
        "Conducted user research, system architecture design, and stakeholder presentations",
        "Prioritized use cases and implementation roadmap with client sponsors",
      ],
    },
  },
  {
    year: "2025",
    left: null,
    right: {
      title: "Produce Assistant Team Leader",
      org: "Giant Eagle, Inc. · Full-time",
      date: "Feb 2025 - May 2025 · 4 mos",
      logo: "/logos/giant_eagle_logo.jpeg",
      bullets: [
        "Hands-on leadership role focused on reducing shrink, improving freshness, and optimizing inventory operations in the grocery's highest-loss department. Leveraged data and tools like Flashfoods and Periscope to drive measurable results in a 1-month window.",
        "Reduced shrink by 1% in produce within 30 days by optimizing markdown execution and inventory rotation strategy",
        "Increased Flashfoods adoption by 300% and Periscope audits by 200%, improving freshness visibility and sell-through",
        "Optimized ordering decisions using sales trends, weather forecasts, and shrink reports to reduce overstock and waste",
        "Led backroom process improvements and cleaning compliance efforts, increasing team adherence by 80%",
        "Trained and coached team members on BOH operations, freshness standards, and food safety compliance",
      ],
    },
  },
  {
    year: "2024",
    left: null,
    right: {
      title: "Cryptocurrency Researcher",
      org: "Carnegie Mellon University · Internship",
      date: "Jul 2024 - Aug 2024 · 2 mos",
      logo: "/logos/carnegie_mellon_university_logo.jpeg",
      bullets: [
        "Researched and defined go-to-market strategy for a new digital asset targeting the gaming industry. Led compliance and technical alignment across a cross-functional team to shape product positioning and long-term scalability.",
        "Developed a strategic launch plan for a novel gaming-focused cryptocurrency, backed by market and competitor analysis",
        "Designed user adoption initiatives and engagement funnels tailored for gamer behavior and blockchain onboarding",
        "Led collaboration across regulatory, technical, and product leads to ensure feasibility and compliance",
        "Created and delivered final presentation to university stakeholders and faculty advisors",
        "Presentation link: https://docs.google.com/presentation/d/1GpSuwN0JYbjMlkA8Mb7yCoeakQXbRq09zBO6_RsQI9I/pub",
      ],
    },
  },
  {
    year: "2023",
    left: null,
    right: {
      title: "Embedded Android Engineer",
      org: "Motorola Solutions · Full-time",
      date: "Aug 2021 - Aug 2023 · 2 yrs 1 mo",
      logo: "/logos/Motorola logo.jpeg",
      bullets: [
        "Developed embedded Android software for Motorola's APX NEXT Smart Radios, supporting mission-critical communications for public safety professionals. Owned features across GPS, authentication, and UI, contributing to product stability and scale.",
        "Designed and shipped Android system extensions that improved GPS accuracy, device security, and UI responsiveness for 15,000+ field units",
        "Diagnosed and resolved 80+ firmware and application-level defects across network, location, and UI components",
        "Led debugging and testing initiatives with global teams, reducing integration delays by 25% and improving time to resolution",
        "Coordinated agile planning and knowledge sharing across firmware, Android, and test automation teams",
        "Contributed to NFC-based feature prototype that won 1st place at Motorola Product Hackathon",
      ],
    },
  },
  {
    year: "2021",
    left: {
      title: "Bachelor's degree, Computer Science",
      org: "University of Florida",
      date: "Aug 2017 - May 2021",
      logo: "/logos/UF logo.jpeg",
      details: [
        "College of Liberal Arts and Sciences | Cum Laude",
        "Relevant Coursework: Software Engineering, Data Structures & Algorithms, Operating Systems, Network Analytics & Machine Learning",
        "Awards: President's Honor Roll (Spring 2020), Cum Laude Graduate (GPA 3.65)",
      ],
    },
    right: {
      title: "AI Product Consultant & Computer Science Instructor",
      org: "Tutora · Part-time",
      date: "Mar 2021 - Present · 4 yrs 4 mos",
      logo: "/logos/Tutora Logo.jpeg",
      bullets: [
        "Redesigned tutoring operations by building both backend automation tools and student-facing programs. Delivered scalable AI systems for internal workflows and custom-built math and computer science curriculum that improved student performance and operational efficiency.",
        "Consulted business owners to identify bottlenecks and build 0→1 unified AI tools using Otter.ai, Dola, WhatsApp, and App Scripts for automation and adoption",
        "Saved 15+ hours/week and cut review time by 50% through AI-driven scheduling, grading, and substitution flows",
        "Developed and launched 50+ TI-BASIC math programs, improving standardized test scores by 35% across 50+ students",
        "Taught core computer science principles including data structures, Java programming, and project-based learning using Code.org and AP CS content",
        "Delivered training and documentation to ensure long-term adoption of both AI workflows and instructional tools",
      ],
    },
  },
  {
    year: "2021",
    left: null,
    right: {
      title: "System Administrator",
      org: "University of Florida · Part-time",
      date: "May 2019 - Jun 2021 · 2 yrs 2 mos",
      logo: "/logos/UF logo.jpeg",
      bullets: [
        "Provided IT support and system management for CALS' academic labs and research teams. Built internal tools and led technician teams to improve service reliability and hardware asset tracking.",
        "Maintained 95%+ customer satisfaction over 2 years while managing MacOS/Linux support for 200+ users",
        "Designed and deployed a Microsoft Power Platform app to track 100+ laptops and lab devices, reducing manual errors by 60%",
        "Supervised and trained a 20-person tech team, streamlining onboarding and troubleshooting procedures",
        "Handled system configuration, software deployment, and tier-2 escalations for lab environments",
        "Created SOP documentation to ensure consistency across support requests and technical resolution workflows",
      ],
    },
  },
  {
    year: "2020",
    left: null,
    right: {
      title: "Android Software Developer",
      org: "Motorola Solutions · Internship",
      date: "Jun 2020 - Aug 2020 · 3 mos",
      logo: "/logos/Motorola logo.jpeg",
      bullets: [
        "Developed and updated Android Applications in the APX NEXT device while using various technologies (Android studio, git, ADB, shell, JIRA, Bitbucket).",
        "Learned how to adapt quickly in a completely virtual agile development setting.",
        "Created and presented end-to-end solutions for developer applications during end of program presentation.",
      ],
    },
  },
  {
    year: "2018",
    left: null,
    right: {
      title: "Store Cashier",
      org: "5-Spice Asian Street Market · Full-time",
      date: "Jan 2016 - Jan 2018 · 2 yrs 1 mo",
      logo: "/logos/5spice_logo.jpeg",
      bullets: [
        "Family-owned restaurant business, started working as an unpaid intern at age 6, made my way to a paid full-time worker by 2016!",
        "Orders taken using Point-of-Sale software to secure communication with the chef and accuracy for the bill.",
        "Managed orders and interacted with customers to ensure positive customer experience",
        "Demonstrated flexibility through a range of jobs such as barista, tip calculator, and dining hall cleaner.",
      ],
    },
  },
];

// 1. Flatten timelineData into a single array of events
const timelineEvents: Array<{
  type: "education" | "experience";
  year: string;
  title: string;
  org: string;
  date: string;
  logo: string;
  bullets?: string[];
  details?: string[];
}> = [
  // Education
  {
    type: "education",
    year: "2024",
    title: "Master's degree, Information Systems Management",
    org: "Carnegie Mellon University",
    date: "Aug 2023 - Dec 2024",
    logo: "/logos/carnegie_mellon_university_logo.jpeg",
    details: [
      "Tepper School of Business & Heinz College",
      "Relevant Coursework: New Product Management, Lean Entrepreneurship, Agile Methods, A/B Testing & Design Analytics, Machine Learning in Production",
      "Awards: Finalist – McGinnis Venture Competition (2025), Gerhalt Sandbox Fund Scholar (2025)",
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
      "College of Liberal Arts and Sciences | Cum Laude",
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
      "Drum Captain - Led marching band percussion section",
      "Founded Asian American Club - 250 members, $10K cashflow management",
      "Founded Autism Awareness Club - Organized 5 community service events",
      "Leadership and community service focus",
    ],
  },
  // Experience
  {
    type: "experience",
    year: "2025",
    title: "Product Manager",
    org: "PM Happy Hour · Internship",
    date: "Mar 2025 - Present · 4 mos",
    logo: "/logos/pm_happy_hour_logo.jpeg",
    bullets: [
      "Scaled PM Happy Hour's community by 30% through a combination of AIGC, targeted engagement campaigns (like MBTI x PM), and continuous feedback loops. Launched interactive content initiatives and analytics workflows to improve user retention and product adoption by 20%.",
      "Led an MBTI-themed campaign to boost community interaction, resulting in 50%+ increase in comment and reaction engagement",
      "Created and iterated on AIGC-driven posts (e.g. polls, storytelling, AI-generated insights), expanding Discord and social channel visibility",
      "Improved feature adoption by 20% via A/B testing and feedback integration from PM community members",
      "Developed content calendar, analytics tracking, and engagement benchmarks to guide strategy",
      "Collaborated across marketing, content, and community leads to optimize growth and retention",
    ],
  },
  {
    type: "experience",
    year: "2025",
    title: "Founder",
    org: "Expired Solutions · Full-time",
    date: "Aug 2024 - Present",
    logo: "/logos/expired_solutions_logo.jpeg",
    bullets: [
      "As Founder and CEO, I led strategy, technical buildout, and GTM for Expired, an AI platform using CV + GPT to automate markdowns and reduce grocery shrink by up to 20%. Pitched an 8-week pilot with Giant Eagle and validated the solution through 15+ exec interviews and 250+ shopper surveys. Oversaw product strategy, model deployment, mobile dev, and team ops.",
      "Built an AI-powered freshness scoring platform to automate pricing, placement, and inventory workflows",
      "Launched shopper companion app to improve produce confidence and affordability",
      "Finalist, McGinnis Venture Competition (Top 4 – Social Enterprise Track); Gerhalt Sandbox Fund Scholar",
      "Led business formation, technical development (Azure, GPT, Vision AI), and compliance planning",
      "Created and executed onboarding strategy for pilot retailers",
    ],
  },
  {
    type: "experience",
    year: "2025",
    title: "Product Manager",
    org: "PanPalz · Internship",
    date: "Aug 2024 - Jan 2025",
    logo: "/logos/Panpalz logo.jpeg",
    bullets: [
      "Led roadmap planning and UI design for PanPalz, a nonprofit social media platform. Improved product readiness through design iteration and alignment with launch goals.",
      "Defined and maintained product roadmap across engineering and design teams",
      "Refined 100+ Figma frames, improving UI consistency and usability by 40%",
      "Supported GTM planning for the launch of the world's first nonprofit social app",
      "Contributed to team alignment and brand messaging prior to release",
    ],
  },
  {
    type: "experience",
    year: "2024",
    title: "Student Consultant, Technical Lead",
    org: "Kearney",
    date: "Sep 2024 - Dec 2024 · 4 mos",
    logo: "/logos/kearney_logo.jpeg",
    bullets: [
      "Built an enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week. Handled research, competitive analysis, and prototyping using OpenAI, Python, and Flask.",
      "Reduced operational decision-making time by 26% with custom GPT-based prototype",
      "Designed and built enterprise tool using OpenAI APIs, Flask, and JavaScript",
      "Conducted user research, system architecture design, and stakeholder presentations",
      "Prioritized use cases and implementation roadmap with client sponsors",
    ],
  },
  {
    type: "experience",
    year: "2025",
    title: "Produce Assistant Team Leader",
    org: "Giant Eagle, Inc. · Full-time",
    date: "Feb 2025 - May 2025 · 4 mos",
    logo: "/logos/giant_eagle_logo.jpeg",
    bullets: [
      "Hands-on leadership role focused on reducing shrink, improving freshness, and optimizing inventory operations in the grocery's highest-loss department. Leveraged data and tools like Flashfoods and Periscope to drive measurable results in a 1-month window.",
      "Reduced shrink by 1% in produce within 30 days by optimizing markdown execution and inventory rotation strategy",
      "Increased Flashfoods adoption by 300% and Periscope audits by 200%, improving freshness visibility and sell-through",
      "Optimized ordering decisions using sales trends, weather forecasts, and shrink reports to reduce overstock and waste",
      "Led backroom process improvements and cleaning compliance efforts, increasing team adherence by 80%",
      "Trained and coached team members on BOH operations, freshness standards, and food safety compliance",
    ],
  },
  {
    type: "experience",
    year: "2024",
    title: "Cryptocurrency Researcher",
    org: "Carnegie Mellon University · Internship",
    date: "Jul 2024 - Aug 2024 · 2 mos",
    logo: "/logos/carnegie_mellon_university_logo.jpeg",
    bullets: [
      "Researched and defined go-to-market strategy for a new digital asset targeting the gaming industry. Led compliance and technical alignment across a cross-functional team to shape product positioning and long-term scalability.",
      "Developed a strategic launch plan for a novel gaming-focused cryptocurrency, backed by market and competitor analysis",
      "Designed user adoption initiatives and engagement funnels tailored for gamer behavior and blockchain onboarding",
      "Led collaboration across regulatory, technical, and product leads to ensure feasibility and compliance",
      "Created and delivered final presentation to university stakeholders and faculty advisors",
      "Presentation link: https://docs.google.com/presentation/d/1GpSuwN0JYbjMlkA8Mb7yCoeakQXbRq09zBO6_RsQI9I/pub",
    ],
  },
  {
    type: "experience",
    year: "2023",
    title: "Embedded Android Engineer",
    org: "Motorola Solutions · Full-time",
    date: "Aug 2021 - Aug 2023 · 2 yrs 1 mo",
    logo: "/logos/Motorola logo.jpeg",
    bullets: [
      "Developed embedded Android software for Motorola's APX NEXT Smart Radios, supporting mission-critical communications for public safety professionals. Owned features across GPS, authentication, and UI, contributing to product stability and scale.",
      "Designed and shipped Android system extensions that improved GPS accuracy, device security, and UI responsiveness for 15,000+ field units",
      "Diagnosed and resolved 80+ firmware and application-level defects across network, location, and UI components",
      "Led debugging and testing initiatives with global teams, reducing integration delays by 25% and improving time to resolution",
      "Coordinated agile planning and knowledge sharing across firmware, Android, and test automation teams",
      "Contributed to NFC-based feature prototype that won 1st place at Motorola Product Hackathon",
    ],
  },
  {
    type: "experience",
    year: "2025",
    title: "AI Product Consultant & Computer Science Instructor",
    org: "Tutora · Part-time",
    date: "Mar 2021 - Present",
    logo: "/logos/Tutora Logo.jpeg",
    bullets: [
      "Redesigned tutoring operations by building both backend automation tools and student-facing programs. Delivered scalable AI systems for internal workflows and custom-built math and computer science curriculum that improved student performance and operational efficiency.",
      "Consulted business owners to identify bottlenecks and build 0→1 unified AI tools using Otter.ai, Dola, WhatsApp, and App Scripts for automation and adoption",
      "Saved 15+ hours/week and cut review time by 50% through AI-driven scheduling, grading, and substitution flows",
      "Developed and launched 50+ TI-BASIC math programs, improving standardized test scores by 35% across 50+ students",
      "Taught core computer science principles including data structures, Java programming, and project-based learning using Code.org and AP CS content",
      "Delivered training and documentation to ensure long-term adoption of both AI workflows and instructional tools",
    ],
  },
  {
    type: "experience",
    year: "2021",
    title: "System Administrator",
    org: "University of Florida · Part-time",
    date: "May 2019 - Jun 2021 · 2 yrs 2 mos",
    logo: "/logos/UF logo.jpeg",
    bullets: [
      "Provided IT support and system management for CALS' academic labs and research teams. Built internal tools and led technician teams to improve service reliability and hardware asset tracking.",
      "Maintained 95%+ customer satisfaction over 2 years while managing MacOS/Linux support for 200+ users",
      "Designed and deployed a Microsoft Power Platform app to track 100+ laptops and lab devices, reducing manual errors by 60%",
      "Supervised and trained a 20-person tech team, streamlining onboarding and troubleshooting procedures",
      "Handled system configuration, software deployment, and tier-2 escalations for lab environments",
      "Created SOP documentation to ensure consistency across support requests and technical resolution workflows",
    ],
  },
  {
    type: "experience",
    year: "2020",
    title: "Android Software Developer",
    org: "Motorola Solutions · Internship",
    date: "Jun 2020 - Aug 2020 · 3 mos",
    logo: "/logos/Motorola logo.jpeg",
    bullets: [
      "Developed and updated Android Applications in the APX NEXT device while using various technologies (Android studio, git, ADB, shell, JIRA, Bitbucket).",
      "Learned how to adapt quickly in a completely virtual agile development setting.",
      "Created and presented end-to-end solutions for developer applications during end of program presentation.",
    ],
  },
  {
    type: "experience",
    year: "2018",
    title: "Store Cashier",
    org: "5-Spice Asian Street Market · Full-time",
    date: "Jan 2016 - Jan 2018 · 2 yrs 1 mo",
    logo: "/logos/5spice_logo.jpeg",
    bullets: [
      "Family-owned restaurant business, started working as an unpaid intern at age 6, made my way to a paid full-time worker by 2016!",
      "Orders taken using Point-of-Sale software to secure communication with the chef and accuracy for the bill.",
      "Managed orders and interacted with customers to ensure positive customer experience",
      "Demonstrated flexibility through a range of jobs such as barista, tip calculator, and dining hall cleaner.",
    ],
  },
];

// Helper to extract end date (YYYYMM or '999999' for Present)
function getEndDateNum(dateStr: string): number {
  if (!dateStr) return 0;
  // Try to match 'Mon YYYY - Mon YYYY' or 'Mon YYYY - Present'
  const match = dateStr.match(/- ([A-Za-z]+ )?(\d{4}|Present)/);
  if (!match) return 0;
  const end = match[2] || match[1] || "";
  if (end === "Present") return 202505; // treat as May 2025
  if (end === "2025") return 202505;
  // Try to get month and year
  const monthMap: { [key: string]: string } = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };
  const monthMatch = match[1] ? match[1].trim() : "01";
  const year = match[2] && match[2] !== "Present" ? match[2] : "0000";
  return parseInt(year + (monthMap[monthMatch] || "01"));
}

function isPresent(dateStr: string): boolean {
  return /Present|present/.test(dateStr);
}

// Sort: Present first, then by end date descending
const sortedTimelineEvents = [...timelineEvents].sort((a, b) => {
  const aPresent = isPresent(a.date);
  const bPresent = isPresent(b.date);
  if (aPresent && !bPresent) return -1;
  if (!aPresent && bPresent) return 1;
  return getEndDateNum(b.date) - getEndDateNum(a.date);
});

// Sort education events chronologically (descending, most recent first) for timeline display
const sortedEducationEvents = [
  ...timelineEvents.filter((e) => e.type === "education"),
].sort((a, b) => {
  return getEndDateNum(b.date) - getEndDateNum(a.date);
});
// The education section below will always show the most recent education first due to this sort.

// Skills data with proper categorization and levels
const skillsData: {
  [key: string]: Array<{
    name: string;
    level: string;
    endorsements: number;
    experiences: number;
    highlight: string;
  }>;
} = {
  business: [
    {
      name: "Product Management",
      level: "expert",
      endorsements: 15,
      experiences: 3,
      highlight:
        "Led Expired Solutions from 0→1, reducing grocery shrink by 20% using AI",
    },
    {
      name: "Product Strategy",
      level: "proficient",
      endorsements: 0,
      experiences: 7,
      highlight:
        "Defined go-to-market strategy for PanPalz, the world's first nonprofit social app",
    },
    {
      name: "Leadership",
      level: "expert",
      endorsements: 28,
      experiences: 6,
      highlight:
        "Founded and scaled Expired Solutions, leading 8-week pilot with Giant Eagle",
    },
    {
      name: "Customer Research",
      level: "proficient",
      endorsements: 12,
      experiences: 6,
      highlight:
        "Conducted 250+ shopper surveys and 15+ exec interviews for Expired Solutions",
    },
    {
      name: "Cross-functional Collaborations",
      level: "proficient",
      endorsements: 13,
      experiences: 6,
      highlight:
        "Led engineering, design, and marketing teams across 6+ product launches",
    },
    {
      name: "A/B Testing",
      level: "proficient",
      endorsements: 8,
      experiences: 2,
      highlight:
        "Improved PM Happy Hour feature adoption by 20% via A/B testing",
    },
    {
      name: "SQL & Excel",
      level: "proficient",
      endorsements: 0,
      experiences: 6,
      highlight:
        "Built analytics workflows and data tracking systems for multiple products",
    },
    {
      name: "Figma",
      level: "proficient",
      endorsements: 0,
      experiences: 2,
      highlight: "Refined 100+ Figma frames, improving UI consistency by 40%",
    },
    {
      name: "Agile Methods",
      level: "proficient",
      endorsements: 0,
      experiences: 5,
      highlight:
        "Coordinated agile planning across firmware, Android, and test automation teams",
    },
    {
      name: "Lean Entrepreneurship",
      level: "familiar",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Applied lean startup principles to validate Expired Solutions through rapid iteration",
    },
    {
      name: "Digital Transformation",
      level: "familiar",
      endorsements: 0,
      experiences: 4,
      highlight:
        "Led enterprise LLM tool development reducing decision time by 18 hours/week",
    },
    {
      name: "Project Management",
      level: "proficient",
      endorsements: 0,
      experiences: 7,
      highlight:
        "Managed product strategy, model deployment, and team operations for Expired",
    },
    {
      name: "Business Development",
      level: "familiar",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Pitched and secured 8-week pilot with Giant Eagle for Expired Solutions",
    },
  ],
  data: [
    {
      name: "AI Product Management",
      level: "expert",
      endorsements: 13,
      experiences: 4,
      highlight:
        "Built AI-powered freshness scoring platform using CV + GPT for grocery automation",
    },
    {
      name: "Computer Science",
      level: "expert",
      endorsements: 28,
      experiences: 4,
      highlight:
        "Developed embedded Android software for 15,000+ Motorola APX NEXT Smart Radios",
    },
    {
      name: "Machine Learning",
      level: "familiar",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Developed KNN model analyzing 10M+ Netflix reviews with A/B testing",
    },
    {
      name: "Computer Vision",
      level: "familiar",
      endorsements: 7,
      experiences: 0,
      highlight:
        "Implemented CV-based freshness detection for automated grocery markdowns",
    },
    {
      name: "Data Analysis",
      level: "expert",
      endorsements: 8,
      experiences: 9,
      highlight:
        "Reduced operational decision-making time by 26% with custom GPT-based prototype",
    },
    {
      name: "Stakeholder Management",
      level: "familiar",
      endorsements: 6,
      experiences: 0,
      highlight:
        "Led collaboration across regulatory, technical, and product leads for crypto project",
    },
    {
      name: "Java & Python",
      level: "familiar",
      endorsements: 0,
      experiences: 4,
      highlight:
        "Built enterprise tool using OpenAI APIs, Flask, and JavaScript for Kearney",
    },
    {
      name: "Android Development",
      level: "familiar",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Designed Android system extensions improving GPS accuracy and device security",
    },
  ],
  engineering: [
    {
      name: "System Administration",
      level: "proficient",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Maintained 95%+ customer satisfaction managing MacOS/Linux support for 200+ users",
    },
    {
      name: "Embedded Systems",
      level: "proficient",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Developed embedded Android software for mission-critical communications systems",
    },
    {
      name: "API Development",
      level: "familiar",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Built RESTful web services for distributed systems project combining Android + DB",
    },
  ],
  design: [
    {
      name: "UI/UX Design",
      level: "proficient",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Led UI design for PanPalz, improving usability by 40% through design iteration",
    },
    {
      name: "Prototyping",
      level: "proficient",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Created NFC-based feature prototype that won 1st place at Motorola Hackathon",
    },
  ],
};

export default function Home() {
  const [bgError, setBgError] = useState(false);
  const [bgTriedAlt, setBgTriedAlt] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expYear, setExpYear] = useState("All");
  const [projectSection, setProjectSection] = useState("all");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Contact form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [contactMode, setContactMode] = useState<"meeting" | "message">(
    "meeting"
  );
  const [meetingDate, setMeetingDate] = useState<Date | null>(null);
  const [meetingTime, setMeetingTime] = useState("");

  const expYears = Array.from(
    new Set(
      sortedTimelineEvents
        .filter((e) => e.type === "experience")
        .map((e) => e.year)
    )
  ).sort((a, b) => Number(b) - Number(a));
  const filteredExperiences =
    expYear === "All"
      ? sortedTimelineEvents.filter((e) => e.type === "experience")
      : sortedTimelineEvents.filter(
          (e) => e.type === "experience" && e.year === expYear
        );

  const filteredSkills =
    activeFilter === "all"
      ? Object.values(skillsData).flat()
      : skillsData[activeFilter as keyof typeof skillsData] || [];

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const payload = {
        ...formData,
        meeting: contactMode === "meeting" ? meetingDate : null,
      };
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        setSubmitMessage("Thank you! Your message has been sent successfully.");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setMeetingDate(null);
        setMeetingTime("");
      } else {
        setSubmitStatus("error");
        setSubmitMessage(
          result.error || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Project data organized by sections
  const projectSections: {
    [key: string]: Array<{
      title: string;
      description: string;
      image: string;
      tags: string[];
      link: string;
      linkText: string;
      linkIcon: string;
    }>;
  } = {
    all: [
      {
        title: "Expired Solutions",
        description:
          "AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT.",
        image: "/logos/expired_solutions_logo.jpeg",
        tags: ["AI/ML", "Product", "Startup"],
        link: "https://expiredsolutions.com",
        linkText: "Visit Site",
        linkIcon: "external",
      },
      {
        title: "McGinnis Venture Competition Finalist: Expired Solutions",
        description:
          "Finalist (Top 4, Social Enterprise) at the 2025 McGinnis Venture Competition. Pitched Expired Solutions, an AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT. Led strategy, technical buildout, and go-to-market for the pilot with Giant Eagle.",
        image: "/logos/Mcginnis.png",
        tags: ["Competition", "AI/ML", "Startup", "Award", "Pitch", "Fun"],
        link: "https://www.youtube.com/watch?v=WqzHP1G3LO8&ab_channel=CMUSwartzCenterforEntrepreneurship",
        linkText: "Watch Live Pitch to Investors!",
        linkIcon: "external",
      },
      {
        title: "BBW Demo Presentation",
        description:
          "Enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week.",
        image: "/logos/bbw.jpg",
        tags: ["Enterprise", "AI", "Consulting"],
        link: "https://github.com/LawrenceHua/BBW_POC",
        linkText: "View Project",
        linkIcon: "github",
      },
      {
        title: "PanPalz",
        description:
          "Nonprofit social media platform. Led roadmap planning and UI design, refined 100+ Figma frames.",
        image: "/logos/Panpalz logo.jpeg",
        tags: ["Social Media", "UI/UX", "Nonprofit"],
        link: "https://panpalz.com",
        linkText: "View Project",
        linkIcon: "external",
      },
      {
        title: "Netflix A/B Testing Analysis",
        description:
          "Deep dive into Netflix's A/B testing methodologies and implementation.",
        image: "/logos/crypto.jpg", // Updated image path
        tags: ["Analysis", "A/B Testing"],
        link: "https://docs.google.com/presentation/d/1ii-Se5r_kFOnujyRiOX3i0j58Svz270OvletCi6Dblo/edit?usp=sharing",
        linkText: "View Analysis",
        linkIcon: "external",
      },
      {
        title: "Netflix Clone with KNN Model",
        description:
          "Developed a KNN model analyzing 10M+ reviews, implemented A/B testing, and visualized results with Grafana.",
        image: "/logos/netflixlogo.jpeg",
        tags: ["Machine Learning", "Data Analysis", "A/B Testing"],
        link: "https://docs.google.com/presentation/d/1G8CHLYjhbST7aTZ-ghWIaQ38CgRdV86MnioyHiZanTM/edit?slide=id.g31d10e42dea_0_0#slide=id.g31d10e42dea_0_0",
        linkText: "View Project",
        linkIcon: "external",
      },
      {
        title: "NFC Feature Prototype",
        description:
          "NFC-based feature prototype that won 1st place at Motorola Product Hackathon.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
        tags: ["NFC", "Prototype", "Hackathon"],
        link: "https://www.linkedin.com/posts/lawrencehua_hackathon-firstplace-innovation-activity-6862193706758393856-fjSi?utm_source=share&utm_medium=member_desktop&rcm=ACoAACoaVQoBe5_rWJwAB8-Fm4Zdm96i2nyD8xM",
        linkText: "View LinkedIn Post",
        linkIcon: "external",
      },
      {
        title: "Tutora AI Automation",
        description:
          "Built AI-driven scheduling, grading, and substitution flows saving 15+ hours/week.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
        tags: ["AI", "Automation", "Education"],
        link: "https://www.tutoraprep.com",
        linkText: "View Project",
        linkIcon: "external",
      },
      {
        title: "Valohai AI Tutorial",
        description:
          "Reproducible ML pipeline tutorial using Valohai for clean experiment tracking and version control.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        tags: ["ML Pipeline", "Python", "Valohai"],
        link: "https://github.com/LawrenceHua/Valohai-AI-tutorial",
        linkText: "View Project",
        linkIcon: "github",
      },
      {
        title: "Android + DB + RESTful Webservice",
        description:
          "Distributed systems project combining Android app, database, and RESTful web services for scalable architecture.",
        image: "/logos/DS project.png",
        tags: ["Android", "Database", "REST API"],
        link: "https://github.com/LawrenceHua/CMU-Projects/blob/main/Spring%202024/Distributed%20Systems/DS%20projects/Project%204%2C%20Android%20%2B%20DB%20%2B%20RESTful%20Webservice/README.pdf",
        linkText: "View Project",
        linkIcon: "external",
      },
      {
        title: "Professional Speaking",
        description:
          "Presented to a class of 30 students, receiving an A+ grade.",
        image: "/logos/professional speak.jpeg",
        tags: ["Presentation", "Education"],
        link: "https://docs.google.com/presentation/d/1A4cpxYo7PuTrZURfcOFTfyF5IDOHKwfxnfmIXerjqVM/edit?usp=sharing",
        linkText: "View Presentation",
        linkIcon: "external",
      },
      {
        title: "Cryptocurrency Research",
        description:
          "Researched and defined go-to-market strategy for a new digital asset targeting the gaming industry.",
        image: "/logos/carnegie_mellon_university_logo.jpeg",
        tags: ["Research", "Strategy", "Crypto"],
        link: "https://docs.google.com/presentation/d/16JXTVzGa05PTkKWciSSzWvvTNbTZ9kaPNtfiEZu0gPU/edit?slide=id.p#slide=id.p",
        linkText: "View Presentation",
        linkIcon: "external",
      },
      {
        title: "ML Playground",
        description:
          "Interactive machine learning simulation featuring models from CMU 10601. Try Decision Trees, Neural Networks, KNN, and more!",
        image: "/images/projects/games/cover.jpg",
        tags: ["Machine Learning", "Interactive", "Education"],
        link: "/ml-playground",
        linkText: "Play Game",
        linkIcon: "external",
      },
    ],
    product: [
      {
        title: "Expired Solutions",
        description:
          "AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT.",
        image: "/logos/expired_solutions_logo.jpeg",
        tags: ["AI/ML", "Product", "Startup"],
        link: "https://expiredsolutions.com",
        linkText: "Visit Site",
        linkIcon: "external",
      },
      {
        title: "BBW Demo Presentation",
        description:
          "Enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week.",
        image: "/logos/bbw.jpg",
        tags: ["Enterprise", "AI", "Consulting"],
        link: "https://github.com/LawrenceHua/BBW_POC",
        linkText: "View Project",
        linkIcon: "github",
      },
      {
        title: "PanPalz",
        description:
          "Nonprofit social media platform. Led roadmap planning and UI design, refined 100+ Figma frames.",
        image: "/logos/Panpalz logo.jpeg",
        tags: ["Social Media", "UI/UX", "Nonprofit"],
        link: "https://panpalz.com",
        linkText: "View Project",
        linkIcon: "external",
      },
      {
        title: "Netflix A/B Testing Analysis",
        description:
          "Deep dive into Netflix's A/B testing methodologies and implementation.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        tags: ["Analysis", "A/B Testing"],
        link: "https://docs.google.com/presentation/d/1ii-Se5r_kFOnujyRiOX3i0j58Svz270OvletCi6Dblo/edit?usp=sharing",
        linkText: "View Analysis",
        linkIcon: "external",
      },
    ],
    engineering: [
      {
        title: "Netflix Clone with KNN Model",
        description:
          "Developed a KNN model analyzing 10M+ reviews, implemented A/B testing, and visualized results with Grafana.",
        image: "/logos/netflixlogo.jpeg",
        tags: ["Machine Learning", "Data Analysis", "A/B Testing"],
        link: "https://docs.google.com/presentation/d/1G8CHLYjhbST7aTZ-ghWIaQ38CgRdV86MnioyHiZanTM/edit?slide=id.g31d10e42dea_0_0#slide=id.g31d10e42dea_0_0",
        linkText: "View Project",
        linkIcon: "external",
      },
      {
        title: "NFC Feature Prototype",
        description:
          "NFC-based feature prototype that won 1st place at Motorola Product Hackathon.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
        tags: ["NFC", "Prototype", "Hackathon"],
        link: "https://www.linkedin.com/posts/lawrencehua_hackathon-firstplace-innovation-activity-6862193706758393856-fjSi?utm_source=share&utm_medium=member_desktop&rcm=ACoAACoaVQoBe5_rWJwAB8-Fm4Zdm96i2nyD8xM",
        linkText: "View LinkedIn Post",
        linkIcon: "external",
      },
      {
        title: "Tutora AI Automation",
        description:
          "Built AI-driven scheduling, grading, and substitution flows saving 15+ hours/week.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
        tags: ["AI", "Automation", "Education"],
        link: "https://www.tutoraprep.com",
        linkText: "View Project",
        linkIcon: "external",
      },
      {
        title: "Valohai AI Tutorial",
        description:
          "Reproducible ML pipeline tutorial using Valohai for clean experiment tracking and version control.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        tags: ["ML Pipeline", "Python", "Valohai"],
        link: "https://github.com/LawrenceHua/Valohai-AI-tutorial",
        linkText: "View Project",
        linkIcon: "github",
      },
      {
        title: "Android + DB + RESTful Webservice",
        description:
          "Distributed systems project combining Android app, database, and RESTful web services for scalable architecture.",
        image: "/logos/DS project.png",
        tags: ["Android", "Database", "REST API"],
        link: "https://github.com/LawrenceHua/CMU-Projects/blob/main/Spring%202024/Distributed%20Systems/DS%20projects/Project%204%2C%20Android%20%2B%20DB%20%2B%20RESTful%20Webservice/README.pdf",
        linkText: "View Project",
        linkIcon: "external",
      },
    ],
    fun: [
      {
        title: "Professional Speaking",
        description:
          "Presented to a class of 30 students, receiving an A+ grade.",
        image: "/logos/professional speak.jpeg",
        tags: ["Presentation", "Education"],
        link: "https://docs.google.com/presentation/d/1A4cpxYo7PuTrZURfcOFTfyF5IDOHKwfxnfmIXerjqVM/edit?usp=sharing",
        linkText: "View Presentation",
        linkIcon: "external",
      },
      {
        title: "Cryptocurrency Research",
        description:
          "Researched and defined go-to-market strategy for a new digital asset targeting the gaming industry.",
        image: "/logos/carnegie_mellon_university_logo.jpeg",
        tags: ["Research", "Strategy", "Crypto"],
        link: "https://docs.google.com/presentation/d/16JXTVzGa05PTkKWciSSzWvvTNbTZ9kaPNtfiEZu0gPU/edit?slide=id.p#slide=id.p",
        linkText: "View Presentation",
        linkIcon: "external",
      },
      {
        title: "ML Playground",
        description:
          "Interactive machine learning simulation featuring models from CMU 10601. Try Decision Trees, Neural Networks, KNN, and more!",
        image: "/images/projects/games/cover.jpg",
        tags: ["Machine Learning", "Interactive", "Education"],
        link: "/ml-playground",
        linkText: "Play Game",
        linkIcon: "external",
      },
      {
        title: "McGinnis Venture Competition Finalist: Expired Solutions",
        description:
          "Finalist (Top 4, Social Enterprise) at the 2025 McGinnis Venture Competition. Pitched Expired Solutions, an AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT. Led strategy, technical buildout, and go-to-market for the pilot with Giant Eagle.",
        image: "/logos/Mcginnis.png",
        tags: ["Competition", "AI/ML", "Startup", "Award", "Pitch", "Fun"],
        link: "https://www.youtube.com/watch?v=WqzHP1G3LO8&ab_channel=CMUSwartzCenterforEntrepreneurship",
        linkText: "Watch Live Pitch to Investors!",
        linkIcon: "external",
      },
    ],
  };

  const currentProjects =
    projectSection === "all"
      ? showAllProjects
        ? projectSections[projectSection as keyof typeof projectSections]
        : projectSections[projectSection as keyof typeof projectSections].slice(
            0,
            4
          )
      : projectSections[projectSection as keyof typeof projectSections] || [];
  const projectTypes = ["all", "product", "engineering", "fun"];
  const currentTypeIndex = projectTypes.indexOf(projectSection);

  const nextProject = () => {
    const nextIndex = (currentTypeIndex + 1) % projectTypes.length;
    setProjectSection(projectTypes[nextIndex]);
    setShowAllProjects(false);
  };

  const prevProject = () => {
    const prevIndex =
      (currentTypeIndex - 1 + projectTypes.length) % projectTypes.length;
    setProjectSection(projectTypes[prevIndex]);
    setShowAllProjects(false);
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  // Calculate the number of additional projects for the 'View More Projects' button
  const totalAllProjects = projectSections.all.length;
  const moreProjectsCount = totalAllProjects > 4 ? totalAllProjects - 4 : 0;

  // Utility: Responsive flex direction for timeline containers
  const isMobile = useMediaQuery("(max-width: 600px)");
  const timelineFlexClass = isMobile
    ? "flex-col items-center gap-6 w-full"
    : "flex-row items-center gap-4";

  useEffect(() => {
    console.log("Firebase useEffect starting...");
    try {
      // Firebase imports and config
      const { initializeApp } = require("firebase/app");
      const { getAnalytics, logEvent } = require("firebase/analytics");
      const {
        getFirestore,
        collection,
        addDoc,
      } = require("firebase/firestore");
      console.log("Firebase modules imported successfully");

      const firebaseConfig = {
        apiKey: "AIzaSyA_HYWpbGRuNvcWyxfiUEZr7_mTw7PU0t8",
        authDomain: "peronalsite-88d49.firebaseapp.com",
        projectId: "peronalsite-88d49",
        storageBucket: "peronalsite-88d49.firebasestorage.app",
        messagingSenderId: "515222232116",
        appId: "1:515222232116:web:b7a9b8735980ce8333fe61",
        measurementId: "G-ZV5CR4EBB8",
      };
      console.log("Firebase config loaded");

      const app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized");

      const analytics = getAnalytics(app);
      console.log("Firebase analytics initialized");

      const db = getFirestore(app);
      console.log("Firestore initialized");

      function getSessionId() {
        let id = localStorage.getItem("firebase_session_id");
        if (!id) {
          id =
            Math.random().toString(36).substring(2) + Date.now().toString(36);
          localStorage.setItem("firebase_session_id", id);
        }
        return id;
      }
      console.log("Session ID function created");

      // Log analytics and visit
      console.log("Attempting to log analytics event...");
      logEvent(analytics, "visit", {
        sessionId: getSessionId(),
        timestamp: Date.now(),
      });
      console.log("Analytics event logged");

      console.log("Attempting to add visit to Firestore...");
      addDoc(collection(db, "visits"), {
        sessionId: getSessionId(),
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        path: window.location.pathname,
      })
        .then(() => {
          console.log("Visit successfully added to Firestore");
        })
        .catch((error: any) => {
          console.error("Error adding visit to Firestore:", error);
        });
    } catch (error: any) {
      console.error("Error in Firebase useEffect:", error);
    }
  }, []);

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Combined Hero + About Section with Background */}
      <section
        id="about"
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black"
        style={{ minHeight: "80vh" }}
      >
        {/* Removed background image. Now solid black. */}
        <div className="relative z-10 flex w-full flex-col items-center justify-center px-0 py-20">
          {/* Redesigned About Card (Profile Box) */}
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 rounded-3xl border border-blue-900/30 bg-gray-900/80 px-6 py-10 shadow-2xl backdrop-blur-lg">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-blue-600 bg-white shadow-lg md:h-56 md:w-56">
                <Image
                  src="/profile.jpg"
                  alt="Lawrence Hua"
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
              <h1
                className="text-center text-6xl font-extrabold text-white drop-shadow-lg"
                style={{ textShadow: "0 4px 24px #38bdf8, 0 1px 0 #000" }}
              >
                Lawrence W. Hua
              </h1>
              <div
                className="space-y-2 text-center text-2xl font-semibold text-blue-200 drop-shadow"
                style={{ textShadow: "0 2px 8px #0ea5e9" }}
              >
                <p>AI Product Manager</p>
                <p>Transforming Ideas into Impactful Digital Solutions</p>
              </div>
              <div className="mb-2 flex flex-wrap justify-center gap-4">
                <Link
                  href="/resume.pdf"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                >
                  <FiFileText className="mr-2 h-5 w-5" />
                  View Resume
                </Link>
                <Link
                  href="https://www.linkedin.com/in/lawrencehua"
                  target="_blank"
                  className="inline-flex items-center rounded-lg bg-[#0077B5] px-6 py-3 text-white transition-colors hover:bg-[#006399]"
                >
                  <FaLinkedin className="mr-2 h-5 w-5" />
                  LinkedIn
                </Link>
                <button
                  onClick={() => setIsChatbotOpen(true)}
                  className="inline-flex items-center rounded-lg bg-purple-600 px-6 py-3 text-white transition-colors hover:bg-purple-700"
                >
                  <FiMessageCircle className="mr-2 h-5 w-5" />
                  Talk to AI
                </button>
              </div>
              {/* Large CTA Button */}
              <button
                onClick={() => {
                  const contactSection = document.getElementById("contact");
                  if (contactSection)
                    contactSection.scrollIntoView({ behavior: "smooth" });
                }}
                className="mt-4 w-full max-w-lg rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                style={{ minWidth: "320px" }}
              >
                Looking for an APM or AI PM? Let's get in touch!
              </button>
            </div>
          </div>

          {/* Recommendations Section - moved up */}
          <section
            id="recommendations"
            className="section-container mt-10 w-full"
          >
            <div className="section-content">
              <h2 className="section-title text-center">
                <span
                  className="inline-block rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text px-10 py-5 text-4xl font-bold tracking-tight text-transparent shadow-lg"
                  style={{ WebkitBackgroundClip: "text" }}
                >
                  What colleagues and mentors say about my work and character
                </span>
              </h2>
              <div className="recommendations-container">
                <div className="animate-scroll">
                  {/* Original Cards */}
                  {/* JJ Xu */}
                  <div className="w-[400px] flex-shrink-0 rounded-lg border border-blue-900/30 bg-gray-900 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src="/logos/JJ.jpeg"
                        alt="JJ Xu"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                          JJ Xu
                          <Link
                            href="https://www.linkedin.com/in/jj-jiaojiao-xu/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaLinkedin className="h-5 w-5 text-[#0077B5] hover:text-[#006399]" />
                          </Link>
                        </h3>
                        <p className="text-gray-400">
                          Founder & CEO @ TalkMeUp
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      "Lawrence approached every challenge with curiosity, grit,
                      and a clear desire to create something meaningful. He
                      combined his technical background with a strong product
                      mindset, conducting thoughtful customer discovery and
                      iterating quickly based on feedback."
                    </p>
                  </div>

                  {/* Wendy Williams */}
                  <div className="w-[400px] flex-shrink-0 rounded-lg border border-blue-900/30 bg-gray-900 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src="/logos/Wendy.jpeg"
                        alt="Wendy Williams"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                          Wendy Williams
                          <Link
                            href="https://www.linkedin.com/in/wendy-williams-873b7538"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaLinkedin className="h-5 w-5 text-[#0077B5] hover:text-[#006399]" />
                          </Link>
                        </h3>
                        <p className="text-gray-400">
                          IT Director at University of Florida
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      "Lawrence was one of my top System Administrators. He is a
                      conscientious worker and was ready to take on any task. He
                      has a very pleasant demeanor and got along well with all
                      the office staff and administration."
                    </p>
                  </div>

                  {/* Shyam Sundar */}
                  <div className="w-[400px] flex-shrink-0 rounded-lg border border-blue-900/30 bg-gray-900 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src="/logos/Shyam.jpeg"
                        alt="Shyam Sundar"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                          Shyam Sundar
                          <Link
                            href="https://www.linkedin.com/in/shyamsundarn/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaLinkedin className="h-5 w-5 text-[#0077B5] hover:text-[#006399]" />
                          </Link>
                        </h3>
                        <p className="text-gray-400">
                          Android Frameworks Engineer
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      "Lawrence exhibited great skills with his ability to solve
                      complex issues on the front-end, dedication to stay
                      motivated even through a fully online program and adapt to
                      Motorola's technology quickly."
                    </p>
                  </div>

                  {/* Duplicate Cards for Infinite Scroll */}
                  {/* JJ Xu */}
                  <div className="w-[400px] flex-shrink-0 rounded-lg border border-blue-900/30 bg-gray-900 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src="/logos/JJ.jpeg"
                        alt="JJ Xu"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                          JJ Xu
                          <Link
                            href="https://www.linkedin.com/in/jj-jiaojiao-xu/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaLinkedin className="h-5 w-5 text-[#0077B5] hover:text-[#006399]" />
                          </Link>
                        </h3>
                        <p className="text-gray-400">
                          Founder & CEO @ TalkMeUp
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      "Lawrence approached every challenge with curiosity, grit,
                      and a clear desire to create something meaningful. He
                      combined his technical background with a strong product
                      mindset, conducting thoughtful customer discovery and
                      iterating quickly based on feedback."
                    </p>
                  </div>

                  {/* Wendy Williams */}
                  <div className="w-[400px] flex-shrink-0 rounded-lg border border-blue-900/30 bg-gray-900 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src="/logos/Wendy.jpeg"
                        alt="Wendy Williams"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                          Wendy Williams
                          <Link
                            href="https://www.linkedin.com/in/wendy-williams-873b7538"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaLinkedin className="h-5 w-5 text-[#0077B5] hover:text-[#006399]" />
                          </Link>
                        </h3>
                        <p className="text-gray-400">
                          IT Director at University of Florida
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      "Lawrence was one of my top System Administrators. He is a
                      conscientious worker and was ready to take on any task. He
                      has a very pleasant demeanor and got along well with all
                      the office staff and administration."
                    </p>
                  </div>

                  {/* Shyam Sundar */}
                  <div className="w-[400px] flex-shrink-0 rounded-lg border border-blue-900/30 bg-gray-900 p-6 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-4">
                      <Image
                        src="/logos/Shyam.jpeg"
                        alt="Shyam Sundar"
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                          Shyam Sundar
                          <Link
                            href="https://www.linkedin.com/in/shyamsundarn/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaLinkedin className="h-5 w-5 text-[#0077B5] hover:text-[#006399]" />
                          </Link>
                        </h3>
                        <p className="text-gray-400">
                          Android Frameworks Engineer
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300">
                      "Lawrence exhibited great skills with his ability to solve
                      complex issues on the front-end, dedication to stay
                      motivated even through a fully online program and adapt to
                      Motorola's technology quickly."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Skills Section with Filtering and Segmentation - moved below recommendations */}
          <h2 className="section-title mt-12 text-center">
            <span
              className="inline-block rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text px-10 py-5 text-4xl font-bold tracking-tight text-transparent shadow-lg"
              style={{ WebkitBackgroundClip: "text" }}
            >
              How my experiences shaped my expertise
            </span>
          </h2>
          <div className="relative z-10 w-full px-4 py-8">
            <div className="skills-container">
              {/* Filter Bar */}
              <div className="skills-filter-bar items-center justify-center text-center">
                <button
                  className={`skills-filter-button ${activeFilter === "all" ? "active" : ""}`}
                  data-type="all"
                  onClick={() => setActiveFilter("all")}
                  style={{ minWidth: "64px" }}
                >
                  All Skills
                </button>
                <button
                  className={`skills-filter-button ${activeFilter === "business" ? "active" : ""}`}
                  data-type="business"
                  onClick={() => setActiveFilter("business")}
                  style={{ minWidth: "64px" }}
                >
                  Business
                </button>
                <button
                  className={`skills-filter-button ${activeFilter === "data" ? "active" : ""}`}
                  data-type="data"
                  onClick={() => setActiveFilter("data")}
                  style={{ minWidth: "64px" }}
                >
                  Data & AI
                </button>
                <button
                  className={`skills-filter-button ${activeFilter === "engineering" ? "active" : ""}`}
                  data-type="engineering"
                  onClick={() => setActiveFilter("engineering")}
                  style={{ minWidth: "64px" }}
                >
                  Engineering
                </button>
                <button
                  className={`skills-filter-button ${activeFilter === "design" ? "active" : ""}`}
                  data-type="design"
                  onClick={() => setActiveFilter("design")}
                  style={{ minWidth: "64px" }}
                >
                  Design
                </button>
              </div>

              {/* Legend */}
              <div className="skills-legend">
                <div className="legend-item">
                  <div className="legend-dot expert"></div>
                  <span>Expert</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot proficient"></div>
                  <span>Proficient</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot familiar"></div>
                  <span>Familiar</span>
                </div>
              </div>

              {/* Skills Info Popup */}
              <div className="mx-auto mb-4 inline-block rounded-lg border border-blue-700/50 bg-blue-900/40 p-3 text-center">
                <p className="text-sm text-blue-200">
                  💡 Hover over skills to see proficiency levels, experience
                  details, and key achievements
                </p>
              </div>

              {/* Skills Grid */}
              <div className="skills-grid">
                {filteredSkills.map((skill, index) => (
                  <div
                    key={skill.name}
                    className="skill-item text-base font-medium"
                    data-level={skill.level}
                    title={`${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}: ${skill.endorsements} endorsements • ${skill.experiences} experiences`}
                  >
                    {skill.name}
                    <div className="skill-tooltip text-sm">
                      <div className="mb-2 text-lg font-bold">{skill.name}</div>
                      <div className="mb-1">
                        Level:{" "}
                        <span className="font-semibold">
                          {skill.level.charAt(0).toUpperCase() +
                            skill.level.slice(1)}
                        </span>
                      </div>
                      <div className="mb-1">
                        Endorsements: {skill.endorsements}
                      </div>
                      <div className="mb-3">
                        Experiences: {skill.experiences}
                      </div>
                      <div className="border-t border-blue-300/30 pt-2">
                        <div className="mb-1 font-semibold text-blue-200">
                          Key Achievement:
                        </div>
                        <div className="text-blue-100">{skill.highlight}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Timeline: Experience */}
      <section id="timeline" className="bg-gray-800 py-20">
        <div className="relative flex w-full flex-col items-center px-8">
          <h2 className="mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-center text-4xl font-bold text-transparent">
            Career Timeline
          </h2>

          {/* Experience Section */}
          <h3 className="mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-center text-3xl font-semibold text-transparent">
            Work Experience
          </h3>

          {/* Year Navigation */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-center">
            <button
              className={`skills-filter-button${expYear === "All" ? "active" : ""}`}
              style={{ minWidth: "64px" }}
              onClick={() => setExpYear("All")}
            >
              All
            </button>
            {expYears.map((year) => (
              <button
                key={year}
                className={`skills-filter-button${expYear === year ? "active" : ""}`}
                style={{ minWidth: "64px" }}
                onClick={() => setExpYear(year)}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Career Timeline Row with Arrows */}
          <div className="timeline-container-with-stars mx-auto w-full max-w-7xl overflow-x-auto">
            <div
              className={
                // Use flex-col on mobile, flex-row on desktop
                "flex flex-col sm:flex-row items-center justify-center px-2 sm:px-8 " +
                timelineFlexClass
              }
            >
              {(expYear === "All"
                ? filteredExperiences
                : filteredExperiences.slice(0, 6)
              ).map((item, idx, arr) => (
                <React.Fragment key={item.title + "-" + item.year + "-" + idx}>
                  <div className="timeline-card-container relative flex max-w-[220px] min-w-[200px] flex-col items-center">
                    <div className="timeline-circle top">
                      <div className="circle-svg">
                        <span className="circle-year">{item.year}</span>
                      </div>
                    </div>
                    <div className="education-card improved-ui timeline-card-container">
                      <div
                        className="timeline-card mx-auto flex h-full w-full flex-col text-left"
                        onClick={() =>
                          toggleCardExpansion(item.title + "-" + item.year)
                        }
                      >
                        <Image
                          src={item.logo}
                          alt={item.org}
                          width={40}
                          height={40}
                          className="logo mx-auto rounded"
                        />
                        <div
                          className="text-center text-base font-bold text-white"
                          style={{ margin: 0, padding: 0 }}
                        >
                          <span>{item.title}</span>
                        </div>
                        <p className="text-sm text-gray-400">{item.org}</p>
                        <p className="text-xs text-gray-400">{item.date}</p>
                        {item.bullets && (
                          <ul className="flex-grow list-inside list-disc space-y-0 text-left text-xs text-gray-300">
                            {expandedCards.has(item.title + "-" + item.year)
                              ? item.bullets.map((b, i) => (
                                  <li key={b + "-" + i}>{b}</li>
                                ))
                              : item.bullets
                                  .slice(0, 1)
                                  .map((b, i) => (
                                    <li key={b + "-" + i}>{b}</li>
                                  ))}
                            {!expandedCards.has(item.title + "-" + item.year) &&
                              item.bullets.length > 1 && (
                                <li className="font-medium text-blue-400">
                                  Click to see {item.bullets.length - 1} more...
                                </li>
                              )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrow between cards: horizontal on desktop, down on mobile */}
                  {idx < arr.length - 1 && (
                    <div className="flex h-12 w-12 items-center justify-center">
                      <svg
                        className="h-8 w-8 text-blue-400 transform sm:rotate-180 rotate-90 sm:rotate-180"
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
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Education Section - Improved UI */}
          <h3 className="mt-16 mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-semibold text-transparent">
            Education
          </h3>
          <div className="education-carousel improved-ui timeline-container-with-stars">
            <div
              className={
                // Use flex-col on mobile, flex-row on desktop
                "flex flex-col sm:flex-row items-center justify-center px-2 sm:px-8 " +
                timelineFlexClass
              }
            >
              {sortedEducationEvents.map((item, idx) => (
                <React.Fragment key={item.year + "-" + idx}>
                  <div
                    className={`timeline-card-container relative flex max-w-[280px] min-w-[240px] flex-col items-center${item.type === "education" ? "education" : ""}`}
                  >
                    <div className="timeline-circle top">
                      <div className="circle-svg">
                        <span className="circle-year">{item.year}</span>
                      </div>
                    </div>
                    <div className="timeline-card mx-auto flex h-full w-full flex-col text-left">
                      <Image
                        src={item.logo}
                        alt={item.org}
                        width={40}
                        height={40}
                        className="logo mx-auto rounded"
                      />
                      <div
                        className="text-center text-base font-bold text-white"
                        style={{ margin: 0, padding: 0 }}
                      >
                        <span>{item.title}</span>
                      </div>
                      <p className="text-sm text-gray-400">{item.org}</p>
                      <p className="text-xs text-gray-400">{item.date}</p>
                      {item.details && (
                        <ul className="flex-grow list-inside list-disc space-y-0 text-left text-xs text-gray-300">
                          {item.details.map((d, i) => (
                            <li key={d + "-" + i}>{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  {idx < sortedEducationEvents.length - 1 && (
                    <div className="flex h-12 w-12 items-center justify-center">
                      <svg
                        className="h-8 w-8 text-blue-400 transform sm:rotate-180 rotate-90 sm:rotate-180"
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
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section-container">
        <div className="section-content">
          <h2 className="section-title mt-12 mb-4 text-center">
            <span
              className="inline-block rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text px-10 py-5 text-4xl font-bold tracking-tight text-transparent shadow-lg"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Projects
            </span>
          </h2>
          <p className="section-subtitle">
            A showcase of my work across different domains of Retail, Social
            Media, Engineering, Management Consulting, and more.
          </p>

          {/* Project Filters */}
          <div className="project-filters">
            <button
              className={`project-filter ${projectSection === "all" ? "active" : ""}`}
              onClick={() => {
                setProjectSection("all");
                setShowAllProjects(false);
              }}
            >
              <span className="project-filter-label">All Projects</span>
              <span className="project-filter-count">
                {projectSections.all.length}
              </span>
            </button>
            <button
              className={`project-filter ${projectSection === "product" ? "active" : ""}`}
              onClick={() => {
                setProjectSection("product");
                setShowAllProjects(false);
              }}
            >
              <span className="project-filter-label">Product Related</span>
              <span className="project-filter-count">
                {projectSections.product.length}
              </span>
            </button>
            <button
              className={`project-filter ${projectSection === "engineering" ? "active" : ""}`}
              onClick={() => {
                setProjectSection("engineering");
                setShowAllProjects(false);
              }}
            >
              <span className="project-filter-label">Engineering Related</span>
              <span className="project-filter-count">
                {projectSections.engineering.length}
              </span>
            </button>
            <button
              className={`project-filter ${projectSection === "fun" ? "active" : ""}`}
              onClick={() => {
                setProjectSection("fun");
                setShowAllProjects(false);
              }}
            >
              <span className="project-filter-label">Fun</span>
              <span className="project-filter-count">
                {projectSections.fun.length}
              </span>
            </button>
          </div>

          {/* Project Carousel */}
          <div className="project-carousel">
            {/* REMOVE ARROW BUTTONS */}
            {/* <button className="project-arrow left" onClick={prevProject}> ... </button> */}
            <div className="project-container">
              <div className="project-grid grid grid-cols-1 justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {currentProjects.map((project, index) => (
                  <div
                    key={project.title}
                    className="project-card mx-auto flex max-w-[340px] min-w-[260px] flex-col overflow-hidden rounded-2xl border border-blue-900/40 bg-gray-900/90 shadow-lg transition-all duration-200 hover:scale-[1.025] hover:shadow-2xl"
                    style={{ minHeight: "420px" }}
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-blue-900/30 bg-gray-800">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="rounded-t-2xl border-b border-blue-900/30 object-cover object-center"
                        style={{
                          borderTopLeftRadius: "1rem",
                          borderTopRightRadius: "1rem",
                        }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 px-5 py-4">
                      <h3
                        className="mb-1 text-lg leading-tight font-bold break-words whitespace-normal text-white"
                        title={project.title}
                      >
                        {project.title}
                      </h3>
                      <p className="mb-2 line-clamp-3 min-h-[48px] text-sm text-blue-100">
                        {project.description}
                      </p>
                      <div className="mb-2 flex flex-wrap gap-2">
                        {project.tags.map((tag, tagIndex) => (
                          <span
                            key={tag + "-" + tagIndex}
                            className="rounded-full bg-blue-700/80 px-3 py-1 text-xs font-medium text-blue-100 shadow-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex-1" />
                      <div className="mt-2">
                        <Link
                          href={project.link}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-700"
                        >
                          {project.linkText}
                          {project.linkIcon === "external" && (
                            <FiExternalLink className="h-4 w-4" />
                          )}
                          {project.linkIcon === "github" && (
                            <FiGithub className="h-4 w-4" />
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* REMOVE ARROW BUTTONS */}
            {/* <button className="project-arrow right" onClick={nextProject}> ... </button> */}
          </div>

          {/* View More/View Less Button only for 'all' category */}
          {projectSection === "all" &&
            (!showAllProjects ? (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowAllProjects(true)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700"
                >
                  <span>
                    View {moreProjectsCount} more project
                    {moreProjectsCount === 1 ? "" : "s"}
                  </span>
                  <svg
                    className="h-5 w-5 transform transition-transform duration-200"
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
                </button>
              </div>
            ) : (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowAllProjects(false)}
                  className="flex items-center gap-2 rounded-lg bg-gray-600 px-6 py-3 text-white transition-all duration-200 hover:scale-105 hover:bg-gray-700"
                >
                  <span>View Less</span>
                  <svg
                    className="h-5 w-5 rotate-180 transform transition-transform duration-200"
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
                </button>
              </div>
            ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-container bg-black py-20">
        <div className="section-content mx-auto max-w-2xl rounded-2xl border border-blue-900/30 bg-gray-900/80 px-8 py-12 shadow-2xl">
          <h2 className="section-title mb-6 text-center">
            <span
              className="inline-block rounded-xl bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text px-10 py-5 text-2xl font-extrabold tracking-tight text-transparent shadow-lg"
              style={{ WebkitBackgroundClip: "text" }}
            >
              Get in Touch
            </span>
          </h2>
          <div className="mb-6 text-center text-lg font-semibold text-blue-200">
            <span className="inline-block rounded-lg bg-blue-900/40 px-4 py-2">
              Recruiters: I'm actively seeking APM/AI PM roles. Schedule a
              meeting or send a message below!
            </span>
          </div>
          <div className="mb-8 flex justify-center gap-4">
            <button
              className={`skills-filter-button ${contactMode === "meeting" ? "active" : ""}`}
              onClick={() => setContactMode("meeting")}
              style={{ minWidth: "180px" }}
            >
              Schedule a Meeting
            </button>
            <button
              className={`skills-filter-button ${contactMode === "message" ? "active" : ""}`}
              onClick={() => setContactMode("message")}
              style={{ minWidth: "180px" }}
            >
              Send a Message
            </button>
          </div>
          <div className="contact-form">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-300"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input w-full"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="What's this about?"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="form-input w-full resize-none"
                  placeholder="Tell me about your project, opportunity, or just say hello!"
                  required
                  disabled={isSubmitting}
                ></textarea>
              </div>
              {contactMode === "meeting" && (
                <div className="mt-2 grid grid-cols-1 items-end gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="meetingDate"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Select a date
                    </label>
                    <DatePicker
                      id="meetingDate"
                      selected={meetingDate}
                      onChange={setMeetingDate}
                      minDate={new Date()}
                      className="form-input w-full"
                      placeholderText="Pick a date"
                      dateFormat="MMMM d, yyyy"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="meetingTime"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Select a time (EST)
                    </label>
                    <input
                      type="time"
                      id="meetingTime"
                      name="meetingTime"
                      className="form-input w-full"
                      step="900"
                      onChange={(e) => setMeetingTime(e.target.value)}
                      value={meetingTime || ""}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : contactMode === "meeting" ? (
                  "Schedule Meeting"
                ) : (
                  "Send Message"
                )}
              </button>

              {/* Success/Error Messages */}
              {submitStatus === "success" && (
                <div className="relative rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                  <span className="block sm:inline">{submitMessage}</span>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                  <span className="block sm:inline">{submitMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </main>
  );
}
