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
  FiUser,
  FiCpu,
  FiHeart,
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
function formatMessage(content: string, isLoveMode: boolean = false) {
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">$1</code>'
    )
    .replace(/\n/g, "<br>");

  // Add love-themed styling if in love mode
  if (isLoveMode) {
    formatted = formatted
      .replace(
        /Myley/g,
        '<span class="text-pink-600 font-semibold">Myley</span>'
      )
      .replace(/love/g, '<span class="text-red-500 font-medium">love</span>')
      .replace(
        /beautiful/g,
        '<span class="text-purple-500 font-medium">beautiful</span>'
      )
      .replace(/sweet/g, '<span class="text-pink-500 font-medium">sweet</span>')
      .replace(/heart/g, '<span class="text-red-500">❤️</span>')
      .replace(/💕/g, '<span class="text-pink-500">💕</span>');
  }

  return formatted;
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
      content: `Hi! I'm Lawrence's AI assistant! 🤖 I can help you learn more about his:

• Experience 💼
• Skills 🛠️
• Projects 🚀
• and more!

**Recruiters**: You can also share files with me for analysis, or I can help you contact Lawrence directly! 📄

What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoveMode, setIsLoveMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

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

      // Check if this is the Myley easter egg response
      const isMyleyResponse =
        data.response &&
        (data.response.includes("Myley") ||
          data.response.includes("girlfriend") ||
          data.response.includes("Lawrence's favorite person"));

      if (isMyleyResponse) {
        setIsLoveMode(true);
      }

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
          className={
            `chatbotContainer ${styles.chatbotContainer} ` +
            (isMinimized ? styles.minimized : "") +
            (isFullscreen ? styles.fullscreen : "") +
            (isLoveMode ? styles.loveMode : "")
          }
          style={{
            maxWidth: isFullscreen ? "100vw" : undefined,
            maxHeight: isFullscreen ? "100vh" : undefined,
            width: isFullscreen ? "100vw" : undefined,
            height: isMinimized ? "64px" : isFullscreen ? "100vh" : undefined,
            bottom: isFullscreen ? 0 : undefined,
            right: isFullscreen ? 0 : undefined,
            left: isFullscreen ? 0 : undefined,
            borderRadius: isFullscreen ? 0 : undefined,
          }}
        >
          {/* Header */}
          <div
            className={
              styles.header + " header flex items-center justify-between"
            }
          >
            <span className="flex items-center gap-2 font-semibold">
              {isLoveMode ? (
                <>
                  <FiHeart className="inline-block mr-2 animate-pulse text-pink-500" />
                  <span className="text-pink-600">Lawrence's Love Bot 💕</span>
                </>
              ) : (
                <>
                  <FiMessageCircle className="inline-block mr-2" />
                  Lawrence's AI Assistant
                </>
              )}
            </span>
            <div className="flex items-center gap-2">
              {isLoveMode && (
                <button
                  className="px-3 py-1 text-xs bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-full transition-colors duration-200 font-medium"
                  onClick={() => setIsLoveMode(false)}
                  title="Stop the cringe"
                >
                  Stop the cringe 😅
                </button>
              )}
              <button
                className={styles.actionButton + " actionButton"}
                title={isMinimized ? "Expand" : "Minimize"}
                onClick={() => setIsMinimized((v) => !v)}
              >
                {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
              </button>
              <button
                className={styles.actionButton + " actionButton"}
                title="Close"
                onClick={onClose}
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <div className={styles.messagesContainer + " messagesContainer"}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    "flex flex-col " +
                    (msg.role === "assistant" ? "items-start" : "items-end")
                  }
                >
                  {/* Message Label */}
                  <div className="flex items-center gap-2 mb-1 px-3">
                    {msg.role === "assistant" ? (
                      <>
                        <FiCpu className="h-3 w-3 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">
                          Lawrence's AI
                        </span>
                      </>
                    ) : (
                      <>
                        <FiUser className="h-3 w-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-400">
                          You
                        </span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={
                      styles.messageBubble +
                      " messageBubble " +
                      (msg.role === "assistant" ? "assistant" : "user")
                    }
                    dangerouslySetInnerHTML={{
                      __html: formatMessage(msg.content, isLoveMode),
                    }}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 mb-1 px-3">
                    <FiCpu className="h-3 w-3 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">
                      Lawrence's AI
                    </span>
                  </div>
                  <div
                    className={
                      styles.messageBubble + " messageBubble assistant"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          {!isMinimized && (
            <form
              className={styles.inputArea + " inputArea"}
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              {/* File attachments display */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-t border-b">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white dark:bg-gray-700 px-2 py-1 rounded text-xs"
                    >
                      {getFileIcon(file)}
                      <span className="truncate max-w-[120px]">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 p-2">
                <input
                  className={styles.inputField + " inputField flex-1"}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  ref={inputRef}
                  style={{ minWidth: 0 }}
                  disabled={isLoading}
                />

                {/* File attachment button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  title="Attach files"
                  disabled={isLoading}
                >
                  <FiPaperclip className="h-4 w-4" />
                </button>

                <button
                  className={styles.sendButton + " sendButton"}
                  type="submit"
                  disabled={
                    isLoading || (!input.trim() && selectedFiles.length === 0)
                  }
                  title="Send"
                >
                  <FiSend />
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}
