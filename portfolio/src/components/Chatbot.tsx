"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageCircle,
  FiSend,
  FiX,
  FiPaperclip,
  FiFile,
  FiImage,
  FiTrash2,
  FiHeart,
  FiCpu,
  FiUser,
  FiMenu,
} from "react-icons/fi";
import styles from "./Chatbot.module.css";

interface FilePreview {
  url: string;
  type: string;
  name: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  files?: FilePreview[];
  timestamp: Date;
}

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

function getSessionId() {
  if (typeof window === "undefined") return "";

  // Check if session has expired (5 minutes of inactivity)
  const lastActivity = localStorage.getItem("session_last_activity");
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;

  if (lastActivity && now - parseInt(lastActivity) > FIVE_MINUTES) {
    // Session expired, clear it
    localStorage.removeItem("session_id");
    localStorage.removeItem("session_last_activity");
  }

  let id = localStorage.getItem("session_id");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("session_id", id);
  }

  // Update last activity timestamp
  localStorage.setItem("session_last_activity", now.toString());

  return id;
}

function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("session_id");
  localStorage.removeItem("session_last_activity");
}

// Markdown formatting function
function formatMessage(
  content: string,
  isLoveMode: boolean = false,
  onButtonClick?: (type: string) => void
) {
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");

  // Replace custom button tags with actual clickable buttons (smaller size)
  formatted = formatted
    .replace(
      /<button-experience>(.*?)<\/button-experience>/g,
      '<button onclick="window.chatbotButtonClick(\'experience\')" class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer">$1</button>'
    )
    .replace(
      /<button-skills>(.*?)<\/button-skills>/g,
      '<button onclick="window.chatbotButtonClick(\'skills\')" class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer">$1</button>'
    )
    .replace(
      /<button-projects>(.*?)<\/button-projects>/g,
      '<button onclick="window.chatbotButtonClick(\'projects\')" class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer">$1</button>'
    )
    .replace(
      /<button-funfact>(.*?)<\/button-funfact>/g,
      '<button onclick="window.chatbotButtonClick(\'funfact\')" class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer">$1</button>'
    )
    .replace(
      /<button-message>(.*?)<\/button-message>/g,
      '<button onclick="window.chatbotButtonClick(\'message\')" class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer">$1</button>'
    )
    .replace(
      /<button-meeting>(.*?)<\/button-meeting>/g,
      '<button onclick="window.chatbotButtonClick(\'meeting\')" class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer">$1</button>'
    )
    .replace(
      /<button-upload>(.*?)<\/button-upload>/g,
      '<button onclick="window.chatbotButtonClick(\'upload\')" class="inline-flex items-center px-2 py-1 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded font-medium text-xs shadow hover:shadow-md transition-all duration-200 mx-0.5 my-0.5 cursor-pointer">$1</button>'
    );

  // Special styling for typed commands - make them more visible and attractive
  formatted = formatted
    .replace(
      /`\/message`/g,
      '<span class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 mx-1">/message</span>'
    )
    .replace(
      /`\/meeting`/g,
      '<span class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 mx-1">/meeting</span>'
    );

  // Handle other code blocks (not commands)
  formatted = formatted.replace(
    /`([^\/][^`]*)`/g,
    '<code class="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono text-sm border border-blue-200">$1</code>'
  );

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
      content: `Hi! I'm Lawrence's AI! 🤖

<button-experience>Experience</button-experience> <button-skills>Skills</button-skills> <button-projects>Projects</button-projects> <button-funfact>Fun Fact</button-funfact>

<button-message>/message</button-message> <button-meeting>/meeting</button-meeting> <button-upload>📎 Upload Job</button-upload>

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
  const [awaitingGirlfriendPassword, setAwaitingGirlfriendPassword] =
    useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [fileError, setFileError] = useState("");

  // Detect mobile/desktop with proper responsive handling
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isDesktop = !isMobile;

  // API call function that can be reused
  const sendMessageToAPI = async (
    messageText: string,
    currentMessages: Message[]
  ) => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", messageText);
      formData.append("history", JSON.stringify(currentMessages.slice(0, -1))); // Exclude the last message we just added
      formData.append("sessionId", getSessionId());

      const response = await fetch("/api/chatbot", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Check if this is the Myley easter egg response using the flag from backend
      const isMyleyResponse = data.isMyleyResponse;

      // Check if password is needed
      const needsPassword = data.needsPassword;
      setAwaitingGirlfriendPassword(!!needsPassword);

      if (isMyleyResponse && !needsPassword) {
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

  // Handle button clicks for quick topics and commands
  const handleButtonClick = (type: string) => {
    let message = "";

    switch (type) {
      case "experience":
        message = "Tell me about Lawrence's experience and background";
        break;
      case "skills":
        message = "What are Lawrence's key skills and technical abilities?";
        break;
      case "projects":
        message = "Show me Lawrence's most impressive projects";
        break;
      case "funfact":
        message = "Tell me a fun fact about Lawrence";
        break;
      case "message":
        message = "/message";
        break;
      case "meeting":
        message = "/meeting";
        break;
      case "upload":
        // Trigger file input - let mobile handle the options naturally
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      default:
        return;
    }

    // Add the message as if user typed it
    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Automatically send to API
    sendMessageToAPI(message, [...messages, userMessage]);
  };

  // Set up global function for button clicks
  useEffect(() => {
    (window as any).chatbotButtonClick = handleButtonClick;

    return () => {
      delete (window as any).chatbotButtonClick;
    };
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear session when chatbot is closed
  useEffect(() => {
    if (!isOpen) {
      clearSession();
    }
  }, [isOpen]);

  // Focus input when chatbot opens (only on desktop to prevent mobile zoom)
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current && isDesktop) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized, isDesktop]);

  // Handle wheel events to prevent body scroll when scrolling inside chatbot
  const handleWheel = (e: React.WheelEvent) => {
    // Only prevent default if we're scrolling the messages container
    const target = e.target as HTMLElement;
    const messagesContainer = target.closest(".messagesContainer");
    if (messagesContainer) {
      e.stopPropagation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      files: selectedFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      })),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length > 0) {
      imageFiles.forEach(async (imageFile) => {
        try {
          const imageFormData = new FormData();
          imageFormData.append("image", imageFile);
          imageFormData.append("message", input);
          imageFormData.append("email", "Portfolio Visitor");
          imageFormData.append("name", "Portfolio Visitor");

          await fetch("/api/send-image", {
            method: "POST",
            body: imageFormData,
          });

          console.log("Image sent to AI assistant", imageFile.name);
        } catch (imageError) {
          console.error("Background image sending failed:", imageError);
        }
      });
    }

    // Handle file uploads with custom API call
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      formData.append("message", input);
      formData.append("history", JSON.stringify(messages));
      formData.append("sessionId", getSessionId());
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      setInput("");
      setSelectedFiles([]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chatbot", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        // Check if this is the Myley easter egg response using the flag from backend
        const isMyleyResponse = data.isMyleyResponse;
        const needsPassword = data.needsPassword;
        setAwaitingGirlfriendPassword(!!needsPassword);

        if (isMyleyResponse && !needsPassword) {
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
    } else {
      // Use the shared API function for text-only messages
      setInput("");
      setSelectedFiles([]);
      sendMessageToAPI(input, [...messages, userMessage]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const files = Array.from(e.target.files || []);
    // Limit file size to 10MB
    const tooLarge = files.some((file) => file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      setFileError(
        "File size exceeds the 10MB limit. Please select a smaller file."
      );
      return;
    }
    setSelectedFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Animated Backdrop */}
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                zIndex: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={isDesktop ? onClose : undefined}
            />
          )}

          {/* Animated Modal */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              x: isDesktop ? 100 : 0,
              y: isDesktop ? 100 : 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              x: isDesktop ? 50 : 0,
              y: isDesktop ? 50 : 20,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.3,
            }}
            className={
              `chatbotContainer ${styles.chatbotContainer} ` +
              (isMinimized ? styles.minimized : "") +
              (isFullscreen ? styles.fullscreen : "") +
              (isLoveMode ? styles.loveMode : "")
            }
            style={{
              maxWidth: isFullscreen || isDesktop ? "500px" : undefined,
              maxHeight: isFullscreen ? "100vh" : undefined,
              width: isFullscreen ? "100vw" : isDesktop ? "500px" : undefined,
              height: isMinimized
                ? "64px"
                : isFullscreen
                  ? "100vh"
                  : isDesktop
                    ? "65vh"
                    : undefined,
              bottom: isFullscreen ? 0 : isDesktop ? "6rem" : undefined,
              right: isFullscreen ? 0 : isDesktop ? "1.5rem" : undefined,
              left: isFullscreen ? 0 : undefined,
              borderRadius: isFullscreen ? 0 : "1rem",
              position: isDesktop ? "fixed" : undefined,
              zIndex: 1000,
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
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
                    <span className="text-pink-600">
                      Lawrence's Love Bot 💕
                    </span>
                  </>
                ) : (
                  <>
                    <FiMessageCircle className="inline-block mr-2" />
                    Lawrence's AI
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
                  title="Menu"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <FiMenu />
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

            {/* Hamburger Menu */}
            {showMenu && !isMinimized && (
              <div className="absolute top-12 right-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-2 min-w-[200px]">
                <button
                  onClick={() => {
                    handleButtonClick("experience");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  💼 Experience
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("skills");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  🛠️ Skills
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("projects");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  🚀 Projects
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("funfact");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  🎯 Fun Fact
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={() => {
                    handleButtonClick("message");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  📧 /message
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("meeting");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  📅 /meeting
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                <button
                  onClick={() => {
                    handleButtonClick("upload");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                >
                  📎 Upload Job Description
                </button>
              </div>
            )}

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
                    >
                      {msg.files && msg.files.length > 0 && (
                        <div className="mb-2">
                          {msg.files.map((file, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-w-xs shadow"
                            >
                              {file.type.startsWith("image/") ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full max-h-48 object-contain"
                                />
                              ) : (
                                <div className="flex flex-col items-center justify-center p-4 text-gray-500 dark:text-gray-400">
                                  <FiFile className="w-8 h-8 mb-2" />
                                  <span className="text-xs truncate">
                                    {file.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg.content, isLoveMode),
                        }}
                      />
                    </div>
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
                {selectedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700 max-h-24 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-700 px-1.5 sm:px-2 py-1 rounded-lg text-xs shadow-sm flex-shrink-0"
                      >
                        {getFileIcon(file)}
                        <span className="truncate max-w-[80px] sm:max-w-[120px]">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <FiTrash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {fileError && (
                  <div className="text-red-500 text-xs px-2 py-1 bg-red-50 dark:bg-red-900/10">
                    {fileError}
                  </div>
                )}

                <div className="w-full px-2 pb-2 pt-1 bg-transparent">
                  <div className="flex items-end bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                    <textarea
                      className="flex-1 px-3 sm:px-4 py-2 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:placeholder-gray-300 text-sm sm:text-base resize-none min-h-[40px] max-h-[80px] sm:max-h-[120px]"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your message..."
                      ref={inputRef}
                      style={{
                        minWidth: 0,
                        fontSize: isMobile ? "16px" : undefined, // Prevent zoom on iOS
                        touchAction: "manipulation",
                      }}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (input.trim() || selectedFiles.length > 0)
                            handleSubmit(e);
                        }
                      }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                      disabled={isLoading}
                    />

                    {/* Mobile-optimized button layout */}
                    <div className="flex items-center flex-shrink-0 px-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                        title="Attach files"
                        disabled={isLoading}
                      >
                        <FiPaperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        className="ml-1 mr-1 sm:mr-2 p-1.5 sm:p-2 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                        type="submit"
                        disabled={
                          isLoading ||
                          (!input.trim() && selectedFiles.length === 0)
                        }
                        title="Send"
                      >
                        <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
