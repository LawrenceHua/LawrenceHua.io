import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import { formatMessage } from "../../../lib/messageFormatter";

// Import Firebase modules
import {
  initializeApp,
  getApps,
} from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";

// Import girlfriend easter egg handler
import { handleGirlfriendEasterEgg } from "./girlfriend-easter-egg";

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

// Clear cache immediately to force reload of new system prompt
systemPromptCache = null;
cacheTimestamp = 0;

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

// Instant responses optimized for performance
const instantResponses = new Map([
  [
    "skills",
    `**🛠️ Lawrence's Core Skills & Expertise:**

**🎯 Product Management (2+ years professional experience)**
• Product strategy, roadmapping, stakeholder management
• A/B testing, analytics, user research, competitive analysis
• Cross-functional team leadership (led 20+ person teams)
• Go-to-market strategy, product-market fit validation

**🤖 AI/ML Specialization**
• Computer Vision (YOLO, object detection), NLP, GPT integration
• Model training, fine-tuning, deployment, performance optimization
• Prompt engineering, AI product strategy, ethical AI implementation
• Applied AI: food waste detection, content generation, tutoring automation

**💻 Technical Stack**
• Languages: Python, JavaScript, TypeScript, Java, C++
• Frameworks: React, Next.js, Flask, TensorFlow, PyTorch
• Cloud: AWS, Firebase, Google Cloud, Azure AI services
• Tools: Git, Docker, Figma, Notion, Google Analytics

**📈 Business & Analytics**
• Data analysis, forecasting, market sizing, financial modeling
• Startup experience (founded company, raised funding interest)
• Client management, consulting, project delivery
• Public speaking, presentation skills, technical writing

**Recent Applications:**
• Built $200M+ value AI platform (Expired Solutions)
• Scaled Discord community 30% using AI content strategy
• Automated workflows saving 15+ hours/week (Tutora)

<button-projects>💻 See Projects</button-projects> <button-experience>🚀 Full Background</button-experience> <button-message>📧 Let's Talk Skills</button-message>

**Quick Actions:** <button-meeting>📅 Schedule Call</button-meeting> <button-upload>📎 Share Job Description</button-upload> <button-funfact>🎲 Fun Fact</button-funfact>`,
  ],
  [
    "experience",
    `**🚀 Lawrence Hua - AI Product Builder (9+ Years Impact):**

**🎯 Currently seeking first full-time AI Product Manager role!**

**Current Active Roles:**
• **External AI Expert - Amazon MTurk** (Jun 2025-Present) - Evaluating AGI models for Amazon's next-gen AI development
• **Product Manager - PM Happy Hour** (Mar 2025-Present) - Scaled Discord 30%, viral MBTI campaign (75+ reactions), 20% retention boost <button-pmhappyhour>Visit Site</button-pmhappyhour> <button-pmhappyhour-work>View AI Work</button-pmhappyhour-work>
• **Founder & CEO - Expired Solutions** (Aug 2024-Present) - AI food waste platform, $200M+ projected value, 50% quality check time reduction, McGinnis VC Finalist <button-expired>View Platform</button-expired>
• **AI Product Consultant - Tutora** (Mar 2021-Present, 4+ years) - Automated workflows saving 15+ hours/week, boosted test scores 35% across 50+ students <button-tutora>Visit Tutora</button-tutora>

**Key Past Achievements:**
• **Giant Eagle Team Lead** (Feb-May 2025) - Cut produce shrink 1% in 30 days, tripled Flashfoods adoption, doubled audits
• **Motorola Android Engineer** (Aug 2021-Aug 2023) - Shipped features to 15k+ radios, won 1st place hackathon, cut delays 25%
• **Kearney Tech Lead** (Sep-Dec 2024) - Built LLM tool cutting decision time 18hrs/week (26% faster), led stakeholder demos

**🎓 Education:** Carnegie Mellon MISM '24 (McGinnis Finalist, Gerhalt Scholar), University of Florida CS Cum Laude

**Awards:** McGinnis VC Finalist, Motorola Hackathon Winner, Gerhalt Sandbox Scholar

<button-skills>🛠️ Technical Skills</button-skills> <button-projects>💻 View Projects</button-projects> <button-message>📧 Let's Connect</button-message>

**Quick Actions:** <button-meeting>📅 Book Call</button-meeting> <button-upload>📎 Share Job Description</button-upload> <button-funfact>🎲 Fun Fact About Me</button-funfact>`,
  ],
  [
    "projects",
    `**💻 Lawrence's Most Impactful Projects:**

**🥑 Expired Solutions - AI Food Waste Platform (Founder & CEO)**
• **Impact:** $200M+ projected value, 50% faster quality checks, 20% shrink reduction forecast
• **Technology:** Computer Vision (YOLO) + GPT-4 fine-tuning on Azure, real-time pricing automation
• **Achievement:** McGinnis VC Finalist after pitching to Giant Eagle C-Suite, shopper app + retailer dashboard
<button-expired>View Platform</button-expired>

**📈 PM Happy Hour Community Growth (Product Manager)**
• **Impact:** 30% Discord growth, 75+ reactions on viral MBTI campaign, 20% retention boost via A/B testing
• **Strategy:** AI content roadmap using Notion AI + Sora for video generation, live feedback loops
<button-pmhappyhour>Visit Community</button-pmhappyhour> <button-pmhappyhour-work>See AI Content Work</button-pmhappyhour-work>

**🎓 Tutora AI Automation (EdTech Consultant, 4+ years)**
• **Impact:** 15 hours/week saved through automation, 35% test score improvement across 50+ students
• **Innovation:** Scheduling/grading/substitution workflows using OpenAI + Google Scripts, 50+ custom TI-BASIC programs
<button-tutora>Visit Platform</button-tutora>

**🎬 Netflix KNN Recommendation System (ML Engineering)**
• **Scale:** 10M+ reviews analyzed with KNN model achieving 94% accuracy, Apache Kafka + SVD comparison
• **Testing:** A/B testing framework for recommendation performance, Grafana visualization dashboards
<button-netflix>View ML Project</button-netflix>

**⚡ Additional Impact:**
• **Kearney Decision Intelligence Tool** - 26% faster decision-making, saving 18 hours/week for enterprise teams
• **Motorola NFC Prototype** - 1st place hackathon winner, improved push-to-talk response times
• **Giant Eagle Shrink Optimization** - 1% reduction in 30 days, tripled Flashfoods adoption

<button-experience>📋 Full Experience</button-experience> <button-skills>🛠️ Technical Skills</button-skills> <button-message>📧 Discuss Projects</button-message>

**Next Steps:** <button-meeting>📅 Schedule Technical Discussion</button-meeting> <button-upload>📎 Share Your Needs</button-upload> <button-funfact>🎲 Behind-the-Scenes Story</button-funfact>`,
  ],
  [
    "education",
    `**🎓 Lawrence's Educational Background:**

**Carnegie Mellon University - Master's in Information Systems Management (2024)**
• Focus: AI/ML, Product Strategy, Data Analytics, Business Intelligence
• McGinnis Venture Competition Finalist (Top-4), Gerhalt Sandbox Scholar
• Capstone: AI-powered business optimization with real industry impact

**University of Florida - Bachelor's Degree, Computer Science (Cum Laude)**
• Strong foundations in algorithms, data structures, software engineering
• Business and technical coursework, cross-disciplinary projects
• Leadership roles in technology and academic organizations

**Continuous Learning & Certifications:**
• AI/ML specializations, product management best practices
• Startup accelerator programs, industry conferences
• Technical workshops, leadership development programs

**Academic Projects:**
• AI research and development with real-world applications
• Product case studies and comprehensive market analysis
• Cross-functional team leadership and project management

<button-projects>💻 View Portfolio</button-projects> <button-expired>🚀 Startup Project</button-expired> <button-skills>🛠️ Technical Skills</button-skills>

**Get Connected:**
<button-message>📧 Send Message</button-message> <button-meeting>📅 Book Call</button-meeting> <button-funfact>🎲 Fun Fact</button-funfact>`,
  ],
  [
    "contact",
    `**📞 Ready to Connect with Lawrence?**

**What Lawrence is Looking For:**
🎯 AI Product Manager or Associate PM roles at innovative companies
🚀 Startup opportunities in AI/ML space with growth potential
🤝 Consulting projects in product strategy and AI implementation
💡 Speaking engagements and industry panel discussions

**Current Availability:**
• Open to immediate opportunities and can start discussions right away
• Flexible on location (remote/hybrid/onsite) based on role requirements
• Available for project consulting and advisory positions

**Best Ways to Connect:**
<button-message>📧 Send Direct Message</button-message> <button-meeting>📅 Book Discovery Call</button-meeting> <button-upload>📎 Upload Job Description</button-upload>

**While You're Here, Explore:**
<button-projects>💻 View Projects</button-projects> <button-experience>🚀 See Experience</button-experience> <button-skills>🛠️ Technical Skills</button-skills>

**Keep Exploring:**
<button-funfact>🎲 Fun Fact</button-funfact> <button-generate-question>💡 Generate Question</button-generate-question>

Click any button above for instant assistance, or tell me what you'd like to discuss!`,
  ],
  [
    "ai",
    `**🤖 Lawrence's AI/ML Expertise:**

**Core AI Technologies:**
• **Computer Vision:** Expiration date detection, image processing, YOLO object detection
• **Natural Language Processing:** Chatbots, content generation, sentiment analysis
• **Machine Learning:** Model training/optimization/deployment, performance tuning
• **GPT Integration:** API usage, prompt engineering, fine-tuning, RAG implementation

**Technical AI Stack:**
• **Languages:** Python, JavaScript, TypeScript for AI development
• **ML Frameworks:** TensorFlow, PyTorch, scikit-learn, Hugging Face Transformers
• **AI Tools:** OpenAI APIs, LangChain, Azure AI services, Google Cloud AI
• **Infrastructure:** Firebase, AWS, Docker for model deployment and scaling

**Real-World AI Applications:**
• **Expired Solutions:** Computer vision for food waste reduction ($200M+ projected value) <button-expired>View Platform</button-expired>
• **Tutora:** AI tutoring optimization achieving 35% better outcomes across 50+ students <button-tutora>Visit Tutora</button-tutora>
• **Amazon MTurk:** AI model evaluation and training for next-generation systems <button-mturk>Learn More</button-mturk>
• **PM Happy Hour:** AI content generation campaigns driving 30% community growth <button-pmhappyhour>Visit Community</button-pmhappyhour> <button-pmhappyhour-work>View AI Work</button-pmhappyhour-work>

**AI Product Strategy Expertise:**
• Model selection, evaluation, and performance optimization for business goals
• User experience design for AI-powered features and seamless integration
• Ethical AI implementation, bias mitigation, and responsible AI practices
• Scaling AI solutions from prototype to production with measurable impact

<button-expired>🥑 Food Waste AI</button-expired> <button-tutora>🎓 EdTech AI</button-tutora> <button-pmhappyhour-work>📊 AI Content Work</button-pmhappyhour-work>

**Next Steps:** <button-message>📧 Discuss AI Projects</button-message> <button-meeting>📅 Schedule AI Chat</button-meeting> <button-projects>💻 View All Projects</button-projects>

**Learn More:**
<button-experience>🚀 Full Background</button-experience> <button-funfact>🎲 Fun AI Fact</button-funfact>`,
  ],
]);

// Improved pattern matching for natural language queries
const quickPatterns = [
  {
    // Skills and technical abilities - more natural patterns
    patterns: [
      /^(what are )?lawrence'?s? (key |main )?skills?( and .+)?$/i,
      /^(what are )?lawrence'?s? (key |main )?(technical )?(skills?|abilities?)( and .+)?$/i,  
      /^skills?$/i,
      /^technical skills?$/i,
      /^tech stack$/i,
      /^abilities$/i,
      /^tell me about lawrence'?s? skills?$/i,
      /^show me lawrence'?s? skills?$/i,
      /^lawrence'?s? skills?$/i,
      /lawrence'?s? .*(skills?|abilities|technical)/i
    ],
    response: "skills",
  },
  {
    // Projects and portfolio
    patterns: [
      /^(show me )?lawrence'?s? (most impressive |key |main )?projects?$/i,
      /^(what are )?lawrence'?s? projects?$/i,
      /^projects?$/i,
      /^portfolio$/i,
      /^work$/i,
      /^showcase$/i,
      /^tell me about lawrence'?s? projects?$/i,
      /^show me lawrence'?s? (most impressive |key |main )?projects?$/i,
      /^lawrence'?s? projects?$/i,
      /^lawrence'?s? work$/i
    ],
    response: "projects",
  },
  {
    // Experience and background
    patterns: [
      /^(tell me about )?lawrence'?s? (work )?experience( and background)?$/i,
      /^lawrence'?s? background$/i,
      /^experience$/i,
      /^background$/i,
      /^history$/i,
      /^tell me about lawrence$/i,
      /^what has lawrence done$/i
    ],
    response: "experience",
  },
  {
    // Education
    patterns: [
      /^education$/i,
      /^degree$/i,
      /^school$/i,
      /^university$/i,
      /^lawrence'?s? education$/i
    ],
    response: "education",
  },
  {
    // Contact
    patterns: [
      /^contact$/i,
      /^connect$/i,
      /^reach$/i,
      /^touch$/i,
      /^get in touch$/i,
      /^contact lawrence$/i
    ],
    response: "contact",
  },
  {
    // AI topics
    patterns: [
      /^ai$/i,
      /^artificial intelligence$/i,
      /^machine learning$/i,
      /^ml$/i,
      /^lawrence'?s? ai( experience)?$/i
    ],
    response: "ai",
  },
];

// Common responses for instant replies
const commonResponses = {
  greeting:
    "👋 Hi! I'm Lawrence's AI assistant. I can help you learn about his experience, skills, and projects. What would you like to know?",
  skills:
    "Lawrence has expertise in Product Management, AI/ML, full-stack development, and startup leadership. He's built AI platforms, led cross-functional teams, and has 2+ years of PM experience across 9+ years total work experience.",
  experience:
    "Lawrence has 2+ years of product management experience including PM internships, founding his own startup, and consulting. With 9+ years total work experience across technology, retail, and education, he brings a unique blend of technical depth and product leadership.",
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

// Smart pattern matching for natural language queries
function getInstantResponse(message: string): string | null {
  const trimmedMessage = message.trim();

  // Check regex patterns for more natural language matching
  for (const pattern of quickPatterns) {
    for (const regex of pattern.patterns) {
      if (regex.test(trimmedMessage)) {
      const response = instantResponses.get(pattern.response);
      if (response) {
        return response;
        }
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

    // Complete system prompt with latest data from experience.txt
    const systemPrompt = `You are Lawrence Hua's AI assistant. Speak in his voice: concise, confident, and impact-oriented. Use first-person ("I") and showcase measurable achievements.

CRITICAL FORMATTING RULES:
1. Keep emojis with titles: "🎯 **Current Focus**: text" (NOT separate lines)  
2. Use button tags: <button-expired>View Expired Solutions</button-expired>
3. End EVERY response with 2-3 action buttons
4. Always include quantified impact (percentages, dollars, time saved)
5. Be natural, conversational, and prove value in every response

LAWRENCE'S CURRENT ROLES & ACHIEVEMENTS:
**🎯 Current Focus**: Seeking first full-time AI Product Manager role

**Active Positions:**
• **External AI Expert - Amazon MTurk** (Jun 2025-Present): Evaluating AGI models, contributing to Amazon's next-gen AI development
• **Product Manager - PM Happy Hour** (Mar 2025-Present): Scaled Discord 30%, viral MBTI campaign (75+ reactions), 20% retention boost via A/B testing <button-pmhappyhour>Visit the site</button-pmhappyhour>
• **Founder & CEO - Expired Solutions** (Aug 2024-Present): AI food waste platform, $200M+ projected value, 50% quality check time reduction, McGinnis VC Finalist <button-expired>View Expired Solutions</button-expired>  
• **AI Consultant - Tutora** (Mar 2021-Present, 4+ years): Saved 15hrs/week with AI workflows, boosted test scores 35% across 50+ students <button-tutora>Visit Tutora Website</button-tutora>

**Key Past Experience:**
• **Giant Eagle Produce Team Lead** (Feb-May 2025): Cut shrink 1% in 30 days, tripled Flashfoods adoption, doubled audits
• **Motorola Android Engineer** (Aug 2021-Aug 2023): Shipped features to 15k+ radios, won 1st place hackathon, cut delays 25%
• **Kearney Tech Lead** (Sep-Dec 2024): Built LLM tool cutting decision time 18hrs/week, led stakeholder demos

**📚 Education**: Carnegie Mellon MISM '24 (McGinnis Finalist, Gerhalt Scholar), University of Florida CS Cum Laude

**🛠 Core Skills**: Product Management (2+ yrs professional), AI/ML (Computer Vision, NLP, GPT), Full-stack (Python, React, Android), Leadership (led 20-person teams), Data Analytics (A/B testing, forecasting)

**Key Projects:**
• <button-expired>Expired Solutions</button-expired> - AI grocery waste platform (CV + GPT)
• <button-pmhappyhour>PM Happy Hour</button-pmhappyhour> - Community growth (30% increase)
• <button-tutora>Tutora AI</button-tutora> - EdTech automation (35% score improvement)
• <button-netflix>Netflix KNN Model</button-netflix> - ML recommendation system

**Awards:** McGinnis VC Finalist, Motorola Hackathon Winner, Gerhalt Sandbox Scholar

AVAILABLE BUTTONS:
Projects: <button-expired>, <button-pmhappyhour>, <button-tutora>, <button-netflix>, <button-projects>
Actions: <button-message>📧 Send Message</button-message>, <button-meeting>📅 Book Call</button-meeting>, <button-upload>📎 Upload Job</button-upload>
Topics: <button-experience>, <button-skills>, <button-funfact>, <button-generate-question>

Always prove Lawrence's value with specific metrics and achievements. Be engaging and ALWAYS end with 2-3 action buttons from the available list. NEVER respond without including buttons.`;

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
  maxTokens: number = 400, // Increased for more intelligent responses
  useAdvancedModel: boolean = false
): Promise<string> {
  if (!openai) {
    return "I'm sorry, the AI service is not available right now.";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: useAdvancedModel ? "gpt-4" : "gpt-3.5-turbo",
      messages,
      max_tokens: maxTokens,
      temperature: 0.3, // Slightly more creative for engaging responses
      stream: false,
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

// Function to write messages to Firebase v2 collections
async function saveMessageToFirebase(
  sessionId: string,
  role: "user" | "assistant",
  message: string,
  userAgent?: string,
  clientIP?: string
) {
  if (!db) {
    console.log("DEBUG: Firebase not initialized, skipping message save");
    return;
  }

  try {
    // Save to new v2 chat messages collection
    await addDoc(collection(db, "analytics_chat_messages_v2"), {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      role,
      content: message,
      timestamp: serverTimestamp(),
      messageLength: message.length,
      hasFiles: false,
      fileTypes: [],
    });
    console.log(`DEBUG: Saved ${role} message to Firebase v2`);
    
    // Also update/create the session record with real data
    await updateSessionRecord(sessionId, role, message, userAgent, clientIP);
  } catch (error) {
    console.error("DEBUG: Error saving message to Firebase v2:", error);
  }
}

// Function to update session records for analytics
async function updateSessionRecord(
  sessionId: string, 
  role: string, 
  message: string, 
  userAgent?: string,
  clientIP?: string
) {
  if (!db) return;
  
  try {
    // Check if session already exists
    const existingSessionsQuery = query(
      collection(db, "analytics_sessions_v2"),
      where("sessionId", "==", sessionId),
      limit(1)
    );
    
    const existingSessionsSnap = await getDocs(existingSessionsQuery);
    
    if (existingSessionsSnap.empty) {
      // Create new session only if it doesn't exist
      const realUserAgent = userAgent || "Unknown Browser";
      const deviceType = determineDeviceType(realUserAgent);
      
      // Fetch geolocation data for new sessions
      let locationData = {
        country: "Unknown",
        region: "Unknown", 
        city: "Unknown",
        ip: clientIP || "Unknown"
      };
      
      try {
        // Call our geolocation API to get real location data
        let geoUrl = "https://ipapi.co/json/";
        if (clientIP && !isLocalIP(clientIP)) {
          geoUrl = `https://ipapi.co/${clientIP}/json/`;
        }
        
        const geoResponse = await fetch(geoUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Portfolio Analytics/1.0)",
          },
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          locationData = {
            country: geoData.country_name || "Unknown",
            region: geoData.region || "Unknown",
            city: geoData.city || "Unknown",
            ip: geoData.ip || clientIP || "Unknown"
          };
          console.log(`DEBUG: Fetched geolocation for session ${sessionId}:`, locationData);
        }
      } catch (geoError) {
        console.log(`DEBUG: Could not fetch geolocation for session ${sessionId}:`, geoError);
      }
      
      const sessionData = {
        sessionId,
        messages: [], // Messages are stored separately in analytics_chat_messages_v2
        startTime: serverTimestamp(),
        endTime: serverTimestamp(),
        messageCount: 1, // Start with 1, will be updated by the analytics provider
        totalDuration: 0, // Would be calculated from start/end times
        userAgent: realUserAgent,
        deviceType,
        location: locationData,
        engagementScore: calculateEngagementScore(message, role),
        isRecruiterSession: isRecruiterMessage(message),
        tags: generateTags(message, role)
      };

      // Save session data only once
      await addDoc(collection(db, "analytics_sessions_v2"), sessionData);
      console.log(`DEBUG: Created new session record for ${sessionId} with real data`);
    } else {
      console.log(`DEBUG: Session ${sessionId} already exists, skipping duplicate creation`);
    }
  } catch (error) {
    console.error("DEBUG: Error updating session record:", error);
  }
}

// Helper function to check if IP is local/private
function isLocalIP(ip: string): boolean {
  return !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.");
}

// Helper functions for session analytics
function determineDeviceType(userAgent: string): "Mobile" | "Desktop" | "Tablet" | "Unknown" {
  if (!userAgent) return "Unknown";
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return "Mobile";
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return "Tablet";
  } else {
    return "Desktop";
  }
}

function calculateEngagementScore(message: string, role: string): number {
  // Simple engagement scoring
  let score = 3.0; // Base score
  
  if (role === "user") {
    if (message.length > 50) score += 1.0;
    if (message.length > 100) score += 1.0;
    if (message.includes("?")) score += 0.5;
    if (message.toLowerCase().includes("resume")) score += 2.0;
    if (message.toLowerCase().includes("meeting")) score += 2.0;
    if (message.toLowerCase().includes("job")) score += 2.0;
  }
  
  return Math.min(10, score);
}

function isRecruiterMessage(message: string): boolean {
  const recruiterKeywords = ["job", "position", "role", "hiring", "resume", "interview", "salary", "meeting", "opportunity"];
  const lowerMessage = message.toLowerCase();
  return recruiterKeywords.some(keyword => lowerMessage.includes(keyword));
}

function generateTags(message: string, role: string): string[] {
  const tags = ["chatbot"];
  const lowerMessage = message.toLowerCase();
  
  if (role === "user") {
    if (lowerMessage.includes("resume")) tags.push("resume-interest");
    if (lowerMessage.includes("meeting")) tags.push("meeting-request");
    if (lowerMessage.includes("job")) tags.push("job-inquiry");
    if (message.length > 100) tags.push("detailed-inquiry");
  }
  
  return tags;
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
    isContactRequest: true, // If this function is called, it's a contact request
  };

  // Simple extraction: look through the conversation for user responses
  for (let i = 0; i < history.length - 1; i++) {
    const current = history[i];
    const next = history[i + 1];
    
    if (current.role === "assistant" && next?.role === "user") {
      const assistantMessage = current.content.toLowerCase();
      const userResponse = next.content.trim();
      
      // Extract name
      if (assistantMessage.includes("what's your name") && !extractedInfo.name) {
        extractedInfo.name = userResponse;
      }
      
      // Extract company 
      if (assistantMessage.includes("what company are you with") && !extractedInfo.company) {
        extractedInfo.company = userResponse;
      }
      
      // Extract email
      if (assistantMessage.includes("email address") && !extractedInfo.email) {
        const emailMatch = userResponse.match(/\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i);
        if (emailMatch) {
          extractedInfo.email = emailMatch[0];
        }
      }
      
      // Extract meeting topic
      if (assistantMessage.includes("what would you like to discuss") && !extractedInfo.message) {
        extractedInfo.message = userResponse;
      }
    }
  }

  // Debug logging
  console.log("DEBUG: extractContactInfoFromHistory result:", extractedInfo);

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
    
    // Additional detection: If assistant mentioned "meeting" or "schedule", it's likely a meeting flow
    if (!intent && lastAssistantMessage.toLowerCase().includes("meeting")) {
      intent = "meeting";
    } else if (!intent && lastAssistantMessage.toLowerCase().includes("message")) {
      intent = "message";
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
  "Lawrence has been banging on drums for 17 years and still can't play 'Wonderwall.' His neighbors have mixed feelings about this.",
  "He'll drink any tea except matcha. Says it tastes like 'disappointed lawn clippings' and stands by this hill he's chosen to die on.",
  "Lawrence versions his life like software. Currently on v2.4.3 with the patch notes: 'Still broke, but now with better error messages.'",
  "Once spent 4 hours debugging code only to realize he forgot to save the file. Twice. In the same day.",
  "His cats Ora and Ory have more successful relationships than most humans. Also more Instagram followers than him.",
  "Tried to impress a date by cooking and somehow managed to burn water. The smoke alarm was not amused.",
  "Built a startup to reduce food waste, then left bananas on his counter until they achieved sentience.",
  "Has a 47-step morning routine that includes checking GitHub, forgetting to brush teeth, remembering to brush teeth, then checking GitHub again.",
  "Once gave a presentation with 73 slides about why presentations should be shorter. The irony was lost on everyone except him.",
  "Owns more programming books than he has time to read, but keeps buying them 'just in case he needs to learn Rust someday.'",
  "Spent his 21st birthday debugging CSS instead of partying. The div was perfectly centered though.",
  "His search history is 50% Stack Overflow, 30% 'how to center a div,' and 20% 'is it normal to talk to your code?'",
  "Once tried to optimize his dating life with a spreadsheet. Spoiler alert: it didn't work, but the pivot tables were flawless.",
  "Has strong opinions about semicolons in JavaScript but can't fold a fitted sheet to save his life.",
  "Told his girlfriend he'd be done with work in '5 minutes' approximately 47 minutes ago. She's stopped believing him.",
  "Built an AI to judge fruit freshness because apparently judging his own life choices wasn't enough.",
  "The type of person who debugs production on a Friday at 5 PM and then wonders why he has trust issues.",
  "Once spent an entire weekend building a script to automate a task that took 10 minutes. He regrets nothing.",
  "His coffee-to-productivity ratio is scientifically fascinating and deeply concerning to medical professionals.",
  "Asked ChatGPT for relationship advice, then realized the AI was giving better suggestions than his friends.",
  "Has a Slack status that permanently says 'debugging life' because it's accurate 98% of the time.",
  "Moved to Pittsburgh for a startup opportunity, proving that love makes you do crazy things. The startup life, not the girlfriend.",
  "His idea of meal prep is ordering Thai food twice a week and calling it 'consistent nutrition planning.'",
  "Once deployed to production without testing locally. Once. He learned that lesson the hard way and now has trust issues with his own code.",
  "Explains programming concepts to his cats. They're surprisingly good listeners and never interrupt with 'why don't you just use WordPress?'"
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

  return `**🎯 Fun Fact About Lawrence:**\n\n${selectedFact}\n\nWant another one? Just ask for another fun fact! 😄`;
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
        // Don't include the datetime message in parsing as it's not part of the Q&A flow
        console.log("DEBUG: About to call extractContactInfoFromHistory in datetime step");
        console.log("DEBUG: History length:", history.length);
        console.log("DEBUG: History:", JSON.stringify(history, null, 2));
        
        const collectedInfo = extractContactInfoFromHistory(history, "");
        
        console.log("DEBUG: Collected info in datetime step:", collectedInfo);

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

    // Extract real user agent and IP for session tracking
    const userAgent = request.headers.get("user-agent") || "Unknown Browser";
    let clientIP = request.headers.get("x-forwarded-for");
    if (clientIP) {
      clientIP = clientIP.split(",")[0].trim();
    } else {
      clientIP = request.headers.get("x-real-ip") || "Unknown";
    }
    
    console.log(`DEBUG: Session ${sessionId} - User Agent: ${userAgent}, IP: ${clientIP}`);

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

          await saveMessageToFirebase(sessionId, "assistant", errorResponse, userAgent, clientIP);
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
• 2+ years Product Management experience (9+ years total experience)
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
Want to discuss this role further? <button-meeting>Book a call</button-meeting> or <button-message>Send a quick note</button-message>

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
                imageResponse,
                userAgent,
                clientIP
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

FORMATTING GUIDELINES:
• Use markdown formatting for headers (### for main sections)
• Use **bold** for emphasis on key points
• Use bullet points (•) for lists, not dashes (-)
• Do NOT include any clickable links or URLs in your response
• Focus on the analysis content. Working buttons and links will be added automatically at the end.`;

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
Want to discuss this role further? <button-meeting>Book a call</button-meeting> or <button-message>Send a quick note</button-message>

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
                imageResponse,
                userAgent,
                clientIP
              );
              return NextResponse.json({
                response: imageResponse,
                imageAnalyzed: true,
              });
            } catch (error) {
              const fallbackAnalysis = `I can see you've shared an image that appears to be a job posting or role description. Based on Lawrence's background:

• **Product Management**: 2+ years experience including internships, founding, and consulting (9+ years total work experience)
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
Want to discuss this role further? <button-meeting>Book a call</button-meeting> or <button-message>Send a quick note</button-message>

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
                fallbackResponse,
                userAgent,
                clientIP
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
    await saveMessageToFirebase(sessionId, "user", userMessage, userAgent, clientIP);

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
      // Apply formatting to instant responses for proper bullet points and buttons
      const formattedResponse = formatMessage(instantResponse);
      await saveMessageToFirebase(sessionId, "assistant", formattedResponse, userAgent, clientIP);
      return NextResponse.json({
        response: formattedResponse,
        instant: true,
        responseTime: 0,
      });
    }

    // 2. Check advanced cache with LRU eviction
    const messageHash = getMessageHash(message);
    const cachedResponse = getCachedResponse(messageHash);
    if (cachedResponse) {
      await saveMessageToFirebase(sessionId, "assistant", cachedResponse, userAgent, clientIP);
      return NextResponse.json({
        response: cachedResponse,
        cached: true,
      });
    }

    // 3. Check for fun fact requests (fast path)
    if (isFunFactRequest(message)) {
      const funFactResponse = getRandomFunFact();
      // Apply formatting to fun fact responses for proper bullet points and buttons
      const formattedFunFactResponse = formatMessage(funFactResponse);
      await saveMessageToFirebase(sessionId, "assistant", formattedFunFactResponse, userAgent, clientIP);
      return NextResponse.json({
        response: formattedFunFactResponse,
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
      await saveMessageToFirebase(sessionId, "assistant", response, userAgent, clientIP);

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
      await saveMessageToFirebase(sessionId, "assistant", fallbackResponse, userAgent, clientIP);

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
      await saveMessageToFirebase(sessionId, "assistant", meetingResponse, userAgent, clientIP);

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
      await saveMessageToFirebase(sessionId, "assistant", fullResponse, userAgent, clientIP);

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
      500, // Increased for more comprehensive responses
      isComplexQuery // Only use GPT-4 for complex queries
    );

    // Apply formatting to OpenAI-generated responses for proper bullet points and buttons
    const formattedResponse = formatMessage(response);

    // 7. Parallel operations: Cache and save simultaneously
    const [_cacheResult, _firebaseResult] = await Promise.all([
      Promise.resolve(setCachedResponse(messageHash, formattedResponse)),
      saveMessageToFirebase(sessionId, "assistant", formattedResponse, userAgent, clientIP),
    ]);

    return NextResponse.json({
      response: formattedResponse,
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
      const userAgent = request.headers.get("user-agent") || "Unknown Browser";
      let clientIP = request.headers.get("x-forwarded-for");
      if (clientIP) {
        clientIP = clientIP.split(",")[0].trim();
      } else {
        clientIP = request.headers.get("x-real-ip") || "Unknown";
      }
      await saveMessageToFirebase(sessionId, "assistant", errorResponse, userAgent, clientIP);
    } catch (firebaseError) {
      console.error("Error saving error response to Firebase:", firebaseError);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
