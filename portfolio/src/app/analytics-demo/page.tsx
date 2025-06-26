"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FiArrowLeft, 
  FiMousePointer, 
  FiDownload, 
  FiMessageCircle, 
  FiCalendar,
  FiTarget,
  FiPlay,
  FiCheck,
  FiActivity
} from "react-icons/fi";

export default function AnalyticsDemoPage() {
  const [feedback, setFeedback] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");

  // Generate session ID only on client side to avoid hydration mismatch
  useEffect(() => {
    setSessionId(`demo_session_${Date.now()}`);
  }, []);

  const trackButtonClick = async (buttonType: string, buttonText: string) => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/track-button-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buttonType,
          buttonText,
          page: '/analytics-demo',
          sessionId,
          userAgent: navigator.userAgent,
        }),
      });

      if (response.ok) {
        setFeedback(`✅ Tracked: ${buttonText}`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (error) {
      setFeedback(`❌ Error tracking: ${buttonText}`);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  const trackTourInteraction = async (tourStep: string, action: string) => {
    if (!sessionId) return;
    
    try {
      const response = await fetch('/api/track-tour-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourStep,
          action,
          sessionId,
          timeOnStep: Math.floor(Math.random() * 30) + 5, // Random time 5-35 seconds
        }),
      });

      if (response.ok) {
        setFeedback(`✅ Tour tracked: ${action} on ${tourStep}`);
        setTimeout(() => setFeedback(""), 3000);
      }
    } catch (error) {
      setFeedback(`❌ Error tracking tour: ${action}`);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/analytics" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <FiArrowLeft className="h-5 w-5" />
            Back to Analytics
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Analytics v2.0 Demo
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Test the new analytics system by clicking buttons and interactions
            </p>
          </div>
        </div>

        {/* Session Info */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <FiActivity className="h-5 w-5 text-green-400" />
            Demo Session Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Session ID:</span>
              <span className="font-mono ml-2">{sessionId || "Generating..."}</span>
            </div>
            <div>
              <span className="text-gray-400">Page:</span>
              <span className="ml-2">/analytics-demo</span>
            </div>
          </div>
          
          {feedback && (
            <div className="mt-4 p-3 bg-gray-700 rounded-lg">
              <div className="text-sm">{feedback}</div>
            </div>
          )}
        </div>

        {/* Button Tracking Demo */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiMousePointer className="h-5 w-5 text-blue-400" />
            Button Click Tracking Demo
          </h2>
          <p className="text-gray-400 mb-6">
            Click these buttons to generate analytics data. Each click will be tracked with location and device info.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => trackButtonClick("download_resume", "Download Resume")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FiDownload className="h-4 w-4" />
              Download Resume
            </button>

            <button
              onClick={() => trackButtonClick("chatbot_open", "Open Chat")}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FiMessageCircle className="h-4 w-4" />
              Open Chat
            </button>

            <button
              onClick={() => trackButtonClick("schedule_meeting", "Schedule Meeting")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FiCalendar className="h-4 w-4" />
              Schedule Meeting
            </button>

            <button
              onClick={() => trackButtonClick("lets_connect", "Let's Connect")}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <FiTarget className="h-4 w-4" />
              Let's Connect
            </button>
          </div>
        </div>

        {/* Tour Tracking Demo */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FiTarget className="h-5 w-5 text-orange-400" />
            Tour Interaction Tracking Demo
          </h2>
          <p className="text-gray-400 mb-6">
            Simulate product tour interactions to test tour analytics.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-medium text-green-400">Tour Steps</h3>
              
              <button
                onClick={() => trackTourInteraction("welcome", "viewed")}
                className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-left"
              >
                <FiPlay className="h-4 w-4" />
                View Welcome Step
              </button>

              <button
                onClick={() => trackTourInteraction("features", "viewed")}
                className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-left"
              >
                <FiPlay className="h-4 w-4" />
                View Features Step
              </button>

              <button
                onClick={() => trackTourInteraction("projects", "clicked")}
                className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-left"
              >
                <FiTarget className="h-4 w-4" />
                Click Projects Step
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-purple-400">Tour Actions</h3>
              
              <button
                onClick={() => trackTourInteraction("contact", "clicked")}
                className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-left"
              >
                <FiMousePointer className="h-4 w-4" />
                Click Contact Step
              </button>

              <button
                onClick={() => trackTourInteraction("skills", "skipped")}
                className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-left"
              >
                ⏭️ Skip Skills Step
              </button>

              <button
                onClick={() => trackTourInteraction("complete", "completed")}
                className="w-full flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg transition-colors text-left"
              >
                <FiCheck className="h-4 w-4" />
                Complete Tour
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-bold mb-4">How to Test</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>1. Click the buttons above to generate analytics data</p>
            <p>2. Go back to the <Link href="/analytics" className="text-blue-400 hover:underline">Analytics Dashboard</Link> to view the data</p>
            <p>3. Try different tabs (Sessions, Button Clicks, Tour Analytics, etc.)</p>
            <p>4. Each interaction includes your location, device type, and timestamp</p>
            <p>5. The system limits to 250 recent sessions and uses new v2 collections</p>
          </div>
        </div>
      </div>
    </div>
  );
} 