"use client";

import { useState, useEffect } from "react";
import { 
  FiRefreshCw, 
  FiBarChart, 
  FiUsers, 
  FiMousePointer, 
  FiSmartphone,
  FiGlobe,
  FiMessageCircle,
  FiDownload,
  FiActivity,
  FiTrendingUp,
  FiClock,
  FiTarget
} from "react-icons/fi";
import { useAnalytics } from "./AnalyticsProvider";

// Import modular components
import OverviewSection from "./sections/OverviewSection";
import ChatSessionsSection from "./sections/ChatSessionsSection";
import ButtonClicksSection from "./sections/ButtonClicksSection";
import TourAnalyticsSection from "./sections/TourAnalyticsSection";
import GeoLocationSection from "./sections/GeoLocationSection";
import DeviceAnalyticsSection from "./sections/DeviceAnalyticsSection";
import GraphSection from "./sections/GraphSection";

// Enhanced scrolling styles
const scrollStyles = `
  .analytics-container {
    scrollbar-width: thick;
    scrollbar-color: #6B7280 #374151;
  }
  
  .analytics-container::-webkit-scrollbar {
    width: 16px;
    height: 16px;
  }
  
  .analytics-container::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 8px;
    border: 2px solid #1F2937;
  }
  
  .analytics-container::-webkit-scrollbar-thumb {
    background: linear-gradient(145deg, #6B7280, #9CA3AF);
    border-radius: 8px;
    border: 2px solid #374151;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  }
  
  .analytics-container::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(145deg, #9CA3AF, #D1D5DB);
  }
  
  .analytics-container::-webkit-scrollbar-corner {
    background: #374151;
  }
`;

export default function AnalyticsDashboard() {
  const analytics = useAnalytics();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [timeRange, setTimeRange] = useState<"1d" | "7d" | "30d" | "all">("30d");

  // Add enhanced scrolling styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = scrollStyles;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load data on mount
  useEffect(() => {
    if (analytics.chatSessions.length === 0 && !analytics.loading) {
      analytics.fetchAllData();
    }
  }, []);

  const tabs = [
    { id: "overview", label: "Overview", icon: FiBarChart, color: "blue" },
    { id: "sessions", label: "Chat Sessions", icon: FiMessageCircle, color: "purple" },
    { id: "buttons", label: "Button Clicks", icon: FiMousePointer, color: "green" },
    { id: "tours", label: "Tour Analytics", icon: FiTarget, color: "orange" },
    { id: "geo", label: "Geo Location", icon: FiGlobe, color: "teal" },
    { id: "devices", label: "Device Analytics", icon: FiSmartphone, color: "indigo" },
    { id: "graph", label: "Graph", icon: FiActivity, color: "purple" },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? "bg-blue-600 text-white" : "text-blue-400 hover:bg-blue-900/30",
      purple: isActive ? "bg-purple-600 text-white" : "text-purple-400 hover:bg-purple-900/30",
      green: isActive ? "bg-green-600 text-white" : "text-green-400 hover:bg-green-900/30",
      orange: isActive ? "bg-orange-600 text-white" : "text-orange-400 hover:bg-orange-900/30",
      teal: isActive ? "bg-teal-600 text-white" : "text-teal-400 hover:bg-teal-900/30",
      indigo: isActive ? "bg-indigo-600 text-white" : "text-indigo-400 hover:bg-indigo-900/30",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between gap-4">
          {/* Stats Summary */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FiUsers className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">Sessions:</span>
              <span className="font-bold text-blue-400">{analytics.totalSessions}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiMousePointer className="h-4 w-4 text-green-400" />
              <span className="text-gray-400">Clicks:</span>
              <span className="font-bold text-green-400">{analytics.totalButtonClicks}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiTarget className="h-4 w-4 text-orange-400" />
              <span className="text-gray-400">Tours:</span>
              <span className="font-bold text-orange-400">{analytics.totalTourInteractions}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Time Range */}
            <div className="flex items-center gap-2">
              <FiClock className="h-4 w-4 text-gray-400" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={analytics.refreshData}
              disabled={analytics.loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <FiRefreshCw className={`h-4 w-4 ${analytics.loading ? 'animate-spin' : ''}`} />
              {analytics.loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Last Updated */}
        {analytics.lastUpdated && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FiActivity className="h-3 w-3" />
              Last updated: {analytics.lastUpdated.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="flex p-3 gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${getColorClasses(tab.color, isActive)}`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area - Expanded for Graph section */}
      <div className={`bg-gray-800 rounded-xl border border-gray-700 ${activeTab === 'graph' ? '' : 'min-h-[600px]'}`}>
        <div className="p-6">
          {/* Loading State */}
          {analytics.loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-lg">Loading analytics data...</span>
              </div>
            </div>
          )}

          {/* Content Sections */}
          {!analytics.loading && (
            <>
              {activeTab === "overview" && <OverviewSection timeRange={timeRange} />}
              {activeTab === "sessions" && <ChatSessionsSection timeRange={timeRange} />}
              {activeTab === "buttons" && <ButtonClicksSection timeRange={timeRange} />}
              {activeTab === "tours" && <TourAnalyticsSection timeRange={timeRange} />}
              {activeTab === "geo" && <GeoLocationSection timeRange={timeRange} />}
              {activeTab === "devices" && <DeviceAnalyticsSection timeRange={timeRange} />}
              {activeTab === "graph" && <GraphSection timeRange={timeRange} />}
            </>
          )}

          {/* Empty State */}
          {!analytics.loading && analytics.totalSessions === 0 && (
            <div className="text-center py-16">
              <div className="bg-gray-700 rounded-xl p-8 max-w-md mx-auto">
                <FiBarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">No Analytics Data Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start collecting data by interacting with your portfolio. Analytics will appear here once users visit and engage with your site.
                </p>
                <button
                  onClick={analytics.fetchAllData}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Check for Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 