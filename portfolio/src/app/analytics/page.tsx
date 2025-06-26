"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FiArrowLeft, FiLock } from "react-icons/fi";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Import our new modular components
import AnalyticsDashboard from "../../components/analytics/AnalyticsDashboard";
import AnalyticsProvider from "../../components/analytics/AnalyticsProvider";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [db, setDb] = useState<any>(null);

  // Check for existing authentication
  useEffect(() => {
    const storedPassword = sessionStorage.getItem("analytics_v2_password");
    if (storedPassword === process.env.NEXT_PUBLIC_SECRET_PASS) {
      setIsAuthenticated(true);
    }
  }, []);

  // Initialize Firebase when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    if (typeof window !== "undefined") {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      const firestore = getFirestore(app);
      setDb(firestore);
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SECRET_PASS) {
      sessionStorage.setItem("analytics_v2_password", process.env.NEXT_PUBLIC_SECRET_PASS || "");
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  // Password Protection Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <div className="bg-gray-800 rounded-xl p-8 w-full max-w-md border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <FiLock className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold">Analytics v2.0 Access</h1>
          </div>
          <p className="text-gray-400 mb-6 text-sm">
            Advanced modular analytics with comprehensive tracking and detailed insights.
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Security Password
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
              Access Analytics Dashboard
            </button>
          </form>
          <div className="mt-6 pt-4 border-t border-gray-700">
            <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm">
              <FiArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main Analytics Dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AnalyticsProvider db={db}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-700">
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
            <FiArrowLeft className="h-5 w-5" />
            Back to Portfolio
          </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Analytics Dashboard v2.0
          </h1>
              <p className="text-gray-400 text-sm mt-1">
                Comprehensive tracking • Modular design • Real-time insights
              </p>
                    </div>
                  </div>

          {/* Dashboard Component - Natural scrolling */}
                  <div className="p-6">
            <AnalyticsDashboard />
                            </div>
                            </div>
      </AnalyticsProvider>
    </div>
  );
} 