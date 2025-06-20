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

// More accurate token estimation (GPT-4 uses ~3.5 characters per token on average)
function estimateTokens(text: string): number {
  // More conservative estimation for safety
  return Math.ceil(text.length / 3.5);
}

// Truncate text to fit within token limit with more aggressive approach
function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedTokens = estimateTokens(text);
  if (estimatedTokens <= maxTokens) {
    return text;
  }

  // Calculate how many characters we can keep (more conservative)
  const maxChars = Math.floor(maxTokens * 3.2); // More conservative multiplier
  const truncated = text.substring(0, maxChars);

  // Try to cut at a sentence boundary
  const lastSentence = truncated.lastIndexOf(".");
  const lastNewline = truncated.lastIndexOf("\n");
  const cutPoint = Math.max(lastSentence, lastNewline);

  if (cutPoint > maxChars * 0.7) {
    // More aggressive boundary check
    // If we can cut at a reasonable boundary
    return text.substring(0, cutPoint + 1);
  }

  return truncated + "...";
}

// Read system prompt from experience.txt file with token management
function getSystemPrompt(maxTokens: number = 4000): string {
  try {
    const filePath = join(process.cwd(), "public", "experience.txt");
    console.log("Trying to read from:", filePath);
    const content = readFileSync(filePath, "utf-8");
    console.log("Successfully read experience.txt, length:", content.length);

    // If file is too large, use a much more conservative limit
    if (content.length > 20000) {
      console.log("File is very large, using conservative token limit");
      maxTokens = 2000; // Much more conservative for large files
    }

    // Truncate if too long
    const truncatedContent = truncateToTokenLimit(content, maxTokens);
    const estimatedTokens = estimateTokens(truncatedContent);
    console.log("Estimated tokens in system prompt:", estimatedTokens);

    return truncatedContent;
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

      // If file is too large, use a much more conservative limit
      if (content.length > 20000) {
        console.log("File is very large, using conservative token limit");
        maxTokens = 2000; // Much more conservative for large files
      }

      // Truncate if too long
      const truncatedContent = truncateToTokenLimit(content, maxTokens);
      const estimatedTokens = estimateTokens(truncatedContent);
      console.log("Estimated tokens in system prompt:", estimatedTokens);

      return truncatedContent;
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

    // Get system prompt with token management (reserve 3000 tokens for user message and response)
    const systemPrompt = getSystemPrompt(4000); // Reduced from 6000 to 4000
    const userMessage = message || "User sent a file for analysis";

    // Check total token count
    const systemTokens = estimateTokens(systemPrompt);
    const userTokens = estimateTokens(userMessage);
    const totalTokens = systemTokens + userTokens + 1000; // +1000 for response

    console.log(
      `Token breakdown: System=${systemTokens}, User=${userTokens}, Total=${totalTokens}`
    );

    // Use a more conservative limit (7000 instead of 8000)
    if (totalTokens > 7000) {
      // If still too long, truncate system prompt further
      const maxSystemTokens = 7000 - userTokens - 1000;
      const truncatedSystemPrompt = truncateToTokenLimit(
        systemPrompt,
        maxSystemTokens
      );
      console.log(
        `Truncated system prompt to ${estimateTokens(truncatedSystemPrompt)} tokens`
      );

      // Final safety check - if still too long, use minimal prompt
      const finalSystemTokens = estimateTokens(truncatedSystemPrompt);
      const finalTotalTokens = finalSystemTokens + userTokens + 1000;

      if (finalTotalTokens > 7000) {
        console.log("Still too long, using minimal system prompt");
        const minimalPrompt = `You are Lawrence Hua's AI assistant. Answer questions about Lawrence professionally and accurately.`;

        const messages = [
          {
            role: "system" as const,
            content: minimalPrompt,
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
      }

      const messages = [
        {
          role: "system" as const,
          content: truncatedSystemPrompt,
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
    }

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

    // Check if it's a token limit error
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "context_length_exceeded"
    ) {
      return NextResponse.json(
        {
          error:
            "The conversation is too long. Please start a new conversation or ask a shorter question.",
          details: "Token limit exceeded",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
