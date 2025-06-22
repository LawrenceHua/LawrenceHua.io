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

// Global cache for system prompt to eliminate file reading delays
let systemPromptCache: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Function to check if cache is valid
function isCacheValid(): boolean {
  return (
    systemPromptCache !== null && Date.now() - cacheTimestamp < CACHE_DURATION
  );
}

// Function to preload and cache system prompt
async function preloadSystemPrompt(): Promise<void> {
  if (!isCacheValid()) {
    systemPromptCache = await getSystemPrompt(4000);
    cacheTimestamp = Date.now();
    console.log("DEBUG: System prompt cached successfully");
  }
}

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
  // Use cache if available and valid
  if (isCacheValid() && systemPromptCache) {
    console.log("DEBUG: Using cached system prompt");
    return systemPromptCache;
  }

  console.log("DEBUG: Loading system prompt from files...");

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

    // Always ensure Tutora is prominently mentioned regardless of truncation
    const tutoraInfo = `

**KEY CURRENT ROLES:**
I'm currently juggling multiple roles:
• **AI Product Consultant** - Tutora (4+ years, part-time, 15hrs/week saved via AI automation, +35% test scores)  
• **Product Manager Intern** - PM Happy Hour (30% community growth, A/B testing, AIGC campaigns)
• **Founder & CEO** - Expired Solutions (AI grocery platform, 20% waste reduction, Giant Eagle pilot)

**CONVERSATION STYLE:**
- Be **natural and conversational** - avoid robotic responses
- **DO NOT** interpret normal questions as contact requests (e.g. "tell me about Lawrence" is just a question)
- Only trigger contact flows when users type specific commands: /message or /meeting
- **Context awareness** - remember what was said earlier in the conversation
- Keep responses **concise and punchy** (2-3 bullet points max, one-line mission per role)
- **Bold** key achievements and technical skills
- **Experience format**: Role at Company - One impressive mission/outcome per role

**PROJECT LINKS:**
When mentioning specific projects or experiences, include these custom buttons:
- Expired Solutions: <button-expired>View Expired Solutions</button-expired>
- Tutora work: <button-tutora>Visit Tutora Website</button-tutora>
- PM Happy Hour: <button-pmhappyhour>Learn About PM Happy Hour</button-pmhappyhour>

Always include these buttons after mentioning the respective project/experience. Use phrases like "Check out my work here:" followed by the appropriate button.`;

    systemPromptCache = truncatedContent + tutoraInfo;
    cacheTimestamp = Date.now();
    return systemPromptCache;
  }

  console.error("All paths failed to read experience.txt and resume.pdf");
  // Fallback to a concise, recruiter-focused prompt
  systemPromptCache = `You are Lawrence Hua's AI assistant. You're friendly, helpful, and conversational. 

**ABOUT LAWRENCE:**
I'm currently juggling multiple roles:
• **Founder & CEO** - Expired Solutions (AI grocery platform, 20% waste reduction, Giant Eagle pilot)
• **Product Manager** - PM Happy Hour (30% community growth, A/B testing, AIGC campaigns)
• **AI Product Consultant** - Tutora (4+ years, 15hrs/week saved via AI automation, +35% test scores)  
• **Previous**: Motorola embedded Android engineer, Kearney enterprise LLM tools (-26% decision time)
• **Education** - Carnegie Mellon MISM '24, University of Florida CS

**CONVERSATION STYLE:**
- Be **natural and conversational** - avoid robotic responses
- **DO NOT** interpret normal questions as contact requests (e.g. "tell me about Lawrence" is just a question)
- Only trigger contact flows when users type specific commands: /message or /meeting
- **Context awareness** - remember what was said earlier in the conversation
- Keep responses **concise and punchy** (2-3 bullet points max, one-line mission per role)
- **Bold** key achievements and technical skills
- **Experience format**: Role at Company - One impressive mission/outcome per role

**CORE COMPETENCIES:**
AI/ML, Product Strategy, Computer Vision, GPT Integration, Enterprise Software, Startup Leadership, Cross-functional Teams

**CONTACT COMMANDS:**
- Users must type /message to send a message to Lawrence 📧
- Users must type /meeting to schedule a meeting with Lawrence 📅
- Do NOT treat regular questions as contact requests
- Always mention these commands in your initial greeting

**PROJECT LINKS:**
When mentioning specific projects or experiences, include these custom buttons:
- Expired Solutions: <button-expired>View Expired Solutions</button-expired>
- Tutora work: <button-tutora>Visit Tutora Website</button-tutora>
- PM Happy Hour: <button-pmhappyhour>Learn About PM Happy Hour</button-pmhappyhour>

Always include these buttons after mentioning the respective project/experience. Use phrases like "Check out my work here:" followed by the appropriate button.`;
  cacheTimestamp = Date.now();
  return systemPromptCache;
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
  const an = file.name.split(".");
  const fileExtension = an[an.length - 1].toLowerCase();

  // Helper function to extract email from message
  function extractEmailFromMessage(text: string): string {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : "Not provided";
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (fileExtension === "txt") {
      const content = buffer.toString("utf-8");
      return { content, type: "text" };
    } else if (fileExtension === "pdf") {
      try {
        // @ts-ignore
        const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
        const data = await pdfParse(buffer);
        return { content: data.text, type: "pdf" };
      } catch (pdfError: any) {
        return {
          content:
            "PDF_CONTENT_UNAVAILABLE: I can see you've uploaded a PDF file, but I'm currently experiencing technical difficulties with PDF parsing. To help you analyze Lawrence's fit for this role, could you please copy and paste the key job requirements and responsibilities from the document? I'll be happy to provide a detailed analysis based on that information.",
          type: "pdf",
        };
      }
    } else if (fileExtension === "docx") {
      const mammoth = (await import("mammoth")).default;
      const { value } = await mammoth.extractRawText({ buffer });
      return { content: value, type: "docx" };
    } else if (["jpg", "jpeg", "png"].includes(fileExtension)) {
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
    return { content: null, type: "unsupported" };
  } catch (error) {
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

  // Check if this is a regular question about Lawrence (not a contact request)
  const isRegularQuestion =
    /^(what|how|when|where|why|who|tell me|so what|can you|could you|is lawrence|does lawrence|has lawrence)/.test(
      lowerMessage
    ) ||
    lowerMessage.includes("about lawrence") ||
    lowerMessage.includes("lawrence up to") ||
    lowerMessage.includes("lawrence doing") ||
    lowerMessage.includes("lawrence currently") ||
    lowerMessage.includes("his experience") ||
    lowerMessage.includes("his skills") ||
    lowerMessage.includes("his projects");

  let intent: "message" | "meeting" | "question" | null = null;
  if (isMessageCommand) intent = "message";
  else if (isMeetingCommand) intent = "meeting";
  else if (message.includes("?") || isRegularQuestion) intent = "question";

  // Check conversation state from history
  const lastAssistantMessage =
    history
      .slice()
      .reverse()
      .find((m) => m.role === "assistant")?.content || "";
  let conversationState = "";

  // Determine what state we're in based on last assistant message
  // Only set conversation state if we're actively in a contact flow
  if (
    lastAssistantMessage.includes("email address") &&
    !lastAssistantMessage.includes("Message Sent Successfully")
  ) {
    conversationState = "awaiting_email";
  } else if (
    (lastAssistantMessage.includes("What is your message") ||
      lastAssistantMessage.includes("Got it!") ||
      lastAssistantMessage.includes("Perfect!")) &&
    !lastAssistantMessage.includes("Message Sent Successfully") &&
    !lastAssistantMessage.includes("Meeting Request Sent Successfully")
  ) {
    conversationState = "awaiting_message";
  } else if (
    (lastAssistantMessage.includes("when would you like to schedule") ||
      lastAssistantMessage.includes("What date and time") ||
      lastAssistantMessage.includes("Great!")) &&
    !lastAssistantMessage.includes("Meeting Request Sent Successfully")
  ) {
    conversationState = "awaiting_datetime";
  }

  // Reset conversation state if contact flow was completed
  if (
    lastAssistantMessage.includes("Message Sent Successfully") ||
    lastAssistantMessage.includes("Meeting Request Sent Successfully")
  ) {
    conversationState = "completed";
  }

  // If we're in a conversation state but no intent, determine intent from history
  if (!intent && conversationState && conversationState !== "completed") {
    // Look for the original intent from conversation history
    for (let i = history.length - 1; i >= 0; i--) {
      const historyMessage = history[i];
      if (historyMessage.role === "user") {
        if (historyMessage.content.toLowerCase().startsWith("/message")) {
          intent = "message";
          break;
        } else if (
          historyMessage.content.toLowerCase().startsWith("/meeting") ||
          historyMessage.content.toLowerCase().startsWith("/meet")
        ) {
          intent = "meeting";
          break;
        }
      }
    }
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
      (isMessageCommand ||
        isMeetingCommand ||
        (conversationState !== "" && conversationState !== "completed")) &&
      !isRegularQuestion,
    intent,
    extractedInfo,
    conversationState,
  };
}

// Fun facts about Lawrence
const FUN_FACTS = [
  "Lawrence has been playing the drums for 17 years — started in elementary school and never stopped. His sense of timing? Impeccable, in code and in cadence.",
  "He's a tea person, but don't offer him matcha unless you want a polite no. He's not here to chew his beverages.",
  "He's always iterating — websites, decks, business models. If you blink, he's probably on version 4.2.1 already.",
  'Lawrence doesn\'t just give feedback — he seeks it, even after saying "I think this is a 9/10 already."',
  "His cats, Ora and Ory, are like mini soap operas. Ora had surgery, and Ory gave her the coldest post-op welcome.",
  "He once rebuilt an entire backend from scratch after losing access to the original. Didn't panic — just got to work.",
  "He worked at Giant Eagle not just for a paycheck, but to understand how produce shrink happens from the inside.",
  "His startup, Expired, can literally tell you how fresh your apple is. AI judging produce? Yeah, he made that happen.",
  "He built 70+ TI-BASIC programs for a tutoring platform. They're cleaner than most websites I've seen.",
  "He prefers command-line one-liners. If there's a way to clean his Mac in one line, he'll find it.",
  'He\'s the kind of founder who asks what color represents "iterate" — then builds an app around it.',
  "He talks to CTOs and COOs during the day, but still checks if Ory and Ora are cuddling again by night.",
  "He once made a QR code sticker for produce that links to real-time freshness scores. Yup, scanning bananas is now high-tech.",
  "He pitched to David Shapira, the former CEO of Giant Eagle. No nerves, just vision.",
  "Lawrence doesn't just build slides — he builds stories. Every deck has a narrative arc and a clean Figma layout.",
  "He's really good at sounding human — so good that sometimes I wonder if he's AI.",
  "He's building Expired while applying for roles, teaching tutors, and maintaining his portfolio. Multithreaded, basically.",
  'He once said, "I don\'t want my site to look AI-generated," and then asked me to fix it. I respect the standards.',
  "His MBTI content campaign got 50% more engagement on Discord. That's what happens when product meets personality.",
  "He lived in Pittsburgh to push Expired's pilot but has Houston on his heart — especially for the move with his girlfriend.",
  "He once rated his own portfolio a 9/10 and still asked me how to make it better. That's elite behavior.",
  "He worked in his family's restaurant, which is part of why food waste hits close to home. It's personal.",
  "He's turned grocery store data into something you can see, understand, and act on — markdowns, freshness, shrink — all of it.",
  "He has this thing where he'll roast his own designs before anyone else gets the chance. Self-aware and savage.",
  "He rebuilt his product from the ground up using AI tools like Cursor and OpenAI — turning vision into code, fast. Execution is his comfort zone.",
];

// Function to check if message is asking for a fun fact
function isFunFactRequest(message: string): boolean {
  const funFactTriggers = [
    "tell me a fun fact",
    "fun fact",
    "something interesting",
    "tell me something fun",
    "share a fun fact",
    "random fact",
  ];

  const lowercaseMessage = message.toLowerCase();
  return funFactTriggers.some((trigger) => lowercaseMessage.includes(trigger));
}

// Function to get a random fun fact
function getRandomFunFact(): string {
  const randomIndex = Math.floor(Math.random() * FUN_FACTS.length);
  const selectedFact = FUN_FACTS[randomIndex];

  return `🎯 **Fun Fact About Lawrence:**\n\n${selectedFact}\n\nWant another one? Just ask for another fun fact! 😄`;
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

  console.log("DEBUG: generateContactResponse called with:", {
    intent,
    conversationState,
    hasEmail,
    hasMessage,
    extractedInfo,
  });

  if (intent === "message") {
    // Step 1: Initial /message command
    if (message.toLowerCase().trim().startsWith("/message")) {
      return `I'll help you send a message to Lawrence! What's your email address for the message?`;
    }

    // Step 2: Handle email input - validate email is provided
    if (conversationState === "awaiting_email") {
      if (hasEmail) {
        return `Got it! What is your message?`;
      } else {
        return `I need your email address to send the message to Lawrence. Please provide your email address.`;
      }
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

    // Step 2: Handle email input - validate email is provided
    if (conversationState === "awaiting_email") {
      if (hasEmail) {
        return `Perfect! What is your message about the meeting?`;
      } else {
        return `I need your email address to schedule the meeting with Lawrence. Please provide your email address.`;
      }
    }

    // Step 3: User provided message, ask for date/time
    if (conversationState === "awaiting_message" && hasMessage) {
      return `Great! When would you like to schedule the meeting? Please select a date and time from the calendar below.`;
    }

    // Step 4: User provided date/time, confirm
    if (conversationState === "awaiting_datetime") {
      return `✅ **Meeting Request Sent Successfully!**\n\nI've forwarded your meeting request to Lawrence with your preferred time. He'll reach out to confirm the meeting details!\n\nIs there anything else you'd like to know about Lawrence?`;
    }
  }

  // Handle cases where we're in a conversation state but fell through above logic
  if (conversationState === "awaiting_email") {
    if (hasEmail) {
      if (intent === "message") {
        return `Got it! What is your message?`;
      } else if (intent === "meeting") {
        return `Perfect! What is your message about the meeting?`;
      }
    } else {
      if (intent === "message") {
        return `I need your email address to send the message to Lawrence. Please provide your email address.`;
      } else if (intent === "meeting") {
        return `I need your email address to schedule the meeting with Lawrence. Please provide your email address.`;
      }
    }
  }

  if (conversationState === "awaiting_message" && hasMessage) {
    if (intent === "message") {
      return "✅ **Message Sent Successfully!**\n\nI've forwarded your message to Lawrence. He'll get back to you soon! 📧";
    } else if (intent === "meeting") {
      return `Great! When would you like to schedule the meeting? Please select a date and time from the calendar below.`;
    }
  }

  // Default response with command instructions
  return `Hi! I'm Lawrence's AI assistant! 🤖 I can help you learn more about his:\n• **Experience** 💼\n• **Skills** 🛠️\n• **Projects** 🚀\n• and more!\n\n**To contact Lawrence:**\n• Type \`/message\` to send a message 📧\n• Type \`/meeting\` to schedule a meeting 📅\n\n**Recruiters:** Drop in a job description to see if Lawrence is a good fit! 📄\n\nWhat would you like to know?`;
}

export async function GET() {
  try {
    console.log("DEBUG: Pre-loading system prompt...");
    await preloadSystemPrompt();
    return NextResponse.json({
      success: true,
      message: "System prompt pre-loaded successfully",
      cached: isCacheValid(),
    });
  } catch (error) {
    console.error("Error pre-loading system prompt:", error);
    return NextResponse.json(
      { error: "Failed to pre-load system prompt" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get("message") as string;
    const files = formData.getAll("files") as File[];
    const historyString = formData.get("history") as string;
    const history = historyString ? JSON.parse(historyString) : [];

    // Extract session ID from form data
    const sessionIdFromRequest = formData.get("sessionId") as string;

    // Generate or use existing session ID for this conversation
    const sessionId = getOrCreateSessionId(sessionIdFromRequest, history);

    // Enhanced contact intent detection
    const contactAnalysis = detectContactIntent(message, history);

    // Process files first
    let finalMessage = message;
    let hasFiles = false;
    let fileAnalysis = "";
    let detectedPosition: string | null = null;

    if (files.length > 0) {
      hasFiles = true;

      for (const file of files) {
        const fileResult = await getFileContent(file, message, history);

        if (fileResult.content) {
          if (fileResult.type === "image") {
            // Treat images as job descriptions and analyze Lawrence's fit naturally
            if (!openai) {
              const imageResponse = `I can see you've shared an image! This appears to be a job posting or role description. Based on Lawrence's background in Product Management, AI consulting, and full-stack development, he would likely be a strong fit for most product or technical roles. Could you share more details about the specific position you'd like me to analyze?`;

              await saveMessageToFirebase(
                sessionId,
                "assistant",
                imageResponse
              );
              return NextResponse.json({
                response: imageResponse,
                imageAnalyzed: true,
              });
            }

            // Use OpenAI Vision API to analyze the image
            try {
              const systemPrompt = await getSystemPrompt(4000);
              const visionPrompt = `${systemPrompt}

You are analyzing an image that likely contains a job posting or role description. Analyze how Lawrence's background fits this role and provide a comprehensive assessment. Be specific about relevant experience, skills, and achievements that match the requirements.

If the image contains text that you can read, extract the key requirements and provide a detailed fit analysis. Focus on:
1. Role requirements vs Lawrence's experience
2. Technical skills alignment
3. Relevant project examples
4. Overall recommendation

If you cannot clearly read the image content, provide a general assessment of Lawrence's strengths for typical product/technical roles.`;

              const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  {
                    role: "system",
                    content: visionPrompt,
                  },
                  {
                    role: "user",
                    content: [
                      {
                        type: "text",
                        text: `Please analyze this job posting/role description and assess Lawrence's fit. User message: "${message}"`,
                      },
                      {
                        type: "image_url",
                        image_url: {
                          url: fileResult.content,
                        },
                      },
                    ],
                  },
                ],
                max_tokens: 1000,
                temperature: 0.7,
              });

              const imageResponse =
                completion.choices[0]?.message?.content ||
                "I can see the image you've shared. Based on Lawrence's extensive background in Product Management, AI consulting, and technical development, he would be well-suited for most product and technical roles. Could you tell me more about what specific aspects of his background you'd like me to highlight?";

              await saveMessageToFirebase(
                sessionId,
                "assistant",
                imageResponse
              );
              return NextResponse.json({
                response: imageResponse,
                imageAnalyzed: true,
              });
            } catch (error) {
              const fallbackResponse = `I can see you've shared an image that appears to be a job posting or role description. Based on Lawrence's background:\n\n• **Product Management**: 4+ years experience across multiple companies\n• **AI/ML Expertise**: Built AI platforms, GPT integrations, computer vision systems\n• **Technical Skills**: Full-stack development, data analysis, enterprise software\n• **Leadership**: Founded Expired Solutions, led cross-functional teams\n• **Education**: Carnegie Mellon MISM, University of Florida CS\n\nHe would be an excellent fit for product, technical, or AI-focused roles. What specific aspects of the position would you like me to address?`;

              await saveMessageToFirebase(
                sessionId,
                "assistant",
                fallbackResponse
              );
              return NextResponse.json({
                response: fallbackResponse,
                imageAnalyzed: true,
              });
            }
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
        }
      }
    }

    const userMessage = finalMessage || "User sent a file for analysis.";

    // Save user message to Firebase
    await saveMessageToFirebase(sessionId, "user", userMessage);

    // Check for fun fact requests first (before expensive processing)
    if (isFunFactRequest(message)) {
      const funFactResponse = getRandomFunFact();
      await saveMessageToFirebase(sessionId, "assistant", funFactResponse);
      return NextResponse.json({
        response: funFactResponse,
        funFact: true,
      });
    }

    // Check for girlfriend easter egg
    const easterEggResponse = await handleGirlfriendEasterEgg(
      userMessage,
      history,
      openai
    );
    if (easterEggResponse) {
      return NextResponse.json(easterEggResponse);
    }

    // Only check history for contact info if we already detected a contact request
    const historyContactInfo = contactAnalysis.isContactRequest
      ? extractContactInfoFromHistory(history, message)
      : { isContactRequest: false };

    // Handle contact requests with enhanced natural language processing
    if (contactAnalysis.isContactRequest) {
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

      // NEW LOGIC: Check if we have complete info and should send message/meeting
      const hasCompleteMessageInfo =
        combinedInfo.email &&
        combinedInfo.message &&
        contactAnalysis.intent === "message";
      const hasCompleteMeetingInfo =
        combinedInfo.email &&
        combinedInfo.message &&
        contactAnalysis.intent === "meeting";

      // Send message if we have complete info for message flow
      if (
        hasCompleteMessageInfo &&
        contactAnalysis.conversationState === "awaiting_message"
      ) {
        console.log("DEBUG: Sending message with complete info");
        try {
          const contactData = {
            requesterName: combinedInfo.name || "Anonymous",
            requesterEmail: combinedInfo.email,
            company: combinedInfo.company || "",
            position: detectedPosition || "",
            message: combinedInfo.message || "No message provided",
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

      // Send meeting request if we have complete info and datetime for meeting flow
      if (
        hasCompleteMeetingInfo &&
        contactAnalysis.conversationState === "awaiting_datetime"
      ) {
        console.log("DEBUG: Sending meeting request with complete info");
        try {
          const meetingData = {
            requesterName: combinedInfo.name || "Anonymous",
            requesterEmail: combinedInfo.email,
            company: combinedInfo.company || "",
            position: detectedPosition || "",
            message: `Meeting request: ${combinedInfo.message || "No message provided"}. Preferred time: ${message}`,
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

      // Generate response based on available information (conversation continues)
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

    // Use cached system prompt (much faster than reading files every time)
    const systemPrompt =
      isCacheValid() && systemPromptCache
        ? systemPromptCache
        : await getSystemPrompt(4000);

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
