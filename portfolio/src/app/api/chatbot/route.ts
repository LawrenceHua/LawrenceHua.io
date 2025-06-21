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
- **Extract information naturally** from messages rather than asking for structured formats
- When someone wants to contact Lawrence, be smart about gathering details organically
- **Recognize contact intent** from phrases like "send a message", "tell Lawrence", "contact me back"
- If someone provides invalid/Lawrence's own email, **gently point it out** and ask for their correct email
- **Context awareness** - remember what was said earlier in the conversation
- Keep responses **concise but friendly** (2-3 bullet points max)
- **Bold** key achievements and technical skills
- Always offer to **help connect them with Lawrence** for detailed discussions

**CORE COMPETENCIES:**
AI/ML, Product Strategy, Computer Vision, GPT Integration, Enterprise Software, Startup Leadership, Cross-functional Teams

**CONTACT HANDLING:**
- When someone wants to send a message to Lawrence, extract their name, email, and message naturally
- Don't ask for rigid formats - be conversational
- If information is missing, ask for it naturally in conversation`;
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

// Enhanced function to detect contact intent and extract information naturally
function detectContactIntent(message: string): {
  isContactRequest: boolean;
  intent: "message" | "meeting" | "question" | null;
  extractedInfo: {
    name?: string;
    email?: string;
    company?: string;
    message?: string;
  };
} {
  const lowerMessage = message.toLowerCase();

  // Contact intent patterns
  const contactPatterns = [
    /send (?:a )?message/i,
    /tell lawrence/i,
    /contact (?:me|him)/i,
    /get in touch/i,
    /reach out/i,
    /getting in touch/i,
    /send that message/i,
    /forward (?:this|that)/i,
    /let (?:him|lawrence) know/i,
  ];

  const meetingPatterns = [
    /schedule/i,
    /meeting/i,
    /call/i,
    /interview/i,
    /discuss/i,
    /talk/i,
    /connect/i,
    /book/i,
    /arrange/i,
    /set up/i,
    /coordinate/i,
    /meet/i,
    /conference/i,
  ];

  const isContactRequest = contactPatterns.some((pattern) =>
    pattern.test(message)
  );
  const isMeetingRequest = meetingPatterns.some((pattern) =>
    pattern.test(message)
  );

  let intent: "message" | "meeting" | "question" | null = null;
  if (isContactRequest) intent = "message";
  else if (isMeetingRequest) intent = "meeting";
  else if (message.includes("?")) intent = "question";

  // Enhanced extraction
  const extractedInfo: any = {};

  // Extract name (more patterns)
  const namePatterns = [
    /(?:i'm|im|my name is)\s+([a-z\s]+?)(?:[,.]|$)/i,
    /(?:this is|hey)\s+([a-z\s]+?)(?:[,.]|$)/i,
    /^([a-z\s]+?)(?:\s+here|,)/i,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].trim().length > 0) {
      const name = match[1].trim();
      // Filter out common false positives
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

  // Extract email
  const emailMatch = message.match(
    /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i
  );
  if (emailMatch) {
    extractedInfo.email = emailMatch[0];
  }

  // Extract company
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

  // Extract message content (what they want to tell Lawrence)
  let messageContent = "";

  // Remove extracted info to get the core message
  let cleanMessage = message;
  if (extractedInfo.name) {
    cleanMessage = cleanMessage.replace(
      new RegExp(
        `(?:i'm|im|my name is|this is|hey)\\s+${extractedInfo.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "gi"
      ),
      ""
    );
  }
  if (extractedInfo.email) {
    cleanMessage = cleanMessage.replace(extractedInfo.email, "");
  }
  if (extractedInfo.company) {
    cleanMessage = cleanMessage.replace(
      new RegExp(
        `(?:from|at|work at)\\s+${extractedInfo.company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "gi"
      ),
      ""
    );
  }

  // Clean up and get the core message
  messageContent = cleanMessage
    .replace(/[,;.]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^(hey|hi|hello)\s*/i, "")
    .replace(/\s*(thanks?|thank you)\s*$/i, "")
    .trim();

  if (messageContent && messageContent.length > 5) {
    extractedInfo.message = messageContent;
  }

  return {
    isContactRequest: isContactRequest || isMeetingRequest,
    intent,
    extractedInfo,
  };
}

// Enhanced function to generate conversational responses
function generateContactResponse(
  intent: "message" | "meeting" | "question" | null,
  extractedInfo: any,
  message: string,
  history: Array<{ role: string; content: string }>
): string {
  const { name, email, company, message: userMessage } = extractedInfo;

  // Check what information we have and what we need
  const hasName = name && name.length > 0;
  const hasEmail = email && email.length > 0;
  const hasMessage = userMessage && userMessage.length > 0;

  if (intent === "message") {
    if (hasName && hasEmail && hasMessage) {
      // We have everything - confirm and send
      return `Perfect! I'll send your message to Lawrence right away:\n\n**From:** ${name}${company ? ` (${company})` : ""}\n**Email:** ${email}\n**Message:** ${userMessage}\n\nLawrence will get back to you soon! 📧`;
    } else if (hasName && hasEmail) {
      // Missing message content
      return `Great${name ? ` ${name}` : ""}! I have your contact info. What message would you like me to send to Lawrence?`;
    } else if (hasName && hasMessage) {
      // Missing email
      return `Thanks${name ? ` ${name}` : ""}! I'd be happy to forward your message to Lawrence. What's your email address so he can get back to you?`;
    } else if (hasEmail && hasMessage) {
      // Missing name
      return `I'd be happy to send that message to Lawrence! Could you tell me your name so I can include it in the message?`;
    } else if (hasName) {
      // Only have name
      return `Hi ${name}! I'd be happy to help you get in touch with Lawrence. What's your email address and what message would you like me to send him?`;
    } else if (hasEmail) {
      // Only have email
      return `I'd be happy to forward a message to Lawrence! Could you tell me your name and what you'd like to say?`;
    } else {
      // No useful info extracted
      return `I'd be happy to help you get in touch with Lawrence! Could you share your name, email, and what message you'd like me to send him?`;
    }
  }

  if (intent === "meeting") {
    if (hasName && hasEmail) {
      return `Absolutely${name ? ` ${name}` : ""}! I'll help you schedule a meeting with Lawrence. I've noted your details and he'll reach out to coordinate a time that works for both of you. 📅`;
    } else {
      return `I'd be happy to help you schedule a meeting with Lawrence! Could you share your name and email so he can reach out to coordinate?`;
    }
  }

  // Default for other intents
  return `Hi${name ? ` ${name}` : ""}! I'm Lawrence's AI assistant! 🤖 I can help you learn more about his:\n\n• **Experience** 💼\n• **Skills** 🛠️\n• **Projects** 🚀\n• and more!\n\n**Recruiters:** Drop in a job description to see if Lawrence is a good fit, or I can help you contact him directly! 📄\n\nWhat would you like to know?`;
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

    // Enhanced contact intent detection
    const contactAnalysis = detectContactIntent(message);
    console.log("DEBUG: Contact analysis:", contactAnalysis);

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
            return NextResponse.json({
              response: `📷 **Image Analysis**\n\nI can see you've shared an image with me! Based on your message "${message}", this appears to be something relevant to Lawrence's professional background.\n\nIf this is a:\n• **Business card or contact info**: I can help you understand how to connect with Lawrence about potential opportunities\n• **Job posting**: I can analyze how Lawrence's experience aligns with the requirements\n• **Resume or CV**: I can compare qualifications and highlight relevant experience\n• **Company information**: I can explain how Lawrence's skills might fit your organization\n\nCould you tell me more about what specific information you're looking for? I'd be happy to provide detailed insights about Lawrence's background and how it relates to what you've shared!`,
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

    // Check for girlfriend easter egg
    const easterEggResponse = await handleGirlfriendEasterEgg(
      userMessage,
      history,
      openai
    );
    if (easterEggResponse) {
      return NextResponse.json(easterEggResponse);
    }

    // Handle contact requests with enhanced natural language processing
    if (contactAnalysis.isContactRequest) {
      console.log("DEBUG: Detected contact request intent");

      const response = generateContactResponse(
        contactAnalysis.intent,
        contactAnalysis.extractedInfo,
        message,
        history
      );

      // If we have complete information, actually send the message
      const {
        name,
        email,
        message: userMessageContent,
      } = contactAnalysis.extractedInfo;
      if (
        name &&
        email &&
        userMessageContent &&
        contactAnalysis.intent === "message"
      ) {
        try {
          // Send the contact request
          const contactData = {
            requesterName: name,
            requesterEmail: email,
            company: contactAnalysis.extractedInfo.company || "",
            position: detectedPosition || "",
            message: userMessageContent,
            conversationContext:
              history.length > 0 ? JSON.stringify(history) : undefined,
            fileAnalysis: hasFiles ? fileAnalysis : undefined,
          };

          const contactResult = await sendMeetingRequest(contactData);

          if (contactResult.success) {
            return NextResponse.json({
              response: `✅ **Message Sent Successfully!**\n\nI've forwarded your message to Lawrence:\n\n**From:** ${name}${contactAnalysis.extractedInfo.company ? ` (${contactAnalysis.extractedInfo.company})` : ""}\n**Message:** ${userMessageContent}\n\nLawrence will get back to you at **${email}** soon! 📧`,
              contactSent: true,
            });
          }
        } catch (error) {
          console.error("DEBUG: Error sending contact request:", error);
        }
      }

      return NextResponse.json({
        response,
        contactIntent: true,
      });
    }

    // Handle regular responses
    if (!openai) {
      return NextResponse.json({
        response:
          "I'm sorry, I'm not configured to respond right now. Please reach out to Lawrence directly!",
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

      return NextResponse.json({
        response: `🤝 **Meeting Request Sent!**\n\n${meetingResult.message}\n\nLawrence will review your request and contact you soon to schedule a meeting. In the meantime, feel free to ask me any other questions about Lawrence's background and experience.`,
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
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chatbot route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
