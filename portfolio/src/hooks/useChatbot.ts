"use client";

import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import type { Message, FilePreview } from "../types/chatbot";
import { trackChatbotEvent } from "../lib/analytics";
import { getSessionId, updateSessionActivity, clearSession } from "../lib/session";

export function useChatbot(isOpen: boolean) {
  // Initialize with welcome message like the original
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `👋 Hey there! I'm Lawrence's AI assistant!

I can help you discover what makes Lawrence tick as a Product Manager and AI builder.

**Popular Topics:**
<button-experience>🚀 Experience</button-experience> <button-skills>🛠️ Skills</button-skills> <button-projects>💻 Projects</button-projects>
**Quick Actions:**
<button-message>📧 Send Message</button-message> <button-meeting>📅 Book Call</button-meeting> <button-upload>📎 Upload Job</button-upload> <button-funfact>🎲 Surprise Me!</button-funfact> <button-generate-question>💡 Generate Question</button-generate-question>

Try asking me something like "What's Lawrence's biggest accomplishment?" or "How does he approach problem-solving?"`,
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCalendarMode, setIsCalendarMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Restore missing state variables from original
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoveMode, setIsLoveMode] = useState(false);
  const [awaitingGirlfriendPassword, setAwaitingGirlfriendPassword] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [fileError, setFileError] = useState("");
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Changed to textarea like original
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track conversation start when chatbot opens
  useEffect(() => {
    if (isOpen) {
      trackChatbotEvent("conversation_started", {
        timestamp: new Date().toISOString(),
        initialMessageLength: messages[0]?.content.length || 0,
      });
    }
  }, [isOpen]);

  // Detect mobile/desktop with proper responsive handling like original
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const isDesktop = !isMobile;

  // Auto-scroll function for smooth scrolling to bottom like original
  const scrollToBottom = (delay: number = 100) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, delay);
  };

  // Function to determine if a query will likely take longer (more restrictive)
  const willTakeLonger = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    
    // INSTANT RESPONSES: Quick button clicks should NEVER show loading
    const instantButtonResponses = [
      "skills", "skill", "experience", "experiences", "projects", "portfolio",
      "education", "degree", "contact", "connect", "ai", "artificial intelligence",
      "machine learning", "ml", "technologies", "tech stack"
    ];

    // If it's a simple button click (single word or very short phrase), make it instant
    if (instantButtonResponses.includes(lowerMessage) || lowerMessage.length <= 15) {
      return false;
    }

    const longRunningTriggers = [
      "tell me about lawrence's experience",
      "lawrence's background",
      "what has lawrence done",
      "lawrence's work history", 
      "lawrence's resume",
      "lawrence's cv",
      "all of lawrence's skills",
      "lawrence's technical abilities",
      "lawrence's expertise",
      "lawrence's accomplishments",
      "lawrence's achievements", 
      "lawrence's portfolio",
      "lawrence's projects",
      "comprehensive",
      "detailed",
      "everything about",
      "full background",
      "complete experience",
      "entire portfolio"
    ];
    
    // More restrictive - require longer phrases or specific comprehensive requests
    return longRunningTriggers.some((trigger) => lowerMessage.includes(trigger)) ||
           (lowerMessage.includes("lawrence") && 
            (lowerMessage.includes("experience") || lowerMessage.includes("background")) &&
            lowerMessage.length > 25); // Only for longer, detailed queries
  };

  // Get a varied loading message (restored from original)
  const getLoadingMessage = (messageText: string, currentMessages?: Message[]): string => {
    const lowerMessage = messageText.toLowerCase();
    
    // Check if this is a contact flow (message or meeting request)
    const isContactFlow = 
      lowerMessage.startsWith("/message") || 
      lowerMessage.startsWith("/meeting") || 
      lowerMessage.startsWith("/meet");
    
    // Check if we're in the middle of a contact flow by looking at recent assistant messages
    const lastFewMessages = currentMessages ? currentMessages.slice(-3) : messages.slice(-3);
    const inContactFlow = lastFewMessages.some(msg => 
      msg.role === "assistant" && (
        msg.content.includes("What's your name") ||
        msg.content.includes("What company are you with") ||
        msg.content.includes("email address") ||
        msg.content.includes("What's your message") ||
        msg.content.includes("What is your message") ||
        msg.content.includes("what would you like to discuss") ||
        msg.content.includes("when would you like to schedule") ||
        msg.content.includes("What date and time") ||
        msg.content.includes("Message Sent Successfully") ||
        msg.content.includes("Meeting Request Sent")
      )
    );

    // For contact flows, use simple default thinking message
    if (isContactFlow || inContactFlow) {
      return "Thinking...";
    }

    const loadingMessages = [
      "⏳ Bear with me while I gather Lawrence's detailed info...",
      "🔍 Pulling up Lawrence's comprehensive background...",
      "📊 Analyzing Lawrence's experience and achievements...",
      "💼 Compiling his professional journey for you...",
      "🚀 Loading all the exciting details about Lawrence...",
      "⚡ Gathering insights from his extensive portfolio...",
    ];

    // Choose based on message content for more relevance
    if (lowerMessage.includes("skill") || lowerMessage.includes("technical")) {
      return "🛠️ Compiling Lawrence's technical skills and expertise...";
    } else if (
      lowerMessage.includes("project") ||
      lowerMessage.includes("portfolio")
    ) {
      return "🚀 Loading his impressive project portfolio...";
    } else if (
      lowerMessage.includes("experience") ||
      lowerMessage.includes("background")
    ) {
      return "💼 Gathering his comprehensive work experience...";
    }

    // Random selection for general queries
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  };

  // API call function that can be reused (restored from original)
  const sendMessageToAPI = async (
    messageText: string,
    currentMessages: Message[]
  ) => {
    // Check if this query will likely take longer
    const isLongRunning = willTakeLonger(messageText);

    // Add predictive loading message for longer queries
    if (isLongRunning) {
      const loadingMessage: Message = {
        role: "assistant",
        content: getLoadingMessage(messageText, currentMessages),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // Scroll to bottom after adding loading message
      scrollToBottom();

      // Small delay to show the loading message
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", messageText);
      formData.append(
        "history",
        JSON.stringify(currentMessages.slice(-10))
      ); // Only send last 10 messages for faster processing
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

      // Replace loading message with actual response, or append if no loading message
      setMessages((prev) => {
        // Check if the last message is our loading message
        const lastMessage = prev[prev.length - 1];
        const isLoadingMessage =
          lastMessage &&
          (lastMessage.content.includes("⏳ Bear with me while I gather") ||
            lastMessage.content.includes("🔍 Pulling up Lawrence's") ||
            lastMessage.content.includes("📊 Analyzing Lawrence's") ||
            lastMessage.content.includes("💼 Compiling his") ||
            lastMessage.content.includes("🚀 Loading") ||
            lastMessage.content.includes("⚡ Gathering insights") ||
            lastMessage.content.includes("🛠️ Compiling Lawrence's"));

        if (isLoadingMessage && isLongRunning) {
          // Replace the loading message with the actual response
          return [
            ...prev.slice(0, -1),
            {
              role: "assistant",
              content: data.response,
              timestamp: new Date(),
            },
          ];
        } else {
          // Append normally if no loading message
          return [
            ...prev,
            {
              role: "assistant",
              content: data.response,
              timestamp: new Date(),
            },
          ];
        }
      });
    } catch (error) {
      console.error("Chatbot error:", error);

      // Replace loading message with error response, or append if no loading message
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        const isLoadingMessage =
          lastMessage &&
          (lastMessage.content.includes("⏳ Bear with me while I gather") ||
            lastMessage.content.includes("🔍 Pulling up Lawrence's") ||
            lastMessage.content.includes("📊 Analyzing Lawrence's") ||
            lastMessage.content.includes("💼 Compiling his") ||
            lastMessage.content.includes("🚀 Loading") ||
            lastMessage.content.includes("⚡ Gathering insights") ||
            lastMessage.content.includes("🛠️ Compiling Lawrence's"));

        const errorMessage = {
          role: "assistant" as const,
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again later or reach out to Lawrence directly.",
          timestamp: new Date(),
        };

        if (isLoadingMessage && isLongRunning) {
          // Replace the loading message with the error message
          return [...prev.slice(0, -1), errorMessage];
        } else {
          // Append normally if no loading message
          return [...prev, errorMessage];
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear session when chatbot is closed (restored from original)
  useEffect(() => {
    if (!isOpen) {
      clearSession();
    }
  }, [isOpen]);

  // Focus input when chatbot opens (mobile + desktop with gentle mobile handling) - restored from original
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        if (inputRef.current) {
          try {
            if (isMobile) {
              // For mobile, set focus but prevent auto-scroll until user explicitly taps
              // This prepares the input for keyboard activation on touch
              inputRef.current.focus({ preventScroll: true });
            } else {
              // Normal focus for desktop
              inputRef.current.focus();
            }
          } catch (error) {
            console.log('Initial focus failed:', error);
          }
        }
      }, 100);
    }
  }, [isOpen, isMinimized, isMobile]);

  // Auto-focus input after first message and subsequent assistant responses (mobile + desktop) - restored from original
  useEffect(() => {
    if (hasUserSentMessage && !isLoading && !isMinimized && inputRef.current) {
      // Small delay to ensure the assistant response is fully rendered
      setTimeout(() => {
        if (inputRef.current) {
          try {
            // For mobile, ensure input stays ready for keyboard
            if (isMobile) {
              // Keep input ready for keyboard activation
              inputRef.current.focus({ preventScroll: true });
            } else {
              // Normal focus for desktop
              inputRef.current.focus();
            }
          } catch (error) {
            // Fallback if focus fails
            console.log('Auto-focus failed:', error);
          }
        }
      }, 300);
    }
  }, [messages, isLoading, hasUserSentMessage, isMobile, isMinimized]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when calendar shows/hides
  useEffect(() => {
    if (showCalendar) {
      scrollToBottom();
    }
  }, [showCalendar]);

  // Auto-scroll when loading state changes (for new assistant responses)
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // Auto-scroll when file error appears
  useEffect(() => {
    if (fileError) {
      scrollToBottom();
    }
  }, [fileError]);

  const sendMessage = async (messageText: string, files?: File[]) => {
    if (!messageText.trim() && (!files || files.length === 0)) return;

    const currentMessages = [...messages];
    const sessionId = getSessionId();
    updateSessionActivity();

    // Track message send event
    trackChatbotEvent("message_sent", {
      messageLength: messageText.length,
      hasFiles: files && files.length > 0,
      fileCount: files?.length || 0,
      messageCount: messages.length,
      sessionLength: messages.length,
      fileTypes: files?.map(f => f.type) || [],
    });

    // Add user message IMMEDIATELY with flushSync for instant appearance
    const userMessage: Message = {
      role: "user",
      content: messageText,
      files: files?.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      })),
      timestamp: new Date(),
    };

    // Use flushSync to force immediate DOM update - user message appears instantly
    flushSync(() => {
      setInputValue("");
      setSelectedFiles([]);
      setMessages((prev) => [...prev, userMessage]);
      setHasUserSentMessage(true);
    });

    // Handle file uploads with custom API call
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("message", messageText);
      formData.append("history", JSON.stringify(currentMessages.slice(-10))); // Only send last 10 messages for faster processing
      formData.append("sessionId", sessionId);
      files.forEach((file) => {
        formData.append("files", file);
      });

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
      sendMessageToAPI(messageText, [...currentMessages, userMessage]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && selectedFiles.length === 0) || isLoading) return;
    sendMessage(inputValue, selectedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError("");
    const files = Array.from(e.target.files || []);
    
    // Track file selection
    if (files.length > 0) {
      trackChatbotEvent("files_selected", {
        fileCount: files.length,
        fileSizes: files.map(f => f.size),
        fileTypes: files.map(f => f.type),
        messageCount: messages.length,
      });
    }
    
    // Limit file size to 10MB
    const tooLarge = files.some((file) => file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      trackChatbotEvent("file_error", {
        errorType: "size_limit",
        fileCount: files.length,
      });
      setFileError(
        "File size exceeds the 10MB limit. Please select a smaller file."
      );
      scrollToBottom();
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    if (files.length > 0) {
      scrollToBottom();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Check if the last assistant message should trigger the calendar (restored from original)
  const shouldShowCalendar = () => {
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage &&
      lastMessage.role === "assistant" &&
      lastMessage.content.includes(
        "When would you like to schedule the meeting"
      )
    );
  };

  // Show calendar when appropriate
  useEffect(() => {
    if (shouldShowCalendar() && !showCalendar) {
      setShowCalendar(true);
    }
  }, [messages, showCalendar]);

  return {
    // State
    messages,
    isLoading,
    inputValue,
    selectedFiles,
    isCalendarMode,
    isMobile,
    isDesktop,
    isMinimized,
    isFullscreen,
    isLoveMode,
    awaitingGirlfriendPassword,
    showMenu,
    showCalendar,
    fileError,
    hasUserSentMessage,
    
    // Refs
    messagesEndRef,
    inputRef,
    fileInputRef,
    
    // Actions
    setInputValue,
    setIsCalendarMode,
    setIsMinimized,
    setIsFullscreen,
    setIsLoveMode,
    setAwaitingGirlfriendPassword,
    setShowMenu,
    setShowCalendar,
    setFileError,
    setHasUserSentMessage,
    sendMessage,
    sendMessageToAPI,
    handleSubmit,
    handleFileSelect,
    removeFile,
    scrollToBottom,
    getLoadingMessage,
    willTakeLonger,
    shouldShowCalendar,
  };
} 