import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, data, timestamp } = await request.json();

    // Log to server console with timestamp
    const logTime = new Date(timestamp || Date.now()).toISOString();
    console.log(`[MOBILE DEBUG ${logTime}] ${message}`, data || "");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Debug logging error:", error);
    return NextResponse.json({ error: "Failed to log" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Debug endpoint active" });
}
