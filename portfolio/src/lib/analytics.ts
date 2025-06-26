import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseInitialized } from "./firebase";
import type { ChatbotAnalyticsEvent } from "../types/chatbot";

// Generate session ID for analytics tracking
export function getChatSessionId(): string {
  if (typeof window === "undefined") return "server";
  
  let sessionId = sessionStorage.getItem("analytics_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("analytics_session_id", sessionId);
  }
  return sessionId;
}

// Track chatbot events
export async function trackChatbotEvent(eventType: string, data: Record<string, any> = {}) {
  if (!isFirebaseInitialized()) {
    console.warn("Firebase not initialized, skipping analytics");
    return;
  }

  try {
    const eventData: ChatbotAnalyticsEvent = {
      eventType,
      sessionId: getChatSessionId(),
      timestamp: serverTimestamp(),
      userAgent: typeof window !== "undefined" ? navigator.userAgent : "server",
      page: typeof window !== "undefined" ? window.location.pathname : "unknown",
      ...data,
    };

    await addDoc(collection(db!, "chatbot_analytics"), eventData);
    console.log(`Tracked chatbot event: ${eventType}`);
  } catch (error) {
    console.error("Error tracking chatbot event:", error);
  }
}

// Track button clicks for analytics
export async function trackButtonClick(buttonType: string, buttonText: string) {
  try {
    await fetch("/api/track-button-v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        buttonType,
        buttonText,
        page: typeof window !== "undefined" ? window.location.pathname : "unknown",
        sessionId: getChatSessionId(),
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "server",
      }),
    });
    console.log(`✅ Button click tracked: ${buttonType}`);
  } catch (error) {
    console.error("❌ Error tracking button click:", error);
  }
} 