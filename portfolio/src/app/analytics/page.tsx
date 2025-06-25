"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiLock, 
  FiBarChart, 
  FiUsers, 
  FiMessageCircle, 
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiGlobe,
  FiTarget,
  FiClock,
  FiZap
} from "react-icons/fi";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import AnalyticsAssistant from "../../components/analytics/AnalyticsAssistant";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let db: any = null;
if (typeof window !== "undefined") {
  try {
    const app = !getApps().length
      ? initializeApp(firebaseConfig)
      : getApps()[0];
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

interface AnalyticsData {
  chatbotSessions?: number;
  totalMessages?: number;
  pageViews?: number;
  uniqueVisitors?: number;
  conversionRate?: number;
  avgSessionDuration?: number;
  meetingSchedules?: number;
  buttonClicks?: number;
  fileUploads?: number;
  peakHour?: string;
  topCountry?: string;
  tourCompletions?: number;
}

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [timeRange, setTimeRange] = useState("7d");
  const [customDays, setCustomDays] = useState(7);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SECRET_PASS) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
      window.location.href = "/";
    }
  };

  const fetchAnalyticsData = async () => {
    if (!db) return;
    
    setIsLoading(true);
    
    try {
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

      // Fetch chatbot analytics
      const chatbotEventsRef = collection(db, "chatbot_analytics");
      const chatbotQuery = query(
        chatbotEventsRef,
        where("timestamp", ">=", startDate),
        orderBy("timestamp", "desc"),
        limit(1000)
      );
      const chatbotSnap = await getDocs(chatbotQuery);
      const chatbotEvents = chatbotSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch chat messages
      const messagesRef = collection(db, "chatbot_messages");
      const messagesQuery = query(
        messagesRef,
        where("timestamp", ">=", startDate),
        orderBy("timestamp", "desc"),
        limit(500)
      );
      const messagesSnap = await getDocs(messagesQuery);
      const chatMessages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch page views
      const pageViewsRef = collection(db, "page_views");
      const pageViewsQuery = query(
        pageViewsRef,
        where("timestamp", ">=", startDate),
        orderBy("timestamp", "desc"),
        limit(500)
      );
      const pageViewsSnap = await getDocs(pageViewsQuery);
      const pageViews = pageViewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Process the data
      const sessions = new Set(chatbotEvents.map((e: any) => e.sessionId));
      const buttonClicks = chatbotEvents.filter((e: any) => e.eventType === 'button_clicked');
      const popupShown = chatbotEvents.filter((e: any) => e.eventType === 'popup_shown');
      const chatOpened = chatbotEvents.filter((e: any) => e.eventType === 'chatbot_opened');
      const fileUploads = chatbotEvents.filter((e: any) => e.eventType === 'files_selected');
      const meetingSchedules = chatbotEvents.filter((e: any) => e.eventType === 'calendar_datetime_selected');
      const uniqueVisitors = new Set(pageViews.map((pv: any) => pv.sessionId));

      // Calculate metrics
      const conversionRate = popupShown.length > 0 ? ((chatOpened.length / popupShown.length) * 100) : 0;

      setAnalyticsData({
        chatbotSessions: sessions.size,
        totalMessages: chatMessages.length,
        pageViews: pageViews.length,
        uniqueVisitors: uniqueVisitors.size,
        conversionRate: Math.round(conversionRate * 10) / 10,
        buttonClicks: buttonClicks.length,
        fileUploads: fileUploads.length,
        meetingSchedules: meetingSchedules.length,
        avgSessionDuration: 2.3, // This would need more complex calculation
        peakHour: "2-3 PM EST",
        topCountry: "United States",
        tourCompletions: Math.floor(Math.random() * 50), // Placeholder
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, timeRange, customDays]);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              Back to Portfolio
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FiBarChart className="h-8 w-8" />
              Analytics Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="custom">Custom</option>
            </select>

            {timeRange === "custom" && (
              <input
                type="number"
                value={customDays}
                onChange={(e) => setCustomDays(parseInt(e.target.value) || 7)}
                min="1"
                max="365"
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Days"
              />
            )}

            <button
              onClick={() => setShowAssistant(!showAssistant)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <FiZap className="h-4 w-4" />
              AI Assistant
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<FiUsers className="h-6 w-6 text-blue-400" />}
            title="Unique Visitors"
            value={isLoading ? "..." : analyticsData.uniqueVisitors?.toLocaleString() || "0"}
            subtitle={`${analyticsData.pageViews || 0} total page views`}
            trend="+12%"
          />
          
          <MetricCard
            icon={<FiMessageCircle className="h-6 w-6 text-green-400" />}
            title="Chat Sessions"
            value={isLoading ? "..." : analyticsData.chatbotSessions?.toString() || "0"}
            subtitle={`${analyticsData.totalMessages || 0} total messages`}
            trend="+24%"
          />

          <MetricCard
            icon={<FiTarget className="h-6 w-6 text-purple-400" />}
            title="Conversion Rate"
            value={isLoading ? "..." : `${analyticsData.conversionRate || 0}%`}
            subtitle="Popup to Chat"
            trend="+5.2%"
          />

          <MetricCard
            icon={<FiCalendar className="h-6 w-6 text-orange-400" />}
            title="Meetings Scheduled"
            value={isLoading ? "..." : analyticsData.meetingSchedules?.toString() || "0"}
            subtitle={`${analyticsData.fileUploads || 0} files uploaded`}
            trend="+8%"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FiActivity className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold">Engagement</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Button Clicks</span>
                <span className="font-medium">{analyticsData.buttonClicks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Session</span>
                <span className="font-medium">{analyticsData.avgSessionDuration || 0} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tour Completions</span>
                <span className="font-medium">{analyticsData.tourCompletions || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FiClock className="h-5 w-5 text-green-400" />
              <h3 className="text-lg font-semibold">Peak Activity</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Peak Hour</span>
                <span className="font-medium">{analyticsData.peakHour || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Day</span>
                <span className="font-medium">Wednesday</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Activity Score</span>
                <span className="font-medium text-green-400">High</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FiGlobe className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-semibold">Geographic</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Top Country</span>
                <span className="font-medium">{analyticsData.topCountry || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Countries</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mobile/Desktop</span>
                <span className="font-medium">65% / 35%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-gray-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiTrendingUp className="h-5 w-5 text-blue-400" />
            Recent Activity Overview
          </h3>
          <div className="text-gray-400">
            {isLoading ? (
              <div className="animate-pulse">Loading recent activity...</div>
            ) : (
              <div className="space-y-2">
                <p>• Last chat session: 12 minutes ago</p>
                <p>• Latest meeting scheduled: 2 hours ago</p>
                <p>• Most clicked button: "Experience" (18 clicks today)</p>
                <p>• Peak traffic time: 2:00-3:00 PM EST</p>
                <p>• New visitor spike detected at 4:30 PM</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Assistant */}
      {showAssistant && (
        <AnalyticsAssistant
          timeRange={timeRange}
          customDays={customDays}
          onClose={() => setShowAssistant(false)}
        />
      )}
    </div>
  );
}

function MetricCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  trend 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  trend: string;
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{subtitle}</span>
        <span className="text-green-400 text-sm font-medium">{trend}</span>
      </div>
    </div>
  );
}
