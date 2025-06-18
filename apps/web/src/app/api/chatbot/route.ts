import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Read system prompt from experience.txt file
function getSystemPrompt(): string {
  try {
    const filePath = join(process.cwd(), "..", "..", "experience.txt");
    const content = readFileSync(filePath, "utf-8");
    return content;
  } catch (error) {
    console.error("Error reading experience.txt:", error);
    // Fallback to a basic prompt if file can't be read
    return `You are Lawrence Hua's AI assistant. You have extensive knowledge about Lawrence's background, experience, skills, and achievements. Answer questions about Lawrence professionally and accurately.`;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not set." },
        { status: 500 },
      );
    }
    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // Get system prompt from file
    const systemPrompt = getSystemPrompt();

    // Compose messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history : []).map((m: any) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await response.json();
    const aiMessage =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";
    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
