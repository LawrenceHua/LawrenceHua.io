"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMessageCircle, FiHeart, FiMenu } from "react-icons/fi";
import type { ChatbotProps } from "../../types/chatbot";
import { useChatbot } from "../../hooks/useChatbot";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { CalendarPicker } from "./CalendarPicker";
import { trackChatbotEvent } from "../../lib/analytics";
import styles from "../Chatbot.module.css";

export function ChatInterface({ isOpen, onClose }: ChatbotProps) {
  const {
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
    messagesEndRef,
    inputRef,
    fileInputRef,
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
  } = useChatbot(isOpen);

  // Handle button clicks for quick topics and commands (restored from original)
  const handleButtonClick = (type: string) => {
    let message = "";

    // Track button click event
    trackChatbotEvent("button_clicked", {
      buttonType: type,
      messageCount: messages.length,
      sessionLength: messages.length,
    });

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
      case "generate-question":
        const questions = [
          "What's Lawrence's biggest accomplishment?",
          "How does Lawrence approach problem-solving?",
          "What makes Lawrence a great teammate?", 
          "What's Lawrence's leadership style?",
          "How does Lawrence handle setbacks or failure?",
          "What drives Lawrence in his work and life?",
          "What would colleagues say about working with Lawrence?",
          "How does Lawrence bridge technical and non-technical stakeholders?",
          "What's Lawrence's approach to customer empathy?",
          "What's a story that best illustrates Lawrence's impact?",
          "How does Lawrence stay current with technology trends?",
          "What are Lawrence's values when building products?"
        ];
        message = questions[Math.floor(Math.random() * questions.length)];
        break;
      case "message":
        message = "/message";
        break;
      case "meeting":
        message = "/meeting";
        break;
      case "upload":
        // Track file upload button click
        trackChatbotEvent("upload_button_clicked", {
          messageCount: messages.length,
        });
        // Trigger file input - let mobile handle the options naturally
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      default:
        return;
    }

    // Add the message as if user typed it
    const userMessage = {
      role: "user" as const,
      content: message,
      timestamp: new Date(),
    };

    // Mark that user has sent their first message (for button clicks too)
    setHasUserSentMessage(true);

    // Automatically send to API
    sendMessage(message);
  };

  // Set up global function for button clicks (restored from original)
  useEffect(() => {
    (window as any).chatbotButtonClick = handleButtonClick;
    
    // Set up global function for projects scroll with chatbot close
    (window as any).scrollToProjectsAndClose = () => {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close chatbot after a delay to allow scroll
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        alert('Projects section not found. Please scroll down to see the featured projects.');
      }
    };

    return () => {
      delete (window as any).chatbotButtonClick;
      delete (window as any).scrollToProjectsAndClose;
    };
  }, [messages, onClose, sendMessage, fileInputRef, setHasUserSentMessage]);

  // Listen for tour triggers (restored from original)
  useEffect(() => {
    const handleTourCommand = (event: CustomEvent) => {
      const { command } = event.detail;
      if (command === "message" || command === "meeting") {
        handleButtonClick(command);
      }
    };

    window.addEventListener(
      "triggerChatbotCommand",
      handleTourCommand as EventListener
    );

    return () => {
      window.removeEventListener(
        "triggerChatbotCommand",
        handleTourCommand as EventListener
      );
    };
  }, []);

  // Handle calendar date/time selection (restored from original)
  const handleDateTimeSelect = async (dateTime: string) => {
    setShowCalendar(false);

    // Track calendar date/time selection
    trackChatbotEvent("calendar_datetime_selected", {
      selectedDateTime: dateTime,
      messageCount: messages.length,
    });

    // Send the selected date/time to API to complete the meeting request
    await sendMessage(dateTime);
  };

  // Handle calendar cancellation (restored from original)
  const handleCalendarCancel = () => {
    setShowCalendar(false);
    
    // Track calendar cancellation
    trackChatbotEvent("calendar_cancelled", {
      messageCount: messages.length,
    });
  };

  // Handle wheel events to prevent body scroll when scrolling inside chatbot (improved)
  const handleWheel = (e: React.WheelEvent) => {
    const target = e.target as HTMLElement;
    const chatbotContainer = target.closest(".chatbotContainer");
    const messagesContainer = target.closest(".messagesContainer");
    const menuContainer = target.closest(`.${styles.menu}`);
    
    // If we're inside the chatbot, allow internal scrolling but prevent body scroll
    if (chatbotContainer || messagesContainer || menuContainer) {
      e.stopPropagation();
      
      // Check if we're at scroll boundaries to allow/prevent default
      const scrollableElement = messagesContainer || menuContainer;
      if (scrollableElement) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
        
        // Only prevent default if we're not at boundaries or if scrolling would stay within bounds
        if ((!isAtTop && e.deltaY < 0) || (!isAtBottom && e.deltaY > 0)) {
          return; // Allow internal scrolling
        }
      }
      
      // Prevent body scroll when at boundaries
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {!isMinimized && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                zIndex: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "auto",
              }}
              onClick={onClose}
              onWheel={(e) => e.preventDefault()} // Prevent body scroll only
            />
          )}

          {/* Modal */}
          <div
            className={
              `chatbotContainer ${styles.chatbotContainer} ` +
              (isMinimized ? styles.minimized : "") +
              (isFullscreen ? styles.fullscreen : "") +
              (isLoveMode ? styles.loveMode : "")
            }
            style={{
              maxWidth: isFullscreen || isDesktop ? "700px" : "100vw",
              maxHeight: isFullscreen ? "100vh" : isMobile ? "100vh" : "750px",
              width: isFullscreen ? "100vw" : isDesktop ? "700px" : "100vw",
              height: isMinimized
                ? "72px"
                : isFullscreen
                  ? "100vh"
                  : isDesktop
                    ? "750px"
                    : "100vh",
              bottom: isFullscreen ? 0 : isDesktop ? "2rem" : 0,
              right: isFullscreen ? 0 : isDesktop ? "2rem" : 0,
              left: isFullscreen ? 0 : isMobile ? 0 : undefined,
              top: isMobile && !isFullscreen ? 0 : undefined,
              borderRadius: isFullscreen || isMobile ? 0 : "1.5rem",
              position: "fixed",
              zIndex: 1000,
              pointerEvents: "auto",
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
                  title="Close"
                  onClick={onClose}
                >
                  <FiX />
                </button>
              </div>
            </div>

            {/* Hamburger Menu - Positioned above hamburger icon */}
            {showMenu && !isMinimized && (
              <div 
                className={`${styles.menu} absolute bottom-20 right-4 py-3 w-[280px] max-h-[400px] z-20`}
                style={{ overflowY: "auto", pointerEvents: "auto" }}
              >
                {/* Quick Actions */}
                <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Quick Actions
                </div>
                <button
                  onClick={() => {
                    handleButtonClick("message");
                    setShowMenu(false);
                  }}
                  className={`${styles.menuItem} w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                >
                  📧 Send Message
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("meeting");
                    setShowMenu(false);
                  }}
                  className={`${styles.menuItem} w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                >
                  📅 Book Call
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("upload");
                    setShowMenu(false);
                  }}
                  className={`${styles.menuItem} w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                >
                  📎 Upload Job
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                {/* Learn About Lawrence */}
                <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Learn About Lawrence
                </div>
                <button
                  onClick={() => {
                    handleButtonClick("experience");
                    setShowMenu(false);
                  }}
                  className={`${styles.menuItem} w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                >
                  🚀 Experience
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("skills");
                    setShowMenu(false);
                  }}
                  className={`${styles.menuItem} w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                >
                  🛠️ Skills
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("projects");
                    setShowMenu(false);
                  }}
                  className={`${styles.menuItem} w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                >
                  💻 Projects
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-600" />
                {/* Fun Features */}
                <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Fun Features
                </div>
                <button
                  onClick={() => {
                    handleButtonClick("funfact");
                    setShowMenu(false);
                  }}
                  className={`${styles.menuItem} w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                >
                  🎲 Fun Fact
                </button>
                <button
                  onClick={() => {
                    handleButtonClick("generate-question");
                    setShowMenu(false);
                  }}
                  className={`${styles.menuItem} w-full text-left px-4 py-2 text-sm flex items-center gap-2`}
                >
                  💡 Generate Question
                </button>
              </div>
            )}

            {/* Messages */}
            {!isMinimized && (
              <div className={`${styles.messagesContainer} messagesContainer`}>
                <MessageList
                  messages={messages}
                  isLoading={isLoading}
                  getLoadingMessage={getLoadingMessage}
                  messagesEndRef={messagesEndRef}
                  isMobile={isMobile}
                  isLoveMode={isLoveMode}
                />
                {showCalendar && (
                  <div className="flex flex-col items-start mt-4 px-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" />
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Lawrence's AI
                      </span>
                    </div>
                    <CalendarPicker
                      onDateTimeSelect={handleDateTimeSelect}
                      onCancel={handleCalendarCancel}
                      onScrollToBottom={scrollToBottom}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Input Area - RESTORED */}
            {!isMinimized && (
              <div className={styles.inputArea}>
                <MessageInput
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  selectedFiles={selectedFiles}
                  handleSubmit={handleSubmit}
                  handleFileSelect={handleFileSelect}
                  removeFile={removeFile}
                  isLoading={isLoading}
                  inputRef={inputRef}
                  fileInputRef={fileInputRef}
                  isMobile={isMobile}
                  fileError={fileError}
                  setFileError={setFileError}
                  scrollToBottom={scrollToBottom}
                  showMenu={showMenu}
                  setShowMenu={setShowMenu}
                />
              </div>
            )}
          </div>
        </>
      )}
    </AnimatePresence>
  );
} 