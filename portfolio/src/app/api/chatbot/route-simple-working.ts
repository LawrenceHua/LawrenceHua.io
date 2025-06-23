import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Test basic functionality first
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Simplified chatbot GET endpoint is working",
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || "Hello";

    // Simple response without complex logic
    const response = {
      success: true,
      message: `I received your message: "${message}". This is a simplified chatbot response.`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in simplified chatbot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
