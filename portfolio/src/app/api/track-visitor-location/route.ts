import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Firebase config
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
    const { sessionId, userAgent, referrer, pathname } = await request.json();

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
      console.log("Geolocation fetch failed for visitor tracking:", geoError);
    }

    // Track visitor location in new collection
    const visitorLocation = {
      sessionId,
      userAgent,
      referrer: referrer || null,
      pathname: pathname || '/',
      timestamp: serverTimestamp(),
      location: {
        country: geoData?.country_name || "Unknown",
        region: geoData?.region || "Unknown",
        city: geoData?.city || "Unknown",
        latitude: geoData?.latitude || null,
        longitude: geoData?.longitude || null,
        timezone: geoData?.timezone || null,
      },
      ip: geoData?.ip || "Unknown",
      fresh: geoData?.fresh || false,
    };

    await addDoc(collection(firestore, "analytics_visitor_locations_v2"), visitorLocation);

    console.log(`🌍 Visitor location tracked: ${geoData?.city || 'Unknown'}, ${geoData?.country_name || 'Unknown'}`);

    return NextResponse.json({ 
      success: true, 
      collection: "analytics_visitor_locations_v2",
      location: `${geoData?.city || 'Unknown'}, ${geoData?.country_name || 'Unknown'}`
    });
  } catch (error) {
    console.error("Error tracking visitor location:", error);
    return NextResponse.json({ error: "Failed to track visitor location" }, { status: 500 });
  }
} 