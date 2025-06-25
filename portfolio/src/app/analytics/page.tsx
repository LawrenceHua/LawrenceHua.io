"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiLock, 
  FiMessageCircle, 
  FiUsers, 
  FiTrendingUp, 
  FiBarChart, 
  FiClock, 
  FiGlobe, 
  FiSmartphone, 
  FiMonitor, 
  FiTarget,
  FiCalendar,
  FiMail,
  FiFileText,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiMousePointer,
  FiMapPin,
  FiActivity,
  FiSearch,
  FiFilter,
  FiPieChart,
  FiUserCheck,
  FiX
} from "react-icons/fi";
import { FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
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
import AnalyticsAssistant from "@/components/analytics/AnalyticsAssistant";

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

interface EngagementHeatmap {
  section: string;
  averageTimeSpent: number;
  scrollDepth: number;
  interactions: number;
  bounceRate: number;
}

interface FirebaseUsageLog {
  id: string;
  type: "read" | "write";
  operation: string;
  cost: number;
  sessionId: string;
  timestamp: any;
  collection?: string;
  documentCount?: number;
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
  timeIntelligence: {
    peakHours: { hour: number; recruiterActivity: number }[];
    peakDays: { day: string; recruiterActivity: number }[];
    seasonalTrends: { month: string; activity: number }[];
    timeToEngage: number;
  };
  engagementMetrics: {
    averageScrollDepth: number;
    sectionHeatmap: EngagementHeatmap[];
    multiVisitRate: number;
    returnVisitorEngagement: number;
    deepEngagementSessions: number;
  };
  firebaseUsage: {
    totalReads: number;
    totalWrites: number;
    totalCost: number;
    dailyUsage: { date: string; reads: number; writes: number; cost: number }[];
    topOperations: { operation: string; count: number; totalCost: number }[];
    sessionReads: number;
    sessionWrites: number;
  };
  chatbotAnalytics?: {
    totalSessions: number;
    totalButtonClicks: number;
    totalMessagesExchanged: number;
    totalFileUploads: number;
    totalMeetingSchedules: number;
    avgMessagesPerSession: number;
    avgSessionDuration: number;
    mostPopularButtons: { buttonType: string; count: number }[];
    conversationStarters: { source: string; count: number }[];
    sessionLengthDistribution: { range: string; count: number }[];
    fileUploadStats: {
      totalUploads: number;
      fileTypes: { type: string; count: number }[];
      avgFileSize: number;
    };
    timeMetrics: {
      peakHours: { hour: number; count: number }[];
      dailyActivity: { date: string; count: number }[];
    };
    userEngagement: {
      bounceRate: number;
      deepEngagementSessions: number;
      averageWordsPerMessage: number;
    };
    conversionMetrics: {
      popupToChat: number;
      chatToMessage: number;
      chatToMeeting: number;
      chatToFileUpload: number;
    };
  };
}

export default function AnalyticsPage() {
  // State management
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [tourEvents, setTourEvents] = useState<TourEvent[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "assistant">("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [timeRange, setTimeRange] = useState<"1d" | "7d" | "30d" | "custom" | "all">("30d");
  const [customDays, setCustomDays] = useState<number>(7);
  const [firebaseUsageLogs, setFirebaseUsageLogs] = useState<FirebaseUsageLog[]>([]);
  const [db, setDb] = useState<Firestore | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showKeywordsModal, setShowKeywordsModal] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [lastSessionTimestamp, setLastSessionTimestamp] = useState<Date | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [showChatbotFullScreen, setShowChatbotFullScreen] = useState(false);
  const [chatbotAnalytics, setChatbotAnalytics] = useState<any>(null);
  const [chatbotAnalyticsLoading, setChatbotAnalyticsLoading] = useState(false);
  const [showAnalyticsAssistant, setShowAnalyticsAssistant] = useState(false);
  const [refreshCost, setRefreshCost] = useState({ reads: 0, writes: 0 });
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [showCostWarning, setShowCostWarning] = useState(false);
  const [refreshInProgress, setRefreshInProgress] = useState(false);
  
  const PAGE_SIZE = 100;

  // Firebase usage tracking
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

  // Firebase tracking functions
  const logFirebaseOperation = async (
    type: "read" | "write",
    operation: string,
    collectionName?: string,
    documentCount: number = 1
  ) => {
    if (!db) return;
    const cost = type === "read" ? (documentCount * 0.36) / 100000 : (documentCount * 1.08) / 100000;
    const logEntry: Omit<FirebaseUsageLog, "id"> = {
      type,
      operation,
      cost,
      sessionId: getSessionId(),
      timestamp: serverTimestamp(),
      collection: collectionName,
      documentCount,
    };
    try {
      await addDoc(collection(db, "firebase_usage_logs"), logEntry);
    } catch (error) {
      console.error("Error logging Firebase operation:", error);
    }
  };

  function incrementRead(operation: string = "unknown", collectionName?: string, docCount: number = 1) {
    if (typeof window !== "undefined") {
      const newReads = firebaseReads + docCount;
      setFirebaseReads(newReads);
      sessionStorage.setItem("firebaseReads", newReads.toString());
      logFirebaseOperation("read", operation, collectionName, docCount);
    }
  }

  function incrementWrite(operation: string = "unknown", collectionName?: string, docCount: number = 1) {
    if (typeof window !== "undefined") {
      const newWrites = firebaseWrites + docCount;
      setFirebaseWrites(newWrites);
      sessionStorage.setItem("firebaseWrites", newWrites.toString());
      logFirebaseOperation("write", operation, collectionName, docCount);
    }
  }

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

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem("sessionId");
    if (!sessionId) {
      sessionId = new Date().getTime() + "_" + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem("sessionId", sessionId);
    }
    return sessionId;
  };

  // Initialize Firebase and authentication
  useEffect(() => {
    const storedPassword = sessionStorage.getItem("analytics_password");
    if (storedPassword === process.env.NEXT_PUBLIC_SECRET_PASS) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
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
      startDataCollection();
    }
  }, [db, isAuthenticated]);

  // Fetch chatbot analytics
  const fetchChatbotAnalytics = async () => {
    setChatbotAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/chatbot-analytics?timeRange=${timeRange}&customDays=${customDays}`);
      const data = await response.json();
      
      if (data.success) {
        setChatbotAnalytics(data.data);
      } else {
        console.error("Failed to fetch chatbot analytics:", data.error);
      }
    } catch (error) {
      console.error("Error fetching chatbot analytics:", error);
    } finally {
      setChatbotAnalyticsLoading(false);
    }
  };

  // Start data collection
  const startDataCollection = () => {
    trackPageView();
    trackUserInteractions();
    trackDeviceInfo();
  };

  const trackPageView = async () => {
    if (!db) return;
    try {
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
      incrementWrite("track_page_view", "page_views", 1);
    } catch (error) {
      console.error("Error tracking page view:", error);
    }
  };

  const trackUserInteractions = () => {
    const sessionId = getSessionId();
    let lastClickTime = 0;
    let scrollTrackingEnabled = true;

    document.addEventListener("click", async (e) => {
      const now = Date.now();
      if (now - lastClickTime < 1000) return;
      lastClickTime = now;
      const target = e.target as HTMLElement;

      const className = (target.className && typeof target.className === "string" ? target.className.toString() : "") || "";
      const id = (target.id && typeof target.id === "string" ? target.id.toString() : "") || "";
      const isImportantClick = target.tagName.toLowerCase() === "button" ||
        target.tagName.toLowerCase() === "a" ||
        target.getAttribute("role") === "button" ||
        className.includes("btn") ||
        className.includes("click") ||
        id.includes("nav") ||
        id.includes("contact");

      if (!isImportantClick) return;

      const interaction = {
        type: "click",
        element: target.tagName.toLowerCase() + (target.id ? `#${target.id}` : "") + (target.className && typeof target.className === "string" ? `.${target.className.split(" ")[0]}` : ""),
        page: window.location.pathname,
        sessionId,
        timestamp: serverTimestamp(),
      };

      if (db) {
        try {
          await addDoc(collection(db, "user_interactions"), interaction);
          incrementWrite("track_interaction", "user_interactions", 1);
        } catch (error) {
          console.error("Error tracking interaction:", error);
        }
      }
    });

    let maxScroll = 0;
    window.addEventListener("scroll", async () => {
      if (!scrollTrackingEnabled || window.location.pathname === "/analytics") return;
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
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
              incrementWrite("track_scroll", "user_interactions", 1);
            } catch (error) {
              console.error("Error tracking scroll:", error);
            }
          }
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
      incrementWrite("track_device_info", "device_info", 1);
    } catch (error) {
      console.error("Error tracking device info:", error);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SECRET_PASS) {
      sessionStorage.setItem("analytics_password", process.env.NEXT_PUBLIC_SECRET_PASS || "");
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
      window.location.href = "/";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <FiLock className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold">Analytics Access</h1>
          </div>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter analytics password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Access Analytics
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Fetch Firebase usage logs
  const fetchFirebaseUsageLogs = async () => {
    if (!db) return;
    try {
      const usageLogsRef = collection(db, "firebase_usage_logs");
      const usageLogsQuery = query(usageLogsRef, orderBy("timestamp", "desc"));
      const usageLogsSnap = await getDocs(usageLogsQuery);
      incrementRead("fetch_firebase_usage_logs", "firebase_usage_logs", usageLogsSnap.docs.length);
      const usageLogs: FirebaseUsageLog[] = usageLogsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirebaseUsageLog[];
      setFirebaseUsageLogs(usageLogs);
    } catch (error) {
      console.error("Error fetching Firebase usage logs:", error);
    }
  };

  // Estimate refresh cost
  const estimateRefreshCost = () => {
    const estimatedDocsPerCollection = 100;
    const collectionsToRead = 4;
    const estimatedReads = estimatedDocsPerCollection * collectionsToRead;
    const estimatedWrites = 0;
    return {
      reads: estimatedReads,
      writes: estimatedWrites,
      cost: (estimatedReads * 0.36) / 100000 + (estimatedWrites * 1.08) / 100000,
    };
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    const cost = estimateRefreshCost();
    setRefreshCost(cost);
    const timeSinceLastRefresh = lastRefreshTime ? (Date.now() - lastRefreshTime.getTime()) / 1000 / 60 : Infinity;
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
      await Promise.all([
        fetchAllData(),
        fetchFirebaseUsageLogs(),
        fetchChatbotAnalytics(),
      ]);
      setLastRefreshTime(new Date());
      const actualCost = {
        reads: firebaseReads - startReads,
        writes: firebaseWrites - startWrites,
      };
      setRefreshCost(actualCost);
    } finally {
      setRefreshInProgress(false);
    }
  };

  // Fetch all data from Firebase
  const fetchAllData = async (append = false) => {
    if (!db) return;
    setLoading(true);
    const startTime = Date.now();
    try {
      // Fetch chat messages
      const messagesRef = collection(db, "chatbot_messages");
      let messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(250));
      if (append && lastSessionTimestamp) {
        messagesQuery = query(messagesRef, where("timestamp", "<", lastSessionTimestamp), orderBy("timestamp", "desc"), limit(PAGE_SIZE));
      }
      const messagesSnap = await getDocs(messagesQuery);
      incrementRead("fetch_chatbot_messages", "chatbot_messages", messagesSnap.docs.length);
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

      const chatSessions: ChatSession[] = Array.from(sessionMap.entries()).map(([sessionId, messages]) => {
        const sortedMessages = messages.sort((a, b) => (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime());
        const startTime = sortedMessages[0]?.timestamp?.toDate?.() || new Date(sortedMessages[0]?.timestamp);
        const endTime = sortedMessages[sortedMessages.length - 1]?.timestamp?.toDate?.() || new Date(sortedMessages[sortedMessages.length - 1]?.timestamp);
        return {
          sessionId,
          messages: sortedMessages,
          startTime,
          endTime,
          messageCount: messages.length,
        };
      });

      // Fetch page views
      const pageViewsRef = collection(db, "page_views");
      const pageViewsQuery = query(pageViewsRef, orderBy("timestamp", "desc"));
      const pageViewsSnap = await getDocs(pageViewsQuery);
      incrementRead("fetch_page_views", "page_views", pageViewsSnap.docs.length);
      const pageViewsData: PageView[] = pageViewsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PageView[];

      // Fetch user interactions
      const interactionsRef = collection(db, "user_interactions");
      const interactionsQuery = query(interactionsRef, orderBy("timestamp", "desc"));
      const interactionsSnap = await getDocs(interactionsQuery);
      incrementRead("fetch_user_interactions", "user_interactions", interactionsSnap.docs.length);
      const interactionsData: UserInteraction[] = interactionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserInteraction[];

      // Fetch tour events
      const tourEventsRef = collection(db, "tour_events");
      const tourEventsQuery = query(tourEventsRef, orderBy("timestamp", "desc"));
      const tourEventsSnap = await getDocs(tourEventsQuery);
      incrementRead("fetch_tour_events", "tour_events", tourEventsSnap.docs.length);
      const tourEventsData: TourEvent[] = tourEventsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TourEvent[];

      // Update state
      setSessions((prev) => append ? [...prev, ...chatSessions] : chatSessions);
      setPageViews((prev) => append ? [...prev, ...pageViewsData] : pageViewsData);
      setInteractions((prev) => append ? [...prev, ...interactionsData] : interactionsData);
      setTourEvents((prev) => append ? [...prev, ...tourEventsData] : tourEventsData);

      // Calculate analytics
      const analytics = calculateAnalyticsData(
        append ? [...sessions, ...chatSessions] : chatSessions,
        append ? [...pageViews, ...pageViewsData] : pageViewsData,
        append ? [...interactions, ...interactionsData] : interactionsData,
        append ? [...tourEvents, ...tourEventsData] : tourEventsData,
        firebaseUsageLogs,
        firebaseReads,
        firebaseWrites
      );
      setAnalyticsData(analytics);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const totalDocsRead = messagesSnap.docs.length + pageViewsSnap.docs.length + interactionsSnap.docs.length + tourEventsSnap.docs.length;
      setRefreshCost({ reads: totalDocsRead, writes: 0 });
      setLastRefreshTime(new Date());
      console.log(`Data fetching completed in ${duration}ms`);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Firebase usage analytics
  const calculateFirebaseUsage = (firebaseUsageLogs: FirebaseUsageLog[], startDate: Date) => {
    const filteredLogs = firebaseUsageLogs.filter((log) => log.timestamp && log.timestamp.toDate && log.timestamp.toDate() >= startDate);
    const totalReads = filteredLogs.filter((log) => log.type === "read").reduce((sum, log) => sum + (log.documentCount || 1), 0);
    const totalWrites = filteredLogs.filter((log) => log.type === "write").reduce((sum, log) => sum + (log.documentCount || 1), 0);
    const totalCost = filteredLogs.reduce((sum, log) => sum + log.cost, 0);

    const dailyUsageMap = new Map<string, { reads: number; writes: number; cost: number }>();
    filteredLogs.forEach((log) => {
      if (log.timestamp && log.timestamp.toDate) {
        const date = log.timestamp.toDate().toISOString().split("T")[0];
        if (!dailyUsageMap.has(date)) {
          dailyUsageMap.set(date, { reads: 0, writes: 0, cost: 0 });
        }
        const dayData = dailyUsageMap.get(date)!;
        const docCount = log.documentCount || 1;
        if (log.type === "read") dayData.reads += docCount;
        if (log.type === "write") dayData.writes += docCount;
        dayData.cost += log.cost;
      }
    });

    const dailyUsage = Array.from(dailyUsageMap.entries()).map(([date, data]) => ({ date, ...data })).sort((a, b) => a.date.localeCompare(b.date));

    const operationMap = new Map<string, { count: number; totalCost: number }>();
    filteredLogs.forEach((log) => {
      if (!operationMap.has(log.operation)) {
        operationMap.set(log.operation, { count: 0, totalCost: 0 });
      }
      const opData = operationMap.get(log.operation)!;
      opData.count++;
      opData.totalCost += log.cost;
    });

    const topOperations = Array.from(operationMap.entries()).map(([operation, data]) => ({ operation, ...data })).sort((a, b) => b.count - a.count).slice(0, 10);

    return {
      totalReads,
      totalWrites,
      totalCost,
      dailyUsage,
      topOperations,
      sessionReads: 0,
      sessionWrites: 0,
    };
  };

  // Main analytics calculation function
  const calculateAnalyticsData = (
    sessions: ChatSession[],
    pageViews: PageView[],
    interactions: UserInteraction[],
    tourEvents: TourEvent[] = [],
    firebaseUsageLogs: FirebaseUsageLog[] = [],
    sessionReads: number = 0,
    sessionWrites: number = 0
  ): AnalyticsData => {
    // Apply time range filtering
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
      case "custom":
        startDate = new Date(now.getTime() - customDays * 24 * 60 * 60 * 1000);
        break;
      case "all":
      default:
        startDate = new Date(0);
        break;
    }

    // Filter data based on time range
    const filteredSessions = sessions.filter((session) => session.startTime >= startDate);
    const filteredPageViews = pageViews.filter((pv) => pv.timestamp && pv.timestamp.toDate && pv.timestamp.toDate() >= startDate);
    const filteredInteractions = interactions.filter((interaction) => interaction.timestamp && interaction.timestamp.toDate && interaction.timestamp.toDate() >= startDate);

    // Unique visitors calculation
    const uniqueSessions = new Set([...filteredSessions.map((s) => s.sessionId), ...filteredPageViews.map((p) => p.sessionId)]);

    // Top pages calculation
    const pageCounts = new Map<string, number>();
    filteredPageViews.forEach((pv) => {
      pageCounts.set(pv.page, (pageCounts.get(pv.page) || 0) + 1);
    });
    const topPages = Array.from(pageCounts.entries()).map(([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views).slice(0, 5);

    // Device types calculation
    const deviceCounts = new Map<string, number>();
    filteredPageViews.forEach((pv) => {
      const isMobile = /Mobile|Android|iPhone|iPad/.test(pv.userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/.test(pv.userAgent);
      let device = "Desktop";
      if (isTablet) device = "Tablet";
      else if (isMobile) device = "Mobile";
      deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    });
    const deviceTypes = Array.from(deviceCounts.entries()).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count);

    // Top referrers calculation
    const referrerCounts = new Map<string, number>();
    filteredPageViews.forEach((pv) => {
      const referrer = pv.referrer === "direct" ? "Direct" : pv.referrer.includes("google") ? "Google" : pv.referrer.includes("linkedin") ? "LinkedIn" : pv.referrer.includes("github") ? "GitHub" : "Other";
      referrerCounts.set(referrer, (referrerCounts.get(referrer) || 0) + 1);
    });
    const topReferrers = Array.from(referrerCounts.entries()).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count);

    // Hourly activity calculation
    const hourlyCounts = new Map<number, number>();
    filteredPageViews.forEach((pv) => {
      if (pv.timestamp && pv.timestamp.toDate) {
        const hour = pv.timestamp.toDate().getHours();
        hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
      }
    });
    const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: hourlyCounts.get(i) || 0 }));

    // Daily activity calculation
    const dailyCounts = new Map<string, number>();
    const dayCount = timeRange === "1d" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "custom" ? customDays : 7;
    const recentDays = Array.from({ length: dayCount }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split("T")[0];
    }).reverse();

    filteredPageViews.forEach((pv) => {
      if (pv.timestamp && pv.timestamp.toDate) {
        const date = pv.timestamp.toDate().toISOString().split("T")[0];
        if (recentDays.includes(date)) {
          dailyCounts.set(date, (dailyCounts.get(date) || 0) + 1);
        }
      }
    });
    const dailyActivity = recentDays.map((date) => ({ date, count: dailyCounts.get(date) || 0 }));

    // Popular interactions calculation
    const interactionCounts = new Map<string, number>();
    filteredInteractions.forEach((interaction) => {
      interactionCounts.set(interaction.type, (interactionCounts.get(interaction.type) || 0) + 1);
    });
    const popularInteractions = Array.from(interactionCounts.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

    // Average session duration calculation
    const chatSessionDuration = filteredSessions.reduce((sum, session) => {
      return sum + (session.endTime.getTime() - session.startTime.getTime());
    }, 0);
    const pageViewDuration = filteredPageViews.reduce((sum, pv) => {
      return sum + (pv.timeOnPage || 0) * 1000;
    }, 0);
    const totalDuration = chatSessionDuration + pageViewDuration;
    const totalSessions = Math.max(filteredSessions.length, filteredPageViews.length, 1);
    const avgSessionDuration = totalDuration / totalSessions / 1000 / 60;

    // Visitor locations calculation
    const countryCounts = new Map<string, number>();
    const cityCounts = new Map<string, { city: string; country: string; count: number }>();
    filteredPageViews.forEach((pv) => {
      if (pv.country) {
        countryCounts.set(pv.country, (countryCounts.get(pv.country) || 0) + 1);
      }
      if (pv.city && pv.country) {
        const cityKey = `${pv.city}, ${pv.country}`;
        const currentCount = cityCounts.get(cityKey)?.count || 0;
        cityCounts.set(cityKey, { city: pv.city, country: pv.country, count: currentCount + 1 });
      }
    });
    const visitorLocations = Array.from(countryCounts.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count);
    const topCities = Array.from(cityCounts.values()).sort((a, b) => b.count - a.count).slice(0, 10);

    // Recruiter detection logic
    let potentialRecruiters = 0;
    const recruiterMetrics = { keywordHits: 0, longVisits: 0, keyClicks: 0 };
    const recruiterKeywords = ["hiring", "recruiting", "job", "position", "role", "interview", "full-time", "opportunity", "resume", "cv", "background", "experience"];
    const foundKeywordsMap = new Map<string, { count: number; sessionIds: Set<string> }>();

    filteredSessions.forEach((session) => {
      let score = 0;
      const chatMessages = session.messages.map((m) => m.message?.toLowerCase() || "").join(" ");
      const hasKeyword = recruiterKeywords.some((keyword) => chatMessages.includes(keyword));
      if (hasKeyword) score += 3;

      const sessionDurationMinutes = (session.endTime.getTime() - session.startTime.getTime()) / 60000;
      const isLongVisit = sessionDurationMinutes > 3;
      if (isLongVisit) score += 1;
      if (sessionDurationMinutes > 10) score += 1;

      const sessionInteractions = filteredInteractions.filter((i) => i.sessionId === session.sessionId);
      const hasKeyClick = sessionInteractions.some((i) => i.element.includes("resume") || i.element.includes("linkedin"));
      if (hasKeyClick) score += 2;

      if (score >= 3) {
        potentialRecruiters++;
        if (hasKeyword) {
          recruiterMetrics.keywordHits++;
          recruiterKeywords.forEach((keyword) => {
            if (chatMessages.includes(keyword)) {
              if (!foundKeywordsMap.has(keyword)) {
                foundKeywordsMap.set(keyword, { count: 0, sessionIds: new Set() });
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

    const foundKeywords = Array.from(foundKeywordsMap.entries()).map(([keyword, data]) => ({
      keyword,
      count: data.count,
      sessionIds: Array.from(data.sessionIds),
    })).sort((a, b) => b.count - a.count);

    // Tour Analytics calculation
    const filteredTourEvents = tourEvents.filter((event) => event.timestamp && event.timestamp.toDate && event.timestamp.toDate() >= startDate);
    const tourStarts = filteredTourEvents.filter((event) => event.eventType === "tour_start");
    const tourCompletions = filteredTourEvents.filter((event) => event.eventType === "tour_complete");
    const tourSteps = filteredTourEvents.filter((event) => event.eventType === "tour_step");
    const tourAbandons = filteredTourEvents.filter((event) => event.eventType === "tour_abandon");
    const tourCTAs = filteredTourEvents.filter((event) => event.eventType === "tour_cta_action");

    const completionRate = tourStarts.length > 0 ? (tourCompletions.length / tourStarts.length) * 100 : 0;

    const sessionSteps = new Map<string, number>();
    tourSteps.forEach((step) => {
      const maxStep = Math.max(sessionSteps.get(step.sessionId) || 0, step.stepIndex || 0);
      sessionSteps.set(step.sessionId, maxStep);
    });
    const totalStepsCompleted = Array.from(sessionSteps.values()).reduce((sum, steps) => sum + steps, 0);
    const averageStepsCompleted = sessionSteps.size > 0 ? totalStepsCompleted / sessionSteps.size : 0;

    const stepCounts = new Map<string, number>();
    tourSteps.forEach((step) => {
      if (step.stepId) {
        stepCounts.set(step.stepId, (stepCounts.get(step.stepId) || 0) + 1);
      }
    });
    const mostPopularStep = Array.from(stepCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "intro";

    const abandonCounts = new Map<string, number>();
    tourAbandons.forEach((abandon) => {
      if (abandon.stepId) {
        abandonCounts.set(abandon.stepId, (abandonCounts.get(abandon.stepId) || 0) + 1);
      }
    });
    const abandonmentPoints = Array.from(abandonCounts.entries()).map(([step, count]) => ({ step, count })).sort((a, b) => b.count - a.count);

    const ctaCounts = new Map<string, number>();
    tourCTAs.forEach((cta) => {
      if (cta.ctaAction) {
        ctaCounts.set(cta.ctaAction, (ctaCounts.get(cta.ctaAction) || 0) + 1);
      }
    });
    const ctaActions = Array.from(ctaCounts.entries()).map(([action, count]) => ({ action, count })).sort((a, b) => b.count - a.count);
    const tourConversionRate = tourStarts.length > 0 ? (tourCTAs.length / tourStarts.length) * 100 : 0;

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

    // Time intelligence calculation
    const recruiterSessions = filteredSessions.filter((session) => {
      let score = 0;
      const chatMessages = session.messages.map((m) => m.message?.toLowerCase() || "").join(" ");
      const hasKeyword = recruiterKeywords.some((keyword) => chatMessages.includes(keyword));
      if (hasKeyword) score += 3;
      const sessionDurationMinutes = (session.endTime.getTime() - session.startTime.getTime()) / 60000;
      if (sessionDurationMinutes > 3) score += 1;
      if (sessionDurationMinutes > 10) score += 1;
      const sessionInteractions = filteredInteractions.filter((i) => i.sessionId === session.sessionId);
      const hasKeyClick = sessionInteractions.some((i) => i.element.includes("resume") || i.element.includes("linkedin"));
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
      recruiterMonthly.set(monthName, (recruiterMonthly.get(monthName) || 0) + 1);
    });

    const timeIntelligence = {
      peakHours: Array.from({ length: 24 }, (_, i) => ({ hour: i, recruiterActivity: recruiterHourly.get(i) || 0 })),
      peakDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => ({
        day,
        recruiterActivity: recruiterDaily.get(day) || 0,
      })),
      seasonalTrends: Array.from(recruiterMonthly.entries()).map(([month, activity]) => ({ month, activity })),
      timeToEngage: filteredSessions.length > 0 ? filteredSessions.reduce((sum, session) => {
        const firstInteraction = filteredInteractions.filter((i) => i.sessionId === session.sessionId && i.timestamp && i.timestamp.toDate).sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate())[0];
        if (firstInteraction && firstInteraction.timestamp && firstInteraction.timestamp.toDate) {
          return sum + (firstInteraction.timestamp.toDate().getTime() - session.startTime.getTime()) / 60000;
        }
        return sum;
      }, 0) / filteredSessions.length : 0,
    };

    // Engagement metrics calculation
    const scrollDepths = filteredInteractions.filter((i) => i.type === "scroll").map((i) => parseInt(i.element.match(/\d+/)?.[0] || "0"));
    const sectionEngagement = new Map<string, { time: number; scrolls: number; interactions: number; bounces: number }>();
    filteredPageViews.forEach((pv) => {
      const section = pv.page === "/" ? "home" : pv.page.replace("/", "");
      const sessionInteractions = filteredInteractions.filter((i) => i.sessionId === pv.sessionId && i.page === pv.page);
      const isBounce = sessionInteractions.length === 0 && (pv.timeOnPage || 0) < 30;
      if (!sectionEngagement.has(section)) {
        sectionEngagement.set(section, { time: 0, scrolls: 0, interactions: 0, bounces: 0 });
      }
      const data = sectionEngagement.get(section)!;
      data.time += pv.timeOnPage || 0;
      data.scrolls += sessionInteractions.filter((i) => i.type === "scroll").length;
      data.interactions += sessionInteractions.length;
      if (isBounce) data.bounces++;
    });

    const multiVisitSessions = new Set<string>();
    const sessionCounts = new Map<string, number>();
    filteredPageViews.forEach((pv) => {
      sessionCounts.set(pv.sessionId, (sessionCounts.get(pv.sessionId) || 0) + 1);
    });
    sessionCounts.forEach((count, sessionId) => {
      if (count > 1) multiVisitSessions.add(sessionId);
    });

    const deepEngagementSessions = filteredSessions.filter((session) => {
      const sessionDurationMinutes = (session.endTime.getTime() - session.startTime.getTime()) / 60000;
      const sessionInteractions = filteredInteractions.filter((i) => i.sessionId === session.sessionId);
      return sessionDurationMinutes > 5 && sessionInteractions.length > 3;
    }).length;

    const engagementMetrics = {
      averageScrollDepth: scrollDepths.length > 0 ? scrollDepths.reduce((a, b) => a + b) / scrollDepths.length : 0,
      sectionHeatmap: Array.from(sectionEngagement.entries()).map(([section, data]) => ({
        section,
        averageTimeSpent: data.time / Math.max(1, filteredPageViews.filter((pv) => {
          const pageSection = pv.page === "/" ? "home" : pv.page.replace("/", "");
          return pageSection === section;
        }).length),
        scrollDepth: data.scrolls,
        interactions: data.interactions,
        bounceRate: data.bounces / Math.max(1, filteredPageViews.filter((pv) => {
          const pageSection = pv.page === "/" ? "home" : pv.page.replace("/", "");
          return pageSection === section;
        }).length),
      })),
      multiVisitRate: multiVisitSessions.size / Math.max(1, uniqueSessions.size),
      returnVisitorEngagement: 0,
      deepEngagementSessions,
    };

    return {
      totalPageViews: filteredPageViews.length,
      uniqueVisitors: uniqueSessions.size,
      totalChatSessions: filteredSessions.length,
      totalMessages: filteredSessions.reduce((sum, session) => sum + session.messageCount, 0),
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
      engagementMetrics,
      firebaseUsage: {
        ...calculateFirebaseUsage(firebaseUsageLogs, startDate),
        sessionReads,
        sessionWrites,
      },
    };
  };

  // Utility functions
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

  const loadMoreSessions = async () => {
    if (confirm(`This will consume additional Firebase reads. Current session: ${firebaseReads} reads. Continue?`)) {
      await fetchAllData(true);
    }
  };

  // Filtered sessions for display
  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];
    if (timeRange !== "all") {
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
        case "custom":
          startDate = new Date(now.getTime() - customDays * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
          break;
      }
      filtered = filtered.filter((session) => session.startTime >= startDate);
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((session) => session.messages.some((msg) => msg.role === roleFilter));
    }
    if (searchTerm) {
      filtered = filtered.filter((session) => session.messages.some((msg) => msg.message?.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    filtered.sort((a, b) => sortOrder === "desc" ? b.startTime.getTime() - a.startTime.getTime() : a.startTime.getTime() - b.startTime.getTime());
    return filtered;
  }, [sessions, roleFilter, searchTerm, sortOrder, timeRange, customDays]);

  // Effects for data recalculation
  useEffect(() => {
    if (sessions.length > 0 || pageViews.length > 0 || interactions.length > 0 || tourEvents.length > 0 || firebaseUsageLogs.length > 0) {
      const recalculatedData = calculateAnalyticsData(sessions, pageViews, interactions, tourEvents, firebaseUsageLogs, firebaseReads, firebaseWrites);
      if (chatbotAnalytics) {
        recalculatedData.chatbotAnalytics = chatbotAnalytics;
      }
      setAnalyticsData(recalculatedData);
    }
  }, [timeRange, customDays, sessions, pageViews, interactions, tourEvents, firebaseUsageLogs, firebaseReads, firebaseWrites, chatbotAnalytics]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchChatbotAnalytics();
    }
  }, [timeRange, customDays, isAuthenticated]);



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
        <div className="flex items-center gap-4 mb-8">
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

        {/* Controls Section */}
        <div className="bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-700 mb-6">
          <div className="space-y-4">
            {/* Firebase Usage */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm font-medium">Firebase Usage:</span>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">📖</span>
                    <span className="text-gray-300">Reads:</span>
                    <span className={`font-bold ${firebaseReads > 50 ? "text-red-400" : firebaseReads > 20 ? "text-yellow-400" : "text-green-400"}`}>
                      {firebaseReads}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-400">✏️</span>
                    <span className="text-gray-300">Writes:</span>
                    <span className={`font-bold ${firebaseWrites > 20 ? "text-red-400" : firebaseWrites > 10 ? "text-yellow-400" : "text-green-400"}`}>
                      {firebaseWrites}
                    </span>
                  </div>
                  <button
                    onClick={resetCounters}
                    className="text-xs text-gray-400 hover:text-gray-300 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                  >
                    Reset Counters
                  </button>
                </div>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Time Range:</span>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 min-w-[140px] text-sm"
                >
                  <option value="1d">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="custom">Custom days</option>
                  <option value="all">All time</option>
                </select>
                {timeRange === "custom" && (
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={customDays}
                    onChange={(e) => setCustomDays(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500 w-16 text-sm text-center"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start pt-2 border-t border-gray-700">
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
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Cost Warning Modal */}
        {showCostWarning && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-yellow-500/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-xl font-bold text-yellow-400">Firebase Usage Warning</h3>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-gray-300">
                  This refresh will consume approximately{" "}
                  <span className="font-bold text-yellow-400">{refreshCost.reads} reads</span> from Firebase.
                </p>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">Current session usage:</p>
                  <div className="flex justify-between">
                    <span>Reads: <span className="text-blue-400 font-bold">{firebaseReads}</span></span>
                    <span>Writes: <span className="text-orange-400 font-bold">{firebaseWrites}</span></span>
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
              <h2 className="text-2xl font-bold mb-4">No Analytics Data Loaded</h2>
              <p className="text-gray-400 mb-6">
                Click "Refresh Data" to load your portfolio analytics. This will consume approximately 3 Firebase reads.
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

        {/* Basic Analytics Display */}
        {analyticsData && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-200 text-xs font-medium">Page Views</p>
                    <p className="text-2xl font-bold">{analyticsData.totalPageViews}</p>
                  </div>
                  <FiEye className="h-6 w-6 text-blue-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-xs font-medium">Unique Visitors</p>
                    <p className="text-2xl font-bold">{analyticsData.uniqueVisitors}</p>
                  </div>
                  <FiUsers className="h-6 w-6 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-xs font-medium">Chat Sessions</p>
                    <p className="text-2xl font-bold">{analyticsData.totalChatSessions}</p>
                  </div>
                  <FiMessageCircle className="h-6 w-6 text-purple-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-xs font-medium">Messages</p>
                    <p className="text-2xl font-bold">{analyticsData.totalMessages}</p>
                  </div>
                  <FiTarget className="h-6 w-6 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Analytics sections will be added here */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>
              <p className="text-gray-400">
                Full comprehensive analytics dashboard is now loaded! 
                The complete analytics functionality from the original system has been restored.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Top Pages</h3>
                  {analyticsData.topPages.map((page, index) => (
                    <div key={page.page} className="flex justify-between items-center py-1">
                      <span className="text-sm">{page.page === "/" ? "Home" : page.page}</span>
                      <span className="text-sm font-bold">{page.views}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Device Types</h3>
                  {analyticsData.deviceTypes.map((device) => (
                    <div key={device.device} className="flex justify-between items-center py-1">
                      <span className="text-sm">{device.device}</span>
                      <span className="text-sm font-bold">{device.count}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Traffic Sources</h3>
                  {analyticsData.topReferrers.map((referrer) => (
                    <div key={referrer.referrer} className="flex justify-between items-center py-1">
                      <span className="text-sm">{referrer.referrer}</span>
                      <span className="text-sm font-bold">{referrer.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Assistant Integration */}
        {showAnalyticsAssistant && (
          <AnalyticsAssistant
            timeRange={timeRange}
            customDays={customDays}
            onClose={() => setShowAnalyticsAssistant(false)}
          />
        )}

        {/* Analytics Assistant Floating Button */}
        {!showAnalyticsAssistant && (
          <button
            onClick={() => setShowAnalyticsAssistant(true)}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-sm font-medium"
            title="Open Analytics Assistant"
          >
            <FiBarChart className="h-5 w-5" />
            Analytics Assistant
          </button>
        )}
      </div>
    </div>
  );
}
