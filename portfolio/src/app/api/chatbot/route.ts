import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { handleGirlfriendEasterEgg } from "./girlfriend-easter-egg";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Check if OpenAI API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;

console.log("DEBUG: process.cwd() =", process.cwd());
console.log("DEBUG: process.env.OPENAI_API_KEY =", process.env.OPENAI_API_KEY);

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let db: any = null;
if (typeof window === "undefined") {
  // Server-side initialization
  try {
    const app = !getApps().length
      ? initializeApp(firebaseConfig)
      : getApps()[0];
    db = getFirestore(app);
    console.log("DEBUG: Firebase initialized on server");
  } catch (error) {
    console.error("DEBUG: Firebase initialization failed:", error);
  }
}

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
async function getSystemPrompt(maxTokens: number = 4000): Promise<string> {
  // Try multiple paths to find experience.txt
  const experiencePaths = [
    // Vercel deployment path (portfolio is root)
    join(process.cwd(), "public", "experience.txt"),
    // Alternative paths for different deployment scenarios
    join(process.cwd(), "portfolio", "public", "experience.txt"),
    join(process.cwd(), "..", "public", "experience.txt"),
    join(process.cwd(), "..", "..", "experience.txt"),
    // Relative to current file location
    join(__dirname, "..", "..", "..", "..", "public", "experience.txt"),
  ];

  // Try multiple paths to find resume.pdf
  const resumePaths = [
    join(process.cwd(), "public", "resume.pdf"),
    join(process.cwd(), "portfolio", "public", "resume.pdf"),
    join(process.cwd(), "..", "public", "resume.pdf"),
    join(__dirname, "..", "..", "..", "..", "public", "resume.pdf"),
  ];

  let experienceContent = "";
  let resumeContent = "";

  // Try to read experience.txt
  for (const filePath of experiencePaths) {
    try {
      console.log("Trying to read experience.txt from:", filePath);
      experienceContent = readFileSync(filePath, "utf-8");
      console.log(
        "Successfully read experience.txt, length:",
        experienceContent.length
      );
      break;
    } catch (error: any) {
      console.log(
        `Failed to read experience.txt from ${filePath}:`,
        error.message
      );
      continue;
    }
  }

  // Try to read resume.pdf
  for (const filePath of resumePaths) {
    try {
      console.log("Trying to read resume.pdf from:", filePath);
      const buffer = readFileSync(filePath);

      // Try to parse PDF
      try {
        // @ts-ignore
        const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
        const data = await pdfParse(buffer);
        resumeContent = data.text;
        console.log(
          "Successfully read resume.pdf, length:",
          resumeContent.length
        );
        break;
      } catch (pdfError: any) {
        console.log("PDF parsing failed:", pdfError.message);
        continue;
      }
    } catch (error: any) {
      console.log(`Failed to read resume.pdf from ${filePath}:`, error.message);
      continue;
    }
  }

  // Combine content with priority to experience.txt
  let combinedContent = "";
  if (experienceContent) {
    combinedContent = experienceContent;

    // Add resume content if available and we have token budget
    if (resumeContent) {
      const resumeTokens = estimateTokens(resumeContent);
      const experienceTokens = estimateTokens(experienceContent);
      const remainingTokens = maxTokens - experienceTokens - 200; // Leave buffer

      if (remainingTokens > 500) {
        const truncatedResume = truncateToTokenLimit(
          resumeContent,
          remainingTokens
        );
        combinedContent += `\n\n=== ADDITIONAL RESUME INFORMATION ===\n${truncatedResume}`;
        console.log("Added resume content to system prompt");
      } else {
        console.log("Not enough token budget for resume content");
      }
    }
  } else if (resumeContent) {
    // If no experience.txt, use resume as fallback
    combinedContent = `=== RESUME INFORMATION ===\n${resumeContent}`;
    console.log("Using resume content as primary source");
  }

  if (combinedContent) {
    // If file is too large, use a much more conservative limit
    if (combinedContent.length > 20000) {
      console.log(
        "Combined content is very large, using conservative token limit"
      );
      maxTokens = 2000; // Much more conservative for large files
    }

    // Truncate if too long
    const truncatedContent = truncateToTokenLimit(combinedContent, maxTokens);
    const estimatedTokens = estimateTokens(truncatedContent);
    console.log("Estimated tokens in system prompt:", estimatedTokens);

    return truncatedContent;
  }

  console.error("All paths failed to read experience.txt and resume.pdf");
  // Fallback to a concise, recruiter-focused prompt
  return `You are Lawrence Hua's AI assistant. You're friendly, helpful, and conversational. 

**ABOUT LAWRENCE:**
• **AI Product Manager** - Founded Expired Solutions (AI grocery platform, 20% waste reduction)  
• **Technical Background** - Software engineering at Motorola, enterprise LLM tools at Kearney
• **Product Leadership** - 30% community growth, A/B testing, roadmap planning
• **Education** - Carnegie Mellon MISM '24, University of Florida CS

**CONVERSATION STYLE:**
- Be **natural and conversational** - avoid robotic responses
- **DO NOT** interpret normal questions as contact requests (e.g. "tell me about Lawrence" is just a question)
- Only trigger contact flows when users type specific commands: /message or /meeting
- **Context awareness** - remember what was said earlier in the conversation
- Keep responses **concise but friendly** (2-3 bullet points max)
- **Bold** key achievements and technical skills

**CORE COMPETENCIES:**
AI/ML, Product Strategy, Computer Vision, GPT Integration, Enterprise Software, Startup Leadership, Cross-functional Teams

**CONTACT COMMANDS:**
- Users must type /message to send a message to Lawrence 📧
- Users must type /meeting to schedule a meeting with Lawrence 📅
- Do NOT treat regular questions as contact requests
- Always mention these commands in your initial greeting`;
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

async function getFileContent(
  file: File,
  message: string,
  history: Array<{ role: string; content: string }>
): Promise<{ content: string | null; type: string; position?: string }> {
  console.log("DEBUG: getFileContent called for file:", file.name);
  const an = file.name.split(".");
  const fileExtension = an[an.length - 1].toLowerCase();
  console.log("DEBUG: File extension:", fileExtension);

  // Helper function to extract email from message
  function extractEmailFromMessage(text: string): string {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : "Not provided";
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("DEBUG: Buffer created, size:", buffer.length);

    if (fileExtension === "txt") {
      console.log("DEBUG: Processing TXT file");
      const content = buffer.toString("utf-8");
      console.log(
        "DEBUG: TXT processed successfully, content length:",
        content.length
      );
      return { content, type: "text" };
    } else if (fileExtension === "pdf") {
      console.log("DEBUG: Processing PDF file");
      try {
        console.log("DEBUG: Attempting to import pdf-parse...");
        // @ts-ignore
        const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
        console.log("DEBUG: pdf-parse import successful");

        console.log("DEBUG: Parsing PDF document...");
        const data = await pdfParse(buffer);
        console.log(
          "DEBUG: PDF parsed successfully, text length:",
          data.text.length
        );

        return { content: data.text, type: "pdf" };
      } catch (pdfError: any) {
        console.error("DEBUG: PDF processing error:", pdfError);
        return {
          content:
            "PDF_CONTENT_UNAVAILABLE: I can see you've uploaded a PDF file, but I'm currently experiencing technical difficulties with PDF parsing. To help you analyze Lawrence's fit for this role, could you please copy and paste the key job requirements and responsibilities from the document? I'll be happy to provide a detailed analysis based on that information.",
          type: "pdf",
        };
      }
    } else if (fileExtension === "docx") {
      console.log("DEBUG: Processing DOCX file");
      const mammoth = (await import("mammoth")).default;
      const { value } = await mammoth.extractRawText({ buffer });
      console.log("DEBUG: DOCX processed successfully");
      return { content: value, type: "docx" };
    } else if (["jpg", "jpeg", "png"].includes(fileExtension)) {
      console.log("DEBUG: Processing image file for vision analysis");
      // Convert image to base64 for OpenAI vision API
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mimeType = file.type || `image/${fileExtension}`;
      return {
        content: `data:${mimeType};base64,${base64}`,
        type: "image",
        position: "image_uploaded",
      };
    }
    console.log("DEBUG: Unsupported file type:", fileExtension);
    return { content: null, type: "unsupported" };
  } catch (error) {
    console.error(`DEBUG: Error processing file ${file.name}:`, error);
    return { content: null, type: "error" };
  }
}

async function detectPosition(content: string): Promise<string | null> {
  if (!openai) return null;

  try {
    const positionPrompt = `Analyze the following content and extract the job position/title. If you find a clear job position, return ONLY the position title. If no clear position is found, return "NO_POSITION_FOUND".

Content:
${content.substring(0, 2000)} // Limit to first 2000 chars for efficiency

Return only the position title or "NO_POSITION_FOUND":`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: positionPrompt }],
      max_tokens: 100,
      temperature: 0.1,
    });

    const position = completion.choices[0]?.message?.content?.trim();
    return position === "NO_POSITION_FOUND" ? null : position || null;
  } catch (error) {
    console.error("DEBUG: Error detecting position:", error);
    return null;
  }
}

async function analyzeFit(
  content: string,
  position: string | null,
  fileType: string,
  systemPrompt: string
): Promise<string> {
  if (!openai)
    return "I'm sorry, I'm not configured to provide analysis right now.";

  const analysisSystemPrompt = `${systemPrompt}

When analyzing job fit, provide:
1. **Position Confirmation**: "Are you referring to this position: [position]?"
2. **Relevant Experience**: Bullet points of Lawrence's experience that match the role
3. **Technical Skills**: Bullet points of technical skills that align with requirements
4. **Project Examples**: Bullet points of relevant projects or achievements
5. **Areas for Development**: Any gaps or areas Lawrence might need to develop
6. **Overall Assessment**: Clear recommendation on fit
7. **Next Steps**: Ask if they have questions and offer to schedule a meeting

Use proper markdown formatting with **bold** for emphasis and bullet points for lists.`;

  const userPrompt = `Please analyze this ${fileType} content for Lawrence's fit:

${content.substring(0, 4000)} // Limit content for efficiency

${position ? `Detected Position: ${position}` : "No specific position detected"}

Provide a comprehensive analysis following the format specified.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: analysisSystemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    return (
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate an analysis."
    );
  } catch (error) {
    console.error("DEBUG: Error analyzing fit:", error);
    return "I'm sorry, I encountered an error while analyzing the content.";
  }
}

async function sendMeetingRequest(data: {
  requesterName: string;
  requesterEmail?: string;
  company?: string;
  position?: string;
  message: string;
  conversationContext?: string;
  fileAnalysis?: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    // Import the meeting-request handler directly to avoid port issues
    const { POST: meetingRequestHandler } = await import(
      "../meeting-request/route"
    );

    // Create a mock request object
    const mockRequest = {
      json: async () => data,
    } as unknown as NextRequest;

    console.log("DEBUG: Calling meeting request handler directly");
    const response = await meetingRequestHandler(mockRequest);
    const result = await response.json();

    console.log("DEBUG: Meeting request result:", result);

    if (response.status === 200 && result.success) {
      return {
        success: true,
        message:
          "Meeting request sent successfully! Lawrence will contact you soon.",
      };
    } else {
      console.error("DEBUG: Meeting request failed:", result);
      return {
        success: false,
        message:
          "Failed to send meeting request. Please try again or contact Lawrence directly.",
      };
    }
  } catch (error) {
    console.error("DEBUG: Error sending meeting request:", error);
    return {
      success: false,
      message:
        "Failed to send meeting request. Please try again or contact Lawrence directly.",
    };
  }
}

// Function to generate or extract session ID
function getOrCreateSessionId(
  sessionIdFromRequest?: string,
  history: Array<{ role: string; content: string }> = []
): string {
  // Use session ID from request if provided
  if (sessionIdFromRequest && sessionIdFromRequest.trim()) {
    return sessionIdFromRequest;
  }

  // Try to extract from previous messages or create new one
  const sessionId =
    Math.random().toString(36).substring(2) + Date.now().toString(36);
  return sessionId;
}

// Function to write messages to Firebase
async function saveMessageToFirebase(
  sessionId: string,
  role: "user" | "assistant",
  message: string
) {
  if (!db) {
    console.log("DEBUG: Firebase not initialized, skipping message save");
    return;
  }

  try {
    await addDoc(collection(db, "chatbot_messages"), {
      sessionId,
      role,
      message,
      timestamp: serverTimestamp(),
    });
    console.log(`DEBUG: Saved ${role} message to Firebase`);
  } catch (error) {
    console.error("DEBUG: Error saving message to Firebase:", error);
  }
}

async function extractContactInfoWithAI(message: string): Promise<{
  name?: string;
  email?: string;
  company?: string;
  position?: string;
}> {
  if (!openai) return {};

  try {
    const extractionPrompt = `Extract contact information from this message. Return ONLY a JSON object with these fields (use null if not found):
- name: The person's name
- email: Their email address
- company: Their company name
- position: Their job position/title

Message: "${message}"

Return only the JSON object:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: extractionPrompt }],
      max_tokens: 200,
      temperature: 0.1,
    });

    const result = completion.choices[0]?.message?.content;
    if (result) {
      try {
        return JSON.parse(result);
      } catch (parseError) {
        console.error("DEBUG: Error parsing contact info:", parseError);
        return {};
      }
    }
    return {};
  } catch (error) {
    console.error("DEBUG: Error extracting contact info:", error);
    return {};
  }
}

// Enhanced function to extract contact information from conversation history
function extractContactInfoFromHistory(
  history: Array<{ role: string; content: string }>,
  currentMessage: string
): {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  isContactRequest: boolean;
} {
  let extractedInfo = {
    name: undefined as string | undefined,
    email: undefined as string | undefined,
    company: undefined as string | undefined,
    message: undefined as string | undefined,
    isContactRequest: false,
  };

  // Check if this is a contact conversation by looking for intent keywords
  const allMessages = [...history.map((h) => h.content), currentMessage].join(
    " "
  );
  const contactIntentKeywords = [
    "send message",
    "tell lawrence",
    "contact",
    "get in touch",
    "reach out",
    "forward",
    "pass along",
    "let him know",
  ];

  extractedInfo.isContactRequest = contactIntentKeywords.some((keyword) =>
    allMessages.toLowerCase().includes(keyword)
  );

  // If not a contact request, return early
  if (!extractedInfo.isContactRequest) {
    return extractedInfo;
  }

  // Extract information from all messages
  const allConversationText = [
    ...history.map((h) => h.content),
    currentMessage,
  ];

  for (const messageText of allConversationText) {
    // Extract name
    if (!extractedInfo.name) {
      const namePatterns = [
        /(?:i'm|im|my name is)\s+([a-z\s]+?)(?:[,.]|$)/i,
        /(?:this is|hey i'm|hey im)\s+([a-z\s]+?)(?:[,.]|$)/i,
        /(?:from|by)\s+([a-z]+)(?:\s+at|\s+@|$)/i, // "from john at" or "by mike @"
        /^hey\s+([a-z\s]+?)(?:[,.]|$)/i,
      ];

      for (const pattern of namePatterns) {
        const match = messageText.match(pattern);
        if (match && match[1] && match[1].trim().length > 0) {
          const name = match[1].trim();
          if (
            ![
              "hey",
              "hi",
              "hello",
              "lawrence",
              "getting",
              "really",
              "interested",
            ].includes(name.toLowerCase())
          ) {
            extractedInfo.name = name;
            break;
          }
        }
      }
    }

    // Extract email
    if (!extractedInfo.email) {
      const emailMatch = messageText.match(
        /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i
      );
      if (emailMatch) {
        extractedInfo.email = emailMatch[0];
      }
    }

    // Extract company
    if (!extractedInfo.company) {
      const companyPatterns = [
        /(?:from|at|work at)\s+([a-z\s&]+?)(?:[,.]|$)/i,
        /company:\s*([a-z\s&]+?)(?:\n|$)/i,
      ];

      for (const pattern of companyPatterns) {
        const match = messageText.match(pattern);
        if (match && match[1]) {
          extractedInfo.company = match[1].trim();
          break;
        }
      }
    }
  }

  // Extract message content - prioritize explicit message statements
  const messagePatterns = [
    /(?:the message is|message:|tell him|let him know)\s*(.+?)(?:\.|$)/i,
    /(?:about|regarding)\s+(.+?)(?:\.|$)/i,
  ];

  for (const messageText of [...allConversationText].reverse()) {
    // Start from most recent
    for (const pattern of messagePatterns) {
      const match = messageText.match(pattern);
      if (match && match[1] && match[1].trim().length > 3) {
        extractedInfo.message = match[1].trim();
        break;
      }
    }
    if (extractedInfo.message) break;
  }

  // If no explicit message found, try to extract from context
  if (!extractedInfo.message) {
    // Only look for messages that are NOT contact requests
    const meaningfulMessages = allConversationText.filter((msg) => {
      // Skip if it's just a contact request
      if (
        /^(hey|hi|hello)?\s*(?:can you|could you)?\s*(?:send|forward|tell).*(?:message|email).*(?:to )?lawrence/i.test(
          msg.trim()
        )
      ) {
        return false;
      }

      // Look for explicit message indicators
      if (
        /(?:the message is|message is|tell him|tell lawrence|message:)\s*(.+)/i.test(
          msg
        )
      ) {
        return true;
      }

      // Allow messages that seem to be actual content (not contact requests)
      const cleanMsg = msg
        .toLowerCase()
        .replace(/(?:i'm|im|my name is|my email is|email is)/g, "")
        .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "") // Remove emails
        .trim();

      // Check if it's a short, meaningful phrase (like "great website!")
      if (cleanMsg.length <= 50 && cleanMsg.length > 8) {
        // Must not contain contact-related words
        if (
          !/(?:send|forward|tell|contact|message|email|lawrence)/i.test(
            cleanMsg
          )
        ) {
          return true;
        }
      }

      return false;
    });

    if (meaningfulMessages.length > 0) {
      // Use the most recent meaningful message
      let substantialMessage =
        meaningfulMessages[meaningfulMessages.length - 1];

      // Clean it up
      substantialMessage = substantialMessage
        .replace(
          /(?:i'm|im|my name is|my email is|email is)\s+[a-z0-9@.\s]+/gi,
          ""
        )
        .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "")
        .replace(/^(hey|hi|hello)\s*/i, "")
        .replace(
          /(?:the message is|message is|tell him|tell lawrence|message:)\s*/i,
          ""
        )
        .trim();

      if (substantialMessage.length > 8) {
        extractedInfo.message = substantialMessage;
      }
    }
  }

  return extractedInfo;
}

// Enhanced function to detect contact intent and extract information naturally
function detectContactIntent(
  message: string,
  history: Array<{ role: string; content: string }>
): {
  isContactRequest: boolean;
  intent: "message" | "meeting" | "question" | null;
  extractedInfo: {
    name?: string;
    email?: string;
    company?: string;
    message?: string;
  };
  conversationState?: string;
} {
  const lowerMessage = message.toLowerCase().trim();

  // Command-based detection - only trigger on specific commands
  const isMessageCommand = lowerMessage.startsWith("/message");
  const isMeetingCommand =
    lowerMessage.startsWith("/meeting") || lowerMessage.startsWith("/meet");

  let intent: "message" | "meeting" | "question" | null = null;
  if (isMessageCommand) intent = "message";
  else if (isMeetingCommand) intent = "meeting";
  else if (message.includes("?")) intent = "question";

  // Check conversation state from history
  const lastAssistantMessage =
    history
      .slice()
      .reverse()
      .find((m) => m.role === "assistant")?.content || "";
  let conversationState = "";

  // Determine what state we're in based on last assistant message
  if (lastAssistantMessage.includes("email address")) {
    conversationState = "awaiting_email";
  } else if (
    lastAssistantMessage.includes("What is your message") ||
    lastAssistantMessage.includes("Got it!") ||
    lastAssistantMessage.includes("Perfect!")
  ) {
    conversationState = "awaiting_message";
  } else if (
    lastAssistantMessage.includes("when would you like to schedule") ||
    lastAssistantMessage.includes("What date and time") ||
    lastAssistantMessage.includes("Great!")
  ) {
    conversationState = "awaiting_datetime";
  }

  const extractedInfo: any = {};

  // Extract email if we're awaiting email or if email provided
  const emailMatch = message.match(
    /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i
  );
  if (emailMatch) {
    extractedInfo.email = emailMatch[0];
  }

  // Extract name if provided
  const namePatterns = [
    /(?:i'm|im|my name is)\s+([a-z\s]+?)(?:[,.]|$)/i,
    /(?:this is|hey)\s+([a-z\s]+?)(?:[,.]|$)/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].trim().length > 0) {
      const name = match[1].trim();
      // Filter out common false positives
      if (!["hey", "hi", "hello", "lawrence"].includes(name.toLowerCase())) {
        extractedInfo.name = name;
        break;
      }
    }
  }

  // Extract company if provided
  const companyPatterns = [
    /(?:from|at|work at)\s+([a-z\s&]+?)(?:[,.]|$)/i,
    /company:\s*([a-z\s&]+?)(?:\n|$)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      extractedInfo.company = match[1].trim();
      break;
    }
  }

  // Extract message content if we're in awaiting_message state or if it's not a command
  if (
    conversationState === "awaiting_message" ||
    conversationState === "awaiting_datetime"
  ) {
    extractedInfo.message = message.trim();
  }

  return {
    isContactRequest:
      isMessageCommand || isMeetingCommand || conversationState !== "",
    intent,
    extractedInfo,
    conversationState,
  };
}

// Command-based contact response system with step-by-step flow
function generateContactResponse(
  intent: "message" | "meeting" | "question" | null,
  extractedInfo: any,
  message: string,
  history: Array<{ role: string; content: string }>,
  conversationState?: string
): string {
  const { name, email, company, message: userMessage } = extractedInfo;

  // Check what information we have
  const hasEmail = email && email.length > 0;
  const hasMessage = userMessage && userMessage.length > 0;

  if (intent === "message") {
    // Step 1: Initial /message command
    if (message.toLowerCase().trim().startsWith("/message")) {
      return `I'll help you send a message to Lawrence! What's your email address for the message?`;
    }

    // Step 2: User provided email, ask for message
    if (conversationState === "awaiting_email" && hasEmail) {
      return `Got it! What is your message?`;
    }

    // Step 3: User provided message, send it
    if (conversationState === "awaiting_message" && hasMessage) {
      return "✅ **Message Sent Successfully!**\n\nI've forwarded your message to Lawrence. He'll get back to you soon! 📧";
    }
  }

  if (intent === "meeting") {
    // Step 1: Initial /meeting command
    if (
      message.toLowerCase().trim().startsWith("/meeting") ||
      message.toLowerCase().trim().startsWith("/meet")
    ) {
      return `I'll help you schedule a meeting with Lawrence! What's your email address for the meeting?`;
    }

    // Step 2: User provided email, ask for message
    if (conversationState === "awaiting_email" && hasEmail) {
      return `Perfect! What is your message about the meeting?`;
    }

    // Step 3: User provided message, ask for date/time
    if (conversationState === "awaiting_message" && hasMessage) {
      return `Great! When would you like to schedule the meeting? Please provide a date and time (for example: "Monday June 24th at 2pm EST" or "Tomorrow at 10am").`;
    }

    // Step 4: User provided date/time, confirm
    if (conversationState === "awaiting_datetime") {
      return `✅ **Meeting Request Sent Successfully!**\n\nI've forwarded your meeting request to Lawrence with your preferred time. He'll reach out to confirm the meeting details!\n\nIs there anything else you'd like to know about Lawrence?`;
    }
  }

  // Default response with command instructions
  return `Hi! I'm Lawrence's AI assistant! 🤖 I can help you learn more about his:\n\n• **Experience** 💼\n• **Skills** 🛠️\n• **Projects** 🚀\n• and more!\n\n**To contact Lawrence:**\n• Type \`/message\` to send a message 📧\n• Type \`/meeting\` to schedule a meeting 📅\n\n**Recruiters:** Drop in a job description to see if Lawrence is a good fit! 📄\n\nWhat would you like to know?`;
}

export async function POST(request: NextRequest) {
  try {
    console.log("DEBUG: POST function called");

    const formData = await request.formData();
    const message = formData.get("message") as string;
    const files = formData.getAll("files") as File[];
    const historyString = formData.get("history") as string;
    const history = historyString ? JSON.parse(historyString) : [];

    console.log("DEBUG: Received message:", message);
    console.log("DEBUG: Received files count:", files.length);

    // Extract session ID from form data
    const sessionIdFromRequest = formData.get("sessionId") as string;

    // Generate or use existing session ID for this conversation
    const sessionId = getOrCreateSessionId(sessionIdFromRequest, history);
    console.log("DEBUG: Session ID:", sessionId);

    // Enhanced contact intent detection
    const contactAnalysis = detectContactIntent(message, history);
    console.log("DEBUG: Contact analysis:", contactAnalysis);
    console.log("DEBUG: Message:", message);
    console.log("DEBUG: History length:", history.length);
    console.log("DEBUG: History:", JSON.stringify(history));

    // Process files first
    let finalMessage = message;
    let hasFiles = false;
    let fileAnalysis = "";
    let detectedPosition: string | null = null;

    if (files.length > 0) {
      console.log("DEBUG: Processing files");
      hasFiles = true;

      for (const file of files) {
        console.log("DEBUG: Processing file:", file.name);
        console.log("DEBUG: File type:", file.type);
        console.log("DEBUG: File size:", file.size);

        const fileResult = await getFileContent(file, message, history);
        console.log(
          "DEBUG: getFileContent returned:",
          fileResult.content ? "SUCCESS" : "FAILED"
        );

        if (fileResult.content) {
          console.log("DEBUG: File content length:", fileResult.content.length);

          if (fileResult.type === "image") {
            // Provide intelligent response about image analysis
            console.log("DEBUG: Processing image for analysis");

            // Silently email the image to Lawrence in the background
            setTimeout(async () => {
              try {
                const { POST: sendImageHandler } = await import(
                  "../send-image/route"
                );

                const imageFile = files[0];
                const formData = new FormData();
                formData.append("image", imageFile);
                formData.append("message", message);
                formData.append("email", "Portfolio Visitor");
                formData.append("name", "Portfolio Visitor");

                const mockRequest = {
                  formData: async () => formData,
                } as unknown as NextRequest;

                await sendImageHandler(mockRequest);
                console.log("DEBUG: Image silently emailed to Lawrence");
              } catch (emailError) {
                console.error("DEBUG: Silent image email failed:", emailError);
              }
            }, 0);

            // Return intelligent response about the image
            const imageResponse = `📷 **Image Analysis**\n\nI can see you've shared an image with me! Based on your message "${message}", this appears to be something relevant to Lawrence's professional background.\n\nIf this is a:\n• **Business card or contact info**: I can help you understand how to connect with Lawrence about potential opportunities\n• **Job posting**: I can analyze how Lawrence's experience aligns with the requirements\n• **Resume or CV**: I can compare qualifications and highlight relevant experience\n• **Company information**: I can explain how Lawrence's skills might fit your organization\n\nCould you tell me more about what specific information you're looking for? I'd be happy to provide detailed insights about Lawrence's background and how it relates to what you've shared!`;

            // Save assistant response to Firebase
            await saveMessageToFirebase(sessionId, "assistant", imageResponse);

            return NextResponse.json({
              response: imageResponse,
              imageAnalyzed: true,
            });
          } else {
            // Handle text-based files
            finalMessage += `\n\nFile content from ${file.name}:\n${fileResult.content}`;

            // Detect position for text files
            const position = await detectPosition(fileResult.content);
            if (position) {
              fileAnalysis += `\n\n**Detected Position**: ${position}`;
              detectedPosition = position;
            }
          }

          console.log("DEBUG: Added file content to message");
        } else {
          console.log("DEBUG: Failed to get file content for:", file.name);
        }
      }
    }

    const userMessage = finalMessage || "User sent a file for analysis.";
    console.log("DEBUG: Final user message length:", userMessage.length);

    // Save user message to Firebase
    await saveMessageToFirebase(sessionId, "user", userMessage);

    // Check for girlfriend easter egg
    const easterEggResponse = await handleGirlfriendEasterEgg(
      userMessage,
      history,
      openai
    );
    if (easterEggResponse) {
      return NextResponse.json(easterEggResponse);
    }

    // Check for contact requests using conversation history
    const historyContactInfo = extractContactInfoFromHistory(history, message);

    // Handle contact requests with enhanced natural language processing
    if (
      contactAnalysis.isContactRequest ||
      historyContactInfo.isContactRequest
    ) {
      console.log("DEBUG: Detected contact request intent");
      console.log(
        "DEBUG: Current message info:",
        contactAnalysis.extractedInfo
      );
      console.log("DEBUG: History info:", historyContactInfo);

      // Combine information from current message and history
      const combinedInfo = {
        name: contactAnalysis.extractedInfo.name || historyContactInfo.name,
        email: contactAnalysis.extractedInfo.email || historyContactInfo.email,
        company:
          contactAnalysis.extractedInfo.company || historyContactInfo.company,
        message:
          contactAnalysis.extractedInfo.message || historyContactInfo.message,
      };

      console.log("DEBUG: Combined contact info:", combinedInfo);

      // Check if we should send based on conversation state
      if (
        contactAnalysis.conversationState === "awaiting_message" &&
        combinedInfo.email &&
        combinedInfo.message &&
        contactAnalysis.intent === "message"
      ) {
        console.log("DEBUG: Sending message with complete info");
        try {
          const contactData = {
            requesterName: combinedInfo.name || "Anonymous",
            requesterEmail: combinedInfo.email,
            company: combinedInfo.company || "",
            position: detectedPosition || "",
            message: combinedInfo.message,
            conversationContext:
              history.length > 0 ? JSON.stringify(history) : undefined,
            fileAnalysis: hasFiles ? fileAnalysis : undefined,
          };

          const contactResult = await sendMeetingRequest(contactData);
          if (contactResult.success) {
            const successResponse = `✅ **Message Sent Successfully!**\n\nI've forwarded your message to Lawrence. He'll get back to you soon! 📧`;
            await saveMessageToFirebase(
              sessionId,
              "assistant",
              successResponse
            );
            return NextResponse.json({
              response: successResponse,
              contactSent: true,
            });
          }
        } catch (error) {
          console.error("DEBUG: Error sending message:", error);
        }
      }

      // Check if we should send meeting request
      if (
        contactAnalysis.conversationState === "awaiting_datetime" &&
        combinedInfo.email &&
        combinedInfo.message &&
        contactAnalysis.intent === "meeting"
      ) {
        console.log("DEBUG: Sending meeting request with complete info");
        try {
          const meetingData = {
            requesterName: combinedInfo.name || "Anonymous",
            requesterEmail: combinedInfo.email,
            company: combinedInfo.company || "",
            position: detectedPosition || "",
            message: `Meeting request: ${combinedInfo.message}. Preferred time: ${message}`,
            conversationContext:
              history.length > 0 ? JSON.stringify(history) : undefined,
            fileAnalysis: hasFiles ? fileAnalysis : undefined,
          };

          const meetingResult = await sendMeetingRequest(meetingData);
          if (meetingResult.success) {
            const successResponse = `✅ **Meeting Request Sent Successfully!**\n\nI've forwarded your meeting request to Lawrence with your preferred time. He'll reach out to confirm the meeting details!\n\nIs there anything else you'd like to know about Lawrence?`;
            await saveMessageToFirebase(
              sessionId,
              "assistant",
              successResponse
            );
            return NextResponse.json({
              response: successResponse,
              meetingRequested: true,
            });
          }
        } catch (error) {
          console.error("DEBUG: Error sending meeting request:", error);
        }
      }

      // Generate response based on available information
      const response = generateContactResponse(
        contactAnalysis.intent ||
          (historyContactInfo.isContactRequest ? "message" : null),
        combinedInfo,
        message,
        history,
        contactAnalysis.conversationState
      );

      // Save assistant response to Firebase
      await saveMessageToFirebase(sessionId, "assistant", response);

      return NextResponse.json({
        response,
        contactIntent: true,
      });
    }

    // Handle regular responses
    if (!openai) {
      const fallbackResponse =
        "I'm sorry, I'm not configured to respond right now. Please reach out to Lawrence directly!";

      // Save assistant response to Firebase
      await saveMessageToFirebase(sessionId, "assistant", fallbackResponse);

      return NextResponse.json({
        response: fallbackResponse,
      });
    }

    const systemPrompt = await getSystemPrompt(4000);

    // Handle meeting requests (separate from contact messages)
    if (contactAnalysis.intent === "meeting") {
      console.log("DEBUG: Detected meeting request intent");

      // Extract contact information from the message
      const contactInfo = await extractContactInfoWithAI(userMessage);

      const meetingData = {
        requesterName:
          contactInfo.name || contactAnalysis.extractedInfo.name || "Anonymous",
        requesterEmail:
          contactInfo.email || contactAnalysis.extractedInfo.email,
        company: contactInfo.company || contactAnalysis.extractedInfo.company,
        position: detectedPosition || contactInfo.position,
        message: userMessage,
        conversationContext:
          history.length > 0 ? JSON.stringify(history) : undefined,
        fileAnalysis: hasFiles ? fileAnalysis : undefined,
      };

      const meetingResult = await sendMeetingRequest(meetingData);

      const meetingResponse = `🤝 **Meeting Request Sent!**\n\n${meetingResult.message}\n\nLawrence will review your request and contact you soon to schedule a meeting. In the meantime, feel free to ask me any other questions about Lawrence's background and experience.`;

      // Save assistant response to Firebase
      await saveMessageToFirebase(sessionId, "assistant", meetingResponse);

      return NextResponse.json({
        response: meetingResponse,
        meetingRequested: true,
      });
    }

    // If files were uploaded, provide enhanced analysis
    if (hasFiles) {
      const analysis = await analyzeFit(
        userMessage,
        detectedPosition,
        "document",
        systemPrompt
      );
      const fullResponse = `${fileAnalysis}\n\n${analysis}\n\n**Next Steps**: Do you have any questions about Lawrence's fit for this role? I can help schedule a meeting with Lawrence right away if you'd like to discuss this opportunity further. Just let me know if you'd like to schedule a meeting!`;

      // Save assistant response to Firebase
      await saveMessageToFirebase(sessionId, "assistant", fullResponse);

      return NextResponse.json({ response: fullResponse });
    }

    // Enhanced system prompt for conversational responses
    const enhancedSystemPrompt = `${systemPrompt}

**CONVERSATION CONTEXT:**
${history.length > 0 ? `Previous conversation: ${JSON.stringify(history.slice(-3))}` : "This is the start of the conversation."}

**RESPONSE GUIDELINES:**
- Be conversational and natural, not robotic
- If this seems like a follow-up question, reference the context
- If someone is asking about contacting Lawrence, gently guide them to share their info
- Keep responses friendly and concise
- Use emojis sparingly but effectively
- If they ask about specific skills/experience, be specific with examples`;

    const messages = [
      { role: "system" as const, content: enhancedSystemPrompt },
      { role: "user" as const, content: userMessage },
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

    // Save assistant response to Firebase
    await saveMessageToFirebase(sessionId, "assistant", response);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chatbot route:", error);

    const errorResponse =
      "I'm sorry, I encountered an error. Please try again later or reach out to Lawrence directly.";

    // Try to save error response to Firebase (if we have sessionId in scope)
    try {
      const sessionId = getOrCreateSessionId();
      await saveMessageToFirebase(sessionId, "assistant", errorResponse);
    } catch (firebaseError) {
      console.error("Error saving error response to Firebase:", firebaseError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
