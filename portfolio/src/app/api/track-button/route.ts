import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Firebase config (same as in other files)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export async function POST(request: NextRequest) {
  try {
    const { buttonType, buttonText, page, sessionId, userAgent } = await request.json();

    // Initialize Firebase
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    const firestore = getFirestore(app);

    // Get geolocation data
    let geoData = null;
    try {
      const geoResponse = await fetch(`${request.nextUrl.origin}/api/geolocation`, {
        method: 'GET',
        headers: {
          'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        },
      });
      if (geoResponse.ok) {
        geoData = await geoResponse.json();
      }
    } catch (geoError) {
      console.log("Geolocation fetch failed for button tracking:", geoError);
    }

    // Track button interaction
    const buttonInteraction = {
      buttonType, // 'download_resume', 'lets_connect', 'schedule_meeting', 'chatbot_open', etc.
      buttonText,
      page,
      sessionId,
      userAgent,
      timestamp: serverTimestamp(),
      country: geoData?.country_name || "Unknown",
      region: geoData?.region || "Unknown",
      city: geoData?.city || "Unknown",
      ip: geoData?.ip || "Unknown",
    };

    await addDoc(collection(firestore, "button_analytics"), buttonInteraction);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking button interaction:", error);
    return NextResponse.json({ error: "Failed to track button interaction" }, { status: 500 });
  }
} 