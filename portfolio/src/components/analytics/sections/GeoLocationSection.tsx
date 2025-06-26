"use client";

import { useMemo } from "react";
import { FiGlobe, FiMapPin, FiUsers, FiTrendingUp, FiMousePointer } from "react-icons/fi";
import { useAnalytics } from "../AnalyticsProvider";

// Helper function to format time ago
function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return timestamp.toLocaleDateString();
}

interface GeoLocationSectionProps {
  timeRange: "1d" | "7d" | "30d" | "all";
}

export default function GeoLocationSection({ timeRange }: GeoLocationSectionProps) {
  const analytics = useAnalytics();

  const geoData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "1d": startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case "7d": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "30d": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(0);
    }

    // Filter all data by time range
    const filteredSessions = analytics.chatSessions.filter(s => s.startTime >= startDate);
    const filteredClicks = analytics.buttonClicks.filter(c => c.timestamp >= startDate);
    const filteredVisitors = analytics.visitorLocations.filter(v => v.timestamp >= startDate);

    // Create recent visitors list for "Recently Visited From"
    const recentVisitors: Array<{
      location: string;
      country: string;
      city: string;
      timestamp: Date;
      type: 'session' | 'click' | 'visit';
      sessionId?: string;
      buttonType?: string;
      pathname?: string;
    }> = [];

    // Add visitor locations (page visits)
    filteredVisitors.forEach(visitor => {
      recentVisitors.push({
        location: `${visitor.location.city}, ${visitor.location.country}`,
        country: visitor.location.country,
        city: visitor.location.city,
        timestamp: visitor.timestamp,
        type: 'visit',
        sessionId: visitor.sessionId,
        pathname: visitor.pathname
      });
    });

    // Add sessions to recent visitors
    filteredSessions.forEach(session => {
      recentVisitors.push({
        location: `${session.location.city}, ${session.location.country}`,
        country: session.location.country,
        city: session.location.city,
        timestamp: session.startTime,
        type: 'session',
        sessionId: session.sessionId
      });
    });

    // Add clicks to recent visitors
    filteredClicks.forEach(click => {
      recentVisitors.push({
        location: `${click.location.city}, ${click.location.country}`,
        country: click.location.country,
        city: click.location.city,
        timestamp: click.timestamp,
        type: 'click',
        buttonType: click.buttonType
      });
    });

    // Sort by most recent first
    recentVisitors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Aggregate location data
    const locationData: Record<string, { 
      country: string; 
      city: string; 
      sessions: number; 
      clicks: number; 
    }> = {};

    // Process sessions
    filteredSessions.forEach(session => {
      const key = `${session.location.city}, ${session.location.country}`;
      if (!locationData[key]) {
        locationData[key] = {
          country: session.location.country,
          city: session.location.city,
          sessions: 0,
          clicks: 0,
        };
      }
      locationData[key].sessions++;
    });

    // Process clicks
    filteredClicks.forEach(click => {
      const key = `${click.location.city}, ${click.location.country}`;
      if (!locationData[key]) {
        locationData[key] = {
          country: click.location.country,
          city: click.location.city,
          sessions: 0,
          clicks: 0,
        };
      }
      locationData[key].clicks++;
    });

    const locations = Object.entries(locationData)
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => (b.sessions + b.clicks) - (a.sessions + a.clicks));

    return {
      locations,
      recentVisitors: recentVisitors.slice(0, 15), // Show last 15 visitors
      totalLocations: locations.length,
      totalSessions: filteredSessions.length,
      totalClicks: filteredClicks.length,
    };
  }, [analytics.chatSessions, analytics.buttonClicks, timeRange]);

  return (
    <div className="h-full overflow-y-auto space-y-3">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Geographic Analytics</h2>
          <p className="text-gray-400 text-xs">
            User locations • {geoData.totalLocations} unique locations
          </p>
        </div>
      </div>

      {/* Key Metrics - Compact */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Locations</p>
              <p className="text-lg font-bold text-white">{geoData.totalLocations}</p>
            </div>
            <FiGlobe className="h-5 w-5 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Sessions</p>
              <p className="text-lg font-bold text-white">{geoData.totalSessions}</p>
            </div>
            <FiUsers className="h-5 w-5 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Clicks</p>
              <p className="text-lg font-bold text-white">{geoData.totalClicks}</p>
            </div>
            <FiMousePointer className="h-5 w-5 text-white/80" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {geoData.totalLocations === 0 && (
        <div className="flex items-center justify-center h-32">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <FiGlobe className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold mb-2">No Geographic Data</h3>
            <p className="text-gray-400 text-xs">
              Location analytics will appear here once users visit your site.
            </p>
          </div>
        </div>
      )}

      {/* Locations List - Compact */}
      {geoData.totalLocations > 0 && (
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <FiMapPin className="h-4 w-4 text-teal-400" />
            Top Locations
          </h3>
          <div className="space-y-1">
            {geoData.locations.slice(0, 8).map((location, index) => (
              <div key={location.key} className="flex justify-between items-center text-xs p-2 bg-gray-600 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-bold text-teal-400">#{index + 1}</span>
                  <FiMapPin className="h-3 w-3 text-teal-400" />
                  <div>
                    <div className="font-medium">{location.city}</div>
                    <div className="text-gray-400">{location.country}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-400">{location.sessions} sessions</div>
                  <div className="text-gray-400">{location.clicks} clicks</div>
                </div>
              </div>
            ))}
          </div>
          
          {geoData.locations.length > 8 && (
            <div className="mt-2 text-center text-xs text-gray-400">
              ... and {geoData.locations.length - 8} more locations
            </div>
          )}
        </div>
      )}

      {/* Recently Visited From */}
      {geoData.recentVisitors.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <FiTrendingUp className="h-4 w-4 text-green-400" />
            Recently Visited From
          </h3>
          <div className="space-y-1">
            {geoData.recentVisitors.map((visitor, index) => {
              const timeAgo = getTimeAgo(visitor.timestamp);
              return (
                <div key={`${visitor.location}-${visitor.timestamp.getTime()}-${index}`} 
                     className="flex justify-between items-center text-xs p-2 bg-gray-600 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      visitor.type === 'session' ? 'bg-blue-400' : 
                      visitor.type === 'click' ? 'bg-green-400' : 'bg-purple-400'
                    }`} />
                    <FiMapPin className="h-3 w-3 text-yellow-400" />
                    <div>
                      <div className="font-medium">{visitor.city}</div>
                      <div className="text-gray-400">{visitor.country}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-yellow-400">{timeAgo}</div>
                    <div className="text-gray-400">
                      {visitor.type === 'session' ? 'Chat' : 
                       visitor.type === 'click' ? `${visitor.buttonType || 'Click'}` :
                       visitor.pathname || 'Visit'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {geoData.recentVisitors.length >= 15 && (
            <div className="mt-2 text-center text-xs text-gray-400">
              Showing last 15 visitors
            </div>
          )}
        </div>
      )}
    </div>
  );
} 