import { NextRequest, NextResponse } from "next/server";

// Force this route to be dynamic since it needs to access request headers
export const dynamic = "force-dynamic";

// Simple in-memory cache to reduce API calls
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Get the user's IP address from the request headers
    let ip = request.headers.get("x-forwarded-for");

    // Handle multiple IPs (comma-separated)
    if (ip) {
      ip = ip.split(",")[0].trim();
    }

    // Check for local/private IPs
    const isLocal =
      !ip ||
      ip === "::1" ||
      ip === "127.0.0.1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.");

    // Use a cache key based on IP
    const cacheKey = ip || "local";

    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log("Returning cached geolocation data for:", cacheKey);
      return NextResponse.json({ ...cached.data, cached: true });
    }

    // Determine API URL
    const apiUrl =
      ip && !isLocal
        ? `https://ipapi.co/${ip}/json/`
        : `https://ipapi.co/json/`;

    console.log("Fetching geolocation data from:", apiUrl);

    // Fetch geolocation data with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Portfolio Analytics/1.0)",
      },
    });

    clearTimeout(timeoutId);

    // Handle rate limiting gracefully
    if (response.status === 429) {
      console.log(
        "Geolocation API rate limited, returning cached or null location"
      );
      const fallbackData = {
        country_name: "Unknown",
        region: "Unknown",
        city: "Unknown",
        latitude: null,
        longitude: null,
        timezone: "UTC",
        ip: ip || "unknown",
        rate_limited: true,
        error: "Rate limited",
      };

      // Cache the fallback data briefly
      cache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });

      return NextResponse.json(fallbackData);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Geolocation API call failed with status ${response.status}: ${errorBody}`
      );
      throw new Error(
        `Failed to fetch geolocation data. Status: ${response.status}`
      );
    }

    const data = await response.json();

    // Validate the data
    const cleanData = {
      country_name: data.country_name || "Unknown",
      region: data.region || "Unknown",
      city: data.city || "Unknown",
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timezone: data.timezone || "UTC",
      ip: data.ip || ip || "unknown",
      rate_limited: false,
      fresh: true,
    };

    // Cache the successful response
    cache.set(cacheKey, { data: cleanData, timestamp: Date.now() });

    console.log("Geolocation data fetched successfully:", cleanData);
    return NextResponse.json(cleanData);
  } catch (error) {
    console.error("Error in geolocation route:", error);

    // Return a fallback response instead of error
    const fallbackData = {
      country_name: "Unknown",
      region: "Unknown",
      city: "Unknown",
      latitude: null,
      longitude: null,
      timezone: "UTC",
      ip: "unknown",
      error: error instanceof Error ? error.message : "Unknown error",
    };

    return NextResponse.json(fallbackData);
  }
}
