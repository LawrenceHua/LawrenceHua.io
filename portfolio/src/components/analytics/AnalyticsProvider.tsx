"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  where,
} from "firebase/firestore";

// New Firebase Collections (v2.0 - reset from scratch)
export const ANALYTICS_COLLECTIONS = {
  // Core tracking
  SESSIONS_V2: "analytics_sessions_v2",
  PAGE_VIEWS_V2: "analytics_page_views_v2", 
  CHAT_MESSAGES_V2: "analytics_chat_messages_v2",
  
  // Interaction tracking
  BUTTON_CLICKS_V2: "analytics_button_clicks_v2",
  TOUR_INTERACTIONS_V2: "analytics_tour_interactions_v2", 
  
  // Device & Location
  DEVICE_ANALYTICS_V2: "analytics_device_info_v2",
  GEO_ANALYTICS_V2: "analytics_geo_data_v2",
  VISITOR_LOCATIONS_V2: "analytics_visitor_locations_v2",
  
  // Performance tracking
  PERFORMANCE_METRICS_V2: "analytics_performance_v2",
  USER_FLOWS_V2: "analytics_user_flows_v2",
};

// Analytics Data Types
export interface ChatSession {
  id: string;
  sessionId: string;
  messages: ChatMessage[];
  startTime: Date;
  endTime: Date;
  messageCount: number;
  totalDuration: number;
  userAgent: string;
  deviceType: "Mobile" | "Desktop" | "Tablet" | "Unknown";
  location: {
    country: string;
    region: string;
    city: string;
    ip?: string;
  };
  engagementScore: number;
  isRecruiterSession: boolean;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  messageLength: number;
  hasFiles: boolean;
  fileTypes?: string[];
}

export interface ButtonClick {
  id: string;
  buttonType: string;
  buttonText: string;
  page: string;
  sessionId: string;
  timestamp: Date;
  location: {
    country: string;
    region: string;
    city: string;
  };
  userAgent: string;
}

export interface TourInteraction {
  id: string;
  tourStep: string;
  action: "viewed" | "clicked" | "skipped" | "completed";
  sessionId: string;
  timestamp: Date;
  timeOnStep: number;
  location: {
    country: string;
    region: string;
    city: string;
  };
}

export interface DeviceAnalytic {
  id: string;
  sessionId: string;
  deviceType: string;
  browser: string;
  os: string;
  screenSize: string;
  userAgent: string;
  timestamp: Date;
}

export interface VisitorLocation {
  id: string;
  sessionId: string;
  userAgent: string;
  referrer?: string;
  pathname: string;
  timestamp: Date;
  location: {
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  ip: string;
  fresh: boolean;
}

export interface AnalyticsContextType {
  // Data
  chatSessions: ChatSession[];
  buttonClicks: ButtonClick[];
  tourInteractions: TourInteraction[];
  deviceAnalytics: DeviceAnalytic[];
  visitorLocations: VisitorLocation[];
  
  // Loading states
  loading: boolean;
  lastUpdated: Date | null;
  
  // Statistics
  totalSessions: number;
  totalButtonClicks: number;
  totalTourInteractions: number;
  uniqueVisitors: number;
  
  // Functions
  fetchAllData: () => Promise<void>;
  trackButtonClick: (data: Omit<ButtonClick, "id" | "timestamp">) => Promise<void>;
  trackTourInteraction: (data: Omit<TourInteraction, "id" | "timestamp">) => Promise<void>;
  trackVisitorLocation: (data: Omit<VisitorLocation, "id" | "timestamp">) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
  db: any;
}

export default function AnalyticsProvider({ children, db }: AnalyticsProviderProps) {
  // State management
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [buttonClicks, setButtonClicks] = useState<ButtonClick[]>([]);
  const [tourInteractions, setTourInteractions] = useState<TourInteraction[]>([]);
  const [deviceAnalytics, setDeviceAnalytics] = useState<DeviceAnalytic[]>([]);
  const [visitorLocations, setVisitorLocations] = useState<VisitorLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Add some dummy data on initial load
  useEffect(() => {
    if (db && chatSessions.length === 0) {
      addDummyData();
    }
  }, [db]);

  const addDummyData = async () => {
    if (!db) return;
    
    try {
      const sessionId = "dummy_session_" + Date.now();
      const now = new Date();
      const startTime = new Date(now.getTime() - 10 * 60 * 1000); // 10 minutes ago
      
      // Create dummy messages for the session
      const dummyMessages = [
        {
          id: "msg_1",
          sessionId,
          role: "user",
          content: "Hi, I'm interested in learning more about your background and experience.",
          timestamp: new Date(startTime.getTime() + 1000),
          messageLength: 67,
          hasFiles: false,
        },
        {
          id: "msg_2", 
          sessionId,
          role: "assistant",
          content: "Hello! I'd be happy to share more about my experience. I'm a product manager and data scientist with expertise in analytics, AI, and user experience design. What specific areas are you most interested in?",
          timestamp: new Date(startTime.getTime() + 15000),
          messageLength: 198,
          hasFiles: false,
        },
        {
          id: "msg_3",
          sessionId,
          role: "user", 
          content: "I'm particularly interested in your analytics and AI experience. Do you have experience with machine learning models in production?",
          timestamp: new Date(startTime.getTime() + 45000),
          messageLength: 134,
          hasFiles: false,
        },
        {
          id: "msg_4",
          sessionId,
          role: "assistant",
          content: "Absolutely! I have extensive experience deploying ML models in production environments. I've worked on recommendation systems, predictive analytics, and NLP applications. I've also led teams that built scalable data pipelines and real-time analytics systems.",
          timestamp: new Date(startTime.getTime() + 60000),
          messageLength: 267,
          hasFiles: false,
        },
        {
          id: "msg_5",
          sessionId,
          role: "user",
          content: "That sounds impressive! Can you share your resume? I'd like to schedule a call to discuss potential opportunities.",
          timestamp: new Date(startTime.getTime() + 120000),
          messageLength: 118,
          hasFiles: false,
        }
      ];

      // Add the chat session with messages
      const dummySession = {
        sessionId,
        messages: dummyMessages,
        startTime: startTime,
        endTime: new Date(startTime.getTime() + 150000), // 2.5 minutes total
        messageCount: dummyMessages.length,
        totalDuration: 2.5, // 2.5 minutes
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        deviceType: "Desktop",
        location: {
          country: "United States",
          region: "California", 
          city: "San Francisco",
          ip: "192.168.1.1"
        },
        engagementScore: 9.2,
        isRecruiterSession: true,
        tags: ["recruiter", "high-engagement", "dummy", "resume-request"]
      };

      await addDoc(collection(db, ANALYTICS_COLLECTIONS.SESSIONS_V2), dummySession);

      // Add some older dummy data for time range testing
      const olderSessionId = "old_session_" + Date.now();
      const oldDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      
      const olderSession = {
        sessionId: olderSessionId,
        messages: [
          {
            id: "old_msg_1",
            sessionId: olderSessionId,
            role: "user",
            content: "Hello, I saw your portfolio and wanted to connect.",
            timestamp: oldDate,
            messageLength: 45,
            hasFiles: false,
          }
        ],
        startTime: oldDate,
        endTime: new Date(oldDate.getTime() + 30000),
        messageCount: 1,
        totalDuration: 0.5,
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
        deviceType: "Mobile",
        location: {
          country: "United States",
          region: "New York",
          city: "New York",
          ip: "192.168.1.2"
        },
        engagementScore: 3.0,
        isRecruiterSession: false,
        tags: ["casual", "mobile"]
      };

      await addDoc(collection(db, ANALYTICS_COLLECTIONS.SESSIONS_V2), olderSession);
      console.log("✅ Added dummy data for time range testing");
    } catch (error) {
      console.log("Note: Dummy data not added (expected for new collections)");
    }
  };

  const fetchAllData = async () => {
    if (!db) return;
    setLoading(true);

    try {
      console.log("🔄 Fetching analytics data from new collections...");

      // Fetch chat sessions (limited to recent 250)
      const sessionsQuery = query(
        collection(db, ANALYTICS_COLLECTIONS.SESSIONS_V2),
        orderBy("startTime", "desc"),
        limit(250)
      );
      const sessionsSnap = await getDocs(sessionsQuery);
      const sessions = sessionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date(),
      })) as ChatSession[];

      // Fetch chat messages and associate them with sessions
      const messagesQuery = query(
        collection(db, ANALYTICS_COLLECTIONS.CHAT_MESSAGES_V2),
        orderBy("timestamp", "desc"),
        limit(5000)
      );
      const messagesSnap = await getDocs(messagesQuery);
      const messages = messagesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ChatMessage[];

      // Group messages by session ID and add to sessions
      const messagesBySession = messages.reduce((acc, message) => {
        if (!acc[message.sessionId]) {
          acc[message.sessionId] = [];
        }
        acc[message.sessionId].push(message);
        return acc;
      }, {} as Record<string, ChatMessage[]>);

      // Add messages to sessions and recalculate metrics
      const enhancedSessions = sessions.map(session => ({
        ...session,
        messages: messagesBySession[session.sessionId] || [],
        messageCount: messagesBySession[session.sessionId]?.length || session.messageCount || 0,
        totalDuration: session.totalDuration || 0,
      }));

      // Fetch button clicks
      const buttonsQuery = query(
        collection(db, ANALYTICS_COLLECTIONS.BUTTON_CLICKS_V2),
        orderBy("timestamp", "desc"),
        limit(1000)
      );
      const buttonsSnap = await getDocs(buttonsQuery);
      const buttons = buttonsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ButtonClick[];

      // Fetch tour interactions
      const tourQuery = query(
        collection(db, ANALYTICS_COLLECTIONS.TOUR_INTERACTIONS_V2),
        orderBy("timestamp", "desc"),
        limit(1000)
      );
      const tourSnap = await getDocs(tourQuery);
      const tours = tourSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as TourInteraction[];

      // Fetch device analytics
      const deviceQuery = query(
        collection(db, ANALYTICS_COLLECTIONS.DEVICE_ANALYTICS_V2),
        orderBy("timestamp", "desc"),
        limit(1000)
      );
      const deviceSnap = await getDocs(deviceQuery);
      const devices = deviceSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as DeviceAnalytic[];

      // Fetch visitor locations
      const visitorsQuery = query(
        collection(db, ANALYTICS_COLLECTIONS.VISITOR_LOCATIONS_V2),
        orderBy("timestamp", "desc"),
        limit(1000)
      );
      const visitorsSnap = await getDocs(visitorsQuery);
      const visitors = visitorsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as VisitorLocation[];

      // Update state
      setChatSessions(enhancedSessions);
      setButtonClicks(buttons);
      setTourInteractions(tours);
      setDeviceAnalytics(devices);
      setVisitorLocations(visitors);
      setLastUpdated(new Date());

      console.log(`✅ Analytics data loaded:`, {
        sessions: enhancedSessions.length,
        messages: messages.length,
        buttonClicks: buttons.length,
        tourInteractions: tours.length,
        deviceAnalytics: devices.length,
        visitorLocations: visitors.length,
      });

    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const trackButtonClick = async (data: Omit<ButtonClick, "id" | "timestamp">) => {
    if (!db) return;
    
    try {
      await addDoc(collection(db, ANALYTICS_COLLECTIONS.BUTTON_CLICKS_V2), {
        ...data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error tracking button click:", error);
    }
  };

  const trackTourInteraction = async (data: Omit<TourInteraction, "id" | "timestamp">) => {
    if (!db) return;
    
    try {
      await addDoc(collection(db, ANALYTICS_COLLECTIONS.TOUR_INTERACTIONS_V2), {
        ...data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error tracking tour interaction:", error);
    }
  };

  const trackVisitorLocation = async (data: Omit<VisitorLocation, "id" | "timestamp">) => {
    if (!db) return;
    
    try {
      await addDoc(collection(db, ANALYTICS_COLLECTIONS.VISITOR_LOCATIONS_V2), {
        ...data,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error tracking visitor location:", error);
    }
  };

  const refreshData = async () => {
    await fetchAllData();
  };

  // Computed values
  const totalSessions = chatSessions.length;
  const totalButtonClicks = buttonClicks.length;
  const totalTourInteractions = tourInteractions.length;
  const uniqueVisitors = new Set(chatSessions.map(s => s.sessionId)).size;

  const contextValue: AnalyticsContextType = {
    // Data
    chatSessions,
    buttonClicks,
    tourInteractions,
    deviceAnalytics,
    visitorLocations,
    
    // Loading states
    loading,
    lastUpdated,
    
    // Statistics  
    totalSessions,
    totalButtonClicks,
    totalTourInteractions,
    uniqueVisitors,
    
    // Functions
    fetchAllData,
    trackButtonClick,
    trackTourInteraction,
    trackVisitorLocation,
    refreshData,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
} 