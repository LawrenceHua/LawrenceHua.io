"use client";

import { useMemo } from "react";
import { 
  FiMousePointer, 
  FiDownload, 
  FiMessageCircle, 
  FiCalendar,
  FiExternalLink,
  FiMapPin,
  FiClock,
  FiSmartphone,
  FiTrendingUp,
  FiTarget,
  FiActivity
} from "react-icons/fi";
import { useAnalytics } from "../AnalyticsProvider";

interface ButtonClicksSectionProps {
  timeRange: "1d" | "7d" | "30d" | "all";
}

export default function ButtonClicksSection({ timeRange }: ButtonClicksSectionProps) {
  const analytics = useAnalytics();

  // Filter clicks by time range and calculate metrics
  const { filteredClicks, metrics } = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "1d": startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case "7d": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "30d": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(0);
    }

    const filtered = analytics.buttonClicks.filter(click => click.timestamp >= startDate);

    // Calculate metrics
    const totalClicks = filtered.length;
    const uniqueButtons = new Set(filtered.map(c => c.buttonText)).size;
    
    // Button breakdown
    const buttonBreakdown = filtered.reduce((acc, click) => {
      const key = click.buttonText || click.buttonType || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Type breakdown
    const typeBreakdown = filtered.reduce((acc, click) => {
      acc[click.buttonType] = (acc[click.buttonType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Location breakdown
    const locationBreakdown = filtered.reduce((acc, click) => {
      const key = `${click.location.city}, ${click.location.country}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent clicks (last 10)
    const recentClicks = filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      filteredClicks: filtered,
      metrics: {
        totalClicks,
        uniqueButtons,
        buttonBreakdown,
        typeBreakdown,
        locationBreakdown,
        recentClicks,
      }
    };
  }, [analytics.buttonClicks, timeRange]);

  const getButtonIcon = (buttonType: string) => {
    if (buttonType.includes("resume") || buttonType.includes("download")) return FiDownload;
    if (buttonType.includes("chat")) return FiMessageCircle;
    if (buttonType.includes("meeting") || buttonType.includes("calendar")) return FiCalendar;
    return FiMousePointer;
  };

  const getButtonColor = (buttonType: string) => {
    if (buttonType.includes("resume") || buttonType.includes("download")) return "text-green-400";
    if (buttonType.includes("chat")) return "text-purple-400";
    if (buttonType.includes("meeting") || buttonType.includes("calendar")) return "text-blue-400";
    return "text-gray-400";
  };

  return (
    <div className="h-full overflow-y-auto space-y-3">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Button Clicks</h2>
          <p className="text-gray-400 text-xs">
            All button interactions • {filteredClicks.length} clicks
          </p>
        </div>
      </div>

      {/* Key Metrics - Compact Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Total Clicks</p>
              <p className="text-lg font-bold text-white">{metrics.totalClicks}</p>
            </div>
            <FiMousePointer className="h-5 w-5 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Unique Buttons</p>
              <p className="text-lg font-bold text-white">{metrics.uniqueButtons}</p>
            </div>
            <FiTarget className="h-5 w-5 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Avg/Day</p>
              <p className="text-lg font-bold text-white">
                {timeRange === "1d" ? metrics.totalClicks : 
                 timeRange === "7d" ? Math.round(metrics.totalClicks / 7) :
                 timeRange === "30d" ? Math.round(metrics.totalClicks / 30) :
                 Math.round(metrics.totalClicks / 30)}
              </p>
            </div>
            <FiTrendingUp className="h-5 w-5 text-white/80" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredClicks.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <FiMousePointer className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold mb-2">No Button Clicks Yet</h3>
            <p className="text-gray-400 text-xs">
              Button interactions will appear here once users click buttons on your portfolio.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Breakdowns - Compact Grid */}
      {filteredClicks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Top Buttons */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <FiTarget className="h-4 w-4 text-green-400" />
              Top Buttons
            </h3>
            <div className="space-y-1">
              {Object.entries(metrics.buttonBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([button, count]) => (
                  <div key={button} className="flex justify-between items-center text-xs">
                    <span className="truncate">{button}</span>
                    <div className="flex items-center gap-1">
                      <div className="bg-gray-600 rounded-full h-1 w-8 overflow-hidden">
                        <div 
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${(count / metrics.totalClicks) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-green-400 min-w-[1rem]">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Click Types */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <FiActivity className="h-4 w-4 text-blue-400" />
              Click Types
            </h3>
            <div className="space-y-1">
              {Object.entries(metrics.typeBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center text-xs">
                    <span className="truncate">{type}</span>
                    <div className="flex items-center gap-1">
                      <div className="bg-gray-600 rounded-full h-1 w-8 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${(count / metrics.totalClicks) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-blue-400 min-w-[1rem]">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <FiMapPin className="h-4 w-4 text-purple-400" />
              Locations
            </h3>
            <div className="space-y-1">
              {Object.entries(metrics.locationBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([location, count]) => (
                  <div key={location} className="flex justify-between items-center text-xs">
                    <span className="truncate">{location.split(',')[0]}</span>
                    <div className="flex items-center gap-1">
                      <div className="bg-gray-600 rounded-full h-1 w-8 overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${(count / metrics.totalClicks) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-purple-400 min-w-[1rem]">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Clicks */}
      {metrics.recentClicks.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <FiClock className="h-4 w-4 text-orange-400" />
            Recent Clicks
          </h3>
          <div className="space-y-1">
            {metrics.recentClicks.slice(0, 5).map((click, index) => (
              <div key={index} className="flex justify-between items-center text-xs p-2 bg-gray-600 rounded">
                <div className="flex items-center gap-2">
                  <FiMousePointer className="h-3 w-3 text-green-400" />
                  <span className="font-medium">{click.buttonText}</span>
                </div>
                <div className="text-gray-400">
                  {click.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 