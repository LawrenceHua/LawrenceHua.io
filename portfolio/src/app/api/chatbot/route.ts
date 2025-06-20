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

    // Easter Egg: Handle questions about Lawrence's girlfriend
    console.log("DEBUG: Incoming message:", message);
    const isGirlfriendQuestion =
      /who\s+is\s+lawrence'?s?\s+(girlfriend|favorite girl|partner)|is\s+lawrence\s+(dating|single)|does\s+lawrence\s+have\s+a\s+(girlfriend|partner)|tell\s+me\s+about\s+lawrence'?s?\s+(girlfriend|love life|relationship)|who\s+is\s+lawrence\s+girlfriend/i.test(
        message
      );
    console.log("DEBUG: isGirlfriendQuestion:", isGirlfriendQuestion);

    if (isGirlfriendQuestion) {
      // Check if the message contains the secret password (August 21, 2024 in any format)
      const passwordPatterns = [
        /august\s*21\s*2024/i,
        /8\/21\/2024/i,
        /8-21-2024/i,
        /8\.21\.2024/i,
        /august\s*21st\s*2024/i,
        /21st\s*august\s*2024/i,
        /2024-08-21/i,
        /08\/21\/24/i,
        /8\/21\/24/i,
        /august\s*21/i,
        /8\/21/i,
        /8-21/i,
        /8\.21/i,
      ];
      const hasCorrectPassword = passwordPatterns.some((pattern) =>
        pattern.test(message)
      );
      console.log("DEBUG: hasCorrectPassword:", hasCorrectPassword);

      if (!hasCorrectPassword) {
        // If no password provided, ask for it
        if (
          !message.toLowerCase().includes("august") &&
          !message.toLowerCase().includes("8/") &&
          !message.toLowerCase().includes("2024")
        ) {
          console.log("DEBUG: Asking for password");
          return NextResponse.json({
            response: "...what's the secret password? 🤐",
            needsPassword: true,
          });
        }

        // If password was provided but incorrect, give the mentor response
        console.log("DEBUG: Password incorrect, giving mentor response");
        const mentorResponse = `Lawrence admires many incredible people who have shaped his thinking and career:

**Mentors & Colleagues:**
• **Dr. Wendy** - His research mentor who taught him the importance of rigorous analysis and clear communication
• **Shyam** - A brilliant colleague who inspires him with innovative problem-solving approaches
• **JJ** - A mentor who showed him how to balance technical excellence with business impact

**Philosophers & Thinkers:**
• **Marcus Aurelius** - For his stoic philosophy and leadership principles
• **Peter Drucker** - For his insights on management and innovation
• **Clayton Christensen** - For his disruptive innovation theory

**Celebrities & Public Figures:**
• **Elon Musk** - For his bold vision and ability to execute on seemingly impossible goals
• **Steve Jobs** - For his focus on design and user experience
• **Warren Buffett** - For his long-term thinking and value investing principles

Lawrence believes that surrounding yourself with great people makes you better. He's grateful for all the mentors, colleagues, and thinkers who have influenced his journey! 🌟`;

        return NextResponse.json({ response: mentorResponse });
      }

      // If password is correct, reveal the answer
      console.log("DEBUG: Password correct, revealing Myley");
      const myleyResponse = `**Myley** is Lawrence's favorite person! 💕

She's his amazing girlfriend who brings so much joy, laughter, and love to his life. They've been together for a while now and Lawrence couldn't be happier! 

She's smart, kind, funny, and supports him in everything he does. Lawrence often says she's the best thing that's ever happened to him! 🥰

*This is a special easter egg - you found the secret password!*`;

      return NextResponse.json({ response: myleyResponse });
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
