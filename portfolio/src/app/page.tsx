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
  FiX,
} from "react-icons/fi";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  Firestore,
} from "firebase/firestore";
// import { Clock } from "lucide-react";

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
    year: "2022",
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
  {
    type: "experience",
    year: "2021",
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
    year: "2017",
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
    year: "2022",
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
  const [version, setVersion] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);
  const [geolocation, setGeolocation] = useState<any>(null);
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeLevel, setActiveLevel] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [meetingDate, setMeetingDate] = useState<Date | null>(new Date());
  const [meetingTime, setMeetingTime] = useState<string | null>("10:30");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [submitMessage, setSubmitMessage] = useState("");
  const timelineRef = useRef<HTMLDivElement>(null);
  const [contactMode, setContactMode] = useState<"meeting" | "message">(
    "message"
  );
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Set client flag on mount to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Fetch geolocation once on mount
  useEffect(() => {
    async function fetchGeo() {
      const geo = await getGeolocationData();
      setGeolocation(geo);
    }
    fetchGeo();
  }, []);

  // Initialize Firebase and start analytics tracking ONCE after geolocation is loaded
  useEffect(() => {
    if (analyticsInitialized || geolocation === null) return;
    let app: FirebaseApp | undefined;
    if (typeof window !== "undefined") {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      const firestore = getFirestore(app);
      setDb(firestore);
      trackPageView(firestore, geolocation);
      trackDeviceInfo(firestore, geolocation);
      // Add event listeners only once
      const clickListener = (e: MouseEvent) => {
        const target = e.target as any; // Use any to handle different element types

        let className = "";
        if (target.className) {
          // Handle SVGAnimatedString for SVG elements
          if (
            typeof target.className === "object" &&
            target.className.baseVal
          ) {
            className = target.className.baseVal;
          } else {
            className = target.className;
          }
        }

        const interactionData = {
          type: "click",
          element:
            target.tagName.toLowerCase() +
            (target.id ? `#${target.id}` : "") +
            (className ? `.${className.split(" ")[0]}` : ""),
          page: window.location.pathname,
          sessionId: getSessionId(),
          timestamp: serverTimestamp(),
          country: geolocation?.country || "Unknown",
          region: geolocation?.region || "Unknown",
          city: geolocation?.city || "Unknown",
          latitude: geolocation?.latitude || null,
          longitude: geolocation?.longitude || null,
          timezone: geolocation?.timezone || "Unknown",
          ip: geolocation?.ip || "Unknown",
        };
        try {
          addDoc(collection(firestore, "user_interactions"), interactionData);
        } catch (error) {
          console.error("Error tracking interaction:", error);
        }
      };
      document.addEventListener("click", clickListener);
      let maxScroll = 0;
      const scrollListener = async () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
            100
        );
        if (scrollPercent > maxScroll) {
          maxScroll = scrollPercent;
        }
      };
      scrollListener();
      window.addEventListener("scroll", scrollListener);
      window.addEventListener("resize", scrollListener);

      return () => {
        document.removeEventListener("click", clickListener);
        window.removeEventListener("scroll", scrollListener);
        window.removeEventListener("resize", scrollListener);
      };
    }
  }, [analyticsInitialized, geolocation]);

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("analytics_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("analytics_session_id", sessionId);
    }
    return sessionId;
  };

  // Get geolocation data from IP
  async function getGeolocationData() {
    try {
      const response = await fetch("/api/geolocation");
      if (!response.ok) {
        if (response.status === 429) {
          console.warn("Geolocation rate limit exceeded");
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn("Error fetching geolocation:", error);
      return null;
    }
  }

  const trackPageView = async (firestore: Firestore, geo: any) => {
    const pageView = {
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      referrer: document.referrer || "direct",
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timeOnPage: 0,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      country: geo?.country || "Unknown",
      region: geo?.region || "Unknown",
      city: geo?.city || "Unknown",
      latitude: geo?.latitude || null,
      longitude: geo?.longitude || null,
      timezone: geo?.timezone || "Unknown",
      ip: geo?.ip || "Unknown",
    };

    try {
      await addDoc(collection(firestore, "page_views"), pageView);
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  };

  const trackDeviceInfo = async (firestore: Firestore, geo: any) => {
    const deviceInfo = {
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      country: geo?.country || "Unknown",
      region: geo?.region || "Unknown",
      city: geo?.city || "Unknown",
      latitude: geo?.latitude || null,
      longitude: geo?.longitude || null,
      timezone: geo?.timezone || "Unknown",
      ip: geo?.ip || "Unknown",
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
    let skills =
      activeCategory === "all"
        ? Object.values(skillsData).flat()
        : skillsData[activeCategory as keyof typeof skillsData] || [];
    if (["expert", "proficient", "familiar"].includes(activeLevel)) {
      skills = skills.filter((s) => s.level === activeLevel);
    }
    return skills;
  }, [activeCategory, activeLevel]);

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
    console.log("Toggling card expansion for:", cardId);
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      console.log("Updated expanded cards:", Array.from(newSet));
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
    setSubmitStatus(null);

    console.log("[DEBUG] handleSubmit contactMode:", contactMode);

    let payload: any = { ...formData };
    if (contactMode === "meeting") {
      let finalMeetingDate = new Date();
      if (meetingDate) {
        finalMeetingDate = new Date(meetingDate);
      }
      if (meetingTime) {
        const [hours, minutes] = meetingTime.split(":");
        finalMeetingDate.setHours(parseInt(hours, 10));
        finalMeetingDate.setMinutes(parseInt(minutes, 10));
      }
      // Always set subject for meeting requests
      payload.subject = `Meeting Request: ${formData.name || "(No Name)"} on ${finalMeetingDate.toLocaleDateString()}`;
      payload.meeting = finalMeetingDate.toISOString();
      payload.message =
        formData.message && formData.message.trim() !== ""
          ? formData.message
          : "I'd like to schedule a meeting to discuss opportunities.";
    }

    console.log(
      "[DEBUG] Submitting form data:",
      JSON.stringify(payload, null, 2)
    ); // Debug log before sending

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[DEBUG] Response status:", response.status); // Debug log response status
      const responseData = await response.json();
      console.log("[DEBUG] Response data:", responseData); // Debug log response data

      if (response.ok) {
        setSubmitStatus("success");
        setSubmitMessage("Message sent successfully!");
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setMeetingDate(null);
        setMeetingTime(null);
      } else {
        throw new Error(responseData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("[DEBUG] Error submitting form:", error);
      setSubmitStatus("error");
      setSubmitMessage("Failed to send. Please try again.");
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

  // Helper: Get all years an experience was active
  function getYearsInRange(dateStr: string): string[] {
    if (!dateStr) return [];
    // Match start and end years
    const match = dateStr.match(/(\d{4}).*(\d{4}|Present)/);
    if (!match) {
      // Try to match a single year
      const singleYear = dateStr.match(/(\d{4})/);
      return singleYear ? [singleYear[1]] : [];
    }
    const startYear = parseInt(match[1]);
    let endYear: number;
    if (match[2] === "Present") {
      endYear = new Date().getFullYear();
    } else {
      endYear = parseInt(match[2]);
    }
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y.toString());
    }
    return years;
  }

  // Get unique years for the year filter (all years covered by any experience)
  const expYears = Array.from(
    new Set(
      sortedTimelineEvents
        .filter((e): e is TimelineEvent => e.type === "experience")
        .flatMap((e) => getYearsInRange(e.date))
    )
  ).sort((a, b) => Number(b) - Number(a));

  // Helper function to check if an experience was active in a given year
  const wasActiveInYear = (date: string, yearStr: string): boolean => {
    return getYearsInRange(date).includes(yearStr);
  };

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

  const getProjectCount = (category: string): number => {
    if (category === "all") return projectSectionsData.all.length;
    return projectSectionsData[category as keyof ProjectSection].length;
  };

  // Utility: Responsive flex direction for timeline containers
  const isMobile = useMediaQuery("(max-width: 600px)");
  const timelineFlexClass = isMobile
    ? "flex-col items-center gap-6 w-full"
    : "flex-row items-center gap-4";

  // Update filtered experiences logic
  const filteredExperiences = sortedTimelineEvents.filter(
    (e: TimelineEvent) => {
      // First check if it's an experience
      if (e.type !== "experience") return false;

      // Then check year filter
      if (expYear !== "All") {
        const isActive = wasActiveInYear(e.date, expYear);
        if (!isActive) return false;
      }

      // Finally check category filter
      if (expCategory !== "all" && e.category !== expCategory) return false;

      return true;
    }
  );

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
  }, [filteredExperiences.length]);

  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Flashing Alert Banner */}
      <div className="fixed top-4 left-4 z-50 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 p-1 md:p-2 shadow-lg flash-alert rounded-lg max-w-[65%] md:max-w-none">
        <div className="flex items-center space-x-1 md:space-x-2">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
          <span className="text-white font-bold text-[10px] md:text-xs">
            🚨 Actively Seeking AI Product Management Opportunities!!! 🚨
          </span>
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
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
                  target="_blank"
                  rel="noopener noreferrer"
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

          {/* Skills Section */}
          <section id="skills" className="section-container bg-gray-900 py-16">
            <div className="section-content">
              <h2 className="mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-center text-5xl font-extrabold text-transparent drop-shadow-lg">
                Skills & Expertise
              </h2>

              {/* Skills Info Popup */}
              <div className="mx-auto mb-4 flex justify-center">
                <div className="inline-block rounded-lg border border-blue-700/50 bg-blue-900/40 p-3 text-center">
                  <p className="text-sm text-blue-200">
                    💡 Hover to view my skill level, project experience,
                    endorsements, and leadership roles.
                  </p>
                </div>
              </div>

              {/* Category Navigation */}
              <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === "all"
                      ? "bg-blue-600/20 border-blue-500/80 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700/80"
                  } border backdrop-blur-sm`}
                >
                  All Skills
                </button>
                <button
                  onClick={() => setActiveCategory("business")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === "business"
                      ? "bg-blue-600/20 border-blue-500/80 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700/80"
                  } border backdrop-blur-sm`}
                >
                  Business
                </button>
                <button
                  onClick={() => setActiveCategory("data")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === "data"
                      ? "bg-blue-600/20 border-blue-500/80 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700/80"
                  } border backdrop-blur-sm`}
                >
                  Data & AI
                </button>
                <button
                  onClick={() => setActiveCategory("engineering")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === "engineering"
                      ? "bg-blue-600/20 border-blue-500/80 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700/80"
                  } border backdrop-blur-sm`}
                >
                  Engineering
                </button>
                <button
                  onClick={() => setActiveCategory("design")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === "design"
                      ? "bg-blue-600/20 border-blue-500/80 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gray-800/80 border-gray-700 text-gray-300 hover:bg-gray-700/80"
                  } border backdrop-blur-sm`}
                >
                  Design
                </button>
              </div>

              {/* Level Navigation */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <button
                  onClick={() => setActiveLevel("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border backdrop-blur-sm ${
                    activeLevel === "all"
                      ? "bg-blue-700/20 border-blue-500/80 text-blue-100 shadow-lg shadow-blue-500/20"
                      : "bg-gray-800/80 border-blue-700 text-blue-300 hover:bg-blue-700/80"
                  }`}
                >
                  All Levels
                </button>
                <button
                  onClick={() => setActiveLevel("expert")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border backdrop-blur-sm ${
                    activeLevel === "expert"
                      ? "bg-green-600/20 border-green-500/80 text-green-200 shadow-lg shadow-green-500/20"
                      : "bg-gray-800/80 border-green-700 text-green-300 hover:bg-green-700/80"
                  }`}
                >
                  Expert
                </button>
                <button
                  onClick={() => setActiveLevel("proficient")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border backdrop-blur-sm ${
                    activeLevel === "proficient"
                      ? "bg-orange-600/20 border-orange-500/80 text-orange-200 shadow-lg shadow-orange-500/20"
                      : "bg-gray-800/80 border-orange-700 text-orange-300 hover:bg-orange-700/80"
                  }`}
                >
                  Proficient
                </button>
                <button
                  onClick={() => setActiveLevel("familiar")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border backdrop-blur-sm ${
                    activeLevel === "familiar"
                      ? "bg-blue-600/20 border-blue-500/80 text-blue-200 shadow-lg shadow-blue-500/20"
                      : "bg-gray-800/80 border-blue-700 text-blue-300 hover:bg-blue-700/80"
                  }`}
                >
                  Familiar
                </button>
              </div>

              {/* Skills Grid */}
              <div className="skills-grid">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="skill-wrapper"
                    onMouseEnter={() => {
                      console.log("DEBUG: Mouse Enter", skill.name);
                      setActiveTooltip(skill.name);
                    }}
                    onMouseLeave={() => {
                      console.log("DEBUG: Mouse Leave", skill.name);
                      setActiveTooltip(null);
                    }}
                  >
                    <div
                      className="skill-item font-medium"
                      data-level={skill.level}
                    >
                      <div className="skill-button-content">
                        {/* Floating bubbles for animation */}
                        <div className="skill-bubble skill-bubble-1 absolute top-2 left-2 w-2 h-2 bg-blue-400/60 rounded-full"></div>
                        <div className="skill-bubble skill-bubble-2 absolute top-1 right-3 w-1.5 h-1.5 bg-purple-400/60 rounded-full"></div>
                        <div className="skill-bubble skill-bubble-3 absolute bottom-2 left-3 w-1 h-1 bg-cyan-400/60 rounded-full"></div>

                        <span className="text-gray-100 relative z-10">
                          {skill.name}
                        </span>
                      </div>
                    </div>
                    {/* Tooltip */}
                    <div
                      className={`skill-tooltip ${
                        activeTooltip === skill.name ? "visible" : ""
                      }`}
                    >
                      <div className="skill-tooltip-title">{skill.name}</div>
                      <div className="skill-tooltip-highlight">
                        {skill.highlight}
                      </div>
                      <div className="skill-tooltip-stats">
                        <div className="skill-tooltip-stat">
                          <span className="skill-tooltip-stat-label">
                            Level
                          </span>
                          <span className="skill-tooltip-stat-value">
                            {skill.level.charAt(0).toUpperCase() +
                              skill.level.slice(1)}
                          </span>
                        </div>
                        <div className="skill-tooltip-stat">
                          <span className="skill-tooltip-stat-label">
                            Experiences
                          </span>
                          <span className="skill-tooltip-stat-value">
                            {skill.experiences}
                          </span>
                        </div>
                        <div className="skill-tooltip-stat">
                          <span className="skill-tooltip-stat-label">
                            Endorsements
                          </span>
                          <span className="skill-tooltip-stat-value">
                            {skill.endorsements}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Career Timeline: Experience */}
          <section id="timeline" className="bg-gray-900 pt-24 pb-16">
            <div className="relative flex w-full flex-col items-center px-8">
              <h2 className="mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-center text-5xl font-extrabold text-transparent drop-shadow-lg">
                Career Timeline
              </h2>

              <h3 className="mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-center text-3xl font-semibold text-transparent">
                Work Experience
              </h3>

              {/* Year Navigation */}
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-center">
                <button
                  className={`rounded-lg px-6 py-2 font-medium transition-all duration-200 ${
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
                    className={`rounded-lg px-6 py-2 font-medium transition-all duration-200 ${
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
              <div className="mb-6 flex flex-wrap items-center justify-center gap-3 text-center">
                {expCategories.map((cat) => (
                  <button
                    key={cat.key}
                    className={`rounded-lg px-6 py-2 font-medium transition-all duration-200 ${
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

              {/* Timeline Container */}
              <div className="relative">
                <div
                  className="timeline-container-with-stars mx-auto w-full max-w-7xl overflow-x-auto pt-2"
                  ref={timelineRef}
                >
                  <div
                    className={
                      "flex flex-row items-start justify-start px-2 sm:px-8 " +
                      timelineFlexClass
                    }
                  >
                    {filteredExperiences.map((item, idx, arr) => (
                      <div
                        key={item.title + "-" + item.year + "-" + idx}
                        className="flex-shrink-0"
                      >
                        <div className="timeline-card-container relative flex min-w-[85vw] sm:w-[320px] flex-col items-center">
                          <div
                            className="timeline-card mx-auto flex h-full w-full flex-col text-left cursor-pointer hover:bg-gray-800/20 transition-colors duration-200"
                            onClick={() =>
                              toggleCardExpansion(item.title + "-" + item.year)
                            }
                          >
                            <div className="flex items-center justify-center gap-2 mb-2 py-2">
                              <Image
                                src={item.logo}
                                alt={item.org}
                                width={56}
                                height={56}
                                className="logo mx-auto rounded object-contain"
                              />
                            </div>
                            <div
                              className="text-center text-lg font-bold text-white"
                              style={{ margin: 0, padding: 0 }}
                            >
                              <span>{item.title}</span>
                            </div>
                            <p className="text-base text-gray-400">
                              {item.org}
                            </p>
                            <p className="text-sm text-gray-400">{item.date}</p>

                            <div className="timeline-card-content mt-2">
                              {item.bullets && item.bullets.length > 0 && (
                                <ul className="list-disc space-y-1 pl-4 text-sm text-gray-300">
                                  <li>{item.bullets[0]}</li>
                                  {expandedCards.has(
                                    item.title + "-" + item.year
                                  ) &&
                                    item.bullets
                                      .slice(1)
                                      .map((bullet: string, i: number) => (
                                        <li key={i}>{bullet}</li>
                                      ))}
                                </ul>
                              )}
                            </div>

                            {item.bullets && item.bullets.length > 1 && (
                              <button
                                className="mt-auto pt-2 text-sm font-bold text-blue-400 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCardExpansion(
                                    item.title + "-" + item.year
                                  );
                                }}
                              >
                                Click to see{" "}
                                {expandedCards.has(item.title + "-" + item.year)
                                  ? "less"
                                  : `${item.bullets.length - 1} more...`}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
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

              {/* Education Section */}
              <div className="section-content mt-16">
                <h3 className="mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-center text-3xl font-semibold text-transparent">
                  Education
                </h3>
                <div
                  className={
                    "flex items-start justify-start px-2 sm:px-8 " +
                    (isMobile
                      ? "flex-col items-center gap-6 w-full"
                      : "flex-row items-start gap-4 overflow-x-auto")
                  }
                >
                  {sortedTimelineEvents
                    .filter((e) => e.type === "education")
                    .map((item, idx, arr) => (
                      <div
                        key={item.title + "-" + item.year + "-" + idx}
                        className="flex-shrink-0"
                      >
                        <div className="timeline-card-container relative flex min-w-[80vw] sm:w-[280px] flex-col items-center">
                          <div
                            className="timeline-card mx-auto flex h-full w-full flex-col text-left cursor-pointer hover:bg-gray-800/20 transition-colors duration-200"
                            onClick={() =>
                              toggleCardExpansion(item.title + "-" + item.year)
                            }
                          >
                            <div className="flex items-center justify-center gap-2 mb-2 py-2">
                              <Image
                                src={item.logo}
                                alt={item.org}
                                width={56}
                                height={56}
                                className="logo mx-auto rounded object-contain"
                              />
                            </div>
                            <h4 className="text-center text-lg font-bold text-white">
                              {item.title}
                            </h4>
                            <p className="text-base text-gray-400">
                              {item.org}
                            </p>
                            <p className="text-sm text-gray-400">{item.date}</p>

                            <div className="timeline-card-content mt-2">
                              {item.details && item.details.length > 0 && (
                                <ul className="space-y-2 text-base text-gray-300 pl-4 list-disc">
                                  <li>{item.details[0]}</li>
                                  {expandedCards.has(
                                    item.title + "-" + item.year
                                  ) &&
                                    item.details
                                      .slice(1)
                                      .map((detail: string, i: number) => (
                                        <li key={i}>{detail}</li>
                                      ))}
                                </ul>
                              )}
                            </div>

                            {item.details && item.details.length > 1 && (
                              <button
                                className="mt-auto pt-2 text-sm font-bold text-blue-400 hover:underline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCardExpansion(
                                    item.title + "-" + item.year
                                  );
                                }}
                              >
                                Click to see{" "}
                                {expandedCards.has(item.title + "-" + item.year)
                                  ? "less"
                                  : `${item.details.length - 1} more...`}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section
            id="projects"
            className="section-container bg-gray-900 py-16"
          >
            <div className="section-content">
              <h2 className="mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-center text-5xl font-extrabold text-transparent drop-shadow-lg">
                Projects
              </h2>

              {/* Project Filter Navigation */}
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setProjectSection("all")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    projectSection === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  All ({getProjectCount("all")})
                </button>
                <button
                  onClick={() => setProjectSection("product")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    projectSection === "product"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Product Management ({getProjectCount("product")})
                </button>
                <button
                  onClick={() => setProjectSection("engineering")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    projectSection === "engineering"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  Engineering ({getProjectCount("engineering")})
                </button>
                <button
                  onClick={() => setProjectSection("fun")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    projectSection === "fun"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  For Fun ({getProjectCount("fun")})
                </button>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {currentProjects.map((project) => (
                  <div
                    key={project.title}
                    className="project-card-v2 rounded-xl border border-blue-900/30 bg-gray-900/70 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-blue-700 hover:shadow-blue-500/20"
                  >
                    <div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-2 text-md font-bold text-white">
                      {project.title}
                    </h3>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-blue-900/50 px-2 py-0.5 text-xs text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="mb-4 text-sm text-gray-400">
                      {project.description}
                    </p>
                    <Link
                      href={project.link}
                      target={project.link.startsWith("/") ? "_self" : "_blank"}
                      className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      {project.linkIcon === "external" ? (
                        <FiExternalLink className="mr-2" />
                      ) : (
                        <FiGithub className="mr-2" />
                      )}
                      {project.linkText}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Show More Button */}
              {projectSection === "all" && projectSections.all.length > 8 && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowAllProjects((prev) => !prev)}
                    className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                  >
                    {showAllProjects
                      ? "Show Less"
                      : `Show ${moreProjectsCount} More Projects`}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Contact Section */}
          <section
            id="contact"
            className="section-container border-t border-gray-800 py-16"
          >
            <div className="section-content">
              <h2 className="mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-center text-5xl font-extrabold text-transparent drop-shadow-lg">
                Get in Touch
              </h2>
              <p className="mb-8 text-center text-lg text-gray-300">
                Ready to discuss opportunities? I'm excited to hear about your
                project or role!
              </p>

              <div className="mx-auto max-w-2xl">
                {/* Contact Mode Switcher */}
                <div className="mb-6 flex justify-center rounded-lg bg-gray-800 p-1">
                  <button
                    onClick={() => setContactMode("message")}
                    className={`w-1/2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      contactMode === "message"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Send a Message
                  </button>
                  <button
                    onClick={() => setContactMode("meeting")}
                    className={`w-1/2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      contactMode === "meeting"
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    Schedule a Meeting
                  </button>
                </div>

                {contactMode === "message" ? (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-blue-900/30 bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-8 shadow-2xl backdrop-blur-sm"
                  >
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Email (optional)
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="message-subject"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        id="message-subject"
                        placeholder="What's up? :D"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="message-body"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Message
                      </label>
                      <textarea
                        name="message"
                        id="message-body"
                        rows={4}
                        placeholder="Tell me more about your project, opportunity, or just say hi"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 resize-none"
                        required
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white font-semibold transition-all duration-200 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        </span>
                      ) : (
                        "Send Message"
                      )}
                    </button>

                    {submitStatus === "success" && (
                      <div className="rounded-lg border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                        <span className="block sm:inline">{submitMessage}</span>
                      </div>
                    )}

                    {submitStatus === "error" && (
                      <div className="rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                        <span className="block sm:inline">{submitMessage}</span>
                      </div>
                    )}
                  </form>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-2xl border border-blue-900/30 bg-gradient-to-br from-gray-900/90 to-gray-800/90 p-8 shadow-2xl backdrop-blur-sm"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Schedule a Discovery Call
                      </h3>
                      <p className="text-gray-400">
                        Let's explore how we can work together on your next
                        project or opportunity!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="meeting-name"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="meeting-name"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="meeting-email"
                          className="block text-sm font-medium text-gray-300"
                        >
                          Email (optional)
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="meeting-email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="meeting-message"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Message
                      </label>
                      <textarea
                        name="message"
                        id="meeting-message"
                        rows={3}
                        placeholder="Tell me more about your project, opportunity, or just say hi"
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 resize-none"
                        required
                      ></textarea>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-300">
                        Preferred Date & Time
                      </label>
                      <div className="flex flex-col items-center space-y-4">
                        <DatePicker
                          selected={meetingDate}
                          onChange={(date) => setMeetingDate(date)}
                          inline
                          className="rounded-lg border border-gray-700 bg-gray-800/50"
                        />
                        <div className="w-full max-w-xs">
                          <input
                            type="time"
                            value={meetingTime || ""}
                            onChange={(e) => setMeetingTime(e.target.value)}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 time-input-icon-white"
                            placeholder="Select time"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white font-semibold transition-all duration-200 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] shadow-lg"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          Sending Request...
                        </span>
                      ) : (
                        "Request Meeting"
                      )}
                    </button>
                    {submitStatus === "success" && (
                      <div className="rounded-lg border border-green-400 bg-green-100 px-4 py-3 text-green-700">
                        <span className="block sm:inline">{submitMessage}</span>
                      </div>
                    )}
                    {submitStatus === "error" && (
                      <div className="rounded-lg border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                        <span className="block sm:inline">{submitMessage}</span>
                      </div>
                    )}
                  </form>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Chatbot */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-blue-900/30 py-8 mt-16 w-full">
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
                  <path d="M19.5 1.5h-15A3 3 0 0 0 1.5 4.5v15a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-15a3 3 0 0 0-3-3zm-4.5 14.25c-1.5 2.25-3.375 3.375-5.25 3.375-1.875 0-2.625-1.125-2.625-2.625 0-2.25 1.875-5.625 2.625-7.125.375-.75.75-1.125 1.5-1.125.75 0 1.125.375 1.125 1.125 0 1.125-1.125 3.375-1.125 4.875 0 .75.375 1.125 1.125 1.125 1.125 0 2.625-1.875 3.375-4.875.375-1.5-.375-3-2.25-3-1.875 0-3.75 1.125-4.875 2.625-.75 1.125-1.125 2.25-1.125 3.375 0 2.25 1.5 3.75 4.125 3.75 1.875 0 3.75-.75 4.875-2.25l-.375.75z" />
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
                {isClient &&
                  lastUpdated.toLocaleString("en-US", {
                    timeZone: "America/New_York",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}{" "}
                EST. V{isClient ? version : ""}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
