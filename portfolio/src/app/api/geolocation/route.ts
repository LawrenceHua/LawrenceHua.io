import { NextRequest, NextResponse } from "next/server";

// Force this route to be dynamic since it needs to access request headers
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Get the user's IP address from the request headers
    let ip = request.headers.get("x-forwarded-for");

    // In a local development environment, x-forwarded-for may be null or a local IP.
    // ipapi.co can auto-detect the IP if we don't provide one.
    const isLocal = ip === "::1" || ip === "127.0.0.1";
    const apiUrl =
      ip && !isLocal
        ? `https://ipapi.co/${ip}/json/`
        : `https://ipapi.co/json/`;

    // Add a check for a flag in localStorage/sessionStorage and a delay before fetching geolocation
    // Instruct the frontend to call this API only once, 5 seconds after first load, and set a flag in localStorage/sessionStorage to prevent repeated calls.

    // Fetch geolocation data from an API
    const response = await fetch(apiUrl);

    // Handle rate limiting gracefully
    if (response.status === 429) {
      console.log("Geolocation API rate limited, returning null location");
      return NextResponse.json({
        country_name: null,
        region: null,
        city: null,
        latitude: null,
        longitude: null,
        timezone: null,
        ip: null,
        rate_limited: true,
      });
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

    // Return the geolocation data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in geolocation route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
