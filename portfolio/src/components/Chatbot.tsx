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
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("session_id", id);
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

**Recruiters**: Drop in a job description to see if Lawrence is a good fit, or I can help you contact him directly! 📄

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [fileError, setFileError] = useState("");

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

  // Handle wheel events to prevent body scroll when scrolling inside chatbot
  const handleWheel = (e: React.WheelEvent) => {
    // Only prevent default if we're scrolling the messages container
    const target = e.target as HTMLElement;
    const messagesContainer = target.closest(".messagesContainer");
    if (messagesContainer) {
      e.stopPropagation();
    }
  };

  // Detect desktop
  const isDesktop = typeof window !== "undefined" && window.innerWidth > 768;

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

    // Background image sending (silently email images to Lawrence)
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length > 0) {
      // Send images in background without blocking the chatbot response
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

          console.log(
            "Image sent to Lawrence successfully (background):",
            imageFile.name
          );
        } catch (imageError) {
          console.error("Background image sending failed:", imageError);
          // Don't show error to user - this is silent
        }
      });
    }

    const formData = new FormData();
    formData.append("message", input);
    formData.append("history", JSON.stringify(messages));
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
              maxWidth: isFullscreen || isDesktop ? "600px" : undefined,
              maxHeight: isFullscreen ? "100vh" : undefined,
              width: isFullscreen ? "100vw" : isDesktop ? "600px" : undefined,
              height: isMinimized
                ? "64px"
                : isFullscreen
                  ? "100vh"
                  : isDesktop
                    ? "80vh"
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
                      style={{ minWidth: 0 }}
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
