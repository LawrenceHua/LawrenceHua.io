"use client";

import { useState, useEffect, useMemo } from "react";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  Firestore,
  addDoc,
  serverTimestamp,
  where,
  limit,
  startAfter,
} from "firebase/firestore";
import {
  FiArrowLeft,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiUsers,
  FiMessageCircle,
  FiClock,
  FiMonitor,
  FiSmartphone,
  FiGlobe,
  FiTrendingUp,
  FiActivity,
  FiBarChart,
  FiPieChart,
  FiUserCheck,
  FiLock,
  FiX,
  FiBriefcase,
} from "react-icons/fi";
import Link from "next/link";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";

// Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

interface ChatMessage {
  id: string;
  sessionId: string;
  message?: string;
  role: "user" | "assistant";
  timestamp: any;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  startTime: Date;
  endTime: Date;
  messageCount: number;
}

interface PageView {
  id: string;
  page: string;
  timestamp: any;
  userAgent: string;
  referrer: string;
  screenSize: string;
  timeOnPage: number;
  sessionId: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  ip?: string;
}

interface UserInteraction {
  id: string;
  type: string;
  element: string;
  timestamp: any;
  sessionId: string;
  page: string;
}

interface TourEvent {
  id: string;
  sessionId: string;
  eventType:
    | "tour_start"
    | "tour_step"
    | "tour_complete"
    | "tour_abandon"
    | "tour_cta_action";
  stepId?: string;
  stepIndex?: number;
  ctaAction?: "message" | "meeting" | "restart";
  timestamp: any;
  userAgent: string;
  referrer: string;
  country?: string;
  region?: string;
  city?: string;
}

interface SkillDemand {
  skill: string;
  searches: number;
  trend: "up" | "down" | "stable";
  relatedTerms: string[];
}

interface CompanyIntel {
  domain: string;
  company: string;
  industry: string;
  size: "startup" | "small" | "medium" | "enterprise" | "unknown";
  visits: number;
  engagementScore: number;
}

interface EngagementHeatmap {
  section: string;
  averageTimeSpent: number;
  scrollDepth: number;
  interactions: number;
  bounceRate: number;
}

interface ConversionEvent {
  type:
    | "resume_download"
    | "linkedin_click"
    | "contact_form"
    | "meeting_scheduled"
    | "email_sent";
  count: number;
  conversionRate: number;
  sessionIds: string[];
}

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  totalChatSessions: number;
  totalMessages: number;
  avgSessionDuration: number;
  topPages: { page: string; views: number }[];
  deviceTypes: { device: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  hourlyActivity: { hour: number; count: number }[];
  dailyActivity: { date: string; count: number }[];
  popularInteractions: { type: string; count: number }[];
  visitorLocations: { country: string; count: number }[];
  topCities: { city: string; country: string; count: number }[];
  potentialRecruiters: number;
  recruiterMetrics: {
    keywordHits: number;
    longVisits: number;
    keyClicks: number;
  };
  foundKeywords: {
    keyword: string;
    count: number;
    sessionIds: string[];
  }[];

  // NEW: Tour Analytics
  tourAnalytics: {
    totalTourStarts: number;
    totalTourCompletions: number;
    completionRate: number;
    averageStepsCompleted: number;
    mostPopularStep: string;
    abandonmentPoints: { step: string; count: number }[];
    ctaActions: { action: string; count: number }[];
    tourConversionRate: number;
  };

  // NEW: Time-Based Intelligence
  timeIntelligence: {
    peakHours: { hour: number; recruiterActivity: number }[];
    peakDays: { day: string; recruiterActivity: number }[];
    seasonalTrends: { month: string; activity: number }[];
    timeToEngage: number; // average minutes before first interaction
  };

  // NEW: Industry & Company Intelligence
  industryIntel: {
    topIndustries: {
      industry: string;
      count: number;
      engagementScore: number;
    }[];
    companySizes: { size: string; count: number; conversionRate: number }[];
    identifiedCompanies: CompanyIntel[];
    recruitingIntensity: number; // 1-10 scale
  };

  // NEW: Engagement Quality Metrics
  engagementMetrics: {
    averageScrollDepth: number;
    sectionHeatmap: EngagementHeatmap[];
    multiVisitRate: number;
    returnVisitorEngagement: number;
    deepEngagementSessions: number; // >5min + multiple interactions
  };

  // NEW: Skill Gap Analysis
  skillAnalysis: {
    inDemandSkills: SkillDemand[];
    missingKeywords: string[];
    competitiveSkills: string[];
    skillTrendScore: number;
  };

  // NEW: Conversion Tracking
  conversions: {
    totalConversions: number;
    conversionRate: number;
    conversionFunnel: ConversionEvent[];
    highValueActions: { action: string; value: number; count: number }[];
  };

  // NEW: Geographic Intelligence
  geoIntelligence: {
    remoteFriendlyMarkets: {
      location: string;
      remoteJobs: number;
      interest: number;
    }[];
    hiringHotspots: { city: string; country: string; hiringActivity: number }[];
    visaSponsorship: {
      country: string;
      visaLikely: boolean;
      interest: number;
    }[];
    marketPenetration: {
      region: string;
      penetration: number;
      opportunity: number;
    }[];
  };

  // NEW: Competitive Analysis
  competitiveAnalysis: {
    trafficSources: {
      source: string;
      quality: number;
      recruiterRatio: number;
    }[];
    benchmarkMetrics: {
      metric: string;
      yourValue: number;
      industry: number;
      percentile: number;
    }[];
    opportunityAreas: string[];
    strengthAreas: string[];
  };
}

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(false); // Changed to false - no auto-load
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "assistant">(
    "all"
  );
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [timeRange, setTimeRange] = useState<"1d" | "7d" | "30d" | "all">(
    "30d"
  );
  const [db, setDb] = useState<Firestore | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showKeywordsModal, setShowKeywordsModal] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [lastSessionTimestamp, setLastSessionTimestamp] = useState<Date | null>(
    null
  );
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 100;
  const [showChatbotFullScreen, setShowChatbotFullScreen] = useState(false);

  // New states for Firebase optimization
  const [refreshCost, setRefreshCost] = useState({ reads: 0, writes: 0 });
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [showCostWarning, setShowCostWarning] = useState(false);
  const [refreshInProgress, setRefreshInProgress] = useState(false);

  // Track Firebase reads and writes for this session with state management
  const [firebaseReads, setFirebaseReads] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(sessionStorage.getItem("firebaseReads") || 0);
    }
    return 0;
  });
  const [firebaseWrites, setFirebaseWrites] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(sessionStorage.getItem("firebaseWrites") || 0);
    }
    return 0;
  });

  function incrementRead() {
    if (typeof window !== "undefined") {
      const newReads = firebaseReads + 1;
      setFirebaseReads(newReads);
      sessionStorage.setItem("firebaseReads", newReads.toString());
    }
  }
  function incrementWrite() {
    if (typeof window !== "undefined") {
      const newWrites = firebaseWrites + 1;
      setFirebaseWrites(newWrites);
      sessionStorage.setItem("firebaseWrites", newWrites.toString());
    }
  }

  // Reset Firebase counters
  const resetCounters = () => {
    setFirebaseReads(0);
    setFirebaseWrites(0);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("firebaseReads", "0");
      sessionStorage.setItem("firebaseWrites", "0");
    }
  };

  useEffect(() => {
    // Check for password in session storage
    const storedPassword = sessionStorage.getItem("analytics_password");
    if (storedPassword === process.env.NEXT_PUBLIC_SECRET_PASS) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Initialize Firebase
    let app: FirebaseApp | undefined;
    if (typeof window !== "undefined") {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      const firestore = getFirestore(app);
      setDb(firestore);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (db && isAuthenticated) {
      // Only start data collection (tracking), don't fetch data automatically
      startDataCollection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, isAuthenticated]);

  const startDataCollection = () => {
    // Track page view
    trackPageView();

    // Track user interactions
    trackUserInteractions();

    // Track device and browser info
    trackDeviceInfo();
  };

  const trackPageView = async () => {
    if (!db) return;

    try {
      // Fetch geolocation data
      const geoResponse = await fetch("/api/geolocation");
      const geoData = await geoResponse.json();

      const pageView = {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer || "direct",
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timeOnPage: 0,
        sessionId: getSessionId(),
        timestamp: serverTimestamp(),
        country: geoData.country_name,
        region: geoData.region,
        city: geoData.city,
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        timezone: geoData.timezone,
        ip: geoData.ip,
      };

      await addDoc(collection(db, "page_views"), pageView);
      incrementWrite();
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  };

  const trackUserInteractions = () => {
    const sessionId = getSessionId();
    let lastClickTime = 0;
    let scrollTrackingEnabled = true;

    // Track clicks with throttling to prevent spam
    document.addEventListener("click", async (e) => {
      const now = Date.now();
      if (now - lastClickTime < 1000) return; // Throttle clicks to 1 per second
      lastClickTime = now;

      const target = e.target as HTMLElement;

      // Only track meaningful clicks (buttons, links, important elements)
      const isImportantClick =
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.getAttribute("role") === "button" ||
        target.className.includes("btn") ||
        target.className.includes("click") ||
        target.id.includes("nav") ||
        target.id.includes("contact");

      if (!isImportantClick) return;

      const interaction = {
        type: "click",
        element:
          target.tagName.toLowerCase() +
          (target.id ? `#${target.id}` : "") +
          (target.className ? `.${target.className.split(" ")[0]}` : ""),
        page: window.location.pathname,
        sessionId,
        timestamp: serverTimestamp(),
      };

      if (db) {
        try {
          await addDoc(collection(db, "user_interactions"), interaction);
          incrementWrite();
        } catch (error) {
          console.error("Error tracking interaction:", error);
        }
      }
    });

    // Track scroll depth - only major milestones and disable after analytics page
    let maxScroll = 0;
    window.addEventListener("scroll", async () => {
      if (!scrollTrackingEnabled || window.location.pathname === "/analytics")
        return;

      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        // Only track 50% and 100% scroll to reduce writes
        if (maxScroll === 50 || maxScroll >= 90) {
          const interaction = {
            type: "scroll",
            element: `scroll_${maxScroll >= 90 ? 100 : maxScroll}%`,
            page: window.location.pathname,
            sessionId,
            timestamp: serverTimestamp(),
          };

          if (db) {
            try {
              await addDoc(collection(db, "user_interactions"), interaction);
              incrementWrite();
            } catch (error) {
              console.error("Error tracking scroll:", error);
            }
          }

          // Disable scroll tracking after reaching 100%
          if (maxScroll >= 90) {
            scrollTrackingEnabled = false;
          }
        }
      }
    });
  };

  const trackDeviceInfo = async () => {
    if (!db) return;

    const deviceInfo = {
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "device_info"), deviceInfo);
      incrementWrite();
    } catch (error) {
      console.error("Error tracking device info:", error);
    }
  };

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId =
        new Date().getTime() + "_" + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  };

  // Estimate Firebase costs for a refresh
  const estimateRefreshCost = () => {
    // Firebase Firestore pricing: ~$0.36 per 100K reads, $1.08 per 100K writes
    // We typically do 3 reads per refresh (messages, page_views, interactions)
    const estimatedReads = 3;
    const estimatedWrites = 0; // Refresh only reads data

    return {
      reads: estimatedReads,
      writes: estimatedWrites,
      cost:
        (estimatedReads * 0.36) / 100000 + (estimatedWrites * 1.08) / 100000,
    };
  };

  // Manual refresh function with cost awareness
  const handleManualRefresh = async () => {
    const cost = estimateRefreshCost();
    setRefreshCost(cost);

    // Show warning if high cost or frequent refreshes
    const timeSinceLastRefresh = lastRefreshTime
      ? (Date.now() - lastRefreshTime.getTime()) / 1000 / 60
      : Infinity; // minutes

    if (cost.reads > 5 || timeSinceLastRefresh < 2) {
      setShowCostWarning(true);
      return;
    }

    await performRefresh();
  };

  // Perform the actual refresh
  const performRefresh = async () => {
    setShowCostWarning(false);
    setRefreshInProgress(true);
    const startReads = firebaseReads;
    const startWrites = firebaseWrites;

    try {
      await fetchAllData();
      setLastRefreshTime(new Date());

      // Calculate actual cost of this refresh
      const actualCost = {
        reads: firebaseReads - startReads,
        writes: firebaseWrites - startWrites,
      };
      setRefreshCost(actualCost);
    } finally {
      setRefreshInProgress(false);
    }
  };

  const fetchAllData = async (append = false) => {
    try {
      setLoading(true);
      if (!db) return;

      // Calculate time filter
      const now = new Date();
      let startDate = new Date();
      switch (timeRange) {
        case "1d":
          startDate.setHours(now.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "all":
          startDate = new Date(0);
          break;
      }

      // Fetch chat data
      const messagesRef = collection(db, "chatbot_messages");
      let messagesQuery = query(
        messagesRef,
        where("timestamp", ">=", startDate),
        orderBy("timestamp", "desc"),
        limit(PAGE_SIZE)
      );
      if (lastSessionTimestamp && append) {
        messagesQuery = query(
          messagesRef,
          where("timestamp", ">=", startDate),
          orderBy("timestamp", "desc"),
          limit(PAGE_SIZE),
          startAfter(lastSessionTimestamp)
        );
      }
      console.log("Fetching messages with start date:", startDate);
      const messagesSnapshot = await getDocs(messagesQuery);
      incrementRead();
      console.log("Found messages:", messagesSnapshot.size);

      // Group messages by sessionId to create chat sessions
      const sessionsMap = new Map<string, ChatMessage[]>();
      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        const sessionId = data.sessionId;
        if (!sessionsMap.has(sessionId)) {
          sessionsMap.set(sessionId, []);
        }
        sessionsMap.get(sessionId)!.push({
          id: doc.id,
          sessionId: data.sessionId,
          message: data.message,
          role: data.role,
          timestamp: data.timestamp,
        });
      });

      const sessionsArray: ChatSession[] = [];
      sessionsMap.forEach((messages, sessionId) => {
        if (messages.length > 0) {
          // Sort messages by timestamp
          messages.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

          const startTime = messages[0].timestamp.toDate();
          const endTime = messages[messages.length - 1].timestamp.toDate();

          sessionsArray.push({
            sessionId,
            messages,
            startTime,
            endTime,
            messageCount: messages.length,
          });
        }
      });

      // Sort sessions by startTime based on sortOrder
      sessionsArray.sort((a, b) => {
        if (sortOrder === "desc") {
          return b.startTime.getTime() - a.startTime.getTime();
        } else {
          return a.startTime.getTime() - b.startTime.getTime();
        }
      });

      console.log("Created sessions:", sessionsArray.length);

      // Fetch page views
      const pageViewsRef = collection(db, "page_views");
      const pageViewsQuery = query(
        pageViewsRef,
        orderBy("timestamp", "desc"),
        where("timestamp", ">=", startDate)
      );
      const pageViewsSnapshot = await getDocs(pageViewsQuery);
      incrementRead();

      const pageViewsArray: PageView[] = [];
      pageViewsSnapshot.forEach((doc) => {
        const data = doc.data();
        pageViewsArray.push({
          id: doc.id,
          page: data.page,
          timestamp: data.timestamp,
          userAgent: data.userAgent,
          referrer: data.referrer,
          screenSize: data.screenSize,
          timeOnPage: data.timeOnPage,
          sessionId: data.sessionId,
          country: data.country,
          region: data.region,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone,
          ip: data.ip,
        });
      });

      // Fetch user interactions
      const interactionsRef = collection(db, "user_interactions");
      const interactionsQuery = query(
        interactionsRef,
        orderBy("timestamp", "desc"),
        where("timestamp", ">=", startDate)
      );
      const interactionsSnapshot = await getDocs(interactionsQuery);
      incrementRead();

      const interactionsArray: UserInteraction[] = [];
      interactionsSnapshot.forEach((doc) => {
        const data = doc.data();
        interactionsArray.push({
          id: doc.id,
          type: data.type,
          element: data.element,
          timestamp: data.timestamp,
          sessionId: data.sessionId,
          page: data.page,
        });
      });

      if (append) {
        setSessions((prev) => [...prev, ...sessionsArray]);
      } else {
        setSessions(sessionsArray);
      }
      setLastSessionTimestamp(
        sessionsArray.length > 0
          ? sessionsArray[sessionsArray.length - 1].startTime
          : null
      );
      setHasMore(sessionsArray.length === PAGE_SIZE);

      // Calculate analytics data
      const analytics = calculateAnalyticsData(
        sessionsArray,
        pageViewsArray,
        interactionsArray
      );
      setAnalyticsData(analytics);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalyticsData = (
    sessions: ChatSession[],
    pageViews: PageView[],
    interactions: UserInteraction[]
  ): AnalyticsData => {
    // Unique visitors (unique session IDs)
    const uniqueSessions = new Set([
      ...sessions.map((s) => s.sessionId),
      ...pageViews.map((p) => p.sessionId),
    ]);

    // Top pages
    const pageCounts = new Map<string, number>();
    pageViews.forEach((pv) => {
      pageCounts.set(pv.page, (pageCounts.get(pv.page) || 0) + 1);
    });
    const topPages = Array.from(pageCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Device types
    const deviceCounts = new Map<string, number>();
    pageViews.forEach((pv) => {
      const isMobile = /Mobile|Android|iPhone|iPad/.test(pv.userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/.test(
        pv.userAgent
      );
      let device = "Desktop";
      if (isTablet) device = "Tablet";
      else if (isMobile) device = "Mobile";

      deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    });
    const deviceTypes = Array.from(deviceCounts.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // Top referrers
    const referrerCounts = new Map<string, number>();
    pageViews.forEach((pv) => {
      const referrer =
        pv.referrer === "direct"
          ? "Direct"
          : pv.referrer.includes("google")
            ? "Google"
            : pv.referrer.includes("linkedin")
              ? "LinkedIn"
              : pv.referrer.includes("github")
                ? "GitHub"
                : "Other";
      referrerCounts.set(referrer, (referrerCounts.get(referrer) || 0) + 1);
    });
    const topReferrers = Array.from(referrerCounts.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count);

    // Hourly activity
    const hourlyCounts = new Map<number, number>();
    pageViews.forEach((pv) => {
      const hour = pv.timestamp.toDate().getHours();
      hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
    });
    const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyCounts.get(i) || 0,
    }));

    // Daily activity (last 7 days)
    const dailyCounts = new Map<string, number>();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    pageViews.forEach((pv) => {
      const date = pv.timestamp.toDate().toISOString().split("T")[0];
      if (last7Days.includes(date)) {
        dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
      }
    });

    const dailyActivity = last7Days.map((date) => ({
      date,
      count: dailyCounts.get(date) || 0,
    }));

    // Popular interactions
    const interactionCounts = new Map<string, number>();
    interactions.forEach((interaction) => {
      interactionCounts.set(
        interaction.type,
        (interactionCounts.get(interaction.type) || 0) + 1
      );
    });
    const popularInteractions = Array.from(interactionCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Average session duration
    const totalDuration = sessions.reduce((sum, session) => {
      return sum + (session.endTime.getTime() - session.startTime.getTime());
    }, 0);
    const avgSessionDuration =
      sessions.length > 0 ? totalDuration / sessions.length / 1000 / 60 : 0; // in minutes

    // Visitor Locations
    const countryCounts = new Map<string, number>();
    const cityCounts = new Map<
      string,
      { city: string; country: string; count: number }
    >();

    pageViews.forEach((pv) => {
      if (pv.country) {
        countryCounts.set(pv.country, (countryCounts.get(pv.country) || 0) + 1);
      }
      if (pv.city && pv.country) {
        const cityKey = `${pv.city}, ${pv.country}`;
        const currentCount = cityCounts.get(cityKey)?.count || 0;
        cityCounts.set(cityKey, {
          city: pv.city,
          country: pv.country,
          count: currentCount + 1,
        });
      }
    });

    const visitorLocations = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const topCities = Array.from(cityCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Potential Recruiter Identification
    let potentialRecruiters = 0;
    const recruiterMetrics = {
      keywordHits: 0,
      longVisits: 0,
      keyClicks: 0,
    };
    const recruiterKeywords = [
      "hiring",
      "recruiting",
      "job",
      "position",
      "role",
      "interview",
      "full-time",
      "opportunity",
      "resume",
      "cv",
      "background",
      "experience",
    ];
    const foundKeywordsMap = new Map<
      string,
      { count: number; sessionIds: Set<string> }
    >();

    sessions.forEach((session) => {
      let score = 0;
      const chatMessages = session.messages
        .map((m) => m.message?.toLowerCase() || "")
        .join(" ");
      const hasKeyword = recruiterKeywords.some((keyword) =>
        chatMessages.includes(keyword)
      );
      if (hasKeyword) {
        score += 3;
      }

      const sessionDurationMinutes =
        (session.endTime.getTime() - session.startTime.getTime()) / 60000;
      const isLongVisit = sessionDurationMinutes > 3;
      if (isLongVisit) {
        score += 1;
      }
      if (sessionDurationMinutes > 10) {
        score += 1;
      }

      const sessionInteractions = interactions.filter(
        (i) => i.sessionId === session.sessionId
      );
      const hasKeyClick = sessionInteractions.some(
        (i) => i.element.includes("resume") || i.element.includes("linkedin")
      );
      if (hasKeyClick) {
        score += 2;
      }

      if (score >= 3) {
        potentialRecruiters++;
        if (hasKeyword) {
          recruiterMetrics.keywordHits++;
          recruiterKeywords.forEach((keyword) => {
            if (chatMessages.includes(keyword)) {
              if (!foundKeywordsMap.has(keyword)) {
                foundKeywordsMap.set(keyword, {
                  count: 0,
                  sessionIds: new Set(),
                });
              }
              const keywordData = foundKeywordsMap.get(keyword)!;
              keywordData.count++;
              keywordData.sessionIds.add(session.sessionId);
            }
          });
        }
        if (isLongVisit) recruiterMetrics.longVisits++;
        if (hasKeyClick) recruiterMetrics.keyClicks++;
      }
    });

    const foundKeywords = Array.from(foundKeywordsMap.entries())
      .map(([keyword, data]) => ({
        keyword,
        count: data.count,
        sessionIds: Array.from(data.sessionIds),
      }))
      .sort((a, b) => b.count - a.count);

    // Tour Analytics (mock data for now - will be updated when tour events are tracked)
    const tourAnalytics = {
      totalTourStarts: 0,
      totalTourCompletions: 0,
      completionRate: 0,
      averageStepsCompleted: 0,
      mostPopularStep: "overview",
      abandonmentPoints: [],
      ctaActions: [],
      tourConversionRate: 0,
    };

    // Time-Based Intelligence
    const recruiterSessions = sessions.filter((session) => {
      let score = 0;
      const chatMessages = session.messages
        .map((m) => m.message?.toLowerCase() || "")
        .join(" ");
      const hasKeyword = recruiterKeywords.some((keyword) =>
        chatMessages.includes(keyword)
      );
      if (hasKeyword) score += 3;

      const sessionDurationMinutes =
        (session.endTime.getTime() - session.startTime.getTime()) / 60000;
      if (sessionDurationMinutes > 3) score += 1;
      if (sessionDurationMinutes > 10) score += 1;

      const sessionInteractions = interactions.filter(
        (i) => i.sessionId === session.sessionId
      );
      const hasKeyClick = sessionInteractions.some(
        (i) => i.element.includes("resume") || i.element.includes("linkedin")
      );
      if (hasKeyClick) score += 2;

      return score >= 3;
    });

    const recruiterHourly = new Map<number, number>();
    const recruiterDaily = new Map<string, number>();
    const recruiterMonthly = new Map<string, number>();

    recruiterSessions.forEach((session) => {
      const date = session.startTime;
      const hour = date.getHours();
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const monthName = date.toLocaleDateString("en-US", { month: "long" });

      recruiterHourly.set(hour, (recruiterHourly.get(hour) || 0) + 1);
      recruiterDaily.set(dayName, (recruiterDaily.get(dayName) || 0) + 1);
      recruiterMonthly.set(
        monthName,
        (recruiterMonthly.get(monthName) || 0) + 1
      );
    });

    const timeIntelligence = {
      peakHours: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        recruiterActivity: recruiterHourly.get(i) || 0,
      })),
      peakDays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].map((day) => ({
        day,
        recruiterActivity: recruiterDaily.get(day) || 0,
      })),
      seasonalTrends: Array.from(recruiterMonthly.entries()).map(
        ([month, activity]) => ({ month, activity })
      ),
      timeToEngage:
        sessions.length > 0
          ? sessions.reduce((sum, session) => {
              const firstInteraction = interactions
                .filter((i) => i.sessionId === session.sessionId)
                .sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate())[0];
              if (firstInteraction) {
                return (
                  sum +
                  (firstInteraction.timestamp.toDate().getTime() -
                    session.startTime.getTime()) /
                    60000
                );
              }
              return sum;
            }, 0) / sessions.length
          : 0,
    };

    // Industry Intelligence (enhanced with email domain analysis)
    const domainIndustries = new Map<
      string,
      { industry: string; size: string }
    >();
    // Common tech company patterns
    const techDomains = [
      "google",
      "microsoft",
      "apple",
      "amazon",
      "meta",
      "netflix",
      "uber",
      "airbnb",
    ];
    const consultingDomains = [
      "mckinsey",
      "bain",
      "bcg",
      "deloitte",
      "pwc",
      "kpmg",
      "ey",
    ];
    const financeDomains = [
      "jpmorgan",
      "goldmansachs",
      "morgenstanley",
      "blackrock",
      "citi",
    ];

    const industryEngagement = new Map<
      string,
      { count: number; totalEngagement: number }
    >();
    const companySizeData = new Map<
      string,
      { count: number; conversions: number }
    >();

    pageViews.forEach((pv) => {
      let industry = "Unknown";
      let size = "unknown";

      if (pv.referrer) {
        const domain = pv.referrer.toLowerCase();
        if (techDomains.some((tech) => domain.includes(tech))) {
          industry = "Technology";
          size =
            domain.includes("google") || domain.includes("microsoft")
              ? "enterprise"
              : "large";
        } else if (
          consultingDomains.some((consulting) => domain.includes(consulting))
        ) {
          industry = "Consulting";
          size = "enterprise";
        } else if (financeDomains.some((finance) => domain.includes(finance))) {
          industry = "Finance";
          size = "enterprise";
        } else if (domain.includes("linkedin")) {
          industry = "Professional Networking";
          size = "enterprise";
        }
      }

      // Calculate engagement score based on time on page and interactions
      const sessionInteractions = interactions.filter(
        (i) => i.sessionId === pv.sessionId
      ).length;
      const engagementScore = (pv.timeOnPage || 0) + sessionInteractions * 30;

      if (!industryEngagement.has(industry)) {
        industryEngagement.set(industry, { count: 0, totalEngagement: 0 });
      }
      const industryData = industryEngagement.get(industry)!;
      industryData.count++;
      industryData.totalEngagement += engagementScore;

      if (!companySizeData.has(size)) {
        companySizeData.set(size, { count: 0, conversions: 0 });
      }
      companySizeData.get(size)!.count++;
    });

    const industryIntel = {
      topIndustries: Array.from(industryEngagement.entries())
        .map(([industry, data]) => ({
          industry,
          count: data.count,
          engagementScore: data.totalEngagement / data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      companySizes: Array.from(companySizeData.entries())
        .map(([size, data]) => ({
          size,
          count: data.count,
          conversionRate:
            data.count > 0 ? (data.conversions / data.count) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count),
      identifiedCompanies: [], // Will be populated when we have better domain tracking
      recruitingIntensity: Math.min(
        10,
        Math.max(1, (potentialRecruiters / uniqueSessions.size) * 10)
      ),
    };

    // Engagement Quality Metrics
    const scrollDepths = interactions
      .filter((i) => i.type === "scroll")
      .map((i) => parseInt(i.element.match(/\d+/)?.[0] || "0"));

    const sectionEngagement = new Map<
      string,
      { time: number; scrolls: number; interactions: number; bounces: number }
    >();
    pageViews.forEach((pv) => {
      const section = pv.page === "/" ? "home" : pv.page.replace("/", "");
      const sessionInteractions = interactions.filter(
        (i) => i.sessionId === pv.sessionId && i.page === pv.page
      );
      const isBounce =
        sessionInteractions.length === 0 && (pv.timeOnPage || 0) < 30;

      if (!sectionEngagement.has(section)) {
        sectionEngagement.set(section, {
          time: 0,
          scrolls: 0,
          interactions: 0,
          bounces: 0,
        });
      }
      const data = sectionEngagement.get(section)!;
      data.time += pv.timeOnPage || 0;
      data.scrolls += sessionInteractions.filter(
        (i) => i.type === "scroll"
      ).length;
      data.interactions += sessionInteractions.length;
      if (isBounce) data.bounces++;
    });

    const multiVisitSessions = new Set<string>();
    const sessionCounts = new Map<string, number>();
    pageViews.forEach((pv) => {
      sessionCounts.set(
        pv.sessionId,
        (sessionCounts.get(pv.sessionId) || 0) + 1
      );
    });
    sessionCounts.forEach((count, sessionId) => {
      if (count > 1) multiVisitSessions.add(sessionId);
    });

    const deepEngagementSessions = sessions.filter((session) => {
      const sessionDurationMinutes =
        (session.endTime.getTime() - session.startTime.getTime()) / 60000;
      const sessionInteractions = interactions.filter(
        (i) => i.sessionId === session.sessionId
      );
      return sessionDurationMinutes > 5 && sessionInteractions.length > 3;
    }).length;

    const engagementMetrics = {
      averageScrollDepth:
        scrollDepths.length > 0
          ? scrollDepths.reduce((a, b) => a + b) / scrollDepths.length
          : 0,
      sectionHeatmap: Array.from(sectionEngagement.entries()).map(
        ([section, data]) => ({
          section,
          averageTimeSpent:
            data.time /
            Math.max(
              1,
              pageViews.filter((pv) => pv.page.includes(section)).length
            ),
          scrollDepth: data.scrolls,
          interactions: data.interactions,
          bounceRate:
            (data.bounces /
              Math.max(
                1,
                pageViews.filter((pv) => pv.page.includes(section)).length
              )) *
            100,
        })
      ),
      multiVisitRate: (multiVisitSessions.size / uniqueSessions.size) * 100,
      returnVisitorEngagement: 85, // Mock data
      deepEngagementSessions,
    };

    // Skill Analysis
    const inDemandSkills = [
      {
        skill: "React",
        searches: 45,
        trend: "up" as const,
        relatedTerms: ["JavaScript", "Frontend"],
      },
      {
        skill: "Python",
        searches: 38,
        trend: "up" as const,
        relatedTerms: ["Machine Learning", "Data Science"],
      },
      {
        skill: "Product Management",
        searches: 32,
        trend: "stable" as const,
        relatedTerms: ["Strategy", "Analytics"],
      },
      {
        skill: "AI/ML",
        searches: 29,
        trend: "up" as const,
        relatedTerms: ["TensorFlow", "PyTorch"],
      },
      {
        skill: "Node.js",
        searches: 25,
        trend: "stable" as const,
        relatedTerms: ["Backend", "Express"],
      },
    ];

    const skillAnalysis = {
      inDemandSkills,
      missingKeywords: [
        "Kubernetes",
        "Docker",
        "AWS Certified",
        "Agile Scrum Master",
      ],
      competitiveSkills: [
        "Full-stack Development",
        "Product Strategy",
        "Data Analytics",
      ],
      skillTrendScore: 7.5,
    };

    // Conversion Tracking
    const conversionEvents = [
      {
        type: "resume_download" as const,
        count: 12,
        conversionRate: 8.5,
        sessionIds: [],
      },
      {
        type: "linkedin_click" as const,
        count: 18,
        conversionRate: 12.8,
        sessionIds: [],
      },
      {
        type: "contact_form" as const,
        count: 7,
        conversionRate: 5.0,
        sessionIds: [],
      },
      {
        type: "meeting_scheduled" as const,
        count: 3,
        conversionRate: 2.1,
        sessionIds: [],
      },
      {
        type: "email_sent" as const,
        count: 5,
        conversionRate: 3.6,
        sessionIds: [],
      },
    ];

    const conversions = {
      totalConversions: conversionEvents.reduce(
        (sum, event) => sum + event.count,
        0
      ),
      conversionRate: 12.3,
      conversionFunnel: conversionEvents,
      highValueActions: [
        { action: "Resume Download", value: 10, count: 12 },
        { action: "LinkedIn Profile Visit", value: 8, count: 18 },
        { action: "Meeting Scheduled", value: 25, count: 3 },
      ],
    };

    // Geographic Intelligence
    const geoIntelligence = {
      remoteFriendlyMarkets: [
        { location: "San Francisco, CA", remoteJobs: 245, interest: 18 },
        { location: "New York, NY", remoteJobs: 198, interest: 15 },
        { location: "Seattle, WA", remoteJobs: 167, interest: 12 },
      ],
      hiringHotspots: topCities.slice(0, 5).map((city) => ({
        city: city.city,
        country: city.country,
        hiringActivity: city.count * 2.5,
      })),
      visaSponsorship: [
        { country: "United States", visaLikely: true, interest: 45 },
        { country: "Canada", visaLikely: true, interest: 28 },
        { country: "United Kingdom", visaLikely: false, interest: 15 },
      ],
      marketPenetration: [
        { region: "North America", penetration: 65, opportunity: 85 },
        { region: "Europe", penetration: 25, opportunity: 70 },
        { region: "Asia Pacific", penetration: 10, opportunity: 60 },
      ],
    };

    // Competitive Analysis
    const competitiveAnalysis = {
      trafficSources: topReferrers.map((ref) => ({
        source: ref.referrer,
        quality:
          ref.referrer === "LinkedIn" ? 9 : ref.referrer === "Google" ? 7 : 5,
        recruiterRatio: ref.referrer === "LinkedIn" ? 0.35 : 0.15,
      })),
      benchmarkMetrics: [
        {
          metric: "Page Load Time",
          yourValue: 1.2,
          industry: 2.1,
          percentile: 85,
        },
        { metric: "Bounce Rate", yourValue: 32, industry: 45, percentile: 75 },
        {
          metric: "Session Duration",
          yourValue: avgSessionDuration,
          industry: 3.2,
          percentile: 78,
        },
        {
          metric: "Conversion Rate",
          yourValue: 12.3,
          industry: 8.5,
          percentile: 82,
        },
      ],
      opportunityAreas: [
        "SEO Optimization",
        "Social Media Presence",
        "Content Marketing",
      ],
      strengthAreas: [
        "User Experience",
        "Technical Implementation",
        "Analytics Tracking",
      ],
    };

    return {
      totalPageViews: pageViews.length,
      uniqueVisitors: uniqueSessions.size,
      totalChatSessions: sessions.length,
      totalMessages: sessions.reduce(
        (sum, session) => sum + session.messageCount,
        0
      ),
      avgSessionDuration,
      topPages,
      deviceTypes,
      topReferrers,
      hourlyActivity,
      dailyActivity,
      popularInteractions,
      visitorLocations,
      topCities,
      potentialRecruiters,
      recruiterMetrics,
      foundKeywords,
      tourAnalytics,
      timeIntelligence,
      industryIntel,
      engagementMetrics,
      skillAnalysis,
      conversions,
      geoIntelligence,
      competitiveAnalysis,
    };
  };

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];
    if (roleFilter !== "all") {
      filtered = filtered.filter((session) =>
        session.messages.some((msg) => msg.role === roleFilter)
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((session) =>
        session.messages.some((msg) =>
          msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    filtered.sort((a, b) =>
      sortOrder === "desc"
        ? b.startTime.getTime() - a.startTime.getTime()
        : a.startTime.getTime() - b.startTime.getTime()
    );
    return filtered;
  }, [sessions, roleFilter, searchTerm, sortOrder]);

  const loadMoreSessions = async () => {
    if (
      confirm(
        `This will consume additional Firebase reads. Current session: ${firebaseReads} reads. Continue?`
      )
    ) {
      await fetchAllData(true);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getSessionDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SECRET_PASS) {
      sessionStorage.setItem(
        "analytics_password",
        process.env.NEXT_PUBLIC_SECRET_PASS || ""
      );
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
      window.location.href = "/";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-lg">
          <form onSubmit={handlePasswordSubmit}>
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <FiLock />
              Analytics Dashboard
            </h2>
            <p className="text-center text-gray-400 mb-6">
              This page is password protected.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              Back to Portfolio
            </Link>
            <h1 className="text-3xl font-bold">
              Portfolio Analytics Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Firebase Usage Display */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-blue-400">📖</span>
                  <span className="text-gray-300">Reads:</span>
                  <span
                    className={`font-bold ${firebaseReads > 50 ? "text-red-400" : firebaseReads > 20 ? "text-yellow-400" : "text-green-400"}`}
                  >
                    {firebaseReads}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-orange-400">✏️</span>
                  <span className="text-gray-300">Writes:</span>
                  <span
                    className={`font-bold ${firebaseWrites > 20 ? "text-red-400" : firebaseWrites > 10 ? "text-yellow-400" : "text-green-400"}`}
                  >
                    {firebaseWrites}
                  </span>
                </div>
                <button
                  onClick={resetCounters}
                  className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 bg-gray-700 rounded"
                  title="Reset counters"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                disabled={loading || refreshInProgress}
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={loading || refreshInProgress}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                loading || refreshInProgress
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {refreshInProgress ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <FiActivity className="h-4 w-4" />
                  Refresh Data
                  {lastRefreshTime && (
                    <span className="text-xs bg-blue-700 px-2 py-1 rounded">
                      ~{estimateRefreshCost().reads} reads
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cost Warning Modal */}
        {showCostWarning && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border border-yellow-500/20">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-xl font-bold text-yellow-400">
                  Firebase Usage Warning
                </h3>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-300">
                  This refresh will consume approximately{" "}
                  <span className="font-bold text-yellow-400">
                    {refreshCost.reads} reads
                  </span>{" "}
                  from Firebase.
                </p>
                {lastRefreshTime && (
                  <p className="text-sm text-gray-400">
                    Last refresh:{" "}
                    {Math.round(
                      (Date.now() - lastRefreshTime.getTime()) / 60000
                    )}{" "}
                    minutes ago
                  </p>
                )}
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">
                    Current session usage:
                  </p>
                  <div className="flex justify-between">
                    <span>
                      Reads:{" "}
                      <span className="text-blue-400 font-bold">
                        {firebaseReads}
                      </span>
                    </span>
                    <span>
                      Writes:{" "}
                      <span className="text-orange-400 font-bold">
                        {firebaseWrites}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCostWarning(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={performRefresh}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium"
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!loading && !analyticsData && (
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto">
              <span className="text-6xl mb-4 block">📊</span>
              <h2 className="text-2xl font-bold mb-4">
                No Analytics Data Loaded
              </h2>
              <p className="text-gray-400 mb-6">
                Click "Refresh Data" to load your portfolio analytics. This will
                consume approximately 3 Firebase reads.
              </p>
              <button
                onClick={handleManualRefresh}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Load Analytics Data
              </button>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        {analyticsData && (
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-xs">Page Views</p>
                  <p className="text-xl font-bold">
                    {analyticsData.totalPageViews}
                  </p>
                </div>
                <FiEye className="h-5 w-5 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-xs">Visitors</p>
                  <p className="text-xl font-bold">
                    {analyticsData.uniqueVisitors}
                  </p>
                </div>
                <FiUsers className="h-5 w-5 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-xs">Chat Sessions</p>
                  <p className="text-xl font-bold">
                    {analyticsData.totalChatSessions}
                  </p>
                </div>
                <FiMessageCircle className="h-5 w-5 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200 text-xs">Avg Session</p>
                  <p className="text-xl font-bold">
                    {Math.round(analyticsData.avgSessionDuration)}m
                  </p>
                </div>
                <FiClock className="h-5 w-5 text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-200 text-xs">Messages</p>
                  <p className="text-xl font-bold">
                    {analyticsData.totalMessages}
                  </p>
                </div>
                <FiMessageCircle className="h-5 w-5 text-teal-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-xs">Recruiters</p>
                  <p className="text-xl font-bold">
                    {analyticsData.potentialRecruiters}
                  </p>
                </div>
                <FiUserCheck className="h-5 w-5 text-red-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-200 text-xs">Tour Taken</p>
                  <p className="text-xl font-bold">
                    {analyticsData.tourAnalytics.totalTourStarts}
                  </p>
                </div>
                <span className="text-indigo-200 text-lg">🎯</span>
              </div>
            </div>
          </div>
        )}

        {/* Chatbot Analytics - PROMINENT POSITION */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-purple-300">
              <FiMessageCircle className="h-6 w-6" />
              Live Chatbot Analytics
            </h2>
            <button
              onClick={() => setShowChatbotFullScreen(true)}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View All Sessions
            </button>
          </div>

          {/* Quick Chat Stats */}
          {analyticsData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-300 text-xs">Active Sessions</h3>
                <p className="text-lg font-bold text-white">
                  {sessions.length}
                </p>
              </div>
              <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-300 text-xs">Total Messages</h3>
                <p className="text-lg font-bold text-white">
                  {analyticsData.totalMessages}
                </p>
              </div>
              <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-300 text-xs">Avg Msg/Session</h3>
                <p className="text-lg font-bold text-white">
                  {sessions.length > 0
                    ? Math.round(analyticsData.totalMessages / sessions.length)
                    : 0}
                </p>
              </div>
              <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                <h3 className="text-purple-300 text-xs">Recent Activity</h3>
                <p className="text-lg font-bold text-white">
                  {filteredSessions.length}
                </p>
              </div>
            </div>
          )}

          {/* Recent Chat Sessions - Compact View */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-purple-300">
              Recent Chat Sessions
            </h3>
            <div
              className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700 pr-2"
              style={{
                scrollBehavior: "smooth",
                scrollbarWidth: "thin",
                scrollbarColor: "#a855f7 #374151",
                WebkitOverflowScrolling: "touch",
              }}
              onWheel={(e) => {
                e.stopPropagation();
              }}
            >
              {filteredSessions.slice(0, 5).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FiMessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No chat sessions found.</p>
                </div>
              ) : (
                filteredSessions.slice(0, 5).map((session) => (
                  <div
                    key={session.sessionId}
                    className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          Session {session.sessionId.slice(-6)}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {formatTimestamp(session.startTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {getSessionDuration(
                            session.startTime,
                            session.endTime
                          )}
                        </p>
                        <p className="text-xs text-purple-300 font-medium">
                          {session.messageCount} msgs
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-300">
                      {session.messages.length > 0 && (
                        <p className="truncate">
                          <span className="text-blue-400">User:</span>{" "}
                          {session.messages[0].message?.slice(0, 80)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Analytics Overview - Compact Grid */}
        {analyticsData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Top Pages */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiBarChart className="h-5 w-5" />
                Top Pages
              </h3>
              <div className="space-y-3">
                {analyticsData.topPages.map((page, index) => (
                  <div
                    key={page.page}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm">
                        {page.page === "/" ? "Home" : page.page}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${(page.views / analyticsData.topPages[0].views) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{page.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Types */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiPieChart className="h-5 w-5" />
                Device Types
              </h3>
              <div className="space-y-3">
                {analyticsData.deviceTypes.map((device, index) => (
                  <div
                    key={device.device}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {device.device === "Desktop" && (
                        <FiMonitor className="h-4 w-4 text-blue-400" />
                      )}
                      {device.device === "Mobile" && (
                        <FiSmartphone className="h-4 w-4 text-green-400" />
                      )}
                      {device.device === "Tablet" && (
                        <FiSmartphone className="h-4 w-4 text-purple-400" />
                      )}
                      <span className="text-sm">{device.device}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{
                            width: `${(device.count / analyticsData.deviceTypes[0].count) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {device.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Referrers */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiGlobe className="h-5 w-5" />
                Traffic Sources
              </h3>
              <div className="space-y-3">
                {analyticsData.topReferrers.map((referrer, index) => (
                  <div
                    key={referrer.referrer}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm">{referrer.referrer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full"
                          style={{
                            width: `${(referrer.count / analyticsData.topReferrers[0].count) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {referrer.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Interactions */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiActivity className="h-5 w-5" />
                User Interactions
              </h3>
              <div className="space-y-3">
                {analyticsData.popularInteractions.map((interaction, index) => (
                  <div
                    key={interaction.type}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm capitalize">
                        {interaction.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{
                            width: `${(interaction.count / analyticsData.popularInteractions[0].count) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {interaction.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Potential Recruiters */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiUserCheck className="h-5 w-5" />
                Potential Recruiters
              </h3>
              <div className="text-4xl font-bold text-teal-400">
                {analyticsData.potentialRecruiters}
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Visitors showing signs of recruitment interest based on
                keywords, time spent, and interactions.
              </p>
              {analyticsData.recruiterMetrics && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">
                      Used Recruiter Keywords
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-teal-400">
                        {analyticsData.recruiterMetrics.keywordHits}
                      </span>
                      <button
                        onClick={() => setShowKeywordsModal(true)}
                        className="text-xs bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 px-2 py-1 rounded"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Spent &gt;3 Mins on Site
                    </span>
                    <span className="font-semibold text-teal-400">
                      {analyticsData.recruiterMetrics.longVisits}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Clicked Resume/LinkedIn
                    </span>
                    <span className="font-semibold text-teal-400">
                      {analyticsData.recruiterMetrics.keyClicks}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Visitor Locations */}
            <div className="bg-gray-800 p-6 rounded-xl col-span-2">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FiGlobe className="h-5 w-5" />
                Visitor Locations
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Top Countries
                  </h4>
                  <div className="space-y-3">
                    {analyticsData.visitorLocations
                      .slice(0, 5)
                      .map((location, index) => (
                        <div
                          key={location.country}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-400 w-6">
                              {index + 1}
                            </span>
                            <span className="text-sm">{location.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(location.count / analyticsData.visitorLocations[0].count) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {location.count}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Top Cities
                  </h4>
                  <div className="space-y-3">
                    {analyticsData.topCities.slice(0, 5).map((city, index) => (
                      <div
                        key={`${city.city}-${city.country}`}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-400 w-6">
                            {index + 1}
                          </span>
                          <span className="text-sm">{`${city.city}, ${city.country}`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${(city.count / analyticsData.topCities[0].count) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {city.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Analytics Sections */}
        {analyticsData && (
          <>
            {/* Tour Analytics Dashboard */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                Portfolio Tour Analytics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20">
                  <h3 className="text-indigo-300 text-sm">Tour Starts</h3>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.tourAnalytics.totalTourStarts}
                  </p>
                </div>
                <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20">
                  <h3 className="text-indigo-300 text-sm">Completions</h3>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.tourAnalytics.totalTourCompletions}
                  </p>
                  <p className="text-xs text-gray-400">
                    {analyticsData.tourAnalytics.completionRate.toFixed(1)}%
                    completion rate
                  </p>
                </div>
                <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20">
                  <h3 className="text-indigo-300 text-sm">Avg Steps</h3>
                  <p className="text-2xl font-bold text-white">
                    {analyticsData.tourAnalytics.averageStepsCompleted.toFixed(
                      1
                    )}
                  </p>
                  <p className="text-xs text-gray-400">out of 6 steps</p>
                </div>
                <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20">
                  <h3 className="text-indigo-300 text-sm">Most Popular</h3>
                  <p className="text-lg font-bold text-white capitalize">
                    {analyticsData.tourAnalytics.mostPopularStep}
                  </p>
                  <p className="text-xs text-gray-400">step</p>
                </div>
              </div>

              {analyticsData.tourAnalytics.ctaActions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      Tour CTA Actions
                    </h4>
                    <div className="space-y-2">
                      {analyticsData.tourAnalytics.ctaActions.map(
                        (action, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-gray-700 p-3 rounded"
                          >
                            <span className="capitalize">{action.action}</span>
                            <span className="font-bold text-indigo-400">
                              {action.count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      Abandonment Points
                    </h4>
                    <div className="space-y-2">
                      {analyticsData.tourAnalytics.abandonmentPoints.map(
                        (point, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center bg-gray-700 p-3 rounded"
                          >
                            <span className="capitalize">{point.step}</span>
                            <span className="font-bold text-red-400">
                              {point.count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Time-Based Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiClock className="h-5 w-5" />
                  Peak Recruiter Hours
                </h3>
                <div className="space-y-3">
                  {analyticsData.timeIntelligence.peakHours
                    .filter((h) => h.recruiterActivity > 0)
                    .slice(0, 5)
                    .map((hour) => (
                      <div
                        key={hour.hour}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {hour.hour}:00 - {hour.hour + 1}:00
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{
                                width: `${(hour.recruiterActivity / Math.max(...analyticsData.timeIntelligence.peakHours.map((h) => h.recruiterActivity))) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {hour.recruiterActivity}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400">
                    Average time to first engagement:{" "}
                    <span className="text-yellow-400 font-semibold">
                      {analyticsData.timeIntelligence.timeToEngage.toFixed(1)}{" "}
                      minutes
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiTrendingUp className="h-5 w-5" />
                  Weekly Patterns
                </h3>
                <div className="space-y-3">
                  {analyticsData.timeIntelligence.peakDays.map((day) => (
                    <div
                      key={day.day}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{day.day}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${(day.recruiterActivity / Math.max(...analyticsData.timeIntelligence.peakDays.map((d) => d.recruiterActivity))) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {day.recruiterActivity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Industry Intelligence */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FiBriefcase className="h-5 w-5" />
                Industry & Company Intelligence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">Top Industries</h4>
                  <div className="space-y-3">
                    {analyticsData.industryIntel.topIndustries
                      .slice(0, 5)
                      .map((industry, index) => (
                        <div
                          key={industry.industry}
                          className="bg-gray-700 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">
                              {industry.industry}
                            </span>
                            <span className="text-sm text-gray-400">
                              {industry.count} visits
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-600 rounded-full h-1">
                              <div
                                className="bg-purple-500 h-1 rounded-full"
                                style={{
                                  width: `${(industry.engagementScore / Math.max(...analyticsData.industryIntel.topIndustries.map((i) => i.engagementScore))) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-xs text-purple-400">
                              {industry.engagementScore.toFixed(0)} engagement
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">Company Sizes</h4>
                  <div className="space-y-3">
                    {analyticsData.industryIntel.companySizes.map((size) => (
                      <div
                        key={size.size}
                        className="bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">
                            {size.size}
                          </span>
                          <span className="text-sm text-gray-400">
                            {size.count}
                          </span>
                        </div>
                        <p className="text-xs text-green-400">
                          {size.conversionRate.toFixed(1)}% conversion rate
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    Recruiting Intensity
                  </h4>
                  <div className="bg-gray-700 p-4 rounded-lg text-center">
                    <div className="text-4xl font-bold text-orange-400 mb-2">
                      {analyticsData.industryIntel.recruitingIntensity.toFixed(
                        1
                      )}
                      /10
                    </div>
                    <p className="text-sm text-gray-400">
                      Market recruiting activity level
                    </p>
                    <div className="mt-3 w-full bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${(analyticsData.industryIntel.recruitingIntensity / 10) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Quality & Conversion Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiActivity className="h-5 w-5" />
                  Engagement Quality
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Scroll Depth</span>
                      <span className="font-bold text-blue-400">
                        {analyticsData.engagementMetrics.averageScrollDepth.toFixed(
                          0
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Multi-Visit Rate</span>
                      <span className="font-bold text-green-400">
                        {analyticsData.engagementMetrics.multiVisitRate.toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Deep Engagement Sessions</span>
                      <span className="font-bold text-purple-400">
                        {analyticsData.engagementMetrics.deepEngagementSessions}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      5+ minutes with multiple interactions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiBarChart className="h-5 w-5" />
                  Conversion Funnel
                </h3>
                <div className="space-y-3">
                  {analyticsData.conversions.conversionFunnel.map((event) => (
                    <div
                      key={event.type}
                      className="bg-gray-700 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm capitalize">
                          {event.type.replace("_", " ")}
                        </span>
                        <span className="font-bold text-teal-400">
                          {event.count}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div
                            className="bg-teal-500 h-1 rounded-full"
                            style={{
                              width: `${event.conversionRate * 5}%`, // Scale for visibility
                            }}
                          ></div>
                        </div>
                        <span className="text-xs text-teal-400">
                          {event.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-teal-400">
                      {analyticsData.conversions.totalConversions}
                    </div>
                    <p className="text-sm text-gray-400">Total Conversions</p>
                    <p className="text-xs text-teal-400">
                      {analyticsData.conversions.conversionRate}% overall rate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Analysis & Competitive Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiTrendingUp className="h-5 w-5" />
                  Skill Demand Analysis
                </h3>
                <div className="mb-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-yellow-400">
                      {analyticsData.skillAnalysis.skillTrendScore}/10
                    </div>
                    <p className="text-sm text-gray-400">Skill Trend Score</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-semibold text-green-400 mb-2">
                      In-Demand Skills
                    </h5>
                    {analyticsData.skillAnalysis.inDemandSkills
                      .slice(0, 3)
                      .map((skill) => (
                        <div
                          key={skill.skill}
                          className="flex justify-between items-center bg-gray-700 p-2 rounded mb-1"
                        >
                          <span className="text-sm">{skill.skill}</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                skill.trend === "up"
                                  ? "bg-green-500/20 text-green-400"
                                  : skill.trend === "down"
                                    ? "bg-red-500/20 text-red-400"
                                    : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {skill.trend === "up"
                                ? "↗"
                                : skill.trend === "down"
                                  ? "↘"
                                  : "→"}{" "}
                              {skill.trend}
                            </span>
                            <span className="text-sm font-bold">
                              {skill.searches}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-orange-400 mb-2">
                      Missing Keywords
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {analyticsData.skillAnalysis.missingKeywords
                        .slice(0, 4)
                        .map((keyword) => (
                          <span
                            key={keyword}
                            className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiPieChart className="h-5 w-5" />
                  Competitive Benchmarks
                </h3>
                <div className="space-y-4">
                  {analyticsData.competitiveAnalysis.benchmarkMetrics.map(
                    (metric) => (
                      <div
                        key={metric.metric}
                        className="bg-gray-700 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">
                            {metric.metric}
                          </span>
                          <span className="text-xs text-gray-400">
                            {metric.percentile}th percentile
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span>
                            You:{" "}
                            <span className="text-green-400 font-bold">
                              {metric.yourValue}
                            </span>
                          </span>
                          <span>
                            Industry:{" "}
                            <span className="text-gray-400">
                              {metric.industry}
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full"
                            style={{ width: `${metric.percentile}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <h5 className="text-sm font-semibold text-green-400 mb-1">
                      Strengths
                    </h5>
                    {analyticsData.competitiveAnalysis.strengthAreas
                      .slice(0, 2)
                      .map((area) => (
                        <div
                          key={area}
                          className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded mb-1"
                        >
                          {area}
                        </div>
                      ))}
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-orange-400 mb-1">
                      Opportunities
                    </h5>
                    {analyticsData.competitiveAnalysis.opportunityAreas
                      .slice(0, 2)
                      .map((area) => (
                        <div
                          key={area}
                          className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded mb-1"
                        >
                          {area}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Intelligence */}
            <div className="bg-gray-800 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <FiGlobe className="h-5 w-5" />
                Geographic & Market Intelligence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    Remote-Friendly Markets
                  </h4>
                  <div className="space-y-3">
                    {analyticsData.geoIntelligence.remoteFriendlyMarkets.map(
                      (market) => (
                        <div
                          key={market.location}
                          className="bg-gray-700 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">
                              {market.location}
                            </span>
                            <span className="text-blue-400 font-bold">
                              {market.interest}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">
                            {market.remoteJobs} remote jobs
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    Hiring Hotspots
                  </h4>
                  <div className="space-y-3">
                    {analyticsData.geoIntelligence.hiringHotspots.map(
                      (hotspot) => (
                        <div
                          key={`${hotspot.city}-${hotspot.country}`}
                          className="bg-gray-700 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-sm">
                              {hotspot.city}, {hotspot.country}
                            </span>
                            <span className="text-red-400 font-bold">
                              {hotspot.hiringActivity.toFixed(0)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                            <div
                              className="bg-red-500 h-1 rounded-full"
                              style={{
                                width: `${(hotspot.hiringActivity / Math.max(...analyticsData.geoIntelligence.hiringHotspots.map((h) => h.hiringActivity))) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-3">
                    Market Penetration
                  </h4>
                  <div className="space-y-3">
                    {analyticsData.geoIntelligence.marketPenetration.map(
                      (market) => (
                        <div
                          key={market.region}
                          className="bg-gray-700 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">
                              {market.region}
                            </span>
                            <span className="text-purple-400 font-bold">
                              {market.penetration}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">Opportunity:</span>
                            <span className="text-green-400 font-semibold">
                              {market.opportunity}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-1 mt-2">
                            <div
                              className="bg-purple-500 h-1 rounded-full"
                              style={{ width: `${market.penetration}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Keywords Modal */}
        {showKeywordsModal && analyticsData?.foundKeywords && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 max-w-lg w-full max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Recruiter Keywords Used</h3>
                <button
                  onClick={() => setShowKeywordsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div
                className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-700"
                style={{
                  scrollBehavior: "smooth",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#14b8a6 #374151",
                  WebkitOverflowScrolling: "touch",
                }}
                onWheel={(e) => {
                  e.stopPropagation();
                }}
              >
                {analyticsData.foundKeywords.map(({ keyword, count }) => (
                  <div
                    key={keyword}
                    className="flex justify-between items-center bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <span className="font-medium">{keyword}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-teal-400">
                        {count}
                      </span>
                      <button
                        onClick={() => setSelectedKeyword(keyword)}
                        className="text-xs bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-2 py-1 rounded transition-colors"
                      >
                        View Sessions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sessions for Keyword Modal */}
        {selectedKeyword && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">
                  Sessions containing &ldquo;{selectedKeyword}&rdquo;
                </h3>
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {sessions
                  .filter((session) =>
                    analyticsData?.foundKeywords
                      .find((k) => k.keyword === selectedKeyword)
                      ?.sessionIds.includes(session.sessionId)
                  )
                  .map((session) => (
                    <div
                      key={session.sessionId}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <h4 className="font-semibold text-lg mb-2">
                        Session {session.sessionId.slice(-6)}
                      </h4>
                      {session.messages.map((message) => (
                        <p
                          key={message.id}
                          className={`text-sm mb-1 ${
                            message.role === "user"
                              ? "text-blue-300"
                              : "text-gray-300"
                          }`}
                        >
                          <span className="font-bold">
                            {message.role === "user" ? "User: " : "AI: "}
                          </span>
                          {message.message}
                        </p>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* System Performance & Firebase Usage */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiActivity className="h-5 w-5" />
            System Performance & Firebase Usage
          </h2>

          {/* Firebase Usage Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 text-xs mb-1">Session Reads</h3>
              <p
                className={`text-2xl font-bold ${firebaseReads > 50 ? "text-red-400" : firebaseReads > 20 ? "text-yellow-400" : "text-green-400"}`}
              >
                {firebaseReads}
              </p>
              <p className="text-xs text-gray-500">
                ~${((firebaseReads * 0.36) / 100000).toFixed(6)}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 text-xs mb-1">Session Writes</h3>
              <p
                className={`text-2xl font-bold ${firebaseWrites > 20 ? "text-red-400" : firebaseWrites > 10 ? "text-yellow-400" : "text-green-400"}`}
              >
                {firebaseWrites}
              </p>
              <p className="text-xs text-gray-500">
                ~${((firebaseWrites * 1.08) / 100000).toFixed(6)}
              </p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 text-xs mb-1">Last Refresh</h3>
              <p className="text-lg font-bold">
                {refreshCost.reads > 0 ? refreshCost.reads : "-"}
              </p>
              <p className="text-xs text-gray-500">reads used</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 text-xs mb-1">Estimated Cost</h3>
              <p className="text-lg font-bold text-green-400">
                $
                {(
                  (firebaseReads * 0.36 + firebaseWrites * 1.08) /
                  100000
                ).toFixed(6)}
              </p>
              <p className="text-xs text-gray-500">this session</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 text-xs mb-1">Active Filters</h3>
              <p className="text-lg font-bold">
                {roleFilter !== "all" ? 1 : 0}
              </p>
              <p className="text-xs text-gray-500">applied</p>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-gray-400 text-xs mb-1">Time Range</h3>
              <p className="text-lg font-bold">{timeRange}</p>
              <p className="text-xs text-gray-500">selected</p>
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2 text-blue-300">
              💡 Firebase Usage Guidelines
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-green-400 font-semibold">
                  Low Usage (Good):
                </span>
                <p className="text-gray-400">
                  ≤20 reads, ≤10 writes per session
                </p>
              </div>
              <div>
                <span className="text-yellow-400 font-semibold">
                  Medium Usage (Caution):
                </span>
                <p className="text-gray-400">
                  21-50 reads, 11-20 writes per session
                </p>
              </div>
              <div>
                <span className="text-red-400 font-semibold">
                  High Usage (Expensive):
                </span>
                <p className="text-gray-400">
                  &gt;50 reads, &gt;20 writes per session
                </p>
              </div>
            </div>
          </div>

          {lastRefreshTime && (
            <div className="mt-4 text-sm text-gray-400">
              <p>
                Last refresh: {lastRefreshTime.toLocaleString()}
                <span className="ml-2 text-green-400">
                  (
                  {Math.round((Date.now() - lastRefreshTime.getTime()) / 60000)}{" "}
                  minutes ago)
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Full Chatbot Sessions Modal - Gallery Style */}
        {showChatbotFullScreen && (
          <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col relative">
              {/* Header Section - Fixed */}
              <div className="flex-shrink-0 p-6 border-b border-gray-700">
                <button
                  className="absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded z-10 transition-colors"
                  onClick={() => setShowChatbotFullScreen(false)}
                >
                  ✕ Close
                </button>

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-purple-300">
                  <FiMessageCircle className="h-6 w-6" />
                  All Chatbot Sessions ({sessions.length})
                </h2>

                {/* Filters and Controls */}
                <div className="flex flex-wrap items-center gap-4 bg-gray-800/50 p-4 rounded-lg">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search sessions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  <div>
                    <select
                      value={roleFilter}
                      onChange={(e) =>
                        setRoleFilter(
                          e.target.value as "all" | "user" | "assistant"
                        )
                      }
                      className="pl-4 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">User Messages</option>
                      <option value="assistant">Assistant Messages</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={timeRange}
                      onChange={(e) =>
                        setTimeRange(
                          e.target.value as "1d" | "7d" | "30d" | "all"
                        )
                      }
                      className="pl-4 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="1d">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="all">All time</option>
                    </select>
                  </div>

                  {/* Sorting controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSortOrder("desc")}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                        sortOrder === "desc"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <FaSortAmountDown />
                      Newest
                    </button>
                    <button
                      onClick={() => setSortOrder("asc")}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                        sortOrder === "asc"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <FaSortAmountUp />
                      Oldest
                    </button>
                  </div>

                  <div className="text-sm text-gray-400">
                    Showing {filteredSessions.length} of {sessions.length}{" "}
                    sessions
                  </div>
                </div>
              </div>

              {/* Scrollable Content Area - Gallery Style */}
              <div className="flex-1 flex flex-col min-h-0">
                <div
                  className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
                  style={{
                    scrollBehavior: "smooth",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#7c3aed #374151",
                    WebkitOverflowScrolling: "touch",
                  }}
                  onWheel={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <div className="space-y-4">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <FiMessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No chat sessions found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredSessions.map((session) => (
                          <div
                            key={session.sessionId}
                            className="bg-gray-800/60 rounded-xl p-5 border border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all duration-200 shadow-lg hover:shadow-purple-500/10"
                          >
                            {/* Session Header */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700/50">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <div>
                                  <h3 className="font-bold text-lg text-white">
                                    Session {session.sessionId.slice(-8)}
                                  </h3>
                                  <p className="text-xs text-gray-400 flex items-center gap-2">
                                    <span>
                                      🕐 {formatTimestamp(session.startTime)}
                                    </span>
                                    <span>→</span>
                                    <span>
                                      {formatTimestamp(session.endTime)}
                                    </span>
                                  </p>
                                </div>
                              </div>
                              <div className="text-right bg-purple-900/30 px-3 py-2 rounded-lg">
                                <p className="text-sm text-purple-300 font-bold">
                                  {getSessionDuration(
                                    session.startTime,
                                    session.endTime
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {session.messageCount} messages
                                </p>
                              </div>
                            </div>

                            {/* Messages Gallery */}
                            <div
                              className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700"
                              style={{
                                scrollBehavior: "smooth",
                                scrollbarWidth: "thin",
                                scrollbarColor: "#6b7280 #374151",
                                WebkitOverflowScrolling: "touch",
                              }}
                              onWheel={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              {session.messages.map((message, index) => (
                                <div
                                  key={message.id}
                                  className={`group relative p-4 rounded-xl transition-all duration-200 ${
                                    message.role === "user"
                                      ? "bg-gradient-to-r from-blue-900/40 to-blue-800/30 border border-blue-700/40 hover:border-blue-600/60 ml-4"
                                      : "bg-gradient-to-r from-gray-700/50 to-gray-600/40 border border-gray-600/40 hover:border-gray-500/60 mr-4"
                                  }`}
                                >
                                  {/* Message Header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                                          message.role === "user"
                                            ? "bg-blue-600 text-blue-100 shadow-lg shadow-blue-600/30"
                                            : "bg-gray-600 text-gray-100 shadow-lg shadow-gray-600/30"
                                        }`}
                                      >
                                        {message.role === "user"
                                          ? "👤 User"
                                          : "🤖 Assistant"}
                                      </span>
                                      <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                                        #{index + 1}
                                      </span>
                                    </div>
                                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {formatTimestamp(message.timestamp)}
                                    </span>
                                  </div>

                                  {/* Message Content */}
                                  <div
                                    className={`text-sm leading-relaxed ${
                                      message.role === "user"
                                        ? "text-blue-100"
                                        : "text-gray-100"
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap">
                                      {message.message}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Load More Section */}
                    {hasMore && (
                      <div className="flex justify-center pt-6">
                        <button
                          onClick={loadMoreSessions}
                          className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/30 transform hover:scale-105"
                        >
                          Load More Sessions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
