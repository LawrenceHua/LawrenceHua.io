"use client";

import { useState, useEffect } from "react";
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
  FiActivity
} from "react-icons/fi";
import AnalyticsAssistant from "../../components/analytics/AnalyticsAssistant";

interface AnalyticsData {
  chatbot: {
    totalSessions: number;
    totalEvents: number;
    buttonClicks: number;
    messagesSent: number;
    popupViews: number;
    chatOpens: number;
    fileUploads: number;
    meetingSchedules: number;
    conversionRate: string;
    mostPopularButtons: Array<{ button: string; count: number }>;
  };
  conversations: {
    totalMessages: number;
    totalSessions: number;
    avgMessagesPerSession: string;
    userMessages: number;
    assistantMessages: number;
  };
  website: {
    totalPageViews: number;
    uniqueVisitors: number;
    countries: number;
    avgTimeOnPage: string;
    topReferrers: Array<{ source: string; count: number }>;
    deviceBreakdown: Array<{ device: string; count: number; percentage: string }>;
  };
  engagement: {
    totalInteractions: number;
    clicks: number;
    scrolls: number;
    topInteractionTypes: Array<{ type: string; count: number }>;
  };
  tour: {
    starts: number;
    completions: number;
    abandons: number;
    completionRate: string;
  };
  temporal: {
    timeRange: string;
    peakHours: Array<{ hour: number; count: number }>;
    dailyTrends: Array<{ day: string; count: number }>;
  };
}

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("7d");
  const [customDays, setCustomDays] = useState(7);
  const [showAssistant, setShowAssistant] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SECRET_PASS) {
      setIsAuthenticated(true);
      loadAnalyticsData();
    } else {
      alert("Incorrect password");
      window.location.href = "/";
    }
  };

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analytics-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Get comprehensive analytics overview for dashboard display",
          timeRange,
          customDays,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Parse the data that comes back from analytics assistant
        await fetchRawAnalyticsData();
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setLoading(false);
    setLastRefresh(new Date());
  };

  const fetchRawAnalyticsData = async () => {
    // This would connect to Firebase directly for dashboard display
    // For now, we'll use mock data structure that matches what analytics assistant expects
    const mockData: AnalyticsData = {
      chatbot: {
        totalSessions: 142,
        totalEvents: 856,
        buttonClicks: 234,
        messagesSent: 387,
        popupViews: 492,
        chatOpens: 186,
        fileUploads: 23,
        meetingSchedules: 12,
        conversionRate: "37.8",
        mostPopularButtons: [
          { button: "experience", count: 89 },
          { button: "projects", count: 67 },
          { button: "skills", count: 45 },
          { button: "message", count: 33 },
          { button: "meeting", count: 28 }
        ]
      },
      conversations: {
        totalMessages: 734,
        totalSessions: 186,
        avgMessagesPerSession: "3.9",
        userMessages: 387,
        assistantMessages: 347
      },
      website: {
        totalPageViews: 1247,
        uniqueVisitors: 892,
        countries: 23,
        avgTimeOnPage: "4.7",
        topReferrers: [
          { source: "Direct", count: 456 },
          { source: "LinkedIn", count: 234 },
          { source: "Google", count: 189 }
        ],
        deviceBreakdown: [
          { device: "Desktop", count: 756, percentage: "60.6" },
          { device: "Mobile", count: 491, percentage: "39.4" }
        ]
      },
      engagement: {
        totalInteractions: 2134,
        clicks: 1567,
        scrolls: 567,
        topInteractionTypes: [
          { type: "click", count: 1567 },
          { type: "scroll", count: 567 },
          { type: "hover", count: 234 }
        ]
      },
      tour: {
        starts: 89,
        completions: 34,
        abandons: 55,
        completionRate: "38.2"
      },
      temporal: {
        timeRange,
        peakHours: [
          { hour: 14, count: 156 },
          { hour: 10, count: 134 },
          { hour: 16, count: 123 }
        ],
        dailyTrends: []
      }
    };
    
    setAnalyticsData(mockData);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyticsData();
    }
  }, [timeRange, customDays, isAuthenticated]);

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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FiArrowLeft className="h-5 w-5" />
                Back to Portfolio
              </Link>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={loadAnalyticsData}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
              >
                <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Analytics Assistant Toggle */}
              <button
                onClick={() => setShowAssistant(!showAssistant)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                <FiMessageCircle className="h-4 w-4" />
                AI Assistant
              </button>
            </div>
          </div>

          {lastRefresh && (
            <p className="text-gray-400 text-sm">
              Last updated: {lastRefresh.toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiRefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p className="text-gray-400">Loading analytics data...</p>
            </div>
          </div>
        ) : analyticsData ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Chat Sessions</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.chatbot.totalSessions}</p>
                  </div>
                  <FiMessageCircle className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {analyticsData.chatbot.conversionRate}% conversion rate
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Unique Visitors</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.website.uniqueVisitors}</p>
                  </div>
                  <FiUsers className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {analyticsData.website.totalPageViews} total page views
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Messages Sent</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.conversations.userMessages}</p>
                  </div>
                  <FiMail className="h-8 w-8 text-purple-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {analyticsData.conversations.avgMessagesPerSession} avg per session
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Meetings Scheduled</p>
                    <p className="text-2xl font-bold text-white">{analyticsData.chatbot.meetingSchedules}</p>
                  </div>
                  <FiCalendar className="h-8 w-8 text-orange-400" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {analyticsData.chatbot.fileUploads} files uploaded
                </p>
              </div>
            </div>

            {/* Chatbot Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiBarChart className="h-5 w-5 text-blue-400" />
                  Chatbot Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Popup Views</span>
                    <span className="font-semibold">{analyticsData.chatbot.popupViews}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Chat Opens</span>
                    <span className="font-semibold">{analyticsData.chatbot.chatOpens}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Button Clicks</span>
                    <span className="font-semibold">{analyticsData.chatbot.buttonClicks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">File Uploads</span>
                    <span className="font-semibold">{analyticsData.chatbot.fileUploads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="font-semibold text-green-400">{analyticsData.chatbot.conversionRate}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiTarget className="h-5 w-5 text-purple-400" />
                  Popular Buttons
                </h3>
                <div className="space-y-3">
                  {analyticsData.chatbot.mostPopularButtons.map((button, index) => (
                    <div key={button.button} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded text-xs flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <span className="capitalize">{button.button}</span>
                      </div>
                      <span className="font-semibold">{button.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Website Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiGlobe className="h-5 w-5 text-green-400" />
                  Traffic Sources
                </h3>
                <div className="space-y-3">
                  {analyticsData.website.topReferrers.map((referrer) => (
                    <div key={referrer.source} className="flex justify-between items-center">
                      <span className="text-gray-400">{referrer.source}</span>
                      <span className="font-semibold">{referrer.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Countries</span>
                    <span className="font-semibold">{analyticsData.website.countries}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Avg. Time on Page</span>
                    <span className="font-semibold">{analyticsData.website.avgTimeOnPage}m</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiSmartphone className="h-5 w-5 text-orange-400" />
                  Device Breakdown
                </h3>
                <div className="space-y-3">
                  {analyticsData.website.deviceBreakdown.map((device) => (
                    <div key={device.device} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {device.device === 'Mobile' ? 
                            <FiSmartphone className="h-4 w-4" /> : 
                            <FiMonitor className="h-4 w-4" />
                          }
                          <span>{device.device}</span>
                        </div>
                        <span className="font-semibold">{device.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${device.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiActivity className="h-5 w-5 text-pink-400" />
                  User Engagement
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Interactions</span>
                    <span className="font-semibold">{analyticsData.engagement.totalInteractions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Clicks</span>
                    <span className="font-semibold">{analyticsData.engagement.clicks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Scrolls</span>
                    <span className="font-semibold">{analyticsData.engagement.scrolls}</span>
                  </div>
                  {analyticsData.tour && (
                    <>
                      <div className="pt-3 border-t border-gray-700">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Tour Starts</span>
                          <span className="font-semibold">{analyticsData.tour.starts}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-400">Completion Rate</span>
                          <span className="font-semibold text-green-400">{analyticsData.tour.completionRate}%</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Peak Hours */}
            {analyticsData.temporal.peakHours.length > 0 && (
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiClock className="h-5 w-5 text-yellow-400" />
                  Peak Activity Hours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analyticsData.temporal.peakHours.map((peak, index) => (
                    <div key={peak.hour} className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {peak.hour}:00
                      </div>
                      <div className="text-gray-400 text-sm">
                        {peak.count} events
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        #{index + 1} most active
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <FiBarChart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
            <p className="text-gray-400 mb-6">
              No analytics data found for the selected time period.
            </p>
            <button
              onClick={loadAnalyticsData}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
            >
              Reload Data
            </button>
          </div>
        )}
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
