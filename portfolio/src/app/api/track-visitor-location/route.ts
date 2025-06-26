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
    const { sessionId, userAgent, referrer, pathname, locationData } = await request.json();

    // Initialize Firebase
    let app;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    const firestore = getFirestore(app);

    // Use pre-fetched location data if available, otherwise fetch fresh
    let geoData = locationData;
    if (!geoData) {
      console.log("🌍 No pre-fetched geolocation data, fetching fresh...");
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
    } else {
      console.log("🌍 Using pre-fetched geolocation data for visitor tracking");
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
      cached: !!locationData, // Track if this used cached data
    };

    await addDoc(collection(firestore, "analytics_visitor_locations_v2"), visitorLocation);

    console.log(`🌍 Visitor location tracked: ${geoData?.city || 'Unknown'}, ${geoData?.country_name || 'Unknown'} (${locationData ? 'cached' : 'fresh'})`);

    return NextResponse.json({ 
      success: true, 
      collection: "analytics_visitor_locations_v2",
      location: `${geoData?.city || 'Unknown'}, ${geoData?.country_name || 'Unknown'}`,
      cached: !!locationData
    });
  } catch (error) {
    console.error("Error tracking visitor location:", error);
    return NextResponse.json({ error: "Failed to track visitor location" }, { status: 500 });
  }
} 