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

    // Check if this is a recruiter contact request
    const isRecruiterContactRequest =
      message.toLowerCase().includes("contact lawrence") ||
      message.toLowerCase().includes("get in touch") ||
      message.toLowerCase().includes("reach out") ||
      message.toLowerCase().includes("send message") ||
      message.toLowerCase().includes("connect with lawrence") ||
      message.toLowerCase().includes("talk with lawrence") ||
      message.toLowerCase().includes("talk to lawrence") ||
      message.toLowerCase().includes("speak with lawrence") ||
      message.toLowerCase().includes("speak to lawrence") ||
      message.toLowerCase().includes("meet with lawrence") ||
      message.toLowerCase().includes("meet lawrence") ||
      message.toLowerCase().includes("schedule a call") ||
      message.toLowerCase().includes("set up a call") ||
      message.toLowerCase().includes("have a call") ||
      message.toLowerCase().includes("discuss with lawrence") ||
      message.toLowerCase().includes("chat with lawrence") ||
      message.toLowerCase().includes("interview lawrence") ||
      message.toLowerCase().includes("hire lawrence") ||
      message.toLowerCase().includes("work with lawrence") ||
      message.toLowerCase().includes("bring lawrence on") ||
      message.toLowerCase().includes("bring him on") ||
      message.toLowerCase().includes("join our team") ||
      message.toLowerCase().includes("join us") ||
      message.toLowerCase().includes("opportunity for lawrence") ||
      message.toLowerCase().includes("role for lawrence") ||
      message.toLowerCase().includes("position for lawrence") ||
      message.toLowerCase().includes("job for lawrence");

    if (isRecruiterContactRequest) {
      return NextResponse.json({
        response: `I'd be happy to help you get in touch with Lawrence! I can collect your information and send him a message on your behalf.

**Please provide the following information:**

1. **Your name:**
2. **Company (if applicable):**
3. **Your email (optional but recommended):**
4. **Message to Lawrence:**

Just reply with this information and I'll send it directly to Lawrence! 🚀`,
        isRecruiterContact: true,
      });
    }

    // Check if this looks like recruiter contact information being provided
    const hasRecruiterInfo =
      (message.toLowerCase().includes("name:") ||
        message.toLowerCase().includes("company:") ||
        message.toLowerCase().includes("email:") ||
        message.toLowerCase().includes("message:")) &&
      (message.toLowerCase().includes("lawrence") ||
        message.toLowerCase().includes("contact") ||
        message.toLowerCase().includes("role") ||
        message.toLowerCase().includes("position"));

    if (hasRecruiterInfo) {
      // Extract recruiter information from the message
      const lines = message.split("\n");
      let recruiterName = "";
      let company = "";
      let email = "";
      let recruiterMessage = "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.toLowerCase().startsWith("name:")) {
          recruiterName = trimmedLine.substring(5).trim();
        } else if (trimmedLine.toLowerCase().startsWith("company:")) {
          company = trimmedLine.substring(8).trim();
        } else if (trimmedLine.toLowerCase().startsWith("email:")) {
          email = trimmedLine.substring(6).trim();
        } else if (trimmedLine.toLowerCase().startsWith("message:")) {
          recruiterMessage = trimmedLine.substring(8).trim();
        }
      }

      // If we have the basic info, send it to Lawrence
      if (recruiterName && recruiterMessage) {
        try {
          const contactResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/recruiter-contact`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                recruiterName,
                company,
                email,
                message: recruiterMessage,
                conversationContext: `This message was sent through the AI assistant. Original user message: ${message}`,
              }),
            }
          );

          if (contactResponse.ok) {
            return NextResponse.json({
              response: `Perfect! I've sent your message to Lawrence. Here's what I sent:

**To:** Lawrence Hua
**From:** ${recruiterName}${company ? ` (${company})` : ""}
**Message:** ${recruiterMessage}

Lawrence will get back to you soon! 🎯

Is there anything else you'd like to know about Lawrence's background or experience?`,
              recruiterContactSent: true,
            });
          } else {
            return NextResponse.json({
              response: `I tried to send your message to Lawrence, but there was a technical issue. Could you please try again, or you can reach out to Lawrence directly at lawrencehua2@gmail.com.

Here's what I was trying to send:
**From:** ${recruiterName}${company ? ` (${company})` : ""}
**Message:** ${recruiterMessage}`,
              recruiterContactError: true,
            });
          }
        } catch (error) {
          console.error("Error sending recruiter contact:", error);
          return NextResponse.json({
            response: `I encountered an error while trying to send your message to Lawrence. Please try again or contact Lawrence directly at lawrencehua2@gmail.com.`,
            recruiterContactError: true,
          });
        }
      } else {
        // If we couldn't extract the info properly, ask for clarification
        return NextResponse.json({
          response: `I'd love to help you contact Lawrence! I just need a bit more information to make sure I get it right.

Could you please provide:
- Your name
- Your company (if applicable) 
- Your email (optional but helpful)
- The message you'd like to send to Lawrence

You can use this format:
Name: [Your Name]
Company: [Your Company]
Email: [Your Email]
Message: [Your Message]`,
          needsClarification: true,
        });
      }
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
