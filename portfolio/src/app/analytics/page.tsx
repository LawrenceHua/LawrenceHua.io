"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiLock, 
  FiMessageCircle, 
  FiUsers, 
  FiEye,
  FiBarChart, 
  FiActivity,
  FiGlobe,
  FiSmartphone,
  FiTarget,
  FiClock,
  FiUserCheck,
  FiX,
  FiMaximize2
} from "react-icons/fi";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import AnalyticsAssistant from "@/components/analytics/AnalyticsAssistant";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
  recruiterScore: number;
  isRecruiterSession: boolean;
  deviceType: string;
  location?: {
    country: string;
    region: string;
    city: string;
  };
  engagementLevel: 'low' | 'medium' | 'high';
  totalDuration: number;
}

interface PageView {
  id: string;
  page: string;
  timestamp: any;
  userAgent: string;
  referrer: string;
  sessionId: string;
  country?: string;
  region?: string;
  city?: string;
  timeOnPage?: number;
}

interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  totalChatSessions: number;
  totalMessages: number;
  avgSessionDuration: number;
  
  // Enhanced metrics
  recruiterSessions: ChatSession[];
  topKeywords: { keyword: string; count: number; sessions: string[] }[];
  locationAnalytics: { country: string; city: string; count: number; recruiterSessions: number }[];
  deviceAnalytics: { device: string; count: number; avgDuration: number }[];
  trafficSources: { source: string; count: number; recruiterTraffic: number }[];
  performanceScore: number;
}

export default function AnalyticsPage() {
  // Core state
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [db, setDb] = useState<any>(null);
  
  // Enhanced UI state
  const [showAnalyticsAssistant, setShowAnalyticsAssistant] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'recruiters' | 'locations'>('overview');
  const [timeRange, setTimeRange] = useState<"1d" | "7d" | "30d" | "all">("30d");
  const [customDays, setCustomDays] = useState(7);

  // Firebase usage tracking
  const [firebaseReads, setFirebaseReads] = useState(() => {
    if (typeof window !== "undefined") {
      return Number(sessionStorage.getItem("firebaseReads") || 0);
    }
    return 0;
  });

  // Recruiter keywords for scoring
  const recruiterKeywords = [
    { keyword: "job", weight: 10 },
    { keyword: "hiring", weight: 10 },
    { keyword: "position", weight: 9 },
    { keyword: "role", weight: 8 },
    { keyword: "opportunity", weight: 9 },
    { keyword: "career", weight: 8 },
    { keyword: "recruiter", weight: 10 },
    { keyword: "experience", weight: 7 },
    { keyword: "skills", weight: 8 },
    { keyword: "resume", weight: 9 },
    { keyword: "interview", weight: 9 },
    { keyword: "salary", weight: 8 },
    { keyword: "remote", weight: 7 },
    { keyword: "contact", weight: 9 },
    { keyword: "meeting", weight: 9 },
  ];

  // Initialize Firebase
  useEffect(() => {
    const storedPassword = sessionStorage.getItem("analytics_password");
    if (storedPassword === process.env.NEXT_PUBLIC_SECRET_PASS) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window !== "undefined") {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      const firestore = getFirestore(app);
      setDb(firestore);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (db && isAuthenticated) {
      fetchAllData();
    }
  }, [db, isAuthenticated]);

  // Data fetching
  const fetchAllData = async () => {
    if (!db) return;
    setLoading(true);
    
    try {
      // Fetch chat messages
      const messagesRef = collection(db, "chatbot_messages");
      const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(250));
      const messagesSnap = await getDocs(messagesQuery);
      
      const chatMessages: ChatMessage[] = messagesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];

      // Group by session and analyze
      const sessionMap = new Map<string, ChatMessage[]>();
      chatMessages.forEach((msg) => {
        if (!sessionMap.has(msg.sessionId)) {
          sessionMap.set(msg.sessionId, []);
        }
        sessionMap.get(msg.sessionId)!.push(msg);
      });

      const processedSessions: ChatSession[] = Array.from(sessionMap.entries()).map(([sessionId, messages]) => {
        const sortedMessages = messages.sort((a, b) => 
          (a.timestamp?.toDate?.() || new Date(a.timestamp)).getTime() - 
          (b.timestamp?.toDate?.() || new Date(b.timestamp)).getTime()
        );
        
        const startTime = sortedMessages[0]?.timestamp?.toDate?.() || new Date();
        const endTime = sortedMessages[sortedMessages.length - 1]?.timestamp?.toDate?.() || new Date();
        
        // Calculate recruiter score
        let recruiterScore = 0;
        messages.forEach(msg => {
          if (msg.message) {
            const msgLower = msg.message.toLowerCase();
            recruiterKeywords.forEach(({ keyword, weight }) => {
              if (msgLower.includes(keyword)) {
                recruiterScore += weight;
              }
            });
          }
        });

        // Session characteristics scoring
        const sessionDurationMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
        if (sessionDurationMinutes > 5) recruiterScore += 3;
        if (messages.length > 5) recruiterScore += 2;

        let engagementLevel: 'low' | 'medium' | 'high' = 'low';
        if (sessionDurationMinutes > 10 && messages.length > 8) engagementLevel = 'high';
        else if (sessionDurationMinutes > 5 && messages.length > 4) engagementLevel = 'medium';

        return {
          sessionId,
          messages: sortedMessages,
          startTime,
          endTime,
          messageCount: messages.length,
          recruiterScore,
          isRecruiterSession: recruiterScore >= 5,
          deviceType: "Unknown",
          engagementLevel,
          totalDuration: sessionDurationMinutes,
        };
      });

      // Fetch page views
      const pageViewsRef = collection(db, "page_views");
      const pageViewsQuery = query(pageViewsRef, orderBy("timestamp", "desc"));
      const pageViewsSnap = await getDocs(pageViewsQuery);
      
      const pageViewsData: PageView[] = pageViewsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PageView[];

      // Enhance sessions with location data
      const enhancedSessions = processedSessions.map(session => {
        const sessionPageViews = pageViewsData.filter(pv => pv.sessionId === session.sessionId);
        const latestPageView = sessionPageViews[0];
        
        let deviceType = "Unknown";
        if (latestPageView?.userAgent) {
          const ua = latestPageView.userAgent.toLowerCase();
          if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            deviceType = "Mobile";
          } else if (ua.includes('tablet') || ua.includes('ipad')) {
            deviceType = "Tablet";
          } else {
            deviceType = "Desktop";
          }
        }

        return {
          ...session,
          deviceType,
          location: latestPageView ? {
            country: latestPageView.country || "Unknown",
            region: latestPageView.region || "Unknown",
            city: latestPageView.city || "Unknown",
          } : undefined,
        };
      });

      setSessions(enhancedSessions);
      setPageViews(pageViewsData);
      setFirebaseReads(prev => prev + messagesSnap.docs.length + pageViewsSnap.docs.length);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  useEffect(() => {
    if (sessions.length > 0 || pageViews.length > 0) {
      const calculatedData = calculateAnalytics();
      setAnalyticsData(calculatedData);
    }
  }, [sessions, pageViews, timeRange]);

  const calculateAnalytics = (): AnalyticsData => {
    // Filter by time range
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case "1d": startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case "7d": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "30d": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(0);
    }

    const filteredSessions = sessions.filter(s => s.startTime >= startDate);
    const filteredPageViews = pageViews.filter(pv => 
      (pv.timestamp?.toDate?.() || new Date(pv.timestamp)) >= startDate
    );

    const uniqueVisitors = new Set(filteredPageViews.map(pv => pv.sessionId)).size;
    const totalMessages = filteredSessions.reduce((sum, s) => sum + s.messageCount, 0);
    const avgSessionDuration = filteredSessions.length > 0 
      ? filteredSessions.reduce((sum, s) => sum + s.totalDuration, 0) / filteredSessions.length
      : 0;

    // Recruiter analysis
    const recruiterSessions = filteredSessions.filter(s => s.isRecruiterSession);
    
    // Keyword analysis
    const keywordMap = new Map<string, { count: number; sessions: string[] }>();
    recruiterSessions.forEach(session => {
      session.messages.forEach(msg => {
        if (msg.message) {
          const msgLower = msg.message.toLowerCase();
          recruiterKeywords.forEach(({ keyword }) => {
            if (msgLower.includes(keyword)) {
              const existing = keywordMap.get(keyword) || { count: 0, sessions: [] };
              existing.count++;
              if (!existing.sessions.includes(session.sessionId)) {
                existing.sessions.push(session.sessionId);
              }
              keywordMap.set(keyword, existing);
            }
          });
        }
      });
    });

    const topKeywords = Array.from(keywordMap.entries())
      .map(([keyword, data]) => ({ keyword, count: data.count, sessions: data.sessions }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Location analysis
    const locationMap = new Map<string, { country: string; city: string; count: number; recruiterSessions: number }>();
    filteredSessions.forEach(session => {
      if (session.location) {
        const key = `${session.location.country}-${session.location.city}`;
        const existing = locationMap.get(key) || {
          country: session.location.country,
          city: session.location.city,
          count: 0,
          recruiterSessions: 0
        };
        existing.count++;
        if (session.isRecruiterSession) existing.recruiterSessions++;
        locationMap.set(key, existing);
      }
    });

    const locationAnalytics = Array.from(locationMap.values())
      .sort((a, b) => b.count - a.count);

    // Device analysis
    const deviceMap = new Map<string, { count: number; totalDuration: number }>();
    filteredSessions.forEach(session => {
      const device = deviceMap.get(session.deviceType) || { count: 0, totalDuration: 0 };
      device.count++;
      device.totalDuration += session.totalDuration;
      deviceMap.set(session.deviceType, device);
    });

    const deviceAnalytics = Array.from(deviceMap.entries()).map(([device, data]) => ({
      device,
      count: data.count,
      avgDuration: data.totalDuration / data.count
    }));

    // Traffic sources
    const referrerMap = new Map<string, { count: number; recruiterTraffic: number }>();
    filteredPageViews.forEach(pv => {
      const referrer = pv.referrer || "direct";
      const data = referrerMap.get(referrer) || { count: 0, recruiterTraffic: 0 };
      data.count++;
      
      const isRecruiterPageView = filteredSessions.some(s => 
        s.sessionId === pv.sessionId && s.isRecruiterSession
      );
      if (isRecruiterPageView) data.recruiterTraffic++;
      
      referrerMap.set(referrer, data);
    });

    const trafficSources = Array.from(referrerMap.entries()).map(([source, data]) => ({
      source,
      count: data.count,
      recruiterTraffic: data.recruiterTraffic
    })).sort((a, b) => b.count - a.count);

    // Performance score
    const performanceScore = Math.min(100, Math.round(
      (uniqueVisitors * 0.3) + 
      (recruiterSessions.length * 2) + 
      (avgSessionDuration * 0.5) + 
      (totalMessages * 0.1)
    ));

    return {
      totalPageViews: filteredPageViews.length,
      uniqueVisitors,
      totalChatSessions: filteredSessions.length,
      totalMessages,
      avgSessionDuration,
      recruiterSessions,
      topKeywords,
      locationAnalytics,
      deviceAnalytics,
      trafficSources,
      performanceScore,
    };
  };

  // Authentication
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SECRET_PASS) {
      sessionStorage.setItem("analytics_password", process.env.NEXT_PUBLIC_SECRET_PASS || "");
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
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
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <FiArrowLeft className="h-5 w-5" />
            Back to Portfolio
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            Comprehensive Analytics Dashboard
          </h1>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm font-medium">Firebase Reads:</span>
              <span className="font-bold text-blue-400">{firebaseReads}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Time Range:</span>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FiActivity className="h-4 w-4" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 rounded-xl p-2 border border-gray-700 mb-6">
          <div className="flex flex-wrap gap-2">
            {(['overview', 'sessions', 'recruiters', 'locations'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Content */}
        {!analyticsData ? (
          <div className="text-center py-16">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto">
              <span className="text-6xl mb-4 block">📊</span>
              <h2 className="text-2xl font-bold mb-4">No Analytics Data</h2>
              <p className="text-gray-400 mb-6">
                Click "Refresh Data" to load your comprehensive analytics.
              </p>
              <button
                onClick={fetchAllData}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Load Analytics Data
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Key Metrics */}
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
                        <p className="text-orange-200 text-xs font-medium">Recruiter Sessions</p>
                        <p className="text-2xl font-bold">{analyticsData.recruiterSessions.length}</p>
                      </div>
                      <FiUserCheck className="h-6 w-6 text-orange-200" />
                    </div>
                  </div>
                </div>

                {/* Performance Score */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4">Portfolio Performance Score</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-700 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${analyticsData.performanceScore}%` }}
                      ></div>
                    </div>
                    <span className="text-2xl font-bold">{analyticsData.performanceScore}/100</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Based on visitor engagement, recruiter interest, and content effectiveness
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiTarget className="h-5 w-5 text-blue-400" />
                      Top Recruiter Keywords
                    </h3>
                    <div className="space-y-2">
                      {analyticsData.topKeywords.slice(0, 5).map((keyword, index) => (
                        <div key={keyword.keyword} className="flex justify-between items-center">
                          <span className="text-sm">{keyword.keyword}</span>
                          <span className="text-sm font-bold text-blue-400">{keyword.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiGlobe className="h-5 w-5 text-green-400" />
                      Top Locations
                    </h3>
                    <div className="space-y-2">
                      {analyticsData.locationAnalytics.slice(0, 5).map((location, index) => (
                        <div key={`${location.country}-${location.city}`} className="flex justify-between items-center">
                          <span className="text-sm">{location.city}, {location.country}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{location.count}</span>
                            {location.recruiterSessions > 0 && (
                              <span className="text-xs bg-orange-500 px-1 rounded">R</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FiSmartphone className="h-5 w-5 text-purple-400" />
                      Device Analytics
                    </h3>
                    <div className="space-y-2">
                      {analyticsData.deviceAnalytics.map((device, index) => (
                        <div key={device.device} className="flex justify-between items-center">
                          <span className="text-sm">{device.device}</span>
                          <div className="text-right">
                            <div className="text-sm font-bold">{device.count}</div>
                            <div className="text-xs text-gray-400">{device.avgDuration.toFixed(1)}m avg</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Chatbot Sessions</h3>
                <div className="space-y-4">
                  {analyticsData.recruiterSessions.slice(0, 10).map((session) => (
                    <div 
                      key={session.sessionId}
                      className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => {
                        setSelectedSession(session);
                        setShowSessionModal(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Session {session.sessionId.slice(-8)}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              session.engagementLevel === 'high' ? 'bg-green-500' :
                              session.engagementLevel === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                            }`}>
                              {session.engagementLevel}
                            </span>
                            {session.isRecruiterSession && (
                              <span className="px-2 py-1 rounded text-xs bg-orange-500">
                                Recruiter (Score: {session.recruiterScore})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">
                            {session.startTime.toLocaleString()} • {session.messageCount} messages • {session.totalDuration.toFixed(1)}m
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-400">
                          {session.location && `${session.location.city}, ${session.location.country}`}
                          <br />
                          {session.deviceType}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300">
                        {session.messages[0]?.message?.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recruiters Tab */}
            {activeTab === 'recruiters' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4">Recruiter Intelligence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-lg">
                      <div className="text-2xl font-bold">{analyticsData.recruiterSessions.length}</div>
                      <div className="text-sm opacity-90">Total Recruiter Sessions</div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-lg">
                      <div className="text-2xl font-bold">
                        {((analyticsData.recruiterSessions.length / analyticsData.totalChatSessions) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm opacity-90">Recruiter Rate</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-lg">
                      <div className="text-2xl font-bold">
                        {analyticsData.recruiterSessions.length > 0 
                          ? (analyticsData.recruiterSessions.reduce((sum, s) => sum + s.totalDuration, 0) / analyticsData.recruiterSessions.length).toFixed(1)
                          : 0
                        }m
                      </div>
                      <div className="text-sm opacity-90">Avg Recruiter Session</div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-lg">
                      <div className="text-2xl font-bold">{analyticsData.topKeywords.length}</div>
                      <div className="text-sm opacity-90">Unique Keywords Found</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Top Recruiter Keywords</h4>
                      <div className="space-y-2">
                        {analyticsData.topKeywords.map((keyword) => (
                          <div 
                            key={keyword.keyword}
                            className="flex justify-between items-center p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                            onClick={() => {
                              setSelectedKeyword(keyword.keyword);
                              setShowKeywordModal(true);
                            }}
                          >
                            <span className="font-medium">{keyword.keyword}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 font-bold">{keyword.count}</span>
                              <span className="text-xs text-gray-400">
                                {keyword.sessions.length} sessions
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-4">High-Value Recruiter Sessions</h4>
                      <div className="space-y-2">
                        {analyticsData.recruiterSessions
                          .filter(s => s.recruiterScore >= 15)
                          .slice(0, 8)
                          .map((session) => (
                            <div 
                              key={session.sessionId}
                              className="p-3 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                              onClick={() => {
                                setSelectedSession(session);
                                setShowSessionModal(true);
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Session {session.sessionId.slice(-8)}</span>
                                <span className="bg-orange-500 px-2 py-1 rounded text-xs">
                                  Score: {session.recruiterScore}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                {session.messageCount} messages • {session.totalDuration.toFixed(1)}m
                              </p>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === 'locations' && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Geographic Analytics</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Visitor Locations</h4>
                    <div className="space-y-3">
                      {analyticsData.locationAnalytics.map((location, index) => (
                        <div key={`${location.country}-${location.city}`} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                          <div>
                            <div className="font-medium">{location.city}</div>
                            <div className="text-sm text-gray-400">{location.country}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{location.count} visitors</div>
                            {location.recruiterSessions > 0 && (
                              <div className="text-sm text-orange-400">
                                {location.recruiterSessions} recruiter sessions
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Traffic Sources</h4>
                    <div className="space-y-3">
                      {analyticsData.trafficSources.slice(0, 10).map((source) => (
                        <div key={source.source} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                          <div className="font-medium truncate">{source.source}</div>
                          <div className="text-right">
                            <div className="font-bold">{source.count}</div>
                            {source.recruiterTraffic > 0 && (
                              <div className="text-sm text-orange-400">
                                {source.recruiterTraffic} recruiter
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Session Modal */}
        {showSessionModal && selectedSession && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h3 className="text-xl font-bold">Session Details</h3>
                  <p className="text-sm text-gray-400">
                    {selectedSession.startTime.toLocaleString()} • Score: {selectedSession.recruiterScore}
                  </p>
                </div>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  {selectedSession.messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-100'
                      }`}>
                        <div className="text-sm">{message.message}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {(message.timestamp?.toDate?.() || new Date(message.timestamp)).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyword Modal */}
        {showKeywordModal && selectedKeyword && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-700">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h3 className="text-xl font-bold">Keyword: "{selectedKeyword}"</h3>
                  <p className="text-sm text-gray-400">
                    Sessions containing this keyword
                  </p>
                </div>
                <button
                  onClick={() => setShowKeywordModal(false)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-3">
                  {analyticsData?.topKeywords
                    .find(k => k.keyword === selectedKeyword)
                    ?.sessions.map((sessionId) => {
                      const session = sessions.find(s => s.sessionId === sessionId);
                      if (!session) return null;
                      
                      return (
                        <div 
                          key={sessionId}
                          className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            setSelectedSession(session);
                            setShowKeywordModal(false);
                            setShowSessionModal(true);
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">Session {sessionId.slice(-8)}</span>
                            <span className="text-sm text-gray-400">
                              Score: {session.recruiterScore}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {session.messages.find(m => m.message?.toLowerCase().includes(selectedKeyword.toLowerCase()))?.message?.substring(0, 150)}...
                          </p>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Assistant */}
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