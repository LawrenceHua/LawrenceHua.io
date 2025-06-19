import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

export async function POST(request: NextRequest) {
  try {
    const { message, files } = await request.json();

    if (!message && (!files || files.length === 0)) {
      return NextResponse.json(
        { error: "Message or files are required" },
        { status: 400 }
      );
    }

    // Get system prompt from file
    const systemPrompt = getSystemPrompt();

    // If OpenAI is not available, use fallback responses
    if (!openai || !openaiApiKey) {
      return NextResponse.json({
        response:
          "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again later or reach out to Lawrence directly.",
      });
    }

    // Build user message content
    let userContent = message || "";

    // Add file information if files are provided
    if (files && files.length > 0) {
      userContent += "\n\n**Files shared:**\n";
      files.forEach((file: any) => {
        userContent += `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)\n`;
      });
      userContent +=
        "\nPlease analyze these files and provide insights about how they relate to Lawrence's experience, skills, or background.";
    }

    // Use OpenAI if available
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });

    let response =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    // Ensure proper markdown formatting
    response = response
      .replace(/\*\*(.*?)\*\*/g, "**$1**") // Ensure bold formatting
      .replace(/\*(.*?)\*/g, "*$1*") // Ensure italic formatting
      .replace(/`(.*?)`/g, "`$1`"); // Ensure code formatting

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chatbot API error:", error);

    // Return a helpful fallback response
    return NextResponse.json({
      response:
        "I'm having trouble connecting to my AI service right now, but I can tell you about Lawrence! He's an **AI Product Manager** and entrepreneur with experience in **machine learning**, **product management**, and **technical development**. Feel free to reach out to Lawrence directly for more detailed information.",
    });
  }
}
