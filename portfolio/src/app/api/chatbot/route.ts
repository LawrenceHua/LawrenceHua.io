import { readFileSync, promises as fs } from "fs";
import { join } from "path";
import path from "path";
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

// Import pdf-parse at the top level to avoid dynamic import issues
let pdfParse: any = null;
try {
  pdfParse = require("pdf-parse");
  console.log("DEBUG: pdf-parse library loaded successfully");
} catch (error) {
  console.log(
    "DEBUG: pdf-parse library not available:",
    (error as Error).message
  );
}

// Global cache for system prompt to eliminate file reading delays
let systemPromptCache: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Response cache for common queries
const responseCache = new Map<
  string,
  { response: string; timestamp: number }
>();
const RESPONSE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Advanced response cache with LRU eviction
const MAX_CACHE_SIZE = 1000;
const advancedCache = new Map<
  string,
  {
    response: string;
    timestamp: number;
    hits: number;
    lastAccessed: number;
  }
>();

// Pre-computed responses for instant delivery
const instantResponses = new Map<string, string>([
  [
    "skills",
    "Lawrence has expertise in Product Management, AI/ML, full-stack development (React, Next.js, Python), data analysis, and startup leadership. He's built AI platforms, led cross-functional teams, and has 4+ years of PM experience at companies like PM Happy Hour, PanPalz, and Kearney.",
  ],
  [
    "experience",
    "Lawrence has 4+ years of product management experience across multiple companies including PM Happy Hour (AI Product Consultant), PanPalz (Product Manager), Kearney (Product Management Intern), and his own startup Expired Solutions (Founder & CEO). He's also worked at Giant Eagle and Motorola as an engineer.",
  ],
  [
    "projects",
    "Lawrence has worked on diverse projects including AI-powered food waste reduction systems, computer vision applications, mobile apps, and data analytics platforms. Notable projects include Expired Solutions (his startup), AI chatbots, machine learning pipelines, and product strategy implementations.",
  ],
  [
    "education",
    "Lawrence holds a Master's in Information Systems Management (MISM) from Carnegie Mellon University (2024) and a Bachelor's degree from the University of Florida. His education combines technical computer science foundations with business and management principles.",
  ],
  [
    "contact",
    "I'd be happy to help you get in touch with Lawrence! I can collect your information and send it directly to him, or help you schedule a meeting. What would you prefer - sending a message or scheduling a call?",
  ],
  [
    "ai",
    "Lawrence has extensive AI/ML experience including computer vision, natural language processing, machine learning pipeline development, and AI product strategy. He's built AI-powered applications, worked with OpenAI APIs, and has hands-on experience with Python, TensorFlow, and various ML frameworks.",
  ],
]);

// Quick pattern matching for instant responses
const quickPatterns = [
  {
    keywords: ["skill", "technical", "expertise", "technology"],
    response: "skills",
  },
  {
    keywords: ["experience", "work", "career", "job", "role"],
    response: "experience",
  },
  {
    keywords: ["project", "portfolio", "built", "created", "developed"],
    response: "projects",
  },
  {
    keywords: ["education", "degree", "university", "carnegie", "school"],
    response: "education",
  },
  {
    keywords: ["contact", "reach", "connect", "talk", "meet"],
    response: "contact",
  },
  {
    keywords: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "ml",
      "computer vision",
    ],
    response: "ai",
  },
];

// Common responses for instant replies
const commonResponses = {
  greeting:
    "👋 Hi! I'm Lawrence's AI assistant. I can help you learn about his experience, skills, and projects. What would you like to know?",
  skills:
    "Lawrence has expertise in Product Management, AI/ML, full-stack development, and startup leadership. He's built AI platforms, led cross-functional teams, and has 4+ years of PM experience.",
  experience:
    "Lawrence has 4+ years of product management experience across multiple companies including PM Happy Hour, PanPalz, Kearney, and his own startup Expired Solutions. He's also worked at Giant Eagle and Motorola.",
};

// Function to check if cache is valid
function isCacheValid(): boolean {
  return (
    systemPromptCache !== null && Date.now() - cacheTimestamp < CACHE_DURATION
  );
}

// Advanced caching functions with LRU eviction
function getCachedResponse(messageHash: string): string | null {
  const cached = advancedCache.get(messageHash);
  if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_DURATION) {
    // Update access time and hit count
    cached.lastAccessed = Date.now();
    cached.hits++;
    return cached.response;
  }

  // Check simple cache as fallback
  const simpleCached = responseCache.get(messageHash);
  if (
    simpleCached &&
    Date.now() - simpleCached.timestamp < RESPONSE_CACHE_DURATION
  ) {
    return simpleCached.response;
  }

  return null;
}

function setCachedResponse(messageHash: string, response: string): void {
  // Check if cache is full and needs eviction
  if (advancedCache.size >= MAX_CACHE_SIZE) {
    // Find least recently used item
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, value] of advancedCache.entries()) {
      if (value.lastAccessed < oldestTime) {
        oldestTime = value.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      advancedCache.delete(oldestKey);
    }
  }

  // Add to advanced cache
  advancedCache.set(messageHash, {
    response,
    timestamp: Date.now(),
    hits: 1,
    lastAccessed: Date.now(),
  });

  // Also add to simple cache for fallback
  responseCache.set(messageHash, { response, timestamp: Date.now() });
}

function getMessageHash(message: string): string {
  return message
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .slice(0, 100);
}

// Quick pattern matching for instant responses
function getInstantResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Check for exact pattern matches
  for (const pattern of quickPatterns) {
    if (pattern.keywords.some((keyword) => lowerMessage.includes(keyword))) {
      const response = instantResponses.get(pattern.response);
      if (response) {
        return response;
      }
    }
  }

  return null;
}

// Function to preload and cache system prompt
async function getSystemPrompt(maxTokens: number = 2000): Promise<string> {
  if (isCacheValid()) {
    return systemPromptCache!;
  }

  try {
    // Use parallel file reading for faster loading
    const [experienceData, projectsData] = await Promise.all([
      fs
        .readFile(path.join(process.cwd(), "experience.txt"), "utf-8")
        .catch(() => "Experience data not available"),
      fs
        .readFile(
          path.join(process.cwd(), "src", "data", "projects.json"),
          "utf-8"
        )
        .catch(() => "{}"),
    ]);

    // Optimized system prompt with essential information only
    const systemPrompt = `You are Lawrence Hua's AI assistant. You help visitors learn about Lawrence's background and connect with him.

CORE INFO:
- Product Manager with 4+ years experience
- AI/ML expertise, full-stack developer
- Carnegie Mellon MISM '24, University of Florida grad
- Founder of Expired Solutions (AI food waste reduction)
- Experience: PM Happy Hour, PanPalz, Kearney, Motorola

SKILLS: Product Management, AI/ML, Python, React, Next.js, Data Analysis, Computer Vision, Startup Leadership

CONTACT HELP:
- For "contact/reach/connect" requests: offer to collect info and send to Lawrence
- For meeting requests: offer to help schedule via calendar
- Always be helpful and professional

Keep responses concise but informative. Focus on Lawrence's PM and technical experience.`;

    systemPromptCache = systemPrompt;
    cacheTimestamp = Date.now();
    return systemPrompt;
  } catch (error) {
    console.error("Error loading system prompt:", error);
    // Fallback to minimal prompt
    const fallbackPrompt = `You are Lawrence Hua's AI assistant. Lawrence is a Product Manager with AI/ML expertise and 4+ years experience. Help visitors learn about him and connect if they're interested.`;
    systemPromptCache = fallbackPrompt;
    cacheTimestamp = Date.now();
    return fallbackPrompt;
  }
}

// Optimized OpenAI API calls with model selection
async function getOptimizedCompletion(
  messages: any[],
  maxTokens: number = 150,
  useAdvancedModel: boolean = false
): Promise<string> {
  if (!openai) {
    return "I'm sorry, the AI service is not available right now.";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: useAdvancedModel ? "gpt-4" : "gpt-3.5-turbo", // Use GPT-3.5 for speed
      messages,
      max_tokens: maxTokens,
      temperature: 0.1,
      stream: false, // Disable streaming for faster simple responses
    });

    return (
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "I'm sorry, I'm having trouble generating a response right now.";
  }
}

// Check if OpenAI API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;

console.log("DEBUG: process.cwd() =", process.cwd());
console.log(
  "DEBUG: process.env.OPENAI_API_KEY =",
  process.env.OPENAI_API_KEY ? "✓ Set" : "✗ Missing"
);

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
    const remainingMessage = message
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

async function getFileContent(file: File): Promise<{
  content: string | null;
  type: string;
  position?: string;
  originalFile?: {
    name: string;
    content: string;
    mimeType: string;
  };
}> {
  function extractEmailFromMessage(text: string): string {
    const emailMatch = text.match(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i);
    return emailMatch ? emailMatch[0] : "";
  }

  try {
    if (file.type.startsWith("image/")) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Content = Buffer.from(arrayBuffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64Content}`;

      return {
        content: dataUrl,
        type: "image",
        originalFile: {
          name: file.name,
          content: base64Content,
          mimeType: file.type,
        },
      };
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Content = Buffer.from(arrayBuffer).toString("base64");

      return {
        content: "PDF file uploaded",
        type: "document",
        originalFile: {
          name: file.name,
          content: base64Content,
          mimeType: file.type,
        },
      };
    } else {
      const text = await file.text();

      return {
        content: text,
        type: "document",
        originalFile: {
          name: file.name,
          content: Buffer.from(text).toString("base64"),
          mimeType: file.type || "text/plain",
        },
      };
    }
  } catch (error) {
    console.error("Error processing file:", error);
    return { content: null, type: "unknown" };
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
      model: "gpt-3.5-turbo", // Faster model for simple extraction
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
  attachments?: Array<{
    name: string;
    content: string;
    mimeType: string;
  }>;
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
function getOrCreateSessionId(sessionIdFromRequest?: string): string {
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
      model: "gpt-3.5-turbo", // Faster model for simple extraction
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
  const extractedInfo = {
    name: undefined as string | undefined,
    email: undefined as string | undefined,
    company: undefined as string | undefined,
    message: undefined as string | undefined,
    isContactRequest: false,
  };

  // Create an ordered list of all conversation entries
  const conversation = [...history, { role: "user", content: currentMessage }];

  // Find the most recent /message or /meeting command to isolate this flow
  let mostRecentCommandIndex = -1;
  for (let i = conversation.length - 1; i >= 0; i--) {
    const entry = conversation[i];
    if (entry.role === "user") {
      const content = entry.content.toLowerCase();
      if (content.startsWith("/message") || content.startsWith("/meeting")) {
        mostRecentCommandIndex = i;
        break;
      }
    }
  }

  // If no command found, return empty
  if (mostRecentCommandIndex === -1) {
    return extractedInfo;
  }

  // Only process conversation from the most recent command onwards
  const relevantConversation = conversation.slice(mostRecentCommandIndex);

  // Track the conversation flow state machine
  let foundMessageCommand = false;
  let foundMeetingCommand = false;
  let askedForName = false;
  let askedForCompany = false;
  let askedForEmail = false;
  let askedForMessage = false;
  let askedForDateTime = false;

  // Process only the relevant conversation in order
  for (let i = 0; i < relevantConversation.length; i++) {
    const entry = relevantConversation[i];
    const content = entry.content.toLowerCase();

    // Detect command initiation
    if (
      entry.role === "user" &&
      (content.startsWith("/message") || content.startsWith("/meeting"))
    ) {
      foundMessageCommand = content.startsWith("/message");
      foundMeetingCommand = content.startsWith("/meeting");
      continue;
    }

    // Track assistant prompts
    if (entry.role === "assistant") {
      if (
        content.includes("what's your name") ||
        content.includes("what is your name")
      ) {
        askedForName = true;
        askedForCompany = false;
        askedForEmail = false;
        askedForMessage = false;
        askedForDateTime = false;
      } else if (content.includes("what company are you with")) {
        askedForCompany = true;
        askedForName = false;
        askedForEmail = false;
        askedForMessage = false;
        askedForDateTime = false;
      } else if (content.includes("email address")) {
        askedForEmail = true;
        askedForName = false;
        askedForCompany = false;
        askedForMessage = false;
        askedForDateTime = false;
      } else if (
        content.includes("what's your message") ||
        content.includes("what is your message") ||
        content.includes("what would you like to discuss")
      ) {
        askedForMessage = true;
        askedForName = false;
        askedForCompany = false;
        askedForEmail = false;
        askedForDateTime = false;
      } else if (
        content.includes("when would you like to schedule") ||
        content.includes("preferred date and time")
      ) {
        askedForDateTime = true;
        askedForName = false;
        askedForCompany = false;
        askedForEmail = false;
        askedForMessage = false;
      }
    }

    // Extract user responses based on what was asked
    if (entry.role === "user" && i > 0) {
      const userContent = entry.content.trim();

      if (askedForName && !extractedInfo.name) {
        // This is the name response - take it as-is unless it's a common non-name
        if (
          !["none", "no", "yes", "ok", "okay"].includes(
            userContent.toLowerCase()
          )
        ) {
          extractedInfo.name = userContent;
        }
      } else if (askedForCompany && !extractedInfo.company) {
        // This is the company response
        extractedInfo.company = userContent;
      } else if (askedForEmail && !extractedInfo.email) {
        // Extract email from response
        const emailMatch = userContent.match(
          /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i
        );
        if (emailMatch) {
          extractedInfo.email = emailMatch[0];
        }
      } else if (askedForMessage && !extractedInfo.message) {
        // This is the message/topic
        extractedInfo.message = userContent;
      } else if (askedForDateTime && extractedInfo.message) {
        // If we already have a message and now getting datetime, keep the message as is
        // The datetime will be handled separately
      }
    }
  }

  extractedInfo.isContactRequest = foundMessageCommand || foundMeetingCommand;

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

  // Check conversation state from history FIRST
  const lastAssistantMessage =
    history
      .slice()
      .reverse()
      .find((m) => m.role === "assistant")?.content || "";
  let conversationState = "";

  // Determine what state we're in based on last assistant message
  if (
    lastAssistantMessage.includes("What's your name") &&
    !lastAssistantMessage.includes("Message Sent Successfully") &&
    !lastAssistantMessage.includes("Meeting Request Sent Successfully")
  ) {
    conversationState = "awaiting_name";
  } else if (
    lastAssistantMessage.includes("What company are you with") &&
    !lastAssistantMessage.includes("Message Sent Successfully") &&
    !lastAssistantMessage.includes("Meeting Request Sent Successfully")
  ) {
    conversationState = "awaiting_company";
  } else if (
    lastAssistantMessage.includes("email address") &&
    !lastAssistantMessage.includes("Message Sent Successfully") &&
    !lastAssistantMessage.includes("Meeting Request Sent Successfully")
  ) {
    conversationState = "awaiting_email";
  } else if (
    (lastAssistantMessage.includes("What is your message") ||
      lastAssistantMessage.includes("What's your message") ||
      lastAssistantMessage.includes("what would you like to discuss") ||
      lastAssistantMessage.includes(
        "What would you like to discuss in the meeting"
      )) &&
    !lastAssistantMessage.includes("Message Sent Successfully") &&
    !lastAssistantMessage.includes("Meeting Request Sent Successfully")
  ) {
    conversationState = "awaiting_message";
  } else if (
    (lastAssistantMessage.includes("when would you like to schedule") ||
      lastAssistantMessage.includes("What date and time") ||
      lastAssistantMessage.includes(
        "Please provide your preferred date and time"
      )) &&
    !lastAssistantMessage.includes("Meeting Request Sent Successfully")
  ) {
    conversationState = "awaiting_datetime";
  }

  // Check if this is a regular question about Lawrence (not a contact request)
  // BUT ONLY if we're not already in an active contact flow
  const isRegularQuestion =
    conversationState === "" && // Only treat as regular question if NOT in contact flow
    (/^(what|how|when|where|why|who|tell me|so what|can you|could you|is lawrence|does lawrence|has lawrence)/.test(
      lowerMessage
    ) ||
      lowerMessage.includes("about lawrence") ||
      lowerMessage.includes("lawrence up to") ||
      lowerMessage.includes("lawrence doing") ||
      lowerMessage.includes("lawrence currently") ||
      lowerMessage.includes("his experience") ||
      lowerMessage.includes("his skills") ||
      lowerMessage.includes("his projects"));

  let intent: "message" | "meeting" | "question" | null = null;
  if (isMessageCommand) intent = "message";
  else if (isMeetingCommand) intent = "meeting";
  else if (
    (message.includes("?") || isRegularQuestion) &&
    conversationState === ""
  )
    intent = "question"; // Only set question intent if NOT in contact flow

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

  // Only extract specific information based on what state we're in
  // This prevents cross-contamination from conversation context

  if (conversationState === "awaiting_name") {
    // Extract name - only when explicitly asked for name
    const namePatterns = [
      /^([a-z\s]+?)$/i, // Just the name by itself
      /(?:i'm|im|my name is)\s+([a-z\s]+?)(?:[,.]|$)/i,
      /(?:this is|hey)\s+([a-z\s]+?)(?:[,.]|$)/i,
    ];

    for (const pattern of namePatterns) {
      const match = message.match(pattern);
      if (match && match[1] && match[1].trim().length > 0) {
        const name = match[1].trim();
        // Filter out common false positives
        if (
          !["hey", "hi", "hello", "lawrence", "none", "no"].includes(
            name.toLowerCase()
          )
        ) {
          extractedInfo.name = name;
          break;
        }
      }
    }
  } else if (conversationState === "awaiting_company") {
    // Extract company - only when explicitly asked for company
    if (
      message.toLowerCase().trim() === "none" ||
      message.toLowerCase().trim() === "no company"
    ) {
      extractedInfo.company = "None";
    } else {
      const companyPatterns = [
        /^([a-z\s&\.]+?)$/i, // Just the company name by itself
        /(?:from|at|work at)\s+([a-z\s&\.]+?)(?:[,.]|$)/i,
        /company:\s*([a-z\s&\.]+?)(?:\n|$)/i,
      ];

      for (const pattern of companyPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
          extractedInfo.company = match[1].trim();
          break;
        }
      }
    }
  } else if (conversationState === "awaiting_email") {
    // Extract email - only when explicitly asked for email
    const emailMatch = message.match(
      /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i
    );
    if (emailMatch) {
      extractedInfo.email = emailMatch[0];
    }
  } else if (
    conversationState === "awaiting_message" ||
    conversationState === "awaiting_datetime"
  ) {
    // Extract message content - only when explicitly asked for message
    extractedInfo.message = message.trim();
  }

  const isContactRequest =
    (isMessageCommand ||
      isMeetingCommand ||
      (conversationState !== "" && conversationState !== "completed")) &&
    !isRegularQuestion;

  // Debug logging
  console.log("DEBUG: detectContactIntent result:", {
    message,
    lastAssistantMessage,
    conversationState,
    isMessageCommand,
    isMeetingCommand,
    isRegularQuestion,
    isContactRequest,
    intent,
    extractedInfo,
  });

  return {
    isContactRequest,
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
async function generateContactResponse(
  intent: "message" | "meeting" | "question" | null,
  extractedInfo: any,
  message: string,
  history: Array<{ role: string; content: string }>,
  conversationState?: string
): Promise<string> {
  const { name, company, email, message: userMessage } = extractedInfo;

  // Check what information we have
  const hasName = name && name.length > 0;
  const hasCompany = company && company.length > 0;
  const hasEmail = email && email.length > 0;
  const hasMessage = userMessage && userMessage.length > 0;

  console.log("DEBUG: generateContactResponse called with:", {
    intent,
    conversationState,
    hasName,
    hasCompany,
    hasEmail,
    hasMessage,
    extractedInfo,
  });

  if (intent === "message") {
    // Step 1: Initial /message command
    if (message.toLowerCase().trim().startsWith("/message")) {
      return `I'll help you send a message to Lawrence! What's your name?`;
    }

    // Step 2: Handle name input
    if (conversationState === "awaiting_name") {
      if (hasName) {
        return `Nice to meet you, ${name}! What company are you with? (Type "none" if not applicable)`;
      } else {
        return `I need your name to send the message to Lawrence. Please provide your name.`;
      }
    }

    // Step 3: Handle company input
    if (conversationState === "awaiting_company") {
      if (hasCompany) {
        return `Got it! What's your email address?`;
      } else {
        return `Please provide your company name, or type "none" if not applicable.`;
      }
    }

    // Step 4: Handle email input
    if (conversationState === "awaiting_email") {
      if (hasEmail) {
        return `Perfect! What's your message?`;
      } else {
        return `I need your email address to send the message to Lawrence. Please provide your email address.`;
      }
    }

    // Step 5: User provided message, actually send it!
    if (conversationState === "awaiting_message" && hasMessage) {
      try {
        // Extract all collected information from conversation history
        const collectedInfo = extractContactInfoFromHistory(history, message);

        // Import the contact handler directly to avoid port issues
        const { POST: contactHandler } = await import("../contact/route");

        // Create a mock request object with the correct field names
        const mockRequest = {
          json: async () => ({
            name: collectedInfo.name || "Anonymous",
            email: collectedInfo.email || "",
            subject: `Message from ${collectedInfo.name || "Website Visitor"}${collectedInfo.company && collectedInfo.company !== "none" ? ` (${collectedInfo.company})` : ""}`,
            message:
              collectedInfo.message || userMessage || "No message provided",
          }),
        } as unknown as NextRequest;

        console.log("DEBUG: Calling contact handler directly");
        const response = await contactHandler(mockRequest);
        const result = await response.json();

        console.log("DEBUG: Contact message result:", result);

        if (response.status === 200 && result.message) {
          return "✅ **Message Sent Successfully!**\n\nI've forwarded your message to Lawrence. He'll get back to you soon! 📧";
        } else {
          console.error("DEBUG: Contact message failed:", result);
          return "❌ **Message Send Failed**\n\nI'm sorry, there was an issue sending your message. Please try again or contact Lawrence directly.";
        }
      } catch (error) {
        console.error("DEBUG: Error sending contact message:", error);
        return "❌ **Message Send Failed**\n\nI'm sorry, there was an issue sending your message. Please try again or contact Lawrence directly.";
      }
    }
  }

  if (intent === "meeting") {
    // Step 1: Initial /meeting command
    if (
      message.toLowerCase().trim().startsWith("/meeting") ||
      message.toLowerCase().trim().startsWith("/meet")
    ) {
      return `I'll help you schedule a meeting with Lawrence! What's your name?`;
    }

    // Step 2: Handle name input
    if (conversationState === "awaiting_name") {
      if (hasName) {
        return `Nice to meet you, ${name}! What company are you with? (Type "none" if not applicable)`;
      } else {
        return `I need your name to schedule the meeting with Lawrence. Please provide your name.`;
      }
    }

    // Step 3: Handle company input
    if (conversationState === "awaiting_company") {
      if (hasCompany) {
        return `Got it! What's your email address?`;
      } else {
        return `Please provide your company name, or type "none" if not applicable.`;
      }
    }

    // Step 4: Handle email input
    if (conversationState === "awaiting_email") {
      if (hasEmail) {
        return `Perfect! What would you like to discuss in the meeting?`;
      } else {
        return `I need your email address to schedule the meeting with Lawrence. Please provide your email address.`;
      }
    }

    // Step 5: User provided meeting message, ask for date/time
    if (conversationState === "awaiting_message" && hasMessage) {
      return `Great! When would you like to schedule the meeting? Please provide your preferred date and time.`;
    }

    // Step 6: User provided date/time, actually send the meeting request!
    if (conversationState === "awaiting_datetime") {
      try {
        // Extract all collected information from conversation history
        const collectedInfo = extractContactInfoFromHistory(history, message);

        // Prepare meeting data with all collected information
        const meetingData = {
          requesterName: collectedInfo.name || "Anonymous",
          requesterEmail: collectedInfo.email || "",
          company: collectedInfo.company || "",
          position: "", // Could be extracted from conversation if needed
          message: `Meeting Request Details:\n\nTopic: ${collectedInfo.message || "No topic specified"}\nPreferred Date/Time: ${message}\n\nRequested via chatbot conversation flow.`,
          conversationContext: JSON.stringify(history),
          fileAnalysis: "",
          attachments: undefined,
        };

        console.log("DEBUG: Sending meeting request with data:", meetingData);

        // Actually send the meeting request email
        const meetingResult = await sendMeetingRequest(meetingData);

        if (meetingResult.success) {
          return `✅ **Meeting Request Sent Successfully!**\n\nI've forwarded your meeting request to Lawrence with your preferred time. He'll reach out to confirm the meeting details!\n\nIs there anything else you'd like to know about Lawrence?`;
        } else {
          return `❌ **Meeting Request Failed**\n\nI'm sorry, there was an issue sending your meeting request. Please try again or contact Lawrence directly at his email.\n\nIs there anything else I can help you with?`;
        }
      } catch (error) {
        console.error("DEBUG: Error sending meeting request:", error);
        return `❌ **Meeting Request Failed**\n\nI'm sorry, there was an issue sending your meeting request. Please try again or contact Lawrence directly.\n\nIs there anything else I can help you with?`;
      }
    }
  }

  // Default response with command instructions
  return `Hi! I'm Lawrence's AI assistant! 🤖 I can help you learn more about his:\n• **Experience** 💼\n• **Skills** 🛠️\n• **Projects** 🚀\n• and more!\n\n**To contact Lawrence:**\n• Type \`/message\` to send a message 📧\n• Type \`/meeting\` to schedule a meeting 📅\n\n**Recruiters:** Drop in a job description to see if Lawrence is a good fit! 📄\n\nWhat would you like to know?`;
}

export async function GET() {
  try {
    console.log("DEBUG: Pre-loading system prompt...");
    await getSystemPrompt();
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
    // Check request size early to prevent memory issues
    const contentLength = request.headers.get("content-length");
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        {
          error: "Request too large. Please upload files smaller than 10MB.",
          maxSize: "10MB",
        },
        { status: 413 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let message: string;
    let files: File[] = [];
    let history: Array<{ role: string; content: string }> = [];
    let sessionIdFromRequest: string | undefined;

    // Handle both JSON and form data requests
    if (contentType.includes("application/json")) {
      // Handle JSON requests (for simple testing and API calls)
      try {
        const jsonData = await request.json();
        message = jsonData.message || "";
        history = jsonData.history || [];
        sessionIdFromRequest = jsonData.sessionId;
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        return NextResponse.json(
          { error: "Invalid JSON in request body" },
          { status: 400 }
        );
      }
    } else {
      // Handle form data requests (for file uploads and regular frontend usage)
      try {
        const formData = await request.formData();
        message = formData.get("message") as string;
        files = formData.getAll("files") as File[];
        const historyString = formData.get("history") as string;
        history = historyString ? JSON.parse(historyString) : [];
        sessionIdFromRequest = formData.get("sessionId") as string;
      } catch (formError) {
        console.error("Form data parsing error:", formError);
        return NextResponse.json(
          { error: "Invalid form data in request" },
          { status: 400 }
        );
      }
    }

    // Generate or use existing session ID for this conversation
    const sessionId = getOrCreateSessionId(sessionIdFromRequest);

    // Process files first to check for image uploads
    let isImageUpload = false;
    let finalMessage = message;
    let hasFiles = false;
    let fileAnalysis = "";
    let detectedPosition: string | null = null;
    const attachments: Array<{
      name: string;
      content: string;
      mimeType: string;
    }> = [];

    if (files.length > 0) {
      hasFiles = true;

      for (const file of files) {
        // Check individual file size (5MB limit per file)
        const maxFileSize = 5 * 1024 * 1024; // 5MB per file
        if (file.size > maxFileSize) {
          const errorResponse = `❌ **File Too Large**\n\nThe file "${file.name}" (${Math.round(file.size / 1024 / 1024)}MB) exceeds the 5MB limit per file.\n\nPlease compress the file or use a smaller version and try again.`;

          await saveMessageToFirebase(sessionId, "assistant", errorResponse);
          return NextResponse.json({
            response: errorResponse,
            error: "File too large",
          });
        }

        const fileResult = await getFileContent(file);

        if (fileResult.originalFile) {
          attachments.push(fileResult.originalFile);
        }

        if (fileResult.content) {
          if (fileResult.type === "image") {
            isImageUpload = true;
            if (!openai) {
              const basicAnalysis = `I can see you've shared an image! This appears to be a job posting or role description. Based on Lawrence's background in Product Management, AI consulting, and full-stack development, he would likely be a strong fit for most product or technical roles.

**Key Strengths:**
• 4+ years Product Management experience
• AI/ML expertise with proven results
• Full-stack technical capabilities
• Startup leadership & cross-functional collaboration

Could you share more details about the specific position you'd like me to analyze?`;

              // Add working links and call-to-action buttons
              const workingLinks = `

**🔗 Explore Lawrence's Work:**
<button-expired>Expired Solutions</button-expired> - AI platform for grocery automation with computer vision
<button-pmhappyhour>PM Happy Hour</button-pmhappyhour> - Community-driven product management platform
<button-projects>Technical Projects</button-projects> - Full-stack applications and ML implementations

**📞 Next Steps:**
Want to discuss this role further? <button-meeting>Schedule a call</button-meeting> or <button-message>Send a quick note</button-message>

**💼 View More:**
You can also scroll down to see his full project portfolio and work experience on this site.`;

              const imageResponse = `📸 **IMAGE UPLOADED & ANALYZED**\n\n${basicAnalysis}${workingLinks}`;

              // Send simple image notification to Lawrence
              try {
                const imageNotification = {
                  requesterName: "Anonymous",
                  requesterEmail: "",
                  company: "",
                  position: "",
                  message: message || "No message provided",
                  conversationContext: "",
                  fileAnalysis:
                    "Image uploaded - OpenAI not available for analysis",
                  attachments: attachments.length > 0 ? attachments : undefined,
                };
                await sendMeetingRequest(imageNotification);
              } catch (emailError) {
                console.error("Image notification send failed:", emailError);
              }

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

If you cannot clearly read the image content, provide a general assessment of Lawrence's strengths for typical product/technical roles.

IMPORTANT: Do not include any placeholder links or markdown links in your response. Focus only on the analysis content. Working links will be added automatically at the end.`;

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

              const rawResponse =
                completion.choices[0]?.message?.content ||
                "I can see the image you've shared. Based on Lawrence's extensive background in Product Management, AI consulting, and technical development, he would be well-suited for most product and technical roles. Could you tell me more about what specific aspects of his background you'd like me to highlight?";

              // Add working links and call-to-action buttons
              const workingLinks = `

**🔗 Explore Lawrence's Work:**
<button-expired>Expired Solutions</button-expired> - AI platform for grocery automation with computer vision
<button-pmhappyhour>PM Happy Hour</button-pmhappyhour> - Community-driven product management platform
<button-projects>Technical Projects</button-projects> - Full-stack applications and ML implementations

**📞 Next Steps:**
Want to discuss this role further? <button-meeting>Schedule a call</button-meeting> or <button-message>Send a quick note</button-message>

**💼 View More:**
You can also scroll down to see his full project portfolio and work experience on this site.`;

              const imageResponse = `📸 **IMAGE UPLOADED & ANALYZED**\n\n${rawResponse}${workingLinks}`;

              // Send simple image notification to Lawrence
              try {
                const imageNotification = {
                  requesterName: "Anonymous",
                  requesterEmail: "",
                  company: "",
                  position: "",
                  message: message || "No message provided",
                  conversationContext: "",
                  fileAnalysis: "AI Vision Analysis: " + rawResponse,
                  attachments: attachments.length > 0 ? attachments : undefined,
                };
                await sendMeetingRequest(imageNotification);
              } catch (emailError) {
                console.error("Image notification send failed:", emailError);
              }

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
              const fallbackAnalysis = `I can see you've shared an image that appears to be a job posting or role description. Based on Lawrence's background:

• **Product Management**: 4+ years experience across multiple companies
• **AI/ML Expertise**: Built AI platforms, GPT integrations, computer vision systems
• **Technical Skills**: Full-stack development, data analysis, enterprise software
• **Leadership**: Founded Expired Solutions, led cross-functional teams
• **Education**: Carnegie Mellon MISM, University of Florida CS

He would be an excellent fit for product, technical, or AI-focused roles. What specific aspects of the position would you like me to address?`;

              // Add working links and call-to-action buttons
              const workingLinks = `

**🔗 Explore Lawrence's Work:**
<button-expired>Expired Solutions</button-expired> - AI platform for grocery automation with computer vision
<button-pmhappyhour>PM Happy Hour</button-pmhappyhour> - Community-driven product management platform
<button-projects>Technical Projects</button-projects> - Full-stack applications and ML implementations

**📞 Next Steps:**
Want to discuss this role further? <button-meeting>Schedule a call</button-meeting> or <button-message>Send a quick note</button-message>

**💼 View More:**
You can also scroll down to see his full project portfolio and work experience on this site.`;

              const fallbackResponse = `📸 **IMAGE UPLOADED & ANALYZED**\n\n${fallbackAnalysis}${workingLinks}`;

              // Send simple image notification to Lawrence
              try {
                const imageNotification = {
                  requesterName: "Anonymous",
                  requesterEmail: "",
                  company: "",
                  position: "",
                  message: message || "No message provided",
                  conversationContext: "",
                  fileAnalysis: "Image uploaded - OpenAI Vision API failed",
                  attachments: attachments.length > 0 ? attachments : undefined,
                };
                await sendMeetingRequest(imageNotification);
              } catch (emailError) {
                console.error("Image notification send failed:", emailError);
              }

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

    // Enhanced contact intent detection (only if not an image upload)
    const contactAnalysis = isImageUpload
      ? {
          isContactRequest: false,
          intent: null,
          extractedInfo: {},
          conversationState: "",
        }
      : detectContactIntent(message, history);

    // PHASE 2 OPTIMIZATIONS: Multiple layers of speed improvements

    // 1. Check for instant responses first (0ms response time)
    const instantResponse = getInstantResponse(message);
    if (instantResponse) {
      await saveMessageToFirebase(sessionId, "assistant", instantResponse);
      return NextResponse.json({
        response: instantResponse,
        instant: true,
        responseTime: 0,
      });
    }

    // 2. Check advanced cache with LRU eviction
    const messageHash = getMessageHash(message);
    const cachedResponse = getCachedResponse(messageHash);
    if (cachedResponse) {
      await saveMessageToFirebase(sessionId, "assistant", cachedResponse);
      return NextResponse.json({
        response: cachedResponse,
        cached: true,
      });
    }

    // 3. Check for fun fact requests (fast path)
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

      // Generate response based on available information (conversation continues)
      const response = await generateContactResponse(
        contactAnalysis.intent ||
          (historyContactInfo.isContactRequest ? "message" : null),
        contactAnalysis.extractedInfo,
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

    // 4. Optimized system prompt loading with reduced token limit
    const systemPrompt = await getSystemPrompt(1500); // Reduced for speed

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
        attachments: attachments.length > 0 ? attachments : undefined,
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

    // 5. Optimized conversation preparation
    const enhancedSystemPrompt = `${systemPrompt}

CONTEXT: ${history.length > 0 ? `Previous: ${JSON.stringify(history.slice(-3))}` : "Start of conversation"}

GUIDELINES: Be conversational, concise, and helpful. Reference context when relevant.`;

    const messages = [
      { role: "system" as const, content: enhancedSystemPrompt },
      { role: "user" as const, content: userMessage },
    ];

    // 6. Use optimized completion with smart model selection
    const isComplexQuery = userMessage.length > 150 || history.length > 8;
    const response = await getOptimizedCompletion(
      messages,
      300, // Reduced max tokens for speed
      isComplexQuery // Only use GPT-4 for complex queries
    );

    // 7. Parallel operations: Cache and save simultaneously
    const [_cacheResult, _firebaseResult] = await Promise.all([
      Promise.resolve(setCachedResponse(messageHash, response)),
      saveMessageToFirebase(sessionId, "assistant", response),
    ]);

    return NextResponse.json({
      response,
      optimized: true,
      model: isComplexQuery ? "gpt-4" : "gpt-3.5-turbo",
    });
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
