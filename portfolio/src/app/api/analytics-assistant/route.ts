import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import OpenAI from "openai";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let db: any = null;
if (typeof window === "undefined") {
  try {
    const app = !getApps().length
      ? initializeApp(firebaseConfig)
      : getApps()[0];
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function POST(request: NextRequest) {
  if (!db || !openai) {
    return NextResponse.json(
      { error: "Analytics assistant not available" },
      { status: 500 }
    );
  }

  try {
    const { message, timeRange = "30d", customDays = 7 } = await request.json();

    // Calculate date filter
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "1d":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        startDate = new Date(now.getTime() - customDays * 24 * 60 * 60 * 1000);
        break;
      case "all":
      default:
        startDate = new Date(0);
        break;
    }

    // Fetch relevant analytics data based on the query
    const analyticsData = await fetchAnalyticsData(startDate);

    // Generate AI response
    const response = await generateAnalyticsResponse(message, analyticsData, timeRange);

    return NextResponse.json({
      response,
      dataPointsAnalyzed: Object.keys(analyticsData).length,
      timeRange,
      startDate: startDate.toISOString(),
    });
  } catch (error) {
    console.error("Error in analytics assistant:", error);
    return NextResponse.json(
      { error: "Failed to process analytics query" },
      { status: 500 }
    );
  }
}

async function fetchAnalyticsData(startDate: Date) {
  const data: any = {};

  try {
    // Fetch chatbot analytics
    const chatbotAnalyticsRef = collection(db, "chatbot_analytics");
    const chatbotQuery = query(
      chatbotAnalyticsRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(1000)
    );
    const chatbotSnap = await getDocs(chatbotQuery);
    data.chatbotEvents = chatbotSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch chat messages
    const messagesRef = collection(db, "chatbot_messages");
    const messagesQuery = query(
      messagesRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(500)
    );
    const messagesSnap = await getDocs(messagesQuery);
    data.chatMessages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch page views
    const pageViewsRef = collection(db, "page_views");
    const pageViewsQuery = query(
      pageViewsRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(500)
    );
    const pageViewsSnap = await getDocs(pageViewsQuery);
    data.pageViews = pageViewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch user interactions
    const interactionsRef = collection(db, "user_interactions");
    const interactionsQuery = query(
      interactionsRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(500)
    );
    const interactionsSnap = await getDocs(interactionsQuery);
    data.userInteractions = interactionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch tour events
    const tourEventsRef = collection(db, "tour_events");
    const tourEventsQuery = query(
      tourEventsRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(300)
    );
    const tourEventsSnap = await getDocs(tourEventsQuery);
    data.tourEvents = tourEventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error) {
    console.error("Error fetching analytics data:", error);
  }

  return data;
}

async function generateAnalyticsResponse(userQuery: string, analyticsData: any, timeRange: string) {
  // Process the data into insights
  const insights = processAnalyticsInsights(analyticsData, timeRange);

  const systemPrompt = `You are Lawrence's Analytics Data Scientist Assistant. You have access to comprehensive portfolio website analytics data and can provide expert insights.

CURRENT DATA SUMMARY:
${JSON.stringify(insights, null, 2)}

TIME PERIOD: ${timeRange === "1d" ? "Last 24 hours" : timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Custom period"}

AVAILABLE METRICS:
- Chatbot Analytics: Sessions, messages, button clicks, file uploads, meeting schedules
- Website Traffic: Page views, unique visitors, referrer sources, device types
- User Engagement: Bounce rates, session durations, scroll depth, interactions
- Geographic Data: Visitor locations, countries, cities
- Conversion Metrics: Popup-to-chat, chat-to-meeting, chat-to-message rates
- Tour Analytics: Tour starts, completions, abandonment points
- Temporal Patterns: Peak hours, daily activity, trends

CAPABILITIES:
✅ Calculate conversion rates and funnels
✅ Identify trends and patterns
✅ Compare metrics across time periods
✅ Generate actionable insights
✅ Create data summaries and reports
✅ Analyze user behavior patterns
✅ Suggest optimizations

RESPONSE STYLE:
- Be data-driven and specific with numbers
- Use bullet points and clear formatting
- Highlight key insights with emojis
- Provide actionable recommendations
- Format percentages to 1 decimal place
- Include relevant context and comparisons

USER QUERY: "${userQuery}"

Analyze the data and provide a comprehensive, insightful response.`;

  if (!openai) {
    return "Analytics assistant is not available right now.";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || "Unable to analyze data at this time.";
  } catch (error) {
    console.error("Error generating analytics response:", error);
    return "I'm having trouble analyzing the data right now. Please try again later.";
  }
}

function processAnalyticsInsights(data: any, timeRange: string) {
  const insights: any = {};

  // Process chatbot events
  if (data.chatbotEvents?.length) {
    const events = data.chatbotEvents;
    const sessions = new Set(events.map((e: any) => e.sessionId));
    const buttonClicks = events.filter((e: any) => e.eventType === 'button_clicked');
    const messagesSent = events.filter((e: any) => e.eventType === 'message_sent');
    const popupShown = events.filter((e: any) => e.eventType === 'popup_shown');
    const chatOpened = events.filter((e: any) => e.eventType === 'chatbot_opened');
    const fileUploads = events.filter((e: any) => e.eventType === 'files_selected');
    const meetingSchedules = events.filter((e: any) => e.eventType === 'calendar_datetime_selected');

    insights.chatbot = {
      totalSessions: sessions.size,
      totalEvents: events.length,
      buttonClicks: buttonClicks.length,
      messagesSent: messagesSent.length,
      popupViews: popupShown.length,
      chatOpens: chatOpened.length,
      fileUploads: fileUploads.length,
      meetingSchedules: meetingSchedules.length,
      conversionRate: popupShown.length > 0 ? ((chatOpened.length / popupShown.length) * 100).toFixed(1) : "0.0",
      mostPopularButtons: getMostPopularButtons(buttonClicks),
    };
  }

  // Process chat messages
  if (data.chatMessages?.length) {
    const messages = data.chatMessages;
    const sessions = new Set(messages.map((m: any) => m.sessionId));
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const assistantMessages = messages.filter((m: any) => m.role === 'assistant');

    insights.conversations = {
      totalMessages: messages.length,
      totalSessions: sessions.size,
      avgMessagesPerSession: sessions.size > 0 ? (messages.length / sessions.size).toFixed(1) : "0.0",
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
    };
  }

  // Process page views
  if (data.pageViews?.length) {
    const pageViews = data.pageViews;
    const uniqueVisitors = new Set(pageViews.map((pv: any) => pv.sessionId));
    const countries = new Set(pageViews.map((pv: any) => pv.country).filter(Boolean));
    const referrers = pageViews.map((pv: any) => pv.referrer);
    const devices = pageViews.map((pv: any) => {
      const isMobile = /Mobile|Android|iPhone|iPad/.test(pv.userAgent);
      return isMobile ? 'Mobile' : 'Desktop';
    });

    insights.website = {
      totalPageViews: pageViews.length,
      uniqueVisitors: uniqueVisitors.size,
      countries: countries.size,
      avgTimeOnPage: calculateAvgTimeOnPage(pageViews),
      topReferrers: getTopReferrers(referrers),
      deviceBreakdown: getDeviceBreakdown(devices),
    };
  }

  // Process user interactions
  if (data.userInteractions?.length) {
    const interactions = data.userInteractions;
    const clicks = interactions.filter((i: any) => i.type === 'click');
    const scrolls = interactions.filter((i: any) => i.type === 'scroll');

    insights.engagement = {
      totalInteractions: interactions.length,
      clicks: clicks.length,
      scrolls: scrolls.length,
      topInteractionTypes: getTopInteractionTypes(interactions),
    };
  }

  // Process tour events
  if (data.tourEvents?.length) {
    const tourEvents = data.tourEvents;
    const starts = tourEvents.filter((e: any) => e.eventType === 'tour_start');
    const completions = tourEvents.filter((e: any) => e.eventType === 'tour_complete');
    const abandons = tourEvents.filter((e: any) => e.eventType === 'tour_abandon');

    insights.tour = {
      starts: starts.length,
      completions: completions.length,
      abandons: abandons.length,
      completionRate: starts.length > 0 ? ((completions.length / starts.length) * 100).toFixed(1) : "0.0",
    };
  }

  // Add temporal insights
  insights.temporal = {
    timeRange,
    peakHours: calculatePeakHours(data),
    dailyTrends: calculateDailyTrends(data),
  };

  return insights;
}

function getMostPopularButtons(buttonClicks: any[]) {
  const buttonCount = new Map();
  buttonClicks.forEach(click => {
    const button = click.buttonType;
    buttonCount.set(button, (buttonCount.get(button) || 0) + 1);
  });
  return Array.from(buttonCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([button, count]) => ({ button, count }));
}

function calculateAvgTimeOnPage(pageViews: any[]) {
  const validTimes = pageViews
    .map(pv => pv.timeOnPage)
    .filter(time => time && time > 0);
  
  if (validTimes.length === 0) return "0.0";
  
  const avg = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
  return (avg / 60).toFixed(1); // Convert to minutes
}

function getTopReferrers(referrers: string[]) {
  const referrerCount = new Map();
  referrers.forEach(ref => {
    const source = ref === "direct" ? "Direct" :
                   ref.includes("google") ? "Google" :
                   ref.includes("linkedin") ? "LinkedIn" :
                   ref.includes("github") ? "GitHub" : "Other";
    referrerCount.set(source, (referrerCount.get(source) || 0) + 1);
  });
  return Array.from(referrerCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([source, count]) => ({ source, count }));
}

function getDeviceBreakdown(devices: string[]) {
  const deviceCount = new Map();
  devices.forEach(device => {
    deviceCount.set(device, (deviceCount.get(device) || 0) + 1);
  });
  const total = devices.length;
  return Array.from(deviceCount.entries()).map(([device, count]) => ({
    device,
    count,
    percentage: ((count / total) * 100).toFixed(1)
  }));
}

function getTopInteractionTypes(interactions: any[]) {
  const typeCount = new Map();
  interactions.forEach(interaction => {
    typeCount.set(interaction.type, (typeCount.get(interaction.type) || 0) + 1);
  });
  return Array.from(typeCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type, count]) => ({ type, count }));
}

function calculatePeakHours(data: any) {
  const hourCounts = new Map();
  
  // Aggregate all timestamped events
  const allEvents = [
    ...(data.chatbotEvents || []),
    ...(data.chatMessages || []),
    ...(data.pageViews || []),
    ...(data.userInteractions || []),
  ];
  
  allEvents.forEach(event => {
    if (event.timestamp) {
      const date = event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp);
      const hour = date.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }
  });
  
  return Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({ hour, count }));
}

function calculateDailyTrends(data: any) {
  const dayCounts = new Map();
  
  const allEvents = [
    ...(data.chatbotEvents || []),
    ...(data.chatMessages || []),
    ...(data.pageViews || []),
  ];
  
  allEvents.forEach(event => {
    if (event.timestamp) {
      const date = event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp);
      const day = date.toISOString().split('T')[0];
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }
  });
  
  return Array.from(dayCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, count]) => ({ day, count }));
} 