"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBarChart,
  FiSend,
  FiX,
  FiTrendingUp,
  FiUsers,
  FiMessageCircle,
  FiClock,
  FiTarget,
  FiZap,
  FiMinimize2,
  FiMaximize2,
} from "react-icons/fi";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AnalyticsAssistantProps {
  timeRange: string;
  customDays: number;
  onClose: () => void;
}

export default function AnalyticsAssistant({
  timeRange,
  customDays,
  onClose,
}: AnalyticsAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `📊 **Analytics Intelligence Assistant**

I'm your personal data analyst! I can help you understand your portfolio analytics in plain English.

**Quick Insights:**
<button-overview>📈 Performance Overview</button-overview> <button-chatbot>🤖 Chatbot Analytics</button-chatbot> <button-trends>📊 Key Trends</button-trends>

**Detailed Analysis:**
<button-conversion>🎯 Conversion Rates</button-conversion> <button-engagement>💬 User Engagement</button-engagement> <button-traffic>🌍 Traffic Sources</button-traffic>

**Smart Questions:**
<button-recommendations>💡 Optimization Tips</button-recommendations> <button-compare>📈 Period Comparison</button-compare>

*Try asking: "What's my chatbot conversion rate?" or "Show me peak activity hours"*`,
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/analytics-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          timeRange,
          customDays,
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || "Unable to analyze data at this time.",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Analytics assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble accessing the analytics data right now. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (type: string) => {
    let query = "";

    switch (type) {
      case "overview":
        query = "Give me a comprehensive performance overview of my portfolio analytics";
        break;
      case "chatbot":
        query = "Analyze my chatbot performance - clicks, conversations, and conversion rates";
        break;
      case "trends":
        query = "What are the key trends and patterns in my data?";
        break;
      case "conversion":
        query = "Show me conversion rates across all funnels - popup to chat, chat to meetings, etc.";
        break;
      case "engagement":
        query = "How engaged are my visitors? Analyze session duration, interactions, and bounce rates";
        break;
      case "traffic":
        query = "Analyze my traffic sources, referrers, and visitor geography";
        break;
      case "recommendations":
        query = "Based on my data, what specific optimizations do you recommend?";
        break;
      case "compare":
        query = "Compare my current metrics to previous periods and highlight changes";
        break;
      default:
        return;
    }

    // Add the message as if user typed it
    const userMessage: Message = {
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Send to API
    fetch("/api/analytics-assistant", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: query,
        timeRange,
        customDays,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response || "Unable to analyze data at this time.",
            timestamp: new Date(),
          },
        ]);
      })
      .catch((error) => {
        console.error("Analytics assistant error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'm having trouble accessing the analytics data right now. Please try again.",
            timestamp: new Date(),
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Set up global function for button clicks
  useEffect(() => {
    (window as any).analyticsButtonClick = handleQuickAction;
    return () => {
      delete (window as any).analyticsButtonClick;
    };
  }, [timeRange, customDays]);

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>")
      .replace(
        /<button-overview>(.*?)<\/button-overview>/g,
        '<button onclick="window.analyticsButtonClick(\'overview\')" class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 mx-1 my-0.5 cursor-pointer">$1</button>'
      )
      .replace(
        /<button-chatbot>(.*?)<\/button-chatbot>/g,
        '<button onclick="window.analyticsButtonClick(\'chatbot\')" class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 mx-1 my-0.5 cursor-pointer">$1</button>'
      )
      .replace(
        /<button-trends>(.*?)<\/button-trends>/g,
        '<button onclick="window.analyticsButtonClick(\'trends\')" class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 mx-1 my-0.5 cursor-pointer">$1</button>'
      )
      .replace(
        /<button-conversion>(.*?)<\/button-conversion>/g,
        '<button onclick="window.analyticsButtonClick(\'conversion\')" class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 mx-1 my-0.5 cursor-pointer">$1</button>'
      )
      .replace(
        /<button-engagement>(.*?)<\/button-engagement>/g,
        '<button onclick="window.analyticsButtonClick(\'engagement\')" class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 mx-1 my-0.5 cursor-pointer">$1</button>'
      )
      .replace(
        /<button-traffic>(.*?)<\/button-traffic>/g,
        '<button onclick="window.analyticsButtonClick(\'traffic\')" class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 mx-1 my-0.5 cursor-pointer">$1</button>'
      )
      .replace(
        /<button-recommendations>(.*?)<\/button-recommendations>/g,
        '<button onclick="window.analyticsButtonClick(\'recommendations\')" class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 mx-1 my-0.5 cursor-pointer">$1</button>'
      )
      .replace(
        /<button-compare>(.*?)<\/button-compare>/g,
        '<button onclick="window.analyticsButtonClick(\'compare\')" class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg font-medium text-sm shadow hover:shadow-md transition-all duration-200 mx-1 my-0.5 cursor-pointer">$1</button>'
      );
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      className={`fixed top-0 right-0 z-50 bg-white border-l border-gray-300 shadow-2xl h-full ${
        isMinimized ? "w-16" : "w-96"
      } transition-all duration-300 flex flex-col`}
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.98)', 
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-300">
        {!isMinimized ? (
          <>
            <div className="flex items-center gap-2">
              <FiBarChart className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Analytics Assistant</span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {timeRange === "1d" ? "24h" : timeRange === "7d" ? "7d" : timeRange === "30d" ? "30d" : "Custom"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Minimize"
              >
                <FiMinimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Close"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center w-full">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-gray-100 rounded transition-colors w-full"
              title="Expand Analytics Assistant"
            >
              <FiBarChart className="h-5 w-5 mx-auto" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors w-full mt-2"
              title="Close"
            >
              <FiX className="h-4 w-4 mx-auto" />
            </button>
          </div>
        )}
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white ml-4"
                      : "bg-gray-100 text-gray-900 mr-4 border border-gray-200"
                  }`}
                >
                  <div
                    className="text-sm whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(message.content),
                    }}
                  />
                  <div className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg mr-4 border border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Analyzing data...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-4 border-t border-gray-300">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your analytics data..."
                  className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </motion.div>
  );
} 