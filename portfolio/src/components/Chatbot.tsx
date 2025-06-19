"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiPaperclip,
  FiFile,
  FiImage,
  FiDownload,
  FiTrash2,
  FiMaximize2,
  FiMinimize2,
} from "react-icons/fi";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  Firestore,
} from "firebase/firestore";
import styles from "./Chatbot.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  files?: File[];
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA_HYWpbGRuNvcWyxfiUEZr7_mTw7PU0t8",
  authDomain: "peronalsite-88d49.firebaseapp.com",
  projectId: "peronalsite-88d49",
  storageBucket: "peronalsite-88d49.firebasestorage.app",
  messagingSenderId: "515222232116",
  appId: "1:515222232116:web:b7a9b8735980ce8333fe61",
  measurementId: "G-ZV5CR4EBB8",
};

let app: FirebaseApp | undefined, db: Firestore | undefined;
if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
}

function getSessionId() {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("firebase_session_id");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("firebase_session_id", id);
  }
  return id;
}

// Markdown formatting function
function formatMessage(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>'
    )
    .replace(/\n/g, "<br>");
}

// File type detection
function getFileIcon(file: File) {
  if (file.type.startsWith("image/")) return <FiImage className="h-4 w-4" />;
  if (file.type.includes("pdf")) return <FiFile className="h-4 w-4" />;
  return <FiFile className="h-4 w-4" />;
}

export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Lawrence's AI assistant. I can help you learn more about his experience, skills, and projects. You can also share files with me for analysis. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      files: selectedFiles.length > 0 ? [...selectedFiles] : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedFiles([]);
    setIsLoading(true);

    try {
      if (db) {
        await logMessageToFirebase(input, "user");
      }

      // Handle file uploads if any
      let fileData = null;
      if (selectedFiles.length > 0) {
        fileData = await handleFileUpload(selectedFiles);
      }

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          files: fileData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);

      if (db && data && data.response) {
        await logMessageToFirebase(data.response, "assistant");
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again later or reach out to Lawrence directly.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    // For now, we'll just return file metadata
    // In a real implementation, you'd upload to a service like AWS S3 or Firebase Storage
    return files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      // In production, you'd upload the actual file and return the URL
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const logMessageToFirebase = async (
    message: string,
    role: "user" | "assistant"
  ) => {
    try {
      if (typeof window !== "undefined" && db) {
        await addDoc(collection(db, "chatbot_messages"), {
          sessionId: getSessionId(),
          message,
          role,
          timestamp: new Date(),
        });
      }
    } catch (error: any) {
      console.error(`Error logging ${role} message to Firebase:`, error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-in-out ${styles.chatbotContainer} ${
        isFullscreen
          ? "inset-0 m-0 rounded-none"
          : isMinimized
            ? "bottom-4 right-4 w-80 h-16"
            : "bottom-4 right-4 w-96 h-[600px] md:h-[700px]"
      }`}
    >
      {/* Chatbot Container */}
      <div
        className={`h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden ${
          isMinimized ? "cursor-pointer" : ""
        }`}
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <FiMessageCircle className="h-6 w-6" />
              <div
                className={`absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full ${styles.statusIndicator}`}
              ></div>
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Assistant</h3>
              <p className="text-xs text-blue-100">Lawrence's AI Helper</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isMinimized && (
              <>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${styles.actionButton}`}
                >
                  {isFullscreen ? (
                    <FiMinimize2 className="h-4 w-4" />
                  ) : (
                    <FiMaximize2 className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${styles.actionButton}`}
                >
                  <FiMinimize2 className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className={`p-2 hover:bg-white/20 rounded-lg transition-colors ${styles.actionButton}`}
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div
              className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800 ${styles.messagesContainer}`}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} ${styles.messageBubble}`}
                >
                  <div
                    className={`max-w-[85%] ${message.role === "user" ? "order-2" : "order-1"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex items-end space-x-2 ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${styles.avatar} ${
                          message.role === "user"
                            ? "bg-blue-600"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                      >
                        {message.role === "user" ? "U" : "AI"}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        {/* Files */}
                        {message.files && message.files.length > 0 && (
                          <div className="mb-3 space-y-2">
                            {message.files.map((file, fileIndex) => (
                              <div
                                key={fileIndex}
                                className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-lg"
                              >
                                {getFileIcon(file)}
                                <span className="text-sm truncate">
                                  {file.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Text Content */}
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: formatMessage(message.content),
                          }}
                        />

                        {/* Timestamp */}
                        <div
                          className={`text-xs mt-2 ${
                            message.role === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                      AI
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-600">
                      <div
                        className={`flex space-x-1 ${styles.typingIndicator}`}
                      >
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
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  Selected files:
                </div>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded-lg ${styles.fileItem}`}
                    >
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file)}
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      >
                        <FiTrash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${styles.actionButton}`}
                >
                  <FiPaperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about Lawrence..."
                  className={`flex-1 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none ${styles.inputField}`}
                  disabled={isLoading}
                />

                <button
                  type="submit"
                  disabled={
                    (!input.trim() && selectedFiles.length === 0) || isLoading
                  }
                  className={`flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${styles.actionButton}`}
                >
                  <FiSend className="h-4 w-4 text-white" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
            </form>
          </>
        )}
      </div>
    </div>
  );
}
