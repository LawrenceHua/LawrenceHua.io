"use client";

import { useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Lawrence's AI assistant. I can help you learn more about his experience, skills, and projects. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again later or reach out to Lawrence directly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 right-4 bottom-0 bottom-4 z-50 flex h-[500px] h-full w-96 w-full flex-col rounded-lg rounded-none border border-gray-200 bg-white shadow-2xl md:right-4 md:bottom-4 md:h-[500px] md:w-96 md:rounded-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <FiMessageCircle className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            AI Assistant
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-700">
              <div className="flex space-x-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4 dark:border-gray-700"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about Lawrence..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none md:text-inherit dark:border-gray-600 dark:bg-gray-700 dark:text-white md:dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSend className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
