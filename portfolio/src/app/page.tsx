"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
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
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";

import "react-datepicker/dist/react-datepicker.css";

// Firebase config (same as in Chatbot.tsx)
const firebaseConfig = {
  apiKey: "AIzaSyA_HYWpbGRuNvcWyxfiUEZr7_mTw7PU0t8",
  authDomain: "peronalsite-88d49.firebaseapp.com",
  projectId: "peronalsite-88d49",
  storageBucket: "peronalsite-88d49.firebasestorage.app",
  messagingSenderId: "515222232116",
  appId: "1:515222232116:web:b7a9b8735980ce8333fe61",
  measurementId: "G-ZV5CR4EBB8",
};

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

// Type definitions
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

interface Skill {
  name: string;
  level: string;
  endorsements: number;
  experiences: number;
  highlight: string;
}

interface ProjectSection {
  all: Project[];
  product: Project[];
  engineering: Project[];
  fun: Project[];
}

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  linkText: string;
  linkIcon: "external" | "github";
}

// Project sections data
const projectSectionsData: ProjectSection = {
  all: [
    {
      title: "Expired Solutions - AI Grocery Platform",
      description:
        "AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT with Azure-based solution and mobile companion app.",
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
    },
    {
      title: "Tutora AI Automation Platform",
      description:
        "Built AI-driven scheduling, grading, and substitution flows saving 15+ hours/week with 50+ TI-BASIC math programs improving test scores by 35%.",
      image: "/logos/Tutora Logo.jpeg",
      tags: ["AI", "Automation", "Education", "Python"],
      link: "https://docs.google.com/spreadsheets/d/1NCw2Rh4E5enRixTwTD4yNtayFH8Wnxgkg2mdEQz1f3A/edit?usp=sharing",
      linkText: "View Project",
      linkIcon: "external" as const,
    },
    {
      title: "McGinnis Venture Competition Finalist",
      description:
        "Finalist (Top 4, Social Enterprise) at the 2025 McGinnis Venture Competition pitching Expired Solutions AI platform for grocery automation.",
      image: "/logos/Mcginnis.png",
      tags: ["Competition", "AI/ML", "Startup", "Award", "Pitch"],
      link: "https://docs.google.com/presentation/d/1GpSuwN0JYbjMlkA8Mb7yCoeakQXbRq09zBO6_RsQI9I/pub",
      linkText: "Watch Live Pitch",
      linkIcon: "external" as const,
    },
    {
      title: "BBW Demo Presentation",
      description:
        "Enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week using OpenAI APIs, Flask, and JavaScript.",
      image: "/logos/bbw.jpg",
      tags: ["Enterprise", "AI", "Consulting", "LLM"],
      link: "https://github.com/LawrenceHua/BBW_POC",
      linkText: "View Project",
      linkIcon: "github" as const,
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
      image: "/logos/professional speak.jpeg",
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
        "Personal portfolio website built with Next.js and TailwindCSS featuring interactive timeline, chatbot, and responsive design for developers to fork and customize.",
      image: "/logos/backgroundlogo.png",
      tags: ["Next.js", "React", "TailwindCSS", "TypeScript"],
      link: "https://github.com/LawrenceHua/LawrenceHua.io",
      linkText: "View Source",
      linkIcon: "github" as const,
    },
  ],
  product: [
    {
      title: "Expired Solutions - AI Grocery Platform",
      description:
        "AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT with Azure-based solution and mobile companion app.",
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
      title: "McGinnis Venture Competition Finalist",
      description:
        "Finalist (Top 4, Social Enterprise) at the 2025 McGinnis Venture Competition pitching Expired Solutions AI platform for grocery automation.",
      image: "/logos/Mcginnis.png",
      tags: ["Competition", "AI/ML", "Startup", "Award", "Pitch"],
      link: "https://docs.google.com/presentation/d/1GpSuwN0JYbjMlkA8Mb7yCoeakQXbRq09zBO6_RsQI9I/pub",
      linkText: "Watch Live Pitch",
      linkIcon: "external" as const,
    },
    {
      title: "BBW Demo Presentation",
      description:
        "Enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week using OpenAI APIs, Flask, and JavaScript.",
      image: "/logos/bbw.jpg",
      tags: ["Enterprise", "AI", "Consulting", "LLM"],
      link: "https://github.com/LawrenceHua/BBW_POC",
      linkText: "View Project",
      linkIcon: "github" as const,
    },
    {
      title: "Tutora AI Automation Platform",
      description:
        "Built AI-driven scheduling, grading, and substitution flows saving 15+ hours/week with 50+ TI-BASIC math programs improving test scores by 35%.",
      image: "/logos/Tutora Logo.jpeg",
      tags: ["AI", "Automation", "Education", "Python"],
      link: "https://docs.google.com/spreadsheets/d/1NCw2Rh4E5enRixTwTD4yNtayFH8Wnxgkg2mdEQz1f3A/edit?usp=sharing",
      linkText: "View Project",
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
  ],
  engineering: [
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
      title: "Valohai AI Tutorial",
      description:
        "Reproducible ML pipeline tutorial using Valohai for clean experiment tracking and version control.",
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
      title: "ML Playground",
      description:
        "Interactive machine learning simulation featuring models from CMU 10601. Try Decision Trees, Neural Networks, KNN, and more!",
      image: "/logos/mlplayground.jpeg",
      tags: ["Machine Learning", "Interactive", "Education", "Simulation"],
      link: "/ml-playground",
      linkText: "Play Game",
      linkIcon: "external" as const,
    },
    {
      title: "Portfolio Website",
      description:
        "Personal portfolio website built with Next.js and TailwindCSS featuring interactive timeline, chatbot, and responsive design. Fork it and build your own!",
      image: "/logos/backgroundlogo.png",
      tags: ["Next.js", "React", "TailwindCSS", "TypeScript"],
      link: "https://github.com/LawrenceHua/LawrenceHua.io",
      linkText: "View Source",
      linkIcon: "github" as const,
    },
  ],
  fun: [
    {
      title: "McGinnis Venture Competition Finalist",
      description:
        "Finalist (Top 4, Social Enterprise) at the 2025 McGinnis Venture Competition pitching Expired Solutions AI platform for grocery automation.",
      image: "/logos/Mcginnis.png",
      tags: ["Competition", "AI/ML", "Startup", "Award", "Pitch"],
      link: "https://docs.google.com/presentation/d/1GpSuwN0JYbjMlkA8Mb7yCoeakQXbRq09zBO6_RsQI9I/pub",
      linkText: "Watch Live Pitch",
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
      title: "Professional Speaking",
      description:
        "Presented to a class of 30 students receiving an A+ grade while demonstrating strong communication and presentation skills.",
      image: "/logos/professional speak.jpeg",
      tags: ["Presentation", "Education", "Communication"],
      link: "https://docs.google.com/presentation/d/1A4cpxYo7PuTrZURfcOFTfyF5IDOHKwfxnfmIXerjqVM/edit?usp=sharing",
      linkText: "View Presentation",
      linkIcon: "external" as const,
    },
  ],
};

const timelineData = [
  {
    year: "2025",
    left: null,
    right: {
      title: "Product Manager",
      org: "PM Happy Hour · Internship",
      date: "Mar 2025 - Present · 4 mos",
      logo: "/logos/pm_happy_hour_logo.jpeg",
      category: "product",
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
      category: "product",
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
      category: "product",
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
      category: "engineering",
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
      category: "retail",
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
      category: "engineering",
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
      category: "engineering",
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
      category: "engineering",
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
      category: "engineering",
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
      category: "engineering",
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
      category: "retail",
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
const timelineEvents: Array<TimelineEvent> = [
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
    category: "product",
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
    category: "product",
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
    category: "product",
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
    category: "engineering",
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
    category: "retail",
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
    category: "engineering",
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
    category: "engineering",
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
    category: "engineering",
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
    category: "engineering",
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
    category: "engineering",
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
    category: "retail",
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
  [key: string]: Array<Skill>;
} = {
  business: [
    {
      name: "Product Management",
      level: "expert",
      endorsements: 15,
      experiences: 8,
      highlight:
        "Led Expired Solutions from 0→1, reducing grocery shrink by 20% using AI",
    },
    {
      name: "Leadership",
      level: "expert",
      endorsements: 28,
      experiences: 8,
      highlight:
        "Founded and scaled Expired Solutions, leading 8-week pilot with Giant Eagle",
    },
    {
      name: "Strategic Planning",
      level: "expert",
      endorsements: 12,
      experiences: 4,
      highlight:
        "Developed comprehensive product roadmaps and go-to-market strategies for multiple startups",
    },
    {
      name: "Product Strategy",
      level: "proficient",
      endorsements: 12,
      experiences: 8,
      highlight:
        "Defined go-to-market strategy for PanPalz, the world's first nonprofit social app",
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
      experiences: 6,
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
      name: "Project Management",
      level: "proficient",
      endorsements: 0,
      experiences: 7,
      highlight:
        "Managed product strategy, model deployment, and team operations for Expired",
    },
    {
      name: "Market Analysis",
      level: "proficient",
      endorsements: 0,
      experiences: 4,
      highlight:
        "Conducted competitive analysis and market research for multiple product launches",
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
      name: "Business Development",
      level: "familiar",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Pitched and secured 8-week pilot with Giant Eagle for Expired Solutions",
    },
    {
      name: "Financial Modeling",
      level: "familiar",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Created financial projections and business models for startup fundraising",
    },
    {
      name: "Sales Strategy",
      level: "familiar",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Developed sales strategies and customer acquisition plans for B2B products",
    },
    {
      name: "Team Building",
      level: "familiar",
      endorsements: 0,
      experiences: 4,
      highlight:
        "Built and managed cross-functional teams across multiple organizations",
    },
  ],
  data: [
    {
      name: "AI Product Management",
      level: "expert",
      endorsements: 13,
      experiences: 6,
      highlight:
        "Built AI-powered freshness scoring platform using CV + GPT for grocery automation",
    },
    {
      name: "Computer Science",
      level: "expert",
      endorsements: 28,
      experiences: 8,
      highlight:
        "Developed embedded Android software for 15,000+ Motorola APX NEXT Smart Radios",
    },
    {
      name: "Data Analysis",
      level: "expert",
      endorsements: 9,
      experiences: 9,
      highlight:
        "Reduced operational decision-making time by 26% with custom GPT-based prototype",
    },
    {
      name: "Machine Learning",
      level: "proficient",
      endorsements: 8,
      experiences: 6,
      highlight:
        "Developed KNN model analyzing 10M+ Netflix reviews with A/B testing",
    },
    {
      name: "Computer Vision",
      level: "proficient",
      endorsements: 7,
      experiences: 3,
      highlight:
        "Implemented CV-based freshness detection for automated grocery markdowns",
    },
    {
      name: "Stakeholder Management",
      level: "proficient",
      endorsements: 6,
      experiences: 1,
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
    {
      name: "Data Visualization",
      level: "familiar",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Created interactive dashboards and data visualizations for business insights",
    },
    {
      name: "Statistical Analysis",
      level: "familiar",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Performed statistical analysis and hypothesis testing for product optimization",
    },
    {
      name: "Big Data Processing",
      level: "familiar",
      endorsements: 0,
      experiences: 1,
      highlight:
        "Processed and analyzed large datasets for machine learning model training",
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
    {
      name: "DevOps",
      level: "proficient",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Implemented CI/CD pipelines and automated testing for software deployment",
    },
    {
      name: "Cloud Architecture",
      level: "proficient",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Designed and deployed cloud-based solutions using Azure and AWS services",
    },
    {
      name: "Database Design",
      level: "proficient",
      endorsements: 0,
      experiences: 4,
      highlight:
        "Designed and optimized database schemas for scalable applications",
    },
    {
      name: "Security Implementation",
      level: "proficient",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Implemented security protocols and authentication systems for enterprise applications",
    },
    {
      name: "Performance Optimization",
      level: "proficient",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Optimized application performance and reduced load times by 40%",
    },
    {
      name: "Microservices",
      level: "familiar",
      endorsements: 0,
      experiences: 1,
      highlight:
        "Architected microservices-based applications for improved scalability",
    },
    {
      name: "Containerization",
      level: "familiar",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Implemented Docker containers for consistent deployment environments",
    },
    {
      name: "Mobile Development",
      level: "familiar",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Developed cross-platform mobile applications using React Native",
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
    {
      name: "User Research",
      level: "proficient",
      endorsements: 0,
      experiences: 4,
      highlight:
        "Conducted user interviews and usability testing to inform design decisions",
    },
    {
      name: "Design Systems",
      level: "proficient",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Created and maintained design systems for consistent user experiences",
    },
    {
      name: "Wireframing",
      level: "proficient",
      endorsements: 0,
      experiences: 3,
      highlight:
        "Created detailed wireframes and user flow diagrams for complex applications",
    },
    {
      name: "Visual Design",
      level: "proficient",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Designed visual assets and brand guidelines for multiple products",
    },
    {
      name: "Accessibility Design",
      level: "familiar",
      endorsements: 0,
      experiences: 1,
      highlight:
        "Implemented WCAG guidelines for inclusive design and accessibility",
    },
    {
      name: "Design Thinking",
      level: "familiar",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Applied design thinking methodologies to solve complex user problems",
    },
    {
      name: "Brand Identity",
      level: "familiar",
      endorsements: 0,
      experiences: 2,
      highlight:
        "Developed brand identities and visual language for startup companies",
    },
  ],
};

export default function Home() {
  // Timeline and filter state
  const [expYear, setExpYear] = useState("All");
  const [expCategory, setExpCategory] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [projectSection, setProjectSection] = useState("all");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showVenmoQR, setShowVenmoQR] = useState(false);
  const [db, setDb] = useState<Firestore | null>(null);
  const [version, setVersion] = useState("1.0.0");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    subject: string;
    message: string;
  }>({
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
    "message"
  );
  const [meetingDate, setMeetingDate] = useState<Date | null>(null);
  const [meetingTime, setMeetingTime] = useState<string | null>(null);

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null);

  // Initialize Firebase and start analytics tracking
  useEffect(() => {
    let app: FirebaseApp | undefined;
    if (typeof window !== "undefined") {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      const firestore = getFirestore(app);
      setDb(firestore);

      // Start analytics tracking
      trackPageView(firestore);
      trackUserInteractions(firestore);
      trackDeviceInfo(firestore);
    }
  }, []);

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  };

  // Get geolocation data from IP
  const getGeolocationData = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return {
        country: data.country_name || "Unknown",
        region: data.region || "Unknown",
        city: data.city || "Unknown",
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        timezone: data.timezone || "Unknown",
        ip: data.ip || "Unknown",
      };
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      return {
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        latitude: null,
        longitude: null,
        timezone: "Unknown",
        ip: "Unknown",
      };
    }
  };

  const trackPageView = async (firestore: Firestore) => {
    const geolocation = await getGeolocationData();
    const pageView = {
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      referrer: document.referrer || "direct",
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timeOnPage: 0,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      // Geolocation data
      country: geolocation.country,
      region: geolocation.region,
      city: geolocation.city,
      latitude: geolocation.latitude,
      longitude: geolocation.longitude,
      timezone: geolocation.timezone,
      ip: geolocation.ip,
    };

    try {
      await addDoc(collection(firestore, "page_views"), pageView);
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  };

  const trackUserInteractions = (firestore: Firestore) => {
    const sessionId = getSessionId();

    // Track clicks
    document.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;
      const geolocation = await getGeolocationData();
      const interaction = {
        type: "click",
        element:
          target.tagName.toLowerCase() +
          (target.id ? `#${target.id}` : "") +
          (target.className ? `.${target.className.split(" ")[0]}` : ""),
        page: window.location.pathname,
        sessionId,
        timestamp: serverTimestamp(),
        // Geolocation data
        country: geolocation.country,
        region: geolocation.region,
        city: geolocation.city,
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
        timezone: geolocation.timezone,
        ip: geolocation.ip,
      };

      try {
        await addDoc(collection(firestore, "user_interactions"), interaction);
      } catch (error) {
        console.error("Error tracking interaction:", error);
      }
    });

    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener("scroll", async () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) {
          // Track every 25% scroll
          const geolocation = await getGeolocationData();
          const interaction = {
            type: "scroll",
            element: `scroll_${maxScroll}%`,
            page: window.location.pathname,
            sessionId,
            timestamp: serverTimestamp(),
            // Geolocation data
            country: geolocation.country,
            region: geolocation.region,
            city: geolocation.city,
            latitude: geolocation.latitude,
            longitude: geolocation.longitude,
            timezone: geolocation.timezone,
            ip: geolocation.ip,
          };

          try {
            await addDoc(
              collection(firestore, "user_interactions"),
              interaction
            );
          } catch (error) {
            console.error("Error tracking scroll:", error);
          }
        }
      }
    });
  };

  const trackDeviceInfo = async (firestore: Firestore) => {
    const geolocation = await getGeolocationData();
    const deviceInfo = {
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      // Geolocation data
      country: geolocation.country,
      region: geolocation.region,
      city: geolocation.city,
      latitude: geolocation.latitude,
      longitude: geolocation.longitude,
      timezone: geolocation.timezone,
      ip: geolocation.ip,
    };

    try {
      await addDoc(collection(firestore, "device_info"), deviceInfo);
    } catch (error) {
      console.error("Error tracking device info:", error);
    }
  };

  // Project data
  const projectSections = projectSectionsData;

  // Filtered skills computation
  const filteredSkills = useMemo(() => {
    if (activeFilter === "all") {
      return Object.values(skillsData).flat();
    }
    return skillsData[activeFilter] || [];
  }, [activeFilter]);

  // Current projects computation
  const currentProjects = useMemo(() => {
    const projects = projectSections[projectSection as keyof ProjectSection];
    if (projectSection === "all" && !showAllProjects) {
      return projects.slice(0, 8); // Show first 8 projects
    }
    return projects;
  }, [projectSection, showAllProjects, projectSections]);

  const moreProjectsCount = useMemo(() => {
    if (projectSection === "all") {
      return Math.max(0, projectSections.all.length - 8);
    }
    return 0;
  }, [projectSection, projectSections.all.length]);

  // Card expansion handler
  const toggleCardExpansion = useCallback((cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  // Form handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Implement your form submission logic here
      setSubmitStatus("success");
      setSubmitMessage("Message sent successfully!");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define types for experience categories
  type ExperienceCategory = {
    key: string;
    label: string;
  };

  const expCategories: ExperienceCategory[] = [
    { key: "all", label: "All" },
    { key: "product", label: "Product Management" },
    { key: "engineering", label: "Engineering" },
    { key: "retail", label: "Retail" },
  ];

  // Helper function to check if an experience was active in a given year
  const wasActiveInYear = (date: string, yearStr: string): boolean => {
    const years = date.match(/\b20\d{2}\b/g);
    if (!years || years.length === 0) return false;

    const year = parseInt(yearStr);

    // Handle "Present" case
    if (date.includes("Present")) {
      const startYear = parseInt(years[0]);
      const currentYear = new Date().getFullYear();
      return year >= startYear && year <= currentYear;
    }

    // For date ranges
    if (years.length >= 2) {
      const startYear = parseInt(years[0]);
      const endYear = parseInt(years[years.length - 1]);
      return year >= startYear && year <= endYear;
    }

    // For single year
    return years.includes(yearStr);
  };

  // Get unique years for the year filter
  const expYears = Array.from(
    new Set(
      sortedTimelineEvents
        .filter((e): e is TimelineEvent => e.type === "experience")
        .flatMap((e) => {
          const matches = e.date.match(/\b20\d{2}\b/g);
          return matches || [];
        })
    )
  ).sort((a, b) => Number(b) - Number(a));

  // Update filtered experiences logic
  const filteredExperiences = sortedTimelineEvents.filter((e) => {
    // First check if it's an experience
    if (e.type !== "experience") return false;

    // Then check year filter
    if (expYear !== "All" && !wasActiveInYear(e.date, expYear)) return false;

    // Finally check category filter
    if (expCategory !== "all" && e.category !== expCategory) return false;

    return true;
  });

  // Get experiences count for each year
  const getYearCount = (yearStr: string): number => {
    if (yearStr === "All")
      return sortedTimelineEvents.filter((e) => e.type === "experience").length;
    return sortedTimelineEvents.filter(
      (e) => e.type === "experience" && wasActiveInYear(e.date, yearStr)
    ).length;
  };

  // Get experiences count for each category
  const getCategoryCount = (category: string): number => {
    return sortedTimelineEvents.filter(
      (e) =>
        e.type === "experience" &&
        (category === "all" || e.category === category)
    ).length;
  };

  // Utility: Responsive flex direction for timeline containers
  const isMobile = useMediaQuery("(max-width: 600px)");
  const timelineFlexClass = isMobile
    ? "flex-col items-center gap-6 w-full"
    : "flex-row items-center gap-4";

  // Check if timeline is scrollable and handle scroll hint
  useEffect(() => {
    const timeline = timelineRef.current;
    if (timeline) {
      const checkScroll = () => {
        const hasHorizontalScroll = timeline.scrollWidth > timeline.clientWidth;
        const isAtEnd =
          Math.abs(
            timeline.scrollLeft + timeline.clientWidth - timeline.scrollWidth
          ) < 5;
        const hasEnoughItems = filteredExperiences.length >= 4;

        // Show hint only if there's horizontal scroll, enough items, and not at the end
        setShowScrollHint(hasHorizontalScroll && hasEnoughItems && !isAtEnd);
      };

      // Initial check
      checkScroll();

      // Check on scroll
      timeline.addEventListener("scroll", checkScroll);
      // Check on resize
      window.addEventListener("resize", checkScroll);

      return () => {
        timeline.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [timelineRef.current, filteredExperiences.length]);

  // Fetch version and timestamp on component mount
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch("/api/version");
        const data = await response.json();
        setVersion(data.version);
        setLastUpdated(new Date(data.timestamp));
      } catch (error) {
        console.log("Could not fetch version info");
      }
    };

    fetchVersion();
  }, []);

  // ... rest of the component code ...

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Flashing Alert Banner */}
      <div className="fixed top-4 left-4 z-50 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-2 shadow-lg flash-alert rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white font-bold text-xs">
            🚨 Actively Seeking AI Product Management Opportunities!!! 🚨
          </span>
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>

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
                  Find out what I'm up to
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
                    {/* Floating bubbles for animation */}
                    <div className="skill-bubble skill-bubble-1 absolute top-2 left-2 w-2 h-2 bg-blue-400/60 rounded-full"></div>
                    <div className="skill-bubble skill-bubble-2 absolute top-1 right-3 w-1.5 h-1.5 bg-purple-400/60 rounded-full"></div>
                    <div className="skill-bubble skill-bubble-3 absolute bottom-2 left-3 w-1 h-1 bg-cyan-400/60 rounded-full"></div>

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
          <div className="mb-2 flex flex-wrap items-center justify-center gap-4 text-center">
            <button
              className={`rounded-lg px-6 py-2.5 font-medium transition-all duration-200 ${
                expYear === "All"
                  ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => setExpYear("All")}
            >
              All ({getYearCount("All")})
            </button>
            {expYears.map((year) => (
              <button
                key={year}
                className={`rounded-lg px-6 py-2.5 font-medium transition-all duration-200 ${
                  expYear === year
                    ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setExpYear(year)}
              >
                {year} ({getYearCount(year)})
              </button>
            ))}
          </div>

          {/* Category Navigation */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-center">
            {expCategories.map((cat) => (
              <button
                key={cat.key}
                className={`rounded-lg px-6 py-2.5 font-medium transition-all duration-200 ${
                  expCategory === cat.key
                    ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-800"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setExpCategory(cat.key)}
              >
                {cat.label} ({getCategoryCount(cat.key)})
              </button>
            ))}
          </div>

          {/* Remove project filters section */}

          {/* Career Timeline Row with Arrows */}
          <div className="relative">
            <div
              className="timeline-container-with-stars mx-auto w-full max-w-7xl overflow-x-auto pt-8"
              ref={timelineRef}
            >
              <div
                className={
                  "flex flex-row items-start justify-start gap-x-4 px-2 sm:px-8 " +
                  timelineFlexClass
                }
              >
                {filteredExperiences.map((item, idx, arr) => (
                  <React.Fragment
                    key={item.title + "-" + item.year + "-" + idx}
                  >
                    <div className="timeline-card-container relative flex min-w-[80vw] max-w-[90vw] sm:min-w-[220px] sm:max-w-[280px] mx-2 flex-col items-center">
                      <div
                        className="timeline-card mx-auto flex h-full w-full flex-col text-left"
                        onClick={() =>
                          toggleCardExpansion(item.title + "-" + item.year)
                        }
                      >
                        {/* REMOVED YEAR CIRCLE AND FLEX WRAPPER */}
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Image
                            src={item.logo}
                            alt={item.org}
                            width={40}
                            height={40}
                            className="logo rounded"
                          />
                        </div>
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
                    {/* Arrow between cards: left arrow, rotated 180deg */}
                    {idx < arr.length - 1 && (
                      <div className="flex items-center justify-center w-8 h-8 mx-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-blue-400"></span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            {/* Scroll hint animation/popup */}
            {showScrollHint && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 animate-bounce bg-blue-700/90 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-semibold pointer-events-none">
                Scroll right to see more →
              </div>
            )}
          </div>

          {/* Education Section - Improved UI */}
          <h3 className="mt-8 mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-semibold text-transparent">
            Education
          </h3>
          <div
            className="education-carousel improved-ui timeline-container-with-stars overflow-visible pt-8"
            style={{ overflow: "visible", paddingTop: "2.5rem" }}
          >
            <div
              className={
                "flex flex-row items-start justify-start gap-x-4 px-2 sm:px-8 " +
                timelineFlexClass
              }
            >
              {sortedEducationEvents.map((item, idx) => (
                <React.Fragment key={item.year + "-" + idx}>
                  <div
                    className={`timeline-card-container relative flex min-w-[80vw] max-w-[90vw] sm:min-w-[240px] sm:max-w-[280px] mx-2 flex-col items-center${item.type === "education" ? " education" : ""}`}
                  >
                    <div
                      className="timeline-card mx-auto flex h-full w-full flex-col text-left"
                      onClick={() =>
                        toggleCardExpansion(item.title + "-" + item.year)
                      }
                    >
                      {/* REMOVED YEAR CIRCLE AND FLEX WRAPPER */}
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Image
                          src={item.logo}
                          alt={item.org}
                          width={40}
                          height={40}
                          className="logo rounded"
                        />
                      </div>
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
                    <div className="flex items-center justify-center w-8 h-8 mx-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-blue-400"></span>
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
          <h2 className="section-title mb-4 text-center">
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
                      <h2
                        className="text-base leading-tight font-bold break-words whitespace-normal text-white"
                        title={project.title}
                      >
                        {project.title}
                      </h2>
                      <p className="mb-2 text-sm text-blue-100">
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
              className={`skills-filter-button ${contactMode === "message" ? "active" : ""}`}
              onClick={() => setContactMode("message")}
              style={{ minWidth: "180px" }}
            >
              Send a Message
            </button>
            <button
              className={`skills-filter-button ${contactMode === "meeting" ? "active" : ""}`}
              onClick={() => setContactMode("meeting")}
              style={{ minWidth: "180px" }}
            >
              Schedule a Meeting
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

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-blue-900/30 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center space-y-6">
            {/* Social Media Links */}
            <div className="flex items-center space-x-6">
              <a
                href="https://www.facebook.com/lawrence.hua.75/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                title="Facebook"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://github.com/LawrenceHua"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                title="GitHub"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              <button
                onClick={() => setShowVenmoQR(!showVenmoQR)}
                className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                title="Venmo"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.06 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </button>
            </div>

            {/* Venmo QR Code Modal */}
            {showVenmoQR && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowVenmoQR(false)}
              >
                <div
                  className="bg-white rounded-lg p-6 max-w-sm mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Venmo QR Code
                    </h3>
                    <button
                      onClick={() => setShowVenmoQR(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="text-center">
                    <Image
                      src="/logos/MyVenmoQRCode.png"
                      alt="Venmo QR Code"
                      width={200}
                      height={200}
                      className="mx-auto rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Scan to send money via Venmo
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Copyright */}
            <div className="text-center text-gray-400 text-sm">
              <p>&copy; 2025 Lawrence W. Hua. All rights reserved.</p>
              <p className="mt-1">
                Built with ❤️ using Next.js, TypeScript, and TailwindCSS
              </p>
              <p className="mt-1 text-xs">
                Last updated:{" "}
                {lastUpdated.toLocaleString("en-US", {
                  timeZone: "America/New_York",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}{" "}
                EST. V{version}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
