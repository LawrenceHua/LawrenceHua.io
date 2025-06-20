import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; Portfolio/1.0;)",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching geolocation:", error);
    return NextResponse.json(
      { error: "Failed to fetch geolocation data" },
      { status: 500 }
    );
  }
}
