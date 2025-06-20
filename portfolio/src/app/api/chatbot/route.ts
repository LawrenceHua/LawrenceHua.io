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
3. **Your email:**
4. **Message to Lawrence:**

Just reply with this information and I'll send it directly to Lawrence! 🚀`,
        isRecruiterContact: true,
      });
    }

    // Check if this looks like recruiter contact information being provided
    // More robust check for unstructured and structured contact info
    const mightBeContactInfo =
      /(@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/.test(message) || // Contains an email
      /(name|company|email|message):/i.test(message) || // Contains keywords
      (message.split(",").length > 1 && message.length < 150); // Looks like a short list

    if (mightBeContactInfo) {
      // --- New Robust Parsing Logic ---
      let recruiterName =
        message
          .match(/name:\s*(.*?)(?:\n|email:|message:|company:|$)/i)?.[1]
          ?.trim() || "";
      let company =
        message
          .match(/company:\s*(.*?)(?:\n|email:|message:|name:|$)/i)?.[1]
          ?.trim() || "";
      let email =
        message.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || "";
      let recruiterMessage =
        message.match(/message:\s*([\s\S]*)/i)?.[1]?.trim() || "";

      // Fallback for unstructured messages
      if (!recruiterName && !recruiterMessage && email) {
        const parts = message.split(/[,;]/).map((p: string) => p.trim());
        const emailIndex = parts.findIndex((p: string) => p === email);

        // Try to infer name and message around the email
        if (parts.length > 1) {
          recruiterName =
            parts.find(
              (p: string, i: number) => i < emailIndex && isNaN(p as any)
            ) || "";
          recruiterMessage =
            parts.filter((p: string, i: number) => i > emailIndex).join(", ") ||
            "";

          if (
            !recruiterMessage &&
            parts.length > 1 &&
            emailIndex === parts.length - 1
          ) {
            recruiterMessage = parts.slice(0, emailIndex).join(", ");
          } else if (!recruiterName && parts.length > 1 && emailIndex === 0) {
            recruiterName = parts[1];
            recruiterMessage = parts.slice(2).join(", ");
          }
        }

        // If still no message, use the original text minus the email
        if (!recruiterMessage) {
          recruiterMessage = message
            .replace(email, "")
            .replace(/[,;]/g, " ")
            .trim();
        }
      }

      // If still no name, try to extract it from the beginning of the message
      if (!recruiterName && recruiterMessage) {
        const potentialName = recruiterMessage.split(" ")[0];
        if (potentialName.length > 1 && potentialName.length < 20) {
          recruiterName = potentialName;
          recruiterMessage = recruiterMessage
            .substring(potentialName.length)
            .trim();
        }
      }

      // If we have everything, send it
      if (recruiterName && recruiterMessage && email) {
        try {
          const contactResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/recruiter-contact`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
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
**Email:** ${email}
**Message:** ${recruiterMessage}

Lawrence will get back to you soon! 🎯

Is there anything else you'd like to know about Lawrence's background or experience?`,
              recruiterContactSent: true,
            });
          } else {
            const errorData = await contactResponse.json();
            return NextResponse.json({
              response: `I tried to send your message to Lawrence, but there was an issue: ${errorData.error}. Could you please check the information and try again?`,
              recruiterContactError: true,
            });
          }
        } catch (error) {
          console.error("Error sending recruiter contact:", error);
          return NextResponse.json({
            response: `I encountered an error while trying to send your message. Please try again or contact Lawrence directly at lawrencehua2@gmail.com.`,
            recruiterContactError: true,
          });
        }
      } else {
        // --- New Contextual Clarification ---
        let clarification =
          "Thanks for the information! I just need a little more to pass this along to Lawrence.\n\n";
        if (!recruiterName) clarification += "**What is your name?**\n";
        if (!email)
          clarification += "**What is your email address?** (required)\n";
        if (!recruiterMessage)
          clarification += "**What is the message you'd like to send?**\n";

        clarification += `\nHere's what I have so far:\n`;
        if (recruiterName) clarification += `> **Name:** ${recruiterName}\n`;
        if (company) clarification += `> **Company:** ${company}\n`;
        if (email) clarification += `> **Email:** ${email}\n`;
        if (recruiterMessage)
          clarification += `> **Message:** ${recruiterMessage}\n`;

        return NextResponse.json({
          response: clarification,
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
