"use client";

import { useMemo } from "react";
import { FiTarget, FiPlay, FiCheck, FiX, FiClock, FiTrendingUp, FiEye, FiMousePointer, FiCheckCircle, FiSkipForward, FiLayers, FiActivity } from "react-icons/fi";
import { useAnalytics } from "../AnalyticsProvider";

interface TourAnalyticsSectionProps {
  timeRange: "1d" | "7d" | "30d" | "all";
}

export default function TourAnalyticsSection({ timeRange }: TourAnalyticsSectionProps) {
  const analytics = useAnalytics();

  // Filter and process tour data
  const tourData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "1d": startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case "7d": startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "30d": startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(0);
    }

    const filtered = analytics.tourInteractions.filter(t => t.timestamp >= startDate);

    // Calculate metrics
    const totalInteractions = filtered.length;
    const viewedCount = filtered.filter(t => t.action === "viewed").length;
    const clickedCount = filtered.filter(t => t.action === "clicked").length;
    const completedCount = filtered.filter(t => t.action === "completed").length;
    const skippedCount = filtered.filter(t => t.action === "skipped").length;

    // Step breakdown
    const stepBreakdown = filtered.reduce((acc, interaction) => {
      acc[interaction.tourStep] = (acc[interaction.tourStep] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Action breakdown
    const actionBreakdown = filtered.reduce((acc, interaction) => {
      acc[interaction.action] = (acc[interaction.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      filtered,
      totalInteractions,
      viewedCount,
      clickedCount,
      completedCount,
      skippedCount,
      stepBreakdown,
      actionBreakdown,
    };
  }, [analytics.tourInteractions, timeRange]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "viewed": return FiPlay;
      case "clicked": return FiTarget;
      case "completed": return FiCheck;
      case "skipped": return FiX;
      default: return FiTarget;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "viewed": return "text-blue-400";
      case "clicked": return "text-green-400";
      case "completed": return "text-emerald-400";
      case "skipped": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div className="h-full overflow-y-auto space-y-3">
      {/* Header - Compact */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Tour Analytics</h2>
          <p className="text-gray-400 text-xs">
            Product tour engagement • {tourData.totalInteractions} interactions
          </p>
        </div>
      </div>

      {/* Key Metrics - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Views</p>
              <p className="text-lg font-bold text-white">{tourData.viewedCount}</p>
            </div>
            <FiEye className="h-5 w-5 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Clicks</p>
              <p className="text-lg font-bold text-white">{tourData.clickedCount}</p>
            </div>
            <FiMousePointer className="h-5 w-5 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Completed</p>
              <p className="text-lg font-bold text-white">{tourData.completedCount}</p>
            </div>
            <FiCheckCircle className="h-5 w-5 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/80 text-xs font-medium">Skipped</p>
              <p className="text-lg font-bold text-white">{tourData.skippedCount}</p>
            </div>
            <FiSkipForward className="h-5 w-5 text-white/80" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {tourData.totalInteractions === 0 && (
        <div className="flex items-center justify-center h-32">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <FiPlay className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold mb-2">No Tour Interactions</h3>
            <p className="text-gray-400 text-xs">
              Product tour analytics will appear here once users engage with the tour.
            </p>
          </div>
        </div>
      )}

      {/* Detailed Analytics - Compact Grid */}
      {tourData.totalInteractions > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Step Breakdown */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <FiLayers className="h-4 w-4 text-blue-400" />
              Step Breakdown
            </h3>
            <div className="space-y-1">
              {Object.entries(tourData.stepBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 6)
                .map(([step, count]) => (
                  <div key={step} className="flex justify-between items-center text-xs">
                    <span className="truncate capitalize">{step}</span>
                    <div className="flex items-center gap-1">
                      <div className="bg-gray-600 rounded-full h-1 w-8 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${(count / tourData.totalInteractions) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-blue-400 min-w-[1rem]">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Action Breakdown */}
          <div className="bg-gray-700 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <FiActivity className="h-4 w-4 text-green-400" />
              Action Breakdown
            </h3>
            <div className="space-y-1">
              {Object.entries(tourData.actionBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([action, count]) => (
                  <div key={action} className="flex justify-between items-center text-xs">
                    <span className="truncate capitalize">{action}</span>
                    <div className="flex items-center gap-1">
                      <div className="bg-gray-600 rounded-full h-1 w-8 overflow-hidden">
                        <div 
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${(count / tourData.totalInteractions) * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-green-400 min-w-[1rem]">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity - Compact */}
      {tourData.filtered.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-3">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <FiClock className="h-4 w-4 text-purple-400" />
            Recent Activity
          </h3>
          <div className="space-y-1">
            {tourData.filtered
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .slice(0, 5)
              .map((interaction, index) => (
                <div key={index} className="flex justify-between items-center text-xs p-2 bg-gray-600 rounded">
                                     <div className="flex items-center gap-2">
                     <FiPlay className="h-3 w-3 text-purple-400" />
                     <span className="font-medium capitalize">{interaction.action}</span>
                     <span className="text-gray-400">on {interaction.tourStep}</span>
                   </div>
                  <div className="text-gray-400">
                    {interaction.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
} 