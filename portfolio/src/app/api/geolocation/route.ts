import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get the user's IP address from the request headers
    const ip = request.headers.get("x-forwarded-for") ?? "8.8.8.8";

    // Fetch geolocation data from an API
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) {
      throw new Error("Failed to fetch geolocation data");
    }

    const data = await response.json();

    // Return the geolocation data
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
