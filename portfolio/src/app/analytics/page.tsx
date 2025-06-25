"use client";

import { useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiLock } from "react-icons/fi";

export default function AnalyticsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === process.env.NEXT_PUBLIC_SECRET_PASS) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect password");
      window.location.href = "/";
    }
  };

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
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
            Back to Portfolio
          </Link>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
          <p className="text-gray-400 mb-6">
            The analytics dashboard is currently being rebuilt. Please check back soon.
          </p>
          <div className="animate-pulse bg-gray-700 h-32 rounded-lg mb-4"></div>
          <div className="animate-pulse bg-gray-700 h-32 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
