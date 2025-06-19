"use client";

import { useState, useEffect } from "react";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  Firestore,
} from "firebase/firestore";
import { FiArrowLeft, FiSearch, FiFilter, FiDownload } from "react-icons/fi";
import Link from "next/link";

// Firebase config (same as in Chatbot.tsx)
const firebaseConfig = {
  apiKey: "AIzaSyA_HYWpbGRuNvcWyxfiUEZr7_mTw7PU0t8",
  authDomain: "peronalsite-88d49.firebaseapp.com",
  projectId: "peronalsite-88d49",
  storageBucket: "peronalsite-88d49.firebasestorage.app",
  messagingSenderId: "515222232116",
  appId: "1:515222232116:web:b7a9b8735980ce8333fe61",
  measurementId: "G-ZV5CR4EBB8",
};

interface ChatMessage {
  id: string;
  sessionId: string;
  message: string;
  role: "user" | "assistant";
  timestamp: any;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  startTime: Date;
  endTime: Date;
  messageCount: number;
}

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "assistant">(
    "all"
  );
  const [db, setDb] = useState<Firestore | null>(null);

  useEffect(() => {
    // Initialize Firebase
    let app: FirebaseApp | undefined;
    if (typeof window !== "undefined") {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      const firestore = getFirestore(app);
      setDb(firestore);
    }
  }, []);

  useEffect(() => {
    if (db) {
      fetchChatData();
    }
  }, [db]);

  const fetchChatData = async () => {
    if (!db) return;

    try {
      setLoading(true);
      const messagesRef = collection(db, "chatbot_messages");
      const q = query(messagesRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      const messages: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          sessionId: data.sessionId,
          message: data.message,
          role: data.role,
          timestamp: data.timestamp,
        });
      });

      // Group messages by session
      const sessionMap = new Map<string, ChatMessage[]>();
      messages.forEach((msg) => {
        if (!sessionMap.has(msg.sessionId)) {
          sessionMap.set(msg.sessionId, []);
        }
        sessionMap.get(msg.sessionId)!.push(msg);
      });

      // Convert to sessions array
      const sessionsArray: ChatSession[] = Array.from(sessionMap.entries()).map(
        ([sessionId, msgs]) => {
          const sortedMsgs = msgs.sort(
            (a, b) =>
              a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime()
          );

          return {
            sessionId,
            messages: sortedMsgs,
            startTime: sortedMsgs[0].timestamp.toDate(),
            endTime: sortedMsgs[sortedMsgs.length - 1].timestamp.toDate(),
            messageCount: msgs.length,
          };
        }
      );

      setSessions(sessionsArray);
    } catch (error) {
      console.error("Error fetching chat data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.messages.some((msg) =>
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const matchesRole =
      roleFilter === "all" ||
      session.messages.some((msg) => msg.role === roleFilter);

    return matchesSearch && matchesRole;
  });

  const exportData = () => {
    const dataStr = JSON.stringify(filteredSessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-analytics-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getSessionDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5" />
              Back to Portfolio
            </Link>
            <h1 className="text-3xl font-bold">Chat Analytics</h1>
          </div>
          <button
            onClick={exportData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <FiDownload className="h-4 w-4" />
            Export Data
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Sessions</h3>
            <p className="text-2xl font-bold">{sessions.length}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Total Messages</h3>
            <p className="text-2xl font-bold">
              {sessions.reduce((sum, session) => sum + session.messageCount, 0)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Avg Messages/Session</h3>
            <p className="text-2xl font-bold">
              {sessions.length > 0
                ? Math.round(
                    sessions.reduce(
                      (sum, session) => sum + session.messageCount,
                      0
                    ) / sessions.length
                  )
                : 0}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-gray-400 text-sm">Active Sessions</h3>
            <p className="text-2xl font-bold">{filteredSessions.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Messages</option>
              <option value="user">User Messages</option>
              <option value="assistant">Assistant Messages</option>
            </select>
          </div>
        </div>

        {/* Sessions List */}
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No chat sessions found.</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.sessionId}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      Session {session.sessionId.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {formatTimestamp(session.startTime)} -{" "}
                      {formatTimestamp(session.endTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      Duration:{" "}
                      {getSessionDuration(session.startTime, session.endTime)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {session.messageCount} messages
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {session.messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-900/30 border border-blue-700/30"
                          : "bg-gray-700/50 border border-gray-600/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            message.role === "user"
                              ? "bg-blue-600 text-blue-100"
                              : "bg-gray-600 text-gray-100"
                          }`}
                        >
                          {message.role === "user" ? "User" : "Assistant"}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
