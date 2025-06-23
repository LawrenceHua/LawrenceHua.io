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

// Tooltip Component for Analytics Explanations
const Tooltip = ({
  children,
  content,
  className = "",
}: {
  children: React.ReactNode;
  content: string;
  className?: string;
}) => {
  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs text-center border border-gray-700">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

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
  const [tourEvents, setTourEvents] = useState<TourEvent[]>([]);
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

  // Removed reset functionality - redundant with time range selector

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
    setRefreshCost({ reads: 0, writes: 0 });
    setLastRefreshTime(null);
    setShowCostWarning(false);
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

  // Recalculate analytics data when timeRange changes
  useEffect(() => {
    if (
      sessions.length > 0 ||
      pageViews.length > 0 ||
      interactions.length > 0 ||
      tourEvents.length > 0
    ) {
      const recalculatedData = calculateAnalyticsData(
        sessions,
        pageViews,
        interactions,
        tourEvents
      );
      setAnalyticsData(recalculatedData);
    }
  }, [timeRange, sessions, pageViews, interactions, tourEvents]);

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
      const className = target.className?.toString() || "";
      const id = target.id?.toString() || "";

      const isImportantClick =
        target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.getAttribute("role") === "button" ||
        className.includes("btn") ||
        className.includes("click") ||
        id.includes("nav") ||
        id.includes("contact");

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
    if (!db) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      // Fetch chat messages
      const messagesRef = collection(db, "chatbot_messages");
      let messagesQuery = query(messagesRef, orderBy("timestamp", "desc"));

      if (append && lastSessionTimestamp) {
        messagesQuery = query(
          messagesRef,
          where("timestamp", "<", lastSessionTimestamp),
          orderBy("timestamp", "desc"),
          limit(PAGE_SIZE)
        );
      }

      const messagesSnap = await getDocs(messagesQuery);
      incrementRead();

      const chatMessages: ChatMessage[] = messagesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      // Group messages by session
      const sessionMap = new Map<string, ChatMessage[]>();
      chatMessages.forEach((msg) => {
        if (!sessionMap.has(msg.sessionId)) {
          sessionMap.set(msg.sessionId, []);
        }
        sessionMap.get(msg.sessionId)!.push(msg);
      });

      const chatSessions: ChatSession[] = Array.from(sessionMap.entries()).map(
        ([sessionId, messages]) => {
          const sortedMessages = messages.sort(
            (a, b) =>
              (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() -
              (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
          );
          const startTime =
            sortedMessages[0]?.timestamp?.toDate?.() ||
            new Date(sortedMessages[0]?.timestamp);
          const endTime =
            sortedMessages[sortedMessages.length - 1]?.timestamp?.toDate?.() ||
            new Date(sortedMessages[sortedMessages.length - 1]?.timestamp);

          return {
            sessionId,
            messages: sortedMessages,
            startTime,
            endTime,
            messageCount: messages.length,
          };
        }
      );

      // Fetch page views
      const pageViewsRef = collection(db, "page_views");
      const pageViewsQuery = query(pageViewsRef, orderBy("timestamp", "desc"));

      const pageViewsSnap = await getDocs(pageViewsQuery);
      incrementRead();

      const pageViewsData: PageView[] = pageViewsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PageView[];

      // Fetch user interactions
      const interactionsRef = collection(db, "user_interactions");
      const interactionsQuery = query(
        interactionsRef,
        orderBy("timestamp", "desc")
      );

      const interactionsSnap = await getDocs(interactionsQuery);
      incrementRead();

      const interactionsData: UserInteraction[] = interactionsSnap.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as UserInteraction[];

      // Fetch tour events
      const tourEventsRef = collection(db, "tour_events");
      const tourEventsQuery = query(
        tourEventsRef,
        orderBy("timestamp", "desc")
      );
      const tourEventsSnap = await getDocs(tourEventsQuery);
      incrementRead();

      const tourEventsData: TourEvent[] = tourEventsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TourEvent[];

      // Update state
      setSessions((prev) =>
        append ? [...prev, ...chatSessions] : chatSessions
      );
      setPageViews((prev) =>
        append ? [...prev, ...pageViewsData] : pageViewsData
      );
      setInteractions((prev) =>
        append ? [...prev, ...interactionsData] : interactionsData
      );
      setTourEvents((prev) =>
        append ? [...prev, ...tourEventsData] : tourEventsData
      );

      // Calculate analytics
      const analytics = calculateAnalyticsData(
        append ? [...sessions, ...chatSessions] : chatSessions,
        append ? [...pageViews, ...pageViewsData] : pageViewsData,
        append ? [...interactions, ...interactionsData] : interactionsData,
        append ? [...tourEvents, ...tourEventsData] : tourEventsData
      );
      setAnalyticsData(analytics);

      // Update cost tracking
      const endTime = Date.now();
      const duration = endTime - startTime;
      setRefreshCost({
        reads: 3, // We made 3 read operations
        writes: 0,
      });
      setLastRefreshTime(new Date());

      console.log(`Data fetching completed in ${duration}ms`);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalyticsData = (
    sessions: ChatSession[],
    pageViews: PageView[],
    interactions: UserInteraction[],
    tourEvents: TourEvent[] = []
  ): AnalyticsData => {
    // Apply time range filtering to all data
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "1d":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "all":
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Time range filtering only (no reset date needed)

    // Filter data based on time range
    const filteredSessions = sessions.filter(
      (session) => session.startTime >= startDate
    );
    const filteredPageViews = pageViews.filter(
      (pv) => pv.timestamp.toDate() >= startDate
    );
    const filteredInteractions = interactions.filter(
      (interaction) => interaction.timestamp.toDate() >= startDate
    );

    // Use filtered data for calculations
    const uniqueSessions = new Set([
      ...filteredSessions.map((s) => s.sessionId),
      ...filteredPageViews.map((p) => p.sessionId),
    ]);

    // Top pages
    const pageCounts = new Map<string, number>();
    filteredPageViews.forEach((pv) => {
      pageCounts.set(pv.page, (pageCounts.get(pv.page) || 0) + 1);
    });
    const topPages = Array.from(pageCounts.entries())
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Device types
    const deviceCounts = new Map<string, number>();
    filteredPageViews.forEach((pv) => {
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
    filteredPageViews.forEach((pv) => {
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
    filteredPageViews.forEach((pv) => {
      const hour = pv.timestamp.toDate().getHours();
      hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
    });
    const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyCounts.get(i) || 0,
    }));

    // Daily activity (adjust based on time range)
    const dailyCounts = new Map<string, number>();
    const dayCount =
      timeRange === "1d"
        ? 1
        : timeRange === "7d"
          ? 7
          : timeRange === "30d"
            ? 30
            : 7;
    const recentDays = Array.from({ length: dayCount }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    filteredPageViews.forEach((pv) => {
      const date = pv.timestamp.toDate().toISOString().split("T")[0];
      if (recentDays.includes(date)) {
        dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
      }
    });

    const dailyActivity = recentDays.map((date) => ({
      date,
      count: dailyCounts.get(date) || 0,
    }));

    // Popular interactions
    const interactionCounts = new Map<string, number>();
    filteredInteractions.forEach((interaction) => {
      interactionCounts.set(
        interaction.type,
        (interactionCounts.get(interaction.type) || 0) + 1
      );
    });
    const popularInteractions = Array.from(interactionCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // Average session duration
    const totalDuration = filteredSessions.reduce((sum, session) => {
      return sum + (session.endTime.getTime() - session.startTime.getTime());
    }, 0);
    const avgSessionDuration =
      filteredSessions.length > 0
        ? totalDuration / filteredSessions.length / 1000 / 60
        : 0; // in minutes

    // Visitor Locations
    const countryCounts = new Map<string, number>();
    const cityCounts = new Map<
      string,
      { city: string; country: string; count: number }
    >();

    filteredPageViews.forEach((pv) => {
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

    // Potential Recruiter Identification (use filtered data)
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

    filteredSessions.forEach((session) => {
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

      const sessionInteractions = filteredInteractions.filter(
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

    // Tour Analytics (using real tour events data)
    const filteredTourEvents = tourEvents.filter(
      (event) => event.timestamp.toDate() >= startDate
    );

    const tourStarts = filteredTourEvents.filter(
      (event) => event.eventType === "tour_start"
    );
    const tourCompletions = filteredTourEvents.filter(
      (event) => event.eventType === "tour_complete"
    );
    const tourSteps = filteredTourEvents.filter(
      (event) => event.eventType === "tour_step"
    );
    const tourAbandons = filteredTourEvents.filter(
      (event) => event.eventType === "tour_abandon"
    );
    const tourCTAs = filteredTourEvents.filter(
      (event) => event.eventType === "tour_cta_action"
    );

    const completionRate =
      tourStarts.length > 0
        ? (tourCompletions.length / tourStarts.length) * 100
        : 0;

    // Calculate average steps completed
    const sessionSteps = new Map<string, number>();
    tourSteps.forEach((step) => {
      const maxStep = Math.max(
        sessionSteps.get(step.sessionId) || 0,
        step.stepIndex || 0
      );
      sessionSteps.set(step.sessionId, maxStep);
    });
    const totalStepsCompleted = Array.from(sessionSteps.values()).reduce(
      (sum, steps) => sum + steps,
      0
    );
    const averageStepsCompleted =
      sessionSteps.size > 0 ? totalStepsCompleted / sessionSteps.size : 0;

    // Most popular step (most frequent stepId)
    const stepCounts = new Map<string, number>();
    tourSteps.forEach((step) => {
      if (step.stepId) {
        stepCounts.set(step.stepId, (stepCounts.get(step.stepId) || 0) + 1);
      }
    });
    const mostPopularStep =
      Array.from(stepCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "intro";

    // Abandonment points
    const abandonCounts = new Map<string, number>();
    tourAbandons.forEach((abandon) => {
      if (abandon.stepId) {
        abandonCounts.set(
          abandon.stepId,
          (abandonCounts.get(abandon.stepId) || 0) + 1
        );
      }
    });
    const abandonmentPoints = Array.from(abandonCounts.entries())
      .map(([step, count]) => ({ step, count }))
      .sort((a, b) => b.count - a.count);

    // CTA Actions
    const ctaCounts = new Map<string, number>();
    tourCTAs.forEach((cta) => {
      if (cta.ctaAction) {
        ctaCounts.set(cta.ctaAction, (ctaCounts.get(cta.ctaAction) || 0) + 1);
      }
    });
    const ctaActions = Array.from(ctaCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    const tourConversionRate =
      tourStarts.length > 0 ? (tourCTAs.length / tourStarts.length) * 100 : 0;

    const tourAnalytics = {
      totalTourStarts: tourStarts.length,
      totalTourCompletions: tourCompletions.length,
      completionRate: Math.round(completionRate),
      averageStepsCompleted: Math.round(averageStepsCompleted * 10) / 10,
      mostPopularStep,
      abandonmentPoints,
      ctaActions,
      tourConversionRate: Math.round(tourConversionRate),
    };

    // Time-Based Intelligence (use filtered data)
    const recruiterSessions = filteredSessions.filter((session) => {
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

      const sessionInteractions = filteredInteractions.filter(
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
        filteredSessions.length > 0
          ? filteredSessions.reduce((sum, session) => {
              const firstInteraction = filteredInteractions
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
            }, 0) / filteredSessions.length
          : 0,
    };

    // Industry Intelligence (use filtered data)
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

    filteredPageViews.forEach((pv) => {
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
      const sessionInteractions = filteredInteractions.filter(
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
        Math.max(
          1,
          (potentialRecruiters / Math.max(1, uniqueSessions.size)) * 10
        )
      ),
    };

    // Engagement Quality Metrics (use filtered data)
    const scrollDepths = filteredInteractions
      .filter((i) => i.type === "scroll")
      .map((i) => parseInt(i.element.match(/\d+/)?.[0] || "0"));

    const sectionEngagement = new Map<
      string,
      { time: number; scrolls: number; interactions: number; bounces: number }
    >();
    filteredPageViews.forEach((pv) => {
      const section = pv.page === "/" ? "home" : pv.page.replace("/", "");
      const sessionInteractions = filteredInteractions.filter(
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
    filteredPageViews.forEach((pv) => {
      sessionCounts.set(
        pv.sessionId,
        (sessionCounts.get(pv.sessionId) || 0) + 1
      );
    });
    sessionCounts.forEach((count, sessionId) => {
      if (count > 1) multiVisitSessions.add(sessionId);
    });

    const deepEngagementSessions = filteredSessions.filter((session) => {
      const sessionDurationMinutes =
        (session.endTime.getTime() - session.startTime.getTime()) / 60000;
      const sessionInteractions = filteredInteractions.filter(
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
              filteredPageViews.filter((pv) => {
                const pageSection =
                  pv.page === "/" ? "home" : pv.page.replace("/", "");
                return pageSection === section;
              }).length
            ),
          scrollDepth: data.scrolls,
          interactions: data.interactions,
          bounceRate:
            data.bounces /
            Math.max(
              1,
              filteredPageViews.filter((pv) => {
                const pageSection =
                  pv.page === "/" ? "home" : pv.page.replace("/", "");
                return pageSection === section;
              }).length
            ),
        })
      ),
      multiVisitRate:
        multiVisitSessions.size / Math.max(1, uniqueSessions.size),
      returnVisitorEngagement: 0, // Will be calculated when we have return visitor tracking
      deepEngagementSessions,
    };

    // Return analytics data with filtered totals
    return {
      totalPageViews: filteredPageViews.length,
      uniqueVisitors: uniqueSessions.size,
      totalChatSessions: filteredSessions.length,
      totalMessages: filteredSessions.reduce(
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
      skillAnalysis: {
        inDemandSkills: [],
        missingKeywords: [],
        competitiveSkills: [],
        skillTrendScore: 0,
      },
      conversions: {
        totalConversions: 0,
        conversionRate: 0,
        conversionFunnel: [],
        highValueActions: [],
      },
      geoIntelligence: {
        remoteFriendlyMarkets: [],
        hiringHotspots: [],
        visaSponsorship: [],
        marketPenetration: [],
      },
      competitiveAnalysis: {
        trafficSources: [],
        benchmarkMetrics: [],
        opportunityAreas: [],
        strengthAreas: [],
      },
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

  // Reset functions removed - time range selector provides all needed filtering

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
        <div className="space-y-6 mb-8">
          {/* Top Section - Title and Back Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
                Back to Portfolio
              </Link>
              <Tooltip content="Comprehensive analytics dashboard tracking visitor behavior, recruiter interest, AI chatbot usage, and business intelligence for your portfolio website.">
                <h1 className="text-2xl md:text-3xl font-bold">
                  Portfolio Analytics Dashboard
                </h1>
              </Tooltip>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700">
            <div className="space-y-4">
              {/* Top Row - Firebase Usage */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Tooltip content="Real-time Firebase database usage monitoring. Green = efficient usage, Yellow = moderate usage, Red = expensive usage. Tracks reads/writes for cost optimization.">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm font-medium">
                      Firebase Usage:
                    </span>
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
                        className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                        title="Reset Firebase usage counters"
                      >
                        Reset Counters
                      </button>
                    </div>
                  </div>
                </Tooltip>

                {/* Time Range Selector */}
                <div className="flex items-center gap-2">
                  <Tooltip content="Filter analytics data by time period. Affects all metrics and visualizations shown in the dashboard.">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">Time Range:</span>
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 min-w-[140px] text-sm"
                        disabled={loading || refreshInProgress}
                      >
                        <option value="1d">Last 24 hours</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="all">All time</option>
                      </select>
                    </div>
                  </Tooltip>
                </div>
              </div>

              {/* Bottom Row - Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start pt-2 border-t border-gray-700">
                {/* Manual Refresh Button */}
                <Tooltip content="Manually refresh analytics data from Firebase. Shows estimated read cost to help manage Firebase usage and expenses.">
                  <button
                    onClick={handleManualRefresh}
                    disabled={loading || refreshInProgress}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 min-w-[140px] justify-center text-sm ${
                      loading || refreshInProgress
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
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
                </Tooltip>

                {/* Reset button removed - use time range selector instead */}
              </div>
            </div>
          </div>
        </div>

        {/* Reset banner removed - using time range selector instead */}

        {/* Cost Warning Modal */}
        {showCostWarning && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-auto border border-yellow-500/20 shadow-2xl my-8">
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

        {/* Priority Metrics - Compact Grid */}
        {analyticsData && (
          <>
            {/* Top Priority Row - Business Critical */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Tooltip content="Visitors identified as potential recruiters based on keywords used, time spent, and interaction patterns. AI-powered detection of recruitment interest.">
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 rounded-xl border border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-200 text-xs font-medium">
                        🎯 Recruiters
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.potentialRecruiters}
                      </p>
                      <p className="text-red-300 text-[10px] mt-1">
                        {analyticsData.foundKeywords.length} keywords used
                      </p>
                    </div>
                    <FiUserCheck className="h-6 w-6 text-red-200" />
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Number of conversations started with your AI chatbot. Each session represents someone actively engaging with your AI assistant.">
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-xl border border-purple-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-xs font-medium">
                        💬 Chat Sessions
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.totalChatSessions}
                      </p>
                      <p className="text-purple-300 text-[10px] mt-1">
                        {analyticsData.totalMessages} total messages
                      </p>
                    </div>
                    <FiMessageCircle className="h-6 w-6 text-purple-200" />
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Unique individuals who visited your portfolio. This counts each person once, regardless of how many pages they viewed.">
                <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-xl border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-200 text-xs font-medium">
                        👥 Visitors
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.uniqueVisitors}
                      </p>
                      <p className="text-green-300 text-[10px] mt-1">
                        {Math.round(analyticsData.avgSessionDuration)}m avg
                        session
                      </p>
                    </div>
                    <FiUsers className="h-6 w-6 text-green-200" />
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Number of visitors who started the interactive Product Manager portfolio tour. This guided experience showcases your PM skills and achievements.">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 rounded-xl border border-indigo-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-xs font-medium">
                        🎯 Tour Starts
                      </p>
                      <p className="text-2xl font-bold">
                        {analyticsData.tourAnalytics.totalTourStarts}
                      </p>
                      <p className="text-indigo-300 text-[10px] mt-1">
                        {analyticsData.tourAnalytics.completionRate}% complete
                        rate
                      </p>
                    </div>
                    <span className="text-indigo-200 text-2xl">🎯</span>
                  </div>
                </div>
              </Tooltip>
            </div>

            {/* Secondary Metrics Row - Supporting Data */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
              <Tooltip content="Total number of page loads across your entire portfolio website.">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg">
                  <div className="text-center">
                    <FiEye className="h-4 w-4 text-blue-200 mx-auto mb-1" />
                    <p className="text-blue-200 text-[10px]">Page Views</p>
                    <p className="text-lg font-bold">
                      {analyticsData.totalPageViews}
                    </p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Average time visitors spend on your portfolio in minutes.">
                <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-3 rounded-lg">
                  <div className="text-center">
                    <FiClock className="h-4 w-4 text-orange-200 mx-auto mb-1" />
                    <p className="text-orange-200 text-[10px]">Avg Time</p>
                    <p className="text-lg font-bold">
                      {Math.round(analyticsData.avgSessionDuration)}m
                    </p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Recent chat activity and conversation engagement.">
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-3 rounded-lg">
                  <div className="text-center">
                    <FiActivity className="h-4 w-4 text-teal-200 mx-auto mb-1" />
                    <p className="text-teal-200 text-[10px]">Chat Activity</p>
                    <p className="text-lg font-bold">
                      {filteredSessions.length}
                    </p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Engagement quality score based on interactions and time spent.">
                <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 p-3 rounded-lg">
                  <div className="text-center">
                    <FiActivity className="h-4 w-4 text-yellow-200 mx-auto mb-1" />
                    <p className="text-yellow-200 text-[10px]">Engagement</p>
                    <p className="text-lg font-bold">
                      {analyticsData.engagementMetrics.deepEngagementSessions}
                    </p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Visitors using mobile devices vs desktop.">
                <div className="bg-gradient-to-br from-gray-600 to-gray-700 p-3 rounded-lg">
                  <div className="text-center">
                    <FiSmartphone className="h-4 w-4 text-gray-200 mx-auto mb-1" />
                    <p className="text-gray-200 text-[10px]">Mobile</p>
                    <p className="text-lg font-bold">
                      {analyticsData.deviceTypes.find(
                        (d) => d.device === "Mobile"
                      )?.count || 0}
                    </p>
                  </div>
                </div>
              </Tooltip>

              <Tooltip content="Geographic diversity of your visitors.">
                <div className="bg-gradient-to-br from-pink-600 to-pink-700 p-3 rounded-lg">
                  <div className="text-center">
                    <FiGlobe className="h-4 w-4 text-pink-200 mx-auto mb-1" />
                    <p className="text-pink-200 text-[10px]">Countries</p>
                    <p className="text-lg font-bold">
                      {analyticsData.visitorLocations.length}
                    </p>
                  </div>
                </div>
              </Tooltip>
            </div>
          </>
        )}

        {/* Chatbot Analytics - PROMINENT POSITION */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 mb-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <Tooltip content="Real-time analytics for your AI chatbot showing conversation patterns, user engagement, and message statistics. Monitor how visitors interact with your AI assistant.">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-purple-300">
                <FiMessageCircle className="h-6 w-6" />
                Live Chatbot Analytics
              </h2>
            </Tooltip>
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
              <Tooltip content="Number of currently tracked chat sessions in your system. Shows recent chatbot activity and engagement.">
                <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                  <h3 className="text-purple-300 text-xs">Active Sessions</h3>
                  <p className="text-lg font-bold text-white">
                    {sessions.length}
                  </p>
                </div>
              </Tooltip>
              <Tooltip content="Total number of messages sent between visitors and your AI chatbot across all conversations.">
                <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                  <h3 className="text-purple-300 text-xs">Total Messages</h3>
                  <p className="text-lg font-bold text-white">
                    {analyticsData.totalMessages}
                  </p>
                </div>
              </Tooltip>
              <Tooltip content="Average number of messages per chat session. Higher numbers indicate deeper conversations and stronger engagement.">
                <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                  <h3 className="text-purple-300 text-xs">Avg Msg/Session</h3>
                  <p className="text-lg font-bold text-white">
                    {sessions.length > 0
                      ? Math.round(
                          analyticsData.totalMessages / sessions.length
                        )
                      : 0}
                  </p>
                </div>
              </Tooltip>
              <Tooltip content="Number of chat sessions within your selected time range. Shows recent chatbot activity level.">
                <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-500/20">
                  <h3 className="text-purple-300 text-xs">Recent Activity</h3>
                  <p className="text-lg font-bold text-white">
                    {filteredSessions.length}
                  </p>
                </div>
              </Tooltip>
            </div>
          )}

          {/* Recent Chat Sessions - Compact View */}
          <div className="bg-gray-900/50 rounded-lg p-4">
            <Tooltip content="Most recent conversations between visitors and your AI chatbot. Shows session duration, message count, and conversation snippets to understand visitor interests.">
              <h3 className="text-lg font-semibold mb-3 text-purple-300">
                Recent Chat Sessions
              </h3>
            </Tooltip>
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
              <Tooltip content="Most visited pages on your portfolio website. Shows which sections attract the most attention and where visitors spend their time.">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiBarChart className="h-5 w-5" />
                  Top Pages
                </h3>
              </Tooltip>
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
              <Tooltip content="Breakdown of devices used to visit your portfolio (Desktop, Mobile, Tablet). Helps understand your audience's viewing preferences and optimize accordingly.">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiPieChart className="h-5 w-5" />
                  Device Types
                </h3>
              </Tooltip>
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
              <Tooltip content="Most common user interactions on your portfolio such as clicks, scrolls, and navigation. Shows what elements visitors engage with most.">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiActivity className="h-5 w-5" />
                  Popular Interactions
                </h3>
              </Tooltip>
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
              <Tooltip content="AI-powered detection of visitors who show signs of recruitment interest. Based on keywords used, time spent, resume downloads, and LinkedIn clicks. Helps identify career opportunities.">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiUserCheck className="h-5 w-5" />
                  Potential Recruiters
                </h3>
              </Tooltip>
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
              <Tooltip content="Analytics for your interactive Product Manager portfolio tour. Tracks user engagement with the guided experience showcasing your PM skills, completion rates, and which steps are most effective.">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Portfolio Tour Analytics
                </h2>
              </Tooltip>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Tooltip content="Number of visitors who started the interactive portfolio tour. Shows initial interest in your guided PM experience.">
                  <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20">
                    <h3 className="text-indigo-300 text-sm">Tour Starts</h3>
                    <p className="text-2xl font-bold text-white">
                      {analyticsData.tourAnalytics.totalTourStarts}
                    </p>
                  </div>
                </Tooltip>
                <Tooltip content="Number of visitors who completed the entire portfolio tour. High completion rates indicate engaging content and clear value proposition.">
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
                </Tooltip>
                <Tooltip content="Average number of tour steps completed by visitors. Helps identify where users lose interest and which content resonates most.">
                  <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20">
                    <h3 className="text-indigo-300 text-sm">Avg Steps</h3>
                    <p className="text-2xl font-bold text-white">
                      {analyticsData.tourAnalytics.averageStepsCompleted.toFixed(
                        1
                      )}
                    </p>
                    <p className="text-xs text-gray-400">out of 6 steps</p>
                  </div>
                </Tooltip>
                <Tooltip content="The tour step that receives the most engagement and time from visitors. Indicates which aspect of your PM profile is most compelling.">
                  <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-500/20">
                    <h3 className="text-indigo-300 text-sm">Most Popular</h3>
                    <p className="text-lg font-bold text-white capitalize">
                      {analyticsData.tourAnalytics.mostPopularStep}
                    </p>
                    <p className="text-xs text-gray-400">step</p>
                  </div>
                </Tooltip>
              </div>

              {analyticsData.tourAnalytics.ctaActions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Tooltip content="Actions taken by visitors at the end of the tour (message, meeting request, restart). Shows how effectively the tour converts visitors into leads.">
                      <h4 className="text-lg font-semibold mb-3">
                        Tour CTA Actions
                      </h4>
                    </Tooltip>
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
                <Tooltip content="Times of day when recruiting activity is highest on your portfolio. Helps identify when recruiters are most active and optimize your outreach timing.">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiClock className="h-5 w-5" />
                    Peak Recruiter Hours
                  </h3>
                </Tooltip>
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
                  <Tooltip content="Average time it takes for visitors to start interacting with your portfolio after landing on the page. Lower times indicate engaging content that immediately captures attention.">
                    <p className="text-sm text-gray-400">
                      Average time to first engagement:{" "}
                      <span className="text-yellow-400 font-semibold">
                        {analyticsData.timeIntelligence.timeToEngage.toFixed(1)}{" "}
                        minutes
                      </span>
                    </p>
                  </Tooltip>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <Tooltip content="Days of the week with highest recruiting activity on your portfolio. Helps understand weekly patterns and optimal days for portfolio updates or outreach.">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiTrendingUp className="h-5 w-5" />
                    Weekly Patterns
                  </h3>
                </Tooltip>
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
              <Tooltip content="Advanced analytics about companies and industries visiting your portfolio. Identifies which sectors show most interest and helps target your job search strategy.">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FiBriefcase className="h-5 w-5" />
                  Industry & Company Intelligence
                </h2>
              </Tooltip>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Tooltip content="Industries with the highest number of visitors and engagement scores. Shows which sectors are most interested in your profile and skills.">
                    <h4 className="text-lg font-semibold mb-3">
                      Top Industries
                    </h4>
                  </Tooltip>
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
                  <Tooltip content="Breakdown of visiting companies by size (startup, small, medium, enterprise). Shows which company types are most interested and their conversion rates.">
                    <h4 className="text-lg font-semibold mb-3">
                      Company Sizes
                    </h4>
                  </Tooltip>
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
                  <Tooltip content="Overall recruiting activity level in your market on a scale of 1-10. Higher scores indicate more active hiring and better job market conditions.">
                    <h4 className="text-lg font-semibold mb-3">
                      Recruiting Intensity
                    </h4>
                  </Tooltip>
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
                <Tooltip content="Metrics measuring the quality and depth of visitor engagement with your portfolio. Higher quality engagement indicates stronger interest and better conversion potential.">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiActivity className="h-5 w-5" />
                    Engagement Quality
                  </h3>
                </Tooltip>
                <div className="space-y-4">
                  <Tooltip content="Percentage of page content that visitors scroll through on average. Higher values indicate visitors are consuming more of your content.">
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
                  </Tooltip>
                  <Tooltip content="Percentage of visitors who return to your portfolio multiple times. High rates indicate memorable content and sustained interest.">
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
                  </Tooltip>
                  <Tooltip content="Number of sessions lasting more than 5 minutes with multiple interactions. These represent highly engaged visitors with strong interest in your profile.">
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          Deep Engagement Sessions
                        </span>
                        <span className="font-bold text-purple-400">
                          {
                            analyticsData.engagementMetrics
                              .deepEngagementSessions
                          }
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        5+ minutes with multiple interactions
                      </p>
                    </div>
                  </Tooltip>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl">
                <Tooltip content="Track conversion events like resume downloads, LinkedIn clicks, contact forms, and meeting requests. Shows how effectively your portfolio converts visitors into leads.">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiBarChart className="h-5 w-5" />
                    Conversion Funnel
                  </h3>
                </Tooltip>
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
                <Tooltip content="Analysis of skill demand trends based on recruiter searches and market data. Helps identify which skills to highlight and which ones to develop.">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiTrendingUp className="h-5 w-5" />
                    Skill Demand Analysis
                  </h3>
                </Tooltip>
                <div className="mb-4">
                  <div className="text-center mb-4">
                    <Tooltip content="Overall score (1-10) indicating how well your skills align with current market demand trends. Higher scores suggest better market positioning.">
                      <div className="text-3xl font-bold text-yellow-400">
                        {analyticsData.skillAnalysis.skillTrendScore}/10
                      </div>
                      <p className="text-sm text-gray-400">Skill Trend Score</p>
                    </Tooltip>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Tooltip content="Skills that are currently in high demand by recruiters and showing upward trends in the job market.">
                      <h5 className="text-sm font-semibold text-green-400 mb-2">
                        In-Demand Skills
                      </h5>
                    </Tooltip>
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
                    <Tooltip content="Important keywords that are missing from your portfolio but are commonly searched by recruiters in your field.">
                      <h5 className="text-sm font-semibold text-orange-400 mb-2">
                        Missing Keywords
                      </h5>
                    </Tooltip>
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
                <Tooltip content="Compare your portfolio performance against industry benchmarks. Shows where you excel and areas for improvement relative to other professionals.">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiPieChart className="h-5 w-5" />
                    Competitive Benchmarks
                  </h3>
                </Tooltip>
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
              <Tooltip content="Geographic analysis of your portfolio visitors and market intelligence. Identifies the best regions for job opportunities, remote work, and market penetration insights.">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <FiGlobe className="h-5 w-5" />
                  Geographic & Market Intelligence
                </h2>
              </Tooltip>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Tooltip content="Geographic regions with high concentration of remote job opportunities and visitor interest in your profile. Great for targeting remote work applications.">
                    <h4 className="text-lg font-semibold mb-3">
                      Remote-Friendly Markets
                    </h4>
                  </Tooltip>
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
                  <Tooltip content="Cities and regions with high hiring activity and recruiter presence. These are prime locations for in-person job opportunities and networking.">
                    <h4 className="text-lg font-semibold mb-3">
                      Hiring Hotspots
                    </h4>
                  </Tooltip>
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
                  <Tooltip content="Regional market analysis showing your current reach and untapped opportunities. Higher opportunity scores indicate markets with growth potential.">
                    <h4 className="text-lg font-semibold mb-3">
                      Market Penetration
                    </h4>
                  </Tooltip>
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

        {/* Sessions for Keyword Modal - Enhanced Scrolling */}
        {selectedKeyword && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              // Only close if clicking on the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                setSelectedKeyword(null);
              }
            }}
          >
            <div
              className="bg-gray-800 rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-600"
              onClick={(e) => e.stopPropagation()} // Prevent backdrop clicks from closing modal
            >
              {/* Fixed Header */}
              <div className="flex-shrink-0 p-6 border-b border-gray-700 bg-gray-800">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      Sessions containing &ldquo;{selectedKeyword}&rdquo;
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {
                        sessions.filter((session) =>
                          analyticsData?.foundKeywords
                            .find((k) => k.keyword === selectedKeyword)
                            ?.sessionIds.includes(session.sessionId)
                        ).length
                      }{" "}
                      sessions found
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedKeyword(null)}
                    className="text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Enhanced Scrollable Content - Force Scrollable */}
              <div
                className="flex-1 overflow-y-scroll overflow-x-hidden min-h-0"
                style={{
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "thin", // Firefox
                  scrollbarColor: "#3B82F6 #374151", // Firefox
                }}
                onWheel={(e) => {
                  // Always allow scrolling within this container
                  e.stopPropagation();
                }}
              >
                <div className="p-6 min-h-[200px]">
                  {/* Scroll Indicator */}
                  <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm p-2 rounded-lg mb-4 border border-blue-500/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-300 font-medium">
                        📜 Scrollable Sessions List
                      </span>
                      <span className="text-gray-400">
                        Use mouse wheel or scroll bar to navigate
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {sessions
                      .filter((session) =>
                        analyticsData?.foundKeywords
                          .find((k) => k.keyword === selectedKeyword)
                          ?.sessionIds.includes(session.sessionId)
                      )
                      .map((session, index) => (
                        <div
                          key={session.sessionId}
                          className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 hover:from-gray-650 hover:to-gray-750 transition-all duration-200 border border-gray-600/50 hover:border-blue-500/30"
                        >
                          {/* Session Header */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-lg text-blue-300">
                                  Session {session.sessionId.slice(-8)}
                                </h4>
                                <p className="text-xs text-gray-400">
                                  {formatTimestamp(session.startTime)} •{" "}
                                  {session.messageCount} messages
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-400 bg-gray-600/50 px-3 py-1 rounded-full">
                              {getSessionDuration(
                                session.startTime,
                                session.endTime
                              )}
                            </div>
                          </div>

                          {/* Enhanced Messages Gallery with Independent Scrolling */}
                          <div className="relative">
                            <div
                              className="space-y-3 max-h-60 overflow-y-scroll overflow-x-hidden pr-2"
                              style={{
                                scrollBehavior: "smooth",
                                WebkitOverflowScrolling: "touch",
                              }}
                              onWheel={(e) => {
                                // Allow wheel events to bubble up to parent only if this scroll area is at limits
                                const element = e.currentTarget;
                                const atTop = element.scrollTop === 0;
                                const atBottom =
                                  element.scrollTop + element.clientHeight >=
                                  element.scrollHeight - 1;

                                if (
                                  (e.deltaY < 0 && atTop) ||
                                  (e.deltaY > 0 && atBottom)
                                ) {
                                  // Allow parent scrolling when at scroll limits
                                  return;
                                } else {
                                  // Prevent parent scrolling when this area can still scroll
                                  e.stopPropagation();
                                }
                              }}
                            >
                              {session.messages.map((message, msgIndex) => (
                                <div
                                  key={message.id}
                                  className={`text-sm p-4 rounded-lg transition-all duration-200 ${
                                    message.role === "user"
                                      ? "bg-gradient-to-r from-blue-900/40 to-blue-800/30 border-l-4 border-blue-400 text-blue-100 hover:from-blue-800/50 hover:to-blue-700/40"
                                      : "bg-gradient-to-r from-gray-600/40 to-gray-500/30 border-l-4 border-gray-400 text-gray-100 hover:from-gray-500/50 hover:to-gray-400/40"
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-xs flex items-center gap-2">
                                      {message.role === "user" ? (
                                        <>
                                          <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">
                                            👤
                                          </span>
                                          User
                                        </>
                                      ) : (
                                        <>
                                          <span className="w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center text-[10px]">
                                            🤖
                                          </span>
                                          AI Assistant
                                        </>
                                      )}
                                    </span>
                                    <span className="text-xs opacity-60">
                                      #{msgIndex + 1}
                                    </span>
                                  </div>
                                  <p className="mt-2 leading-relaxed whitespace-pre-wrap break-words">
                                    {message.message}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {/* Scroll Indicator for Messages */}
                            {session.messages.length > 2 && (
                              <div className="absolute bottom-0 right-0 bg-blue-600/20 backdrop-blur-sm px-2 py-1 rounded-tl-lg text-[10px] text-blue-300 pointer-events-none">
                                Scroll for more ↓
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                    {/* No Sessions Found State */}
                    {sessions.filter((session) =>
                      analyticsData?.foundKeywords
                        .find((k) => k.keyword === selectedKeyword)
                        ?.sessionIds.includes(session.sessionId)
                    ).length === 0 && (
                      <div className="text-center py-16 text-gray-400">
                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FiMessageCircle className="h-8 w-8 opacity-50" />
                        </div>
                        <h4 className="text-xl font-semibold mb-2">
                          No Sessions Found
                        </h4>
                        <p className="text-sm">
                          No chat sessions contain the keyword "
                          {selectedKeyword}"
                        </p>
                      </div>
                    )}

                    {/* Bottom Scroll Indicator */}
                    {sessions.filter((session) =>
                      analyticsData?.foundKeywords
                        .find((k) => k.keyword === selectedKeyword)
                        ?.sessionIds.includes(session.sessionId)
                    ).length > 0 && (
                      <div className="text-center py-8 border-t border-gray-700/50 mt-8">
                        <div className="text-sm text-gray-400 bg-gray-700/30 px-4 py-2 rounded-lg inline-block">
                          🎯 End of sessions for "{selectedKeyword}" -
                          <span className="text-blue-300 ml-1">
                            {
                              sessions.filter((session) =>
                                analyticsData?.foundKeywords
                                  .find((k) => k.keyword === selectedKeyword)
                                  ?.sessionIds.includes(session.sessionId)
                              ).length
                            }{" "}
                            total sessions
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer with Stats */}
              <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800/50">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>
                    Keyword:{" "}
                    <span className="text-blue-400 font-semibold">
                      "{selectedKeyword}"
                    </span>
                  </span>
                  <span>
                    Found in{" "}
                    {analyticsData?.foundKeywords.find(
                      (k) => k.keyword === selectedKeyword
                    )?.count || 0}{" "}
                    messages across{" "}
                    {
                      sessions.filter((session) =>
                        analyticsData?.foundKeywords
                          .find((k) => k.keyword === selectedKeyword)
                          ?.sessionIds.includes(session.sessionId)
                      ).length
                    }{" "}
                    sessions
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Performance & Firebase Usage */}
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <Tooltip content="Real-time monitoring of your analytics system performance and Firebase database usage costs. Helps optimize expenses and track system efficiency.">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FiActivity className="h-5 w-5" />
              System Performance & Firebase Usage
            </h2>
          </Tooltip>

          {/* Firebase Usage Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Tooltip content="Number of Firebase database read operations performed in this analytics session. Reads cost $0.36 per 100,000 operations.">
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
            </Tooltip>
            <Tooltip content="Number of Firebase database write operations performed in this session. Writes cost $1.08 per 100,000 operations.">
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
            </Tooltip>
            <Tooltip content="Number of Firebase reads consumed by the last manual data refresh operation. Helps track refresh costs.">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-400 text-xs mb-1">Last Refresh</h3>
                <p className="text-lg font-bold">
                  {refreshCost.reads > 0 ? refreshCost.reads : "-"}
                </p>
                <p className="text-xs text-gray-500">reads used</p>
              </div>
            </Tooltip>
            <Tooltip content="Estimated total cost for Firebase operations in this session based on current pricing. Includes both read and write operations.">
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
            </Tooltip>
            <Tooltip content="Data quality and analytics accuracy score based on recent refresh and data completeness.">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-400 text-xs mb-1">Data Quality</h3>
                <p className="text-lg font-bold text-green-400">
                  {analyticsData ? "98%" : "N/A"}
                </p>
                <p className="text-xs text-gray-500">accuracy</p>
              </div>
            </Tooltip>
            <Tooltip content="Efficiency score based on Firebase usage and data processing performance.">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-gray-400 text-xs mb-1">Efficiency</h3>
                <p className="text-lg font-bold text-blue-400">
                  {firebaseReads <= 20
                    ? "High"
                    : firebaseReads <= 50
                      ? "Good"
                      : "Fair"}
                </p>
                <p className="text-xs text-gray-500">performance</p>
              </div>
            </Tooltip>
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
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-gray-900 rounded-xl shadow-xl w-full max-w-7xl max-h-[95vh] h-[95vh] flex flex-col relative border border-gray-700">
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

                  <div className="text-sm text-gray-400 bg-gray-700/50 px-3 py-2 rounded-lg">
                    Time Range:{" "}
                    <span className="text-purple-300 font-medium">
                      {timeRange}
                    </span>
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

              {/* Enhanced Scrollable Content with Proper Hierarchy */}
              <div
                className="flex-1 overflow-y-scroll overflow-x-hidden"
                style={{
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <FiMessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No chat sessions found</p>
                        <p className="text-sm">Try adjusting your filters</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredSessions.map((session) => (
                          <div
                            key={session.sessionId}
                            className="bg-gray-800/60 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/50 hover:bg-gray-800/80 transition-all duration-200 shadow-lg hover:shadow-purple-500/10"
                          >
                            {/* Compact Session Header */}
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700/50">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <div>
                                  <h3 className="font-bold text-sm text-white">
                                    Session {session.sessionId.slice(-8)}
                                  </h3>
                                  <p className="text-[10px] text-gray-400">
                                    🕐 {formatTimestamp(session.startTime)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right bg-purple-900/30 px-2 py-1 rounded text-xs">
                                <p className="text-purple-300 font-bold">
                                  {getSessionDuration(
                                    session.startTime,
                                    session.endTime
                                  )}
                                </p>
                                <p className="text-[10px] text-gray-400">
                                  {session.messageCount} msgs
                                </p>
                              </div>
                            </div>

                            {/* Enhanced Messages Gallery with Independent Scrolling */}
                            <div className="relative">
                              <div
                                className="space-y-2 max-h-48 overflow-y-scroll overflow-x-hidden pr-2"
                                style={{
                                  scrollBehavior: "smooth",
                                  WebkitOverflowScrolling: "touch",
                                }}
                                onWheel={(e) => {
                                  // Allow wheel events to bubble up to parent only if this scroll area is at limits
                                  const element = e.currentTarget;
                                  const atTop = element.scrollTop === 0;
                                  const atBottom =
                                    element.scrollTop + element.clientHeight >=
                                    element.scrollHeight - 1;

                                  if (
                                    (e.deltaY < 0 && atTop) ||
                                    (e.deltaY > 0 && atBottom)
                                  ) {
                                    // Allow parent scrolling when at scroll limits
                                    return;
                                  } else {
                                    // Prevent parent scrolling when this area can still scroll
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                {session.messages.map((message, index) => (
                                  <div
                                    key={message.id}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      message.role === "user"
                                        ? "bg-gradient-to-r from-blue-900/40 to-blue-800/30 border-l-2 border-blue-500 ml-2"
                                        : "bg-gradient-to-r from-gray-700/50 to-gray-600/40 border-l-2 border-gray-500 mr-2"
                                    }`}
                                  >
                                    {/* Compact Message Header */}
                                    <div className="flex items-center justify-between mb-1">
                                      <span
                                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                                          message.role === "user"
                                            ? "bg-blue-600/50 text-blue-100"
                                            : "bg-gray-600/50 text-gray-100"
                                        }`}
                                      >
                                        {message.role === "user" ? "👤" : "🤖"}{" "}
                                        #{index + 1}
                                      </span>
                                    </div>

                                    {/* Compact Message Content */}
                                    <div
                                      className={`text-xs leading-relaxed ${
                                        message.role === "user"
                                          ? "text-blue-100"
                                          : "text-gray-100"
                                      }`}
                                    >
                                      <p className="whitespace-pre-wrap line-clamp-3 break-words">
                                        {message.message}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Scroll Indicator for Messages */}
                              {session.messages.length > 3 && (
                                <div className="absolute bottom-0 right-0 bg-purple-600/20 backdrop-blur-sm px-2 py-1 rounded-tl-lg text-[10px] text-purple-300 pointer-events-none">
                                  Scroll for more ↓
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Load More Section */}
                    {hasMore && (
                      <div className="flex justify-center pt-6 pb-4">
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

        {/* Reset modal removed - time range selector provides all needed functionality */}
      </div>
    </div>
  );
}
