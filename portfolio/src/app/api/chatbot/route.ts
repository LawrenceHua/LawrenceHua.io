import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { handleGirlfriendEasterEgg } from "./girlfriend-easter-egg";

// Check if OpenAI API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;

console.log("DEBUG: process.cwd() =", process.cwd());
console.log("DEBUG: process.env.OPENAI_API_KEY =", process.env.OPENAI_API_KEY);

if (!openaiApiKey) {
  console.warn(
    "OPENAI_API_KEY environment variable is not set. Chatbot will return fallback responses."
  );
}

const openai = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey,
    })
  : null;

// Read system prompt from experience.txt file
function getSystemPrompt(): string {
  try {
    const filePath = join(process.cwd(), "public", "experience.txt");
    console.log("Trying to read from:", filePath);
    const content = readFileSync(filePath, "utf-8");
    console.log("Successfully read experience.txt, length:", content.length);
    return content;
  } catch (error) {
    console.error("Error reading experience.txt:", error);
    // Try alternative path
    try {
      const altPath = join(process.cwd(), "..", "..", "experience.txt");
      console.log("Trying alternative path:", altPath);
      const content = readFileSync(altPath, "utf-8");
      console.log(
        "Successfully read from alternative path, length:",
        content.length
      );
      return content;
    } catch (altError) {
      console.error("Alternative path also failed:", altError);
      // Fallback to a basic prompt if file can't be read
      return `You are Lawrence Hua's AI assistant. You have extensive knowledge about Lawrence's background, experience, skills, and achievements. 

IMPORTANT: When responding, use proper markdown formatting:
- Use **bold** for emphasis and important points
- Use *italic* for subtle emphasis
- Use \`code\` for technical terms, skills, or code references
- Use bullet points for lists
- Keep responses conversational but professional

Answer questions about Lawrence professionally and accurately. If users share files, analyze them and provide relevant insights about how they relate to Lawrence's experience or skills.`;
    }
  }
}

// Add helper to extract info from context and message
function extractContactInfo(
  message: string,
  context: Record<string, string> = {}
) {
  // Try to extract from context first
  let recruiterName = context.recruiterName || "";
  let company = context.company || "";
  let email = context.email || "";
  let recruiterMessage = context.recruiterMessage || "";

  // Extract from message
  recruiterName =
    recruiterName ||
    message.match(/name is\s+([A-Za-z\s]+)(?:,|$)/i)?.[1]?.trim() ||
    message.match(/I'm\s+([A-Za-z\s]+)(?:,|$)/i)?.[1]?.trim() ||
    message
      .match(/name:\s*(.*?)(?:\n|email:|message:|company:|$)/i)?.[1]
      ?.trim() ||
    "";
  company =
    company ||
    message.match(/from\s+([A-Za-z\s]+)(?:,|$)/i)?.[1]?.trim() ||
    message
      .match(/company:\s*(.*?)(?:\n|email:|message:|name:|$)/i)?.[1]
      ?.trim() ||
    "";
  email =
    email ||
    message.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] ||
    "";
  recruiterMessage =
    recruiterMessage ||
    message.match(/message:\s*([\s\S]*)/i)?.[1]?.trim() ||
    "";

  // Fallback for unstructured messages
  const tellLawrenceMatch = message.match(
    /(?:tell|ask|send to)\s+lawrence\s+(.*)/i
  );
  if (tellLawrenceMatch && tellLawrenceMatch[1]) {
    if (!recruiterMessage) recruiterMessage = tellLawrenceMatch[1].trim();
    if (recruiterName.toLowerCase() === "hey") recruiterName = "";
  } else if (!recruiterMessage && email) {
    let remainingMessage = message
      .replace(email, "")
      .replace(/my name is\s+[A-Za-z\s]+/i, "")
      .replace(/from\s+[A-Za-z\s]+/i, "")
      .replace(/I'm\s+[A-Za-z\s]+/i, "")
      .replace(/you can reach me at/i, "")
      .replace(/[,;]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    recruiterMessage = remainingMessage;
  }
  if (recruiterName && !recruiterMessage) {
    recruiterMessage =
      message.split(recruiterName)[1]?.replace(/[,;]/g, " ").trim() || "";
  }

  // In extractContactInfo, extract phone number (simple regex for US/international numbers)
  const phone =
    message.match(
      /\+?\d{1,3}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/i
    )?.[0] || "";

  return { recruiterName, company, email, recruiterMessage, phone };
}

export async function POST(request: NextRequest) {
  try {
    // Handle FormData from frontend
    const formData = await request.formData();
    const message = formData.get("message") as string;
    const files = formData.getAll("files") as File[];

    console.log("DEBUG: Received message:", message);
    console.log("DEBUG: Received files count:", files.length);

    if (!message && files.length === 0) {
      return NextResponse.json(
        { error: "Message or files are required" },
        { status: 400 }
      );
    }

    // Check for girlfriend easter egg first
    const easterEggResponse = await handleGirlfriendEasterEgg(message, openai);
    if (easterEggResponse) {
      return NextResponse.json(easterEggResponse);
    }

    // Handle regular chatbot responses
    if (!openai) {
      return NextResponse.json({
        response:
          "I'm sorry, I'm not configured to respond right now. Please reach out to Lawrence directly!",
      });
    }

    const systemPrompt = getSystemPrompt();
    const userMessage = message || "User sent a file for analysis";

    const messages = [
      {
        role: "system" as const,
        content: systemPrompt,
      },
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chatbot route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
