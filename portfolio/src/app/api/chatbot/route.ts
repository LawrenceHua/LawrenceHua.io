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

    // Easter Egg: Handle questions about Lawrence's girlfriend
    const isGirlfriendQuestion =
      /who is lawrence's (girlfriend|favorite girl)|is lawrence (dating|single)|does lawrence have a (girlfriend|partner)/i.test(
        message
      );

    if (isGirlfriendQuestion) {
      if (!openai) {
        return NextResponse.json({
          response:
            "I'm having some trouble connecting to my creative circuits, but I can tell you Lawrence is very happy with his wonderful girlfriend, Myley!",
        });
      }

      const poemPrompt =
        "You are a poet deeply in love. Write a short, romantic, and SFW poem for Myley. Each time you are asked, you must write a completely new and unique poem; do not repeat poems you have written in the past. Here is some context about Myley: she is very beautiful, incredibly smart (top of her class at the best schools), funny, and very hardworking. She can be sweet, and she takes wonderful care of her boyfriend and his two cats, Ory (a black and white tuxedo boy) and Ora (a grey girl). Capture this love and admiration in a 4-6 line poem. Do not use quotation marks in the poem.";
      const poemCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: poemPrompt }],
        temperature: 0.9,
        n: 1,
      });

      const poem =
        poemCompletion.choices[0].message.content?.trim() ||
        "A poem about his endless love.";

      const response = `Lawrence's favorite person in the world is his wonderful girlfriend, Myley. He thinks she is the most beautiful girl he has ever known and loves her more than words can say.
      
He's always writing little things for her. Here's one:

*${poem}*`;

      return NextResponse.json({ response: response });
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

    // Check for contact info FIRST, to avoid asking for it if it's already provided.
    const mightBeContactInfo =
      /(@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)/.test(message) || // Contains an email
      /(name:|company:|email:|message:)/i.test(message) || // Contains keywords
      /(tell|ask|send to)\s+lawrence/i.test(message) || // A message for lawrence
      (message.split(",").length > 2 && message.length < 150); // Looks like a short list

    if (mightBeContactInfo) {
      // --- Parsing Logic ---
      let recruiterName =
        message.match(/name is\s+([A-Za-z\s]+)(?:,|$)/i)?.[1]?.trim() ||
        message.match(/I'm\s+([A-Za-z\s]+)(?:,|$)/i)?.[1]?.trim() ||
        message
          .match(/name:\s*(.*?)(?:\n|email:|message:|company:|$)/i)?.[1]
          ?.trim() ||
        "";
      let company =
        message.match(/from\s+([A-Za-z\s]+)(?:,|$)/i)?.[1]?.trim() ||
        message
          .match(/company:\s*(.*?)(?:\n|email:|message:|name:|$)/i)?.[1]
          ?.trim() ||
        "";
      let email =
        message.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || "";
      let recruiterMessage =
        message.match(/message:\s*([\s\S]*)/i)?.[1]?.trim() || "";

      // Fallback for unstructured messages
      const tellLawrenceMatch = message.match(
        /(?:tell|ask|send to)\s+lawrence\s+(.*)/i
      );
      if (tellLawrenceMatch && tellLawrenceMatch[1]) {
        if (!recruiterMessage) {
          recruiterMessage = tellLawrenceMatch[1].trim();
        }
        // If we got a message this way, we probably don't have a name yet
        if (recruiterName.toLowerCase() === "hey") {
          recruiterName = "";
        }
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

      // If a name was found but no message, assume the rest of the string is the message.
      if (recruiterName && !recruiterMessage) {
        recruiterMessage =
          message.split(recruiterName)[1]?.replace(/[,;]/g, " ").trim() || "";
      }

      // Final check for message quality
      const lowQualityWords = [
        "hey",
        "hi",
        "hello",
        "my",
        "is",
        "and",
        "email",
        "name",
      ];
      const messageWords = recruiterMessage.toLowerCase().split(" ");
      if (
        !tellLawrenceMatch && // Don't invalidate messages captured with "tell lawrence"
        (messageWords.length < 3 ||
          messageWords.every((word: string) => lowQualityWords.includes(word)))
      ) {
        recruiterMessage = ""; // Invalidate the message
      }

      // If we are still missing key info, ask for it.
      if (!recruiterName || !recruiterMessage || !email) {
        let clarification = "";

        if (recruiterMessage && !recruiterName && !email) {
          clarification = `Okay, I'll let him know you said: "${recruiterMessage}". But first, I need your name and email so he can get back to you.`;
        } else if (email && !recruiterName && !recruiterMessage) {
          clarification = `Thanks! I've got your email as **${email}**. If you'd like to send a message to Lawrence, please provide your name and what you'd like to say.`;
        } else {
          clarification =
            "Thanks for providing some information! To connect you with Lawrence, I just need a bit more.\n\n";
          if (!recruiterName) clarification += "**What is your name?**\n";
          if (!email)
            clarification += "**What is your email address?** (required)\n";
          if (!recruiterMessage)
            clarification += "**What is the message you'd like to send?**\n";

          clarification += `\nHere's what I have so far:\n`;
          if (recruiterName) clarification += `> **Name:** ${recruiterName}\n`;
          if (company) clarification += `> **Company:** ${company}\n`;
          if (email) clarification += `> **Email:** ${email}\n`;
        }

        return NextResponse.json({
          response: clarification,
          needsClarification: true,
        });
      }

      // If we have everything, send it
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
    }

    // If it's not contact info, check for recruiter intent phrases
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

    // Hardcoded rule for a common but problematic phrase
    if (message.toLowerCase().startsWith("my email is")) {
      const email =
        message.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || "";
      if (email) {
        return NextResponse.json({
          response: `Thanks! I've got your email as **${email}**. Could you also provide your name and a short message for Lawrence?`,
          needsClarification: true,
        });
      }
    }

    // Use OpenAI if available
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
    });
    const responseContent = completion.choices[0].message.content;
    return NextResponse.json({ response: responseContent });
  } catch (error) {
    console.error("Chatbot error:", error);
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
