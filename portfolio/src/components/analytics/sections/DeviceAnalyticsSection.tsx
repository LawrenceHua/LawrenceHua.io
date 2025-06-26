"use client";

import { useMemo } from "react";
import { FiSmartphone, FiMonitor, FiTablet, FiTrendingUp } from "react-icons/fi";
import { useAnalytics } from "../AnalyticsProvider";

interface DeviceAnalyticsSectionProps {
  timeRange: "1d" | "7d" | "30d" | "all";
}

export default function DeviceAnalyticsSection({ timeRange }: DeviceAnalyticsSectionProps) {
  const analytics = useAnalytics();

  const deviceData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "1d": startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case "7d": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "30d": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(0);
    }

    const filteredSessions = analytics.chatSessions.filter(s => s.startTime >= startDate);

    // Device type breakdown
    const deviceTypes = filteredSessions.reduce((acc, session) => {
      acc[session.deviceType] = (acc[session.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Browser breakdown (using userAgent as fallback)
    const browsers = filteredSessions.reduce((acc, session) => {
      const browser = session.userAgent || "Unknown Browser";
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalSessions = filteredSessions.length;

    return {
      deviceTypes,
      browsers,
      totalSessions,
    };
  }, [analytics.chatSessions, timeRange]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile': return FiSmartphone;
      case 'tablet': return FiTablet;
      case 'desktop': 
      default: return FiMonitor;
    }
  };

  return (
    <div className="h-full overflow-y-auto space-y-3">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Device Analytics</h2>
          <p className="text-gray-400 text-xs">
            Device and browser usage • {deviceData.totalSessions} sessions
          </p>
        </div>
      </div>

      {/* Key Metric */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-white/80 text-xs font-medium">Total Sessions</p>
            <p className="text-lg font-bold text-white">{deviceData.totalSessions}</p>
          </div>
          <FiSmartphone className="h-5 w-5 text-white/80" />
        </div>
      </div>

      {/* Empty State */}
      {deviceData.totalSessions === 0 && (
        <div className="flex items-center justify-center h-32">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <FiSmartphone className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold mb-2">No Device Data</h3>
            <p className="text-gray-400 text-xs">
              Device analytics will appear here once users visit your site.
            </p>
          </div>
        </div>
      )}

      {/* Device & Browser Breakdown - Compact */}
      {deviceData.totalSessions > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Device Types */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <FiSmartphone className="h-4 w-4 text-indigo-400" />
              Device Types
            </h3>
            <div className="space-y-1">
              {Object.entries(deviceData.deviceTypes)
                .sort(([, a], [, b]) => b - a)
                .map(([device, count]) => {
                  const Icon = getDeviceIcon(device);
                  return (
                    <div key={device} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1">
                        <Icon className="h-3 w-3 text-indigo-400" />
                        <span className="capitalize">{device}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="bg-gray-600 rounded-full h-1 w-8 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${(count / deviceData.totalSessions) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-indigo-400 min-w-[1rem]">{count}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Browsers */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <FiMonitor className="h-4 w-4 text-purple-400" />
              Browsers
            </h3>
            <div className="space-y-1">
              {Object.entries(deviceData.browsers)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([browser, count]) => (
                  <div key={browser} className="flex justify-between items-center text-xs">
                    <span className="truncate">{browser}</span>
                    <div className="flex items-center gap-1">
                      <div className="bg-gray-600 rounded-full h-1 w-8 overflow-hidden">
                        <div 
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${(count / deviceData.totalSessions) * 100}%` }}
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
    </div>
  );
} 