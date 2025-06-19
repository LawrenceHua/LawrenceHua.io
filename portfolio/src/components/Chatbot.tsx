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

  return (
    <>
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-800 ${
            styles.chatbotContainer
          } ${isMinimized ? styles.minimized : ""} ${
            isFullscreen ? styles.fullscreen : ""
          }`}
          style={{
            width: isFullscreen ? "100vw" : "400px",
            height: isMinimized ? "64px" : isFullscreen ? "100vh" : "600px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FiMessageCircle className="h-6 w-6 text-blue-500" />
                <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-400"></div>
              </div>
              <h3 className="font-semibold">Chat with Lawrence's AI</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMinimized ? (
                  <FiMaximize2 className="h-4 w-4" />
                ) : (
                  <FiMinimize2 className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={onClose}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                className={`flex-1 overflow-y-auto p-4 ${styles.messagesContainer}`}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-4 flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    } ${styles.messageBubble}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 dark:bg-gray-700"
                      } max-w-[80%]`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg.content),
                        }}
                      />
                      {msg.files && msg.files.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.files.map((file, fileIdx) => (
                            <div
                              key={fileIdx}
                              className="flex items-center space-x-2 text-sm"
                            >
                              {getFileIcon(file)}
                              <span>{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex space-x-2 rounded-lg bg-gray-100 px-4 py-2 dark:bg-gray-700">
                      <div
                        className={`h-2 w-2 rounded-full bg-gray-400 ${styles.typingIndicator}`}
                        style={{ animationDelay: "0s" }}
                      />
                      <div
                        className={`h-2 w-2 rounded-full bg-gray-400 ${styles.typingIndicator}`}
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className={`h-2 w-2 rounded-full bg-gray-400 ${styles.typingIndicator}`}
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center space-x-2 rounded-lg bg-white px-3 py-1 text-sm dark:bg-gray-800 ${styles.fileItem}`}
                      >
                        {getFileIcon(file)}
                        <span className="max-w-[150px] truncate">
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div
                className={`border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 ${styles.inputArea}`}
              >
                <form
                  onSubmit={handleSubmit}
                  className="flex items-end space-x-2"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      className={`w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white ${styles.inputField}`}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 ${styles.actionButton}`}
                    >
                      <FiPaperclip className="h-5 w-5" />
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isLoading ||
                        (!input.trim() && selectedFiles.length === 0)
                      }
                      className={`rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50 ${styles.actionButton}`}
                    >
                      <FiSend className="h-5 w-5" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
