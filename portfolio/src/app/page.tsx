"use client";
import Image from 'next/image'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { FiFileText, FiExternalLink, FiSend, FiGithub, FiAward, FiBook } from 'react-icons/fi'
import { FaLinkedin } from 'react-icons/fa'
import { useState } from 'react'
import React from 'react'

const timelineData = [
  {
    year: '2025',
    left: null,
    right: {
      title: 'Product Manager',
      org: 'PM Happy Hour · Internship',
      date: 'Mar 2025 - Present · 4 mos',
      logo: '/logos/pm_happy_hour_logo.jpeg',
      bullets: [
        "Scaled PM Happy Hour's community by 30% through AIGC, targeted engagement campaigns, and continuous feedback loops.",
        'Led MBTI-themed campaign boosting engagement by 50%+',
        'Created AIGC-driven posts expanding social visibility',
        'Improved feature adoption by 20% via A/B testing',
      ],
    },
  },
  {
    year: '2024',
    left: {
      title: "Master's degree, Information Systems Management",
      org: 'Carnegie Mellon University',
      date: 'Aug 2023 - Dec 2024',
      logo: '/logos/carnegie_mellon_university_logo.jpeg',
      details: [
        'Tepper School of Business & Heinz College',
        'Relevant Coursework: New Product Management, Lean Entrepreneurship, Agile Methods, A/B Testing & Design Analytics, Machine Learning in Production',
        'Awards: Finalist – McGinnis Venture Competition (2025), Gerhalt Sandbox Fund Scholar (2025)',
      ],
    },
    right: {
      title: 'Founder & CEO',
      org: 'Expired Solutions · Full-time',
      date: 'Aug 2024 - Present · 11 mos',
      logo: '/logos/expired_solutions_logo.jpeg',
      bullets: [
        'Built an AI platform using CV + GPT to automate markdowns and reduce grocery shrink by up to 20%.',
        'Finalist, McGinnis Venture Competition',
        'Led technical development (Azure, GPT, Vision AI)',
      ],
    },
  },
  {
    year: '2024',
    left: null,
    right: {
      title: 'Product Manager',
      org: 'PanPalz · Internship',
      date: 'Aug 2024 - Jan 2025 · 6 mos',
      logo: '/logos/Panpalz logo.jpeg',
      bullets: [
        'Refined 100+ Figma frames, improving UI consistency by 40%',
        	'Supported GTM planning for the world\'s first nonprofit social app',
        'Contributed to team alignment and brand messaging',
      ],
    },
  },
  {
    year: '2024',
    left: null,
    right: {
      title: 'Student Consultant, Technical Lead',
      org: 'Kearney · 4 mos',
      date: 'Sep 2024 - Dec 2024',
      logo: '/logos/kearney_logo.jpeg',
      bullets: [
        'Reduced operational decision-making time by 26%',
        'Designed and built enterprise tool using OpenAI APIs, Flask, and JavaScript',
        'Conducted user research, system architecture design, and stakeholder presentations',
      ],
    },
  },
  {
    year: '2025',
    left: null,
    right: {
      title: 'Produce Assistant Team Leader',
      org: 'Giant Eagle, Inc. · Full-time',
      date: 'Feb 2025 - May 2025 · 4 mos',
      logo: '/logos/giant_eagle_logo.jpeg',
      bullets: [
        'Reduced shrink by 1% in produce within 30 days',
        'Increased Flashfoods adoption by 300%',
        'Led backroom process improvements and cleaning compliance',
      ],
    },
  },
  {
    year: '2023',
    left: null,
    right: {
      title: 'Embedded Android Engineer',
      org: 'Motorola Solutions · Full-time',
      date: 'Aug 2021 - Aug 2023 · 2 yrs 1 mo',
      logo: '/logos/Motorola logo.jpeg',
      bullets: [
        'Designed and shipped Android system extensions for 15,000+ field units',
        'Diagnosed and resolved 80+ firmware and application-level defects',
        'Led debugging and testing initiatives with global teams',
      ],
    },
  },
  {
    year: '2021',
    left: {
      title: "Bachelor's degree, Computer Science",
      org: 'University of Florida',
      date: 'Aug 2017 - May 2021',
      logo: '/logos/UF logo.jpeg',
      details: [
        'College of Liberal Arts and Sciences | Cum Laude',
        'Relevant Coursework: Software Engineering, Data Structures & Algorithms, Operating Systems, Network Analytics & Machine Learning',
        "Awards: President's Honor Roll (Spring 2020), Cum Laude Graduate (GPA 3.65)",
      ],
    },
    right: {
      title: 'AI Product Consultant & Computer Science Instructor',
      org: 'Tutora · Part-time',
      date: 'Mar 2021 - Present · 4 yrs 4 mos',
      logo: '/logos/Tutora Logo.jpeg',
      bullets: [
        'Saved 15+ hours/week through AI-driven scheduling and grading',
        'Developed 50+ TI-BASIC math programs, improving test scores by 35%',
        'Taught core computer science principles including data structures and Java programming',
      ],
    },
  },
];

// 1. Flatten timelineData into a single array of events
const timelineEvents = [
  // Education
  {
    type: 'education',
    year: '2024',
    title: "Master's degree, Information Systems Management",
    org: 'Carnegie Mellon University',
    date: 'Aug 2023 - Dec 2024',
    logo: '/logos/carnegie_mellon_university_logo.jpeg',
    details: [
      'Tepper School of Business & Heinz College',
      'Relevant Coursework: New Product Management, Lean Entrepreneurship, Agile Methods, A/B Testing & Design Analytics, Machine Learning in Production',
      'Awards: Finalist – McGinnis Venture Competition (2025), Gerhalt Sandbox Fund Scholar (2025)',
    ],
  },
  {
    type: 'education',
    year: '2021',
    title: "Bachelor's degree, Computer Science",
    org: 'University of Florida',
    date: 'Aug 2017 - May 2021',
    logo: '/logos/UF logo.jpeg',
    details: [
      'College of Liberal Arts and Sciences | Cum Laude',
      'Relevant Coursework: Software Engineering, Data Structures & Algorithms, Operating Systems, Network Analytics & Machine Learning',
      "Awards: President's Honor Roll (Spring 2020), Cum Laude Graduate (GPA 3.65)",
    ],
  },
  // Experience
  {
    type: 'experience',
    year: '2025',
    title: 'Product Manager',
    org: 'PM Happy Hour · Internship',
    date: 'Mar 2025 - Present · 4 mos',
    logo: '/logos/pm_happy_hour_logo.jpeg',
    bullets: [
      "Scaled PM Happy Hour's community by 30% through AIGC, targeted engagement campaigns, and continuous feedback loops.",
      'Led MBTI-themed campaign boosting engagement by 50%+',
      'Created AIGC-driven posts expanding social visibility',
      'Improved feature adoption by 20% via A/B testing',
    ],
  },
  {
    type: 'experience',
    year: '2025',
    title: 'Founder & CEO',
    org: 'Expired Solutions · Full-time',
    date: 'Aug 2024 - Present',
    logo: '/logos/expired_solutions_logo.jpeg',
    bullets: [
      'Built an AI platform using CV + GPT to automate markdowns and reduce grocery shrink by up to 20%.',
      'Finalist, McGinnis Venture Competition',
      'Led technical development (Azure, GPT, Vision AI)',
    ],
  },
  {
    type: 'experience',
    year: '2025',
    title: 'Product Manager',
    org: 'PanPalz · Internship',
    date: 'Aug 2024 - Jan 2025',
    logo: '/logos/Panpalz logo.jpeg',
    bullets: [
      'Refined 100+ Figma frames, improving UI consistency by 40%',
      "Supported GTM planning for the world's first nonprofit social app",
      'Contributed to team alignment and brand messaging',
    ],
  },
  {
    type: 'experience',
    year: '2024',
    title: 'Student Consultant, Technical Lead',
    org: 'Kearney · 4 mos',
    date: 'Sep 2024 - Dec 2024',
    logo: '/logos/kearney_logo.jpeg',
    bullets: [
      'Reduced operational decision-making time by 26%',
      'Designed and built enterprise tool using OpenAI APIs, Flask, and JavaScript',
      'Conducted user research, system architecture design, and stakeholder presentations',
    ],
  },
  {
    type: 'experience',
    year: '2025',
    title: 'Produce Assistant Team Leader',
    org: 'Giant Eagle, Inc. · Full-time',
    date: 'Feb 2025 - May 2025 · 4 mos',
    logo: '/logos/giant_eagle_logo.jpeg',
    bullets: [
      'Reduced shrink by 1% in produce within 30 days',
      'Increased Flashfoods adoption by 300%',
      'Led backroom process improvements and cleaning compliance',
    ],
  },
  {
    type: 'experience',
    year: '2023',
    title: 'Embedded Android Engineer',
    org: 'Motorola Solutions · Full-time',
    date: 'Aug 2021 - Aug 2023 · 2 yrs 1 mo',
    logo: '/logos/Motorola logo.jpeg',
    bullets: [
      'Designed and shipped Android system extensions for 15,000+ field units',
      'Diagnosed and resolved 80+ firmware and application-level defects',
      'Led debugging and testing initiatives with global teams',
    ],
  },
  {
    type: 'experience',
    year: '2025',
    title: 'AI Product Consultant & Computer Science Instructor',
    org: 'Tutora · Part-time',
    date: 'Mar 2021 - Present',
    logo: '/logos/Tutora Logo.jpeg',
    bullets: [
      'Saved 15+ hours/week through AI-driven scheduling and grading',
      'Developed 50+ TI-BASIC math programs, improving test scores by 35%',
      'Taught core computer science principles including data structures and Java programming',
    ],
  },
  {
    type: 'experience',
    year: '2021',
    title: 'System Administrator',
    org: 'University of Florida',
    date: 'Jan 2019 - May 2021',
    logo: '/logos/UF logo.jpeg',
    bullets: [
      'Managed Linux/Windows servers for the College of Liberal Arts and Sciences',
      'Provided IT support for 100+ faculty and staff',
      'Automated system backups and improved network reliability',
    ],
  },
  {
    type: 'experience',
    year: '2024',
    title: 'Cryptocurrency Research',
    org: 'Carnegie Mellon University',
    date: 'Jan 2024 - May 2024',
    logo: '/logos/carnegie_mellon_university_logo.jpeg',
    bullets: [
      'Researched and defined go-to-market strategy for a new digital asset targeting the gaming industry.',
      'Collaborated with cross-functional teams to analyze market trends and user adoption.',
    ],
  },
];

// Helper to extract end date (YYYYMM or '999999' for Present)
function getEndDateNum(dateStr: string): number {
  if (!dateStr) return 0;
  // Try to match 'Mon YYYY - Mon YYYY' or 'Mon YYYY - Present'
  const match = dateStr.match(/- ([A-Za-z]+ )?(\d{4}|Present)/);
  if (!match) return 0;
  const end = match[2] || match[1] || '';
  if (end === 'Present') return 202505; // treat as May 2025
  if (end === '2025') return 202505;
  // Try to get month and year
  const monthMap: { [key: string]: string } = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
  const monthMatch = match[1] ? match[1].trim() : '01';
  const year = match[2] && match[2] !== 'Present' ? match[2] : '0000';
  return parseInt(year + (monthMap[monthMatch] || '01'));
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

// Skills data with proper categorization and levels
const skillsData = {
  business: [
    { name: 'Product Management', level: 'expert', endorsements: 15, experiences: 3 },
    { name: 'Product Strategy', level: 'proficient', endorsements: 0, experiences: 7 },
    { name: 'Leadership', level: 'expert', endorsements: 28, experiences: 6 },
    { name: 'Customer Research', level: 'proficient', endorsements: 12, experiences: 6 },
    { name: 'Cross-functional Collaborations', level: 'proficient', endorsements: 13, experiences: 6 },
    { name: 'A/B Testing', level: 'proficient', endorsements: 8, experiences: 2 },
    { name: 'SQL & Excel', level: 'proficient', endorsements: 0, experiences: 6 },
    { name: 'Figma', level: 'proficient', endorsements: 0, experiences: 2 },
    { name: 'Agile Methods', level: 'proficient', endorsements: 0, experiences: 5 },
    { name: 'Lean Entrepreneurship', level: 'familiar', endorsements: 0, experiences: 3 },
    { name: 'Digital Transformation', level: 'familiar', endorsements: 0, experiences: 4 },
    { name: 'Project Management', level: 'proficient', endorsements: 0, experiences: 7 },
    { name: 'Business Development', level: 'familiar', endorsements: 0, experiences: 3 },
  ],
  data: [
    { name: 'AI Product Management', level: 'expert', endorsements: 13, experiences: 4 },
    { name: 'Computer Science', level: 'expert', endorsements: 28, experiences: 4 },
    { name: 'Machine Learning', level: 'familiar', endorsements: 0, experiences: 3 },
    { name: 'Computer Vision', level: 'familiar', endorsements: 7, experiences: 0 },
    { name: 'Data Analysis', level: 'expert', endorsements: 8, experiences: 9 },
    { name: 'Stakeholder Management', level: 'familiar', endorsements: 6, experiences: 0 },
    { name: 'Java & Python', level: 'familiar', endorsements: 0, experiences: 4 },
    { name: 'Android Development', level: 'familiar', endorsements: 0, experiences: 2 },
  ],
  engineering: [
    { name: 'System Administration', level: 'proficient', endorsements: 0, experiences: 3 },
    { name: 'Embedded Systems', level: 'proficient', endorsements: 0, experiences: 2 },
    { name: 'API Development', level: 'familiar', endorsements: 0, experiences: 2 },
  ],
  design: [
    { name: 'UI/UX Design', level: 'proficient', endorsements: 0, experiences: 3 },
    { name: 'Prototyping', level: 'proficient', endorsements: 0, experiences: 2 },
  ]
};

export default function Home() {
  const [bgError, setBgError] = useState(false);
  const [bgTriedAlt, setBgTriedAlt] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expYear, setExpYear] = useState('All');
  const [projectSection, setProjectSection] = useState('all');
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const expYears = Array.from(new Set(sortedTimelineEvents.filter(e => e.type === 'experience').map(e => e.year))).sort((a, b) => Number(b) - Number(a));
  const filteredExperiences = expYear === 'All'
    ? sortedTimelineEvents.filter(e => e.type === 'experience')
    : sortedTimelineEvents.filter(e => e.type === 'experience' && e.year === expYear);

  const filteredSkills = activeFilter === 'all' 
    ? Object.values(skillsData).flat()
    : skillsData[activeFilter] || [];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you! Your message has been sent successfully.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Project data organized by sections
  const projectSections = {
    all: [
      {
        title: "Expired Solutions",
        description: "AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT.",
        image: "/logos/expired_solutions_logo.jpeg",
        tags: ["AI/ML", "Product", "Startup"],
        link: "#",
        linkText: "Learn More",
        linkIcon: "external"
      },
      {
        title: "BBW Demo Presentation",
        description: "Enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week.",
        image: "/logos/bbw.jpg",
        tags: ["Enterprise", "AI", "Consulting"],
        link: "https://github.com/LawrenceHua/BBW_POC",
        linkText: "View Project",
        linkIcon: "github"
      },
      {
        title: "PanPalz",
        description: "Nonprofit social media platform. Led roadmap planning and UI design, refined 100+ Figma frames.",
        image: "/logos/Panpalz logo.jpeg",
        tags: ["Social Media", "UI/UX", "Nonprofit"],
        link: "https://panpalz.com",
        linkText: "View Project",
        linkIcon: "external"
      },
      {
        title: "Netflix A/B Testing Analysis",
        description: "Deep dive into Netflix's A/B testing methodologies and implementation.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        tags: ["Analysis", "A/B Testing"],
        link: "https://docs.google.com/presentation/d/1ii-Se5r_kFOnujyRiOX3i0j58Svz270OvletCi6Dblo/edit?usp=sharing",
        linkText: "View Analysis",
        linkIcon: "external"
      },
      {
        title: "Netflix Clone with KNN Model",
        description: "Developed a KNN model analyzing 10M+ reviews, implemented A/B testing, and visualized results with Grafana.",
        image: "/logos/netflixlogo.jpeg",
        tags: ["Machine Learning", "Data Analysis", "A/B Testing"],
        link: "https://docs.google.com/presentation/d/1G8CHLYjhbST7aTZ-ghWIaQ38CgRdV86MnioyHiZanTM/edit?slide=id.g31d10e42dea_0_0",
        linkText: "View Project",
        linkIcon: "external"
      },
      {
        title: "NFC Feature Prototype",
        description: "NFC-based feature prototype that won 1st place at Motorola Product Hackathon.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
        tags: ["NFC", "Prototype", "Hackathon"],
        link: "https://www.linkedin.com/posts/lawrencehua_hackathon-firstplace-innovation-activity-6862193706758393856-fjSi?utm_source=share&utm_medium=member_desktop&rcm=ACoAACoaVQoBe5_rWJwAB8-Fm4Zdm96i2nyD8xM",
        linkText: "View LinkedIn Post",
        linkIcon: "external"
      },
      {
        title: "Tutora AI Automation",
        description: "Built AI-driven scheduling, grading, and substitution flows saving 15+ hours/week.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
        tags: ["AI", "Automation", "Education"],
        link: "https://www.tutoraprep.com",
        linkText: "View Project",
        linkIcon: "external"
      },
      {
        title: "Valohai AI Tutorial",
        description: "Reproducible ML pipeline tutorial using Valohai for clean experiment tracking and version control.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        tags: ["ML Pipeline", "Python", "Valohai"],
        link: "https://github.com/LawrenceHua/Valohai-AI-tutorial",
        linkText: "View Project",
        linkIcon: "github"
      },
      {
        title: "Android + DB + RESTful Webservice",
        description: "Distributed systems project combining Android app, database, and RESTful web services for scalable architecture.",
        image: "/logos/DS project.png",
        tags: ["Android", "Database", "REST API"],
        link: "https://github.com/LawrenceHua/CMU-Projects/blob/main/Spring%202024/Distributed%20Systems/DS%20projects/Project%204%2C%20Android%20%2B%20DB%20%2B%20RESTful%20Webservice/README.pdf",
        linkText: "View Project",
        linkIcon: "external"
      },
      {
        title: "Professional Speaking",
        description: "Presented to a class of 30 students, receiving an A+ grade.",
        image: "/logos/professional speak.jpeg",
        tags: ["Presentation", "Education"],
        link: "https://docs.google.com/presentation/d/1A4cpxYo7PuTrZURfcOFTfyF5IDOHKwfxnfmIXerjqVM/edit?usp=sharing",
        linkText: "View Presentation",
        linkIcon: "external"
      },
      {
        title: "Cryptocurrency Research",
        description: "Researched and defined go-to-market strategy for a new digital asset targeting the gaming industry.",
        image: "/logos/carnegie_mellon_university_logo.jpeg",
        tags: ["Research", "Strategy", "Crypto"],
        link: "#",
        linkText: "Learn More",
        linkIcon: "external"
      }
    ],
    product: [
      {
        title: "Expired Solutions",
        description: "AI-powered platform reducing grocery shrink by up to 20% using computer vision and GPT.",
        image: "/logos/expired_solutions_logo.jpeg",
        tags: ["AI/ML", "Product", "Startup"],
        link: "#",
        linkText: "Learn More",
        linkIcon: "external"
      },
      {
        title: "BBW Demo Presentation",
        description: "Enterprise LLM-powered decision-support tool that reduced decision-making time by 18 hours/week.",
        image: "/logos/bbw.jpg",
        tags: ["Enterprise", "AI", "Consulting"],
        link: "https://github.com/LawrenceHua/BBW_POC",
        linkText: "View Project",
        linkIcon: "github"
      },
      {
        title: "PanPalz",
        description: "Nonprofit social media platform. Led roadmap planning and UI design, refined 100+ Figma frames.",
        image: "/logos/Panpalz logo.jpeg",
        tags: ["Social Media", "UI/UX", "Nonprofit"],
        link: "https://panpalz.com",
        linkText: "View Project",
        linkIcon: "external"
      },
      {
        title: "Netflix A/B Testing Analysis",
        description: "Deep dive into Netflix's A/B testing methodologies and implementation.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        tags: ["Analysis", "A/B Testing"],
        link: "https://docs.google.com/presentation/d/1ii-Se5r_kFOnujyRiOX3i0j58Svz270OvletCi6Dblo/edit?usp=sharing",
        linkText: "View Analysis",
        linkIcon: "external"
      }
    ],
    engineering: [
      {
        title: "Netflix Clone with KNN Model",
        description: "Developed a KNN model analyzing 10M+ reviews, implemented A/B testing, and visualized results with Grafana.",
        image: "/logos/netflixlogo.jpeg",
        tags: ["Machine Learning", "Data Analysis", "A/B Testing"],
        link: "https://docs.google.com/presentation/d/1G8CHLYjhbST7aTZ-ghWIaQ38CgRdV86MnioyHiZanTM/edit?slide=id.g31d10e42dea_0_0",
        linkText: "View Project",
        linkIcon: "external"
      },
      {
        title: "NFC Feature Prototype",
        description: "NFC-based feature prototype that won 1st place at Motorola Product Hackathon.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12",
        tags: ["NFC", "Prototype", "Hackathon"],
        link: "https://www.linkedin.com/posts/lawrencehua_hackathon-firstplace-innovation-activity-6862193706758393856-fjSi?utm_source=share&utm_medium=member_desktop&rcm=ACoAACoaVQoBe5_rWJwAB8-Fm4Zdm96i2nyD8xM",
        linkText: "View LinkedIn Post",
        linkIcon: "external"
      },
      {
        title: "Tutora AI Automation",
        description: "Built AI-driven scheduling, grading, and substitution flows saving 15+ hours/week.",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
        tags: ["AI", "Automation", "Education"],
        link: "https://www.tutoraprep.com",
        linkText: "View Project",
        linkIcon: "external"
      },
      {
        title: "Valohai AI Tutorial",
        description: "Reproducible ML pipeline tutorial using Valohai for clean experiment tracking and version control.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        tags: ["ML Pipeline", "Python", "Valohai"],
        link: "https://github.com/LawrenceHua/Valohai-AI-tutorial",
        linkText: "View Project",
        linkIcon: "github"
      },
      {
        title: "Android + DB + RESTful Webservice",
        description: "Distributed systems project combining Android app, database, and RESTful web services for scalable architecture.",
        image: "/logos/DS project.png",
        tags: ["Android", "Database", "REST API"],
        link: "https://github.com/LawrenceHua/CMU-Projects/blob/main/Spring%202024/Distributed%20Systems/DS%20projects/Project%204%2C%20Android%20%2B%20DB%20%2B%20RESTful%20Webservice/README.pdf",
        linkText: "View Project",
        linkIcon: "external"
      }
    ],
    fun: [
      {
        title: "Professional Speaking",
        description: "Presented to a class of 30 students, receiving an A+ grade.",
        image: "/logos/professional speak.jpeg",
        tags: ["Presentation", "Education"],
        link: "https://docs.google.com/presentation/d/1A4cpxYo7PuTrZURfcOFTfyF5IDOHKwfxnfmIXerjqVM/edit?usp=sharing",
        linkText: "View Presentation",
        linkIcon: "external"
      },
      {
        title: "Cryptocurrency Research",
        description: "Researched and defined go-to-market strategy for a new digital asset targeting the gaming industry.",
        image: "/logos/carnegie_mellon_university_logo.jpeg",
        tags: ["Research", "Strategy", "Crypto"],
        link: "#",
        linkText: "Learn More",
        linkIcon: "external"
      }
    ]
  };

  const currentProjects = projectSection === 'all' 
    ? (showAllProjects ? projectSections[projectSection] : projectSections[projectSection].slice(0, 5))
    : projectSections[projectSection] || [];
  const projectTypes = ['all', 'product', 'engineering', 'fun'];
  const currentTypeIndex = projectTypes.indexOf(projectSection);

  const nextProject = () => {
    const nextIndex = (currentTypeIndex + 1) % projectTypes.length;
    setProjectSection(projectTypes[nextIndex]);
    setShowAllProjects(false);
  };

  const prevProject = () => {
    const prevIndex = (currentTypeIndex - 1 + projectTypes.length) % projectTypes.length;
    setProjectSection(projectTypes[prevIndex]);
    setShowAllProjects(false);
  };

  return (
    <main className="min-h-screen">
      <Navigation />
      
      {/* Combined Hero + About Section with Background */}
      <section
        id="about"
        className="relative min-h-screen flex flex-col items-center justify-center bg-gray-900 overflow-hidden"
        style={{ minHeight: '80vh' }}
      >
        <div className="absolute inset-0 w-full h-full z-0">
          {!bgError ? (
            <Image
              src={bgTriedAlt ? "/@backgroundlogo.png" : "/BackgroundImageLogo.png"}
              alt=""
              fill
              className="object-cover object-center"
              style={{ filter: 'brightness(0.5) blur(1px)' }}
              priority
              onError={() => {
                if (!bgTriedAlt) setBgTriedAlt(true);
                else setBgError(true);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white text-lg opacity-80">
              <span>Background image failed to load. Showing fallback background.</span>
            </div>
          )}
        </div>
        <div className="relative z-10 w-full flex flex-col items-center justify-center px-0 py-20">
          {/* Redesigned About Card */}
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-8 px-6 py-10 bg-gray-900/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-900/30">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg bg-white">
                <Image
                  src="/profile.jpg"
                  alt="Lawrence Hua"
                  fill
                  className="object-contain object-center"
                  priority
                />
              </div>
              <h1 className="text-6xl font-extrabold text-white drop-shadow-lg text-center" style={{textShadow:'0 4px 24px #38bdf8, 0 1px 0 #000'}}>Lawrence W. Hua</h1>
              <div className="text-2xl text-blue-200 font-semibold drop-shadow text-center space-y-2" style={{textShadow:'0 2px 8px #0ea5e9'}}>
                <p>AI Product Manager</p>
                <p>Transforming Ideas into Impactful Digital Solutions</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center mb-2">
                <Link 
                  href="/resume.pdf"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiFileText className="w-5 h-5 mr-2" />
                  View Resume
                </Link>
                <Link 
                  href="https://www.linkedin.com/in/lawrencehua"
                  target="_blank"
                  className="inline-flex items-center px-6 py-3 bg-[#0077B5] text-white rounded-lg hover:bg-[#006399] transition-colors"
                >
                  <FaLinkedin className="w-5 h-5 mr-2" />
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>
          
          {/* Skills Section with Filtering and Segmentation */}
          <div className="relative z-10 w-full mt-8 px-4 py-8">
            <div className="skills-container">
              {/* Filter Bar */}
              <div className="skills-filter-bar justify-center items-center text-center">
                <button 
                  className={`skills-filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                  data-type="all"
                  onClick={() => setActiveFilter('all')}
                  style={{ minWidth: '64px' }}
                >
                  All Skills
                </button>
                <button 
                  className={`skills-filter-button ${activeFilter === 'business' ? 'active' : ''}`}
                  data-type="business"
                  onClick={() => setActiveFilter('business')}
                  style={{ minWidth: '64px' }}
                >
                  Business
                </button>
                <button 
                  className={`skills-filter-button ${activeFilter === 'data' ? 'active' : ''}`}
                  data-type="data"
                  onClick={() => setActiveFilter('data')}
                  style={{ minWidth: '64px' }}
                >
                  Data & AI
                </button>
                <button 
                  className={`skills-filter-button ${activeFilter === 'engineering' ? 'active' : ''}`}
                  data-type="engineering"
                  onClick={() => setActiveFilter('engineering')}
                  style={{ minWidth: '64px' }}
                >
                  Engineering
                </button>
                <button 
                  className={`skills-filter-button ${activeFilter === 'design' ? 'active' : ''}`}
                  data-type="design"
                  onClick={() => setActiveFilter('design')}
                  style={{ minWidth: '64px' }}
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
              <div className="text-center mb-4 p-2 bg-blue-900/40 rounded-lg border border-blue-700/50 inline-block mx-auto">
                <p className="text-blue-200 text-xs">💡 Hover over skills to see proficiency levels and experience details</p>
              </div>

              {/* Skills Grid */}
              <div className="skills-grid">
                {filteredSkills.map((skill, index) => (
                  <div
                    key={skill.name}
                    className="skill-item"
                    data-level={skill.level}
                    title={`${skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}: ${skill.endorsements} endorsements • ${skill.experiences} experiences`}
                  >
                    {skill.name}
                    <div className="skill-tooltip">
                      <div className="font-semibold">{skill.name}</div>
                      <div>Level: {skill.level.charAt(0).toUpperCase() + skill.level.slice(1)}</div>
                      <div>Endorsements: {skill.endorsements}</div>
                      <div>Experiences: {skill.experiences}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Timeline: Experience */}
      <section id="timeline" className="py-20 bg-gray-800">
        <div className="flex flex-col items-center w-full px-8 relative">
          <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent text-center">Career Timeline</h2>
          
          {/* Experience Section */}
          <h3 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent text-center">Experience</h3>
          
          {/* Year Navigation */}
          <div className="flex gap-4 mb-8 flex-wrap justify-center items-center text-center">
            <button
              className={`skills-filter-button${expYear === 'All' ? ' active' : ''}`}
              style={{ minWidth: '64px' }}
              onClick={() => setExpYear('All')}
            >
              All
            </button>
            {expYears.map(year => (
              <button
                key={year}
                className={`skills-filter-button${expYear === year ? ' active' : ''}`}
                style={{ minWidth: '64px' }}
                onClick={() => setExpYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
          
          {/* Career Timeline Row with Arrows */}
          <div className="w-full max-w-7xl mx-auto overflow-x-auto">
            <div className="flex items-center justify-center gap-4 min-w-max px-8">
              {(expYear === 'All' ? filteredExperiences : filteredExperiences.slice(0, 6)).map((item, idx, arr) => (
                <React.Fragment key={item.title + '-' + item.year + '-' + idx}>
                  <div className="flex flex-col items-center min-w-[200px] max-w-[220px]">
                    <div className="timeline-card bg-gray-900/90 border border-blue-900/30 shadow-xl p-4 rounded-2xl flex flex-col items-center w-full">
                      <Image src={item.logo} alt={item.org} width={60} height={60} className="rounded-full mb-3" />
                      <h3 className="text-base font-bold text-white mb-1 text-center leading-tight">{item.title}</h3>
                      <p className="text-blue-300 text-xs mb-1 text-center font-semibold">{item.org}</p>
                      <p className="text-gray-400 text-xs mb-2 text-center">{item.date}</p>
                      {item.bullets && (
                        <ul className="list-disc list-inside text-gray-300 space-y-1 text-xs text-left w-full">
                          {item.bullets.slice(0, 1).map((b, i) => <li key={b + '-' + i} className="text-xs">{b}</li>)}
                        </ul>
                      )}
                    </div>
                    <div className="timeline-year-circle mt-2 text-sm">{item.year}</div>
                  </div>
                  
                  {/* Arrow pointing left (toward older items) */}
                  {idx < arr.length - 1 && (
                    <div className="flex items-center justify-center w-12 h-12">
                      <svg 
                        className="w-8 h-8 text-blue-400 transform rotate-180" 
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

          {/* Education Section - Static */}
          <h3 className="text-3xl font-semibold mb-6 mt-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Education</h3>
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex justify-start items-center gap-8 w-full">
              {sortedTimelineEvents.filter(e => e.type === 'education').map((item, idx, arr) => (
                <React.Fragment key={item.year + '-' + idx}>
                  <div className="flex flex-col items-center">
                    <div className="timeline-card text-left">
                      <Image src={item.logo} alt={item.org} width={40} height={40} className="rounded mb-3 mx-auto" />
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-2">{item.org}</p>
                      <p className="text-gray-400 text-xs mb-3">{item.date}</p>
                      {item.details && (
                        <ul className="list-disc list-inside text-gray-300 space-y-1 text-xs text-left">
                          {item.details.map((d, i) => <li key={d + '-' + i}>{d}</li>)}
                        </ul>
                      )}
                    </div>
                    <div className="timeline-year-circle">{item.year}</div>
                  </div>
                  {idx < arr.length - 1 && (
                    <div className="timeline-connector-horizontal-static" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="section-container">
        <div className="section-content">
          <h2 className="section-title">Projects</h2>
          <p className="section-subtitle">A showcase of my work across different domains</p>
          
          {/* Project Filters */}
          <div className="project-filters">
            <button 
              className={`project-filter ${projectSection === 'all' ? 'active' : ''}`}
              onClick={() => {
                setProjectSection('all');
                setShowAllProjects(false);
              }}
            >
              <span className="project-filter-label">All Projects</span>
              <span className="project-filter-count">{projectSections.all.length}</span>
            </button>
            <button 
              className={`project-filter ${projectSection === 'product' ? 'active' : ''}`}
              onClick={() => {
                setProjectSection('product');
                setShowAllProjects(false);
              }}
            >
              <span className="project-filter-label">Product Related</span>
              <span className="project-filter-count">{projectSections.product.length}</span>
            </button>
            <button 
              className={`project-filter ${projectSection === 'engineering' ? 'active' : ''}`}
              onClick={() => {
                setProjectSection('engineering');
                setShowAllProjects(false);
              }}
            >
              <span className="project-filter-label">Engineering Related</span>
              <span className="project-filter-count">{projectSections.engineering.length}</span>
            </button>
            <button 
              className={`project-filter ${projectSection === 'fun' ? 'active' : ''}`}
              onClick={() => {
                setProjectSection('fun');
                setShowAllProjects(false);
              }}
            >
              <span className="project-filter-label">Fun</span>
              <span className="project-filter-count">{projectSections.fun.length}</span>
            </button>
          </div>

          {/* Project Carousel */}
          <div className="project-carousel">
            <button className="project-arrow left" onClick={prevProject}>
              <svg 
                className="w-8 h-8 text-blue-400 transform rotate-180" 
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
            </button>
            <div className="project-container">
              <div className="project-grid">
                {currentProjects.map((project, index) => (
                  <div key={project.title} className="project-card">
                    <div className="project-image">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="project-details">
                      <h3 className="text-xl font-bold mb-2 text-white">{project.title}</h3>
                      <p className="text-gray-300 mb-4">{project.description}</p>
                      <div className="project-tags">
                        {project.tags.map((tag, tagIndex) => (
                          <span key={tag + '-' + tagIndex} className="px-2 py-1 bg-blue-600 text-white text-xs rounded mr-2 mb-2">{tag}</span>
                        ))}
                      </div>
                      <div className="project-actions">
                        <Link 
                          href={project.link}
                          target="_blank"
                          className="inline-flex items-center text-blue-400 hover:text-blue-300"
                        >
                          {project.linkText}
                          {project.linkIcon === "external" && <FiExternalLink className="w-4 h-4 ml-2" />}
                          {project.linkIcon === "github" && <FiGithub className="w-4 h-4 ml-2" />}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="project-arrow right" onClick={nextProject}>
              <svg 
                className="w-8 h-8 text-blue-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 8l4 4m0 0l4-4m-4 4H3"
                />
              </svg>
            </button>
          </div>
          
          {/* View More Button for All Projects */}
          {projectSection === 'all' && !showAllProjects && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAllProjects(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
              >
                <span>View More Projects</span>
                <svg 
                  className="w-5 h-5 transform transition-transform duration-200" 
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
          )}
          
          {/* View Less Button for All Projects */}
          {projectSection === 'all' && showAllProjects && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowAllProjects(false)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
              >
                <span>View Less</span>
                <svg 
                  className="w-5 h-5 transform rotate-180 transition-transform duration-200" 
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
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      <section id="recommendations" className="section-container">
        <div className="section-content">
          <h2 className="section-title">Recommendations</h2>
          <p className="section-subtitle">What colleagues and mentors say about my work and character</p>
          
          <div className="recommendations-container">
            <div className="animate-scroll">
              {/* Original Cards */}
              {/* JJ Xu */}
              <div className="flex-shrink-0 w-[400px] bg-gray-900 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Image src="/logos/JJ.jpeg" alt="JJ Xu" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">JJ Xu</h3>
                    <p className="text-gray-400">Founder & CEO @ TalkMeUp</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Lawrence approached every challenge with curiosity, grit, and a clear desire to create something meaningful. He combined his technical background with a strong product mindset, conducting thoughtful customer discovery and iterating quickly based on feedback."
                </p>
              </div>

              {/* Wendy Williams */}
              <div className="flex-shrink-0 w-[400px] bg-gray-900 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Image src="/logos/Wendy.jpeg" alt="Wendy Williams" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Wendy Williams</h3>
                    <p className="text-gray-400">IT Director at University of Florida</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Lawrence was one of my top System Administrators. He is a conscientious worker and was ready to take on any task. He has a very pleasant demeanor and got along well with all the office staff and administration."
                </p>
              </div>

              {/* Shyam Sundar */}
              <div className="flex-shrink-0 w-[400px] bg-gray-900 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Image src="/logos/Shyam.jpeg" alt="Shyam Sundar" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Shyam Sundar</h3>
                    <p className="text-gray-400">Android Frameworks Engineer</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Lawrence exhibited great skills with his ability to solve complex issues on the front-end, dedication to stay motivated even through a fully online program and adapt to Motorola's technology quickly."
                </p>
              </div>

              {/* Duplicate Cards for Infinite Scroll */}
              {/* JJ Xu */}
              <div className="flex-shrink-0 w-[400px] bg-gray-900 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Image src="/logos/JJ.jpeg" alt="JJ Xu" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">JJ Xu</h3>
                    <p className="text-gray-400">Founder & CEO @ TalkMeUp</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Lawrence approached every challenge with curiosity, grit, and a clear desire to create something meaningful. He combined his technical background with a strong product mindset, conducting thoughtful customer discovery and iterating quickly based on feedback."
                </p>
              </div>

              {/* Wendy Williams */}
              <div className="flex-shrink-0 w-[400px] bg-gray-900 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Image src="/logos/Wendy.jpeg" alt="Wendy Williams" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Wendy Williams</h3>
                    <p className="text-gray-400">IT Director at University of Florida</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Lawrence was one of my top System Administrators. He is a conscientious worker and was ready to take on any task. He has a very pleasant demeanor and got along well with all the office staff and administration."
                </p>
              </div>

              {/* Shyam Sundar */}
              <div className="flex-shrink-0 w-[400px] bg-gray-900 p-6 rounded-lg border border-blue-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Image src="/logos/Shyam.jpeg" alt="Shyam Sundar" width={48} height={48} className="rounded-full" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Shyam Sundar</h3>
                    <p className="text-gray-400">Android Frameworks Engineer</p>
                  </div>
                </div>
                <p className="text-gray-300">
                  "Lawrence exhibited great skills with his ability to solve complex issues on the front-end, dedication to stay motivated even through a fully online program and adapt to Motorola's technology quickly."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-container">
        <div className="section-content">
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">Let's discuss opportunities, collaborations, or just say hello</p>
          
          <div className="contact-form">
            <form 
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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
                <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
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
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message</label>
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
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{submitMessage}</span>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                  <span className="block sm:inline">{submitMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
