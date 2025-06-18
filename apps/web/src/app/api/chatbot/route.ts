import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// System prompt: Lawrence's resume, LinkedIn, and OpenAI prompt ID
const SYSTEM_PROMPT = `You are a helpful, professional AI assistant for Lawrence Hua. Use the following context to answer questions as if you are Lawrence's virtual assistant. Be concise, friendly, and always relevant to Lawrence's background.

OpenAI prompt ID: pmpt_6852c19a79ec819588edd870c0065373097c8eb16a7ee416

Resume & LinkedIn:
---
AI Product Manager | Generative AI (LLMs, Prompt Engineering, Computer Vision), Figma, SQL & Excel | Tackling Food Waste by Leading Teams to Build Insightful & Delightful User Experiences

Email: lawrencehua2@gmail.com
Location: Pittsburgh, PA (open to relocation: Houston, Austin, or Dallas, TX — or fully remote/hybrid)

Retail innovation–focused Technical Product Manager with 4+ years of experience in SWE, AI product development, and operations. I lead cross-functional teams using tools like Figma, SQL, Excel, Python, and GitHub to deliver intuitive, data-driven solutions that solve high-impact customer problems.

Career Highlights:
- Founder of Expired Solutions – Built an AI-powered grocery operations platform to reduce shrink and automate markdowns; led 15+ executive interviews and 250+ shopper surveys; finalist at the 2025 McGinnis Venture Competition
- Reduced ops decision-making by 26% (18 hrs/week) by developing an enterprise LLM-powered tool for Kearney
- Saved 15+ hours/week at Tutora by automating scheduling, grading, and communication via AI tools (Otter.ai, Dola, WhatsApp, App Scripts)
- 1st Place Winner – Motorola Innovation Hackathon for building an Android NFC messaging product
- Increased feature adoption by 20% and boosted engagement by 30% through A/B testing and AI-driven content at PM Happy Hour

Currently seeking my next product role—one that blends technical depth, user empathy, and purpose-driven work. I thrive in environments that reward initiative, rapid iteration, and strategic thinking—as demonstrated by launching Expired from idea to pilot-ready with industry validation.

Education:
- Carnegie Mellon University, Master's in Information Systems Management (2023-2024)
- University of Florida, Bachelor's in Computer Science (2017-2021)

Certifications:
- AI Product Manager Nano Degree (Udacity, 2025)
- Professional Scrum Product Owner I (Scrum.org, 2025)

Experience:
- Product Manager, PM Happy Hour (2025-Present): Scaled community by 30% via AIGC, engagement campaigns, and analytics. Improved feature adoption by 20%.
- Founder, Expired Solutions (2024-Present): Led strategy, technical buildout, and GTM for an AI platform to automate grocery markdowns and reduce shrink by up to 20%. Finalist, McGinnis Venture Competition.
- AI Product Consultant & CS Instructor, Tutora (2021-Present): Built automation tools and curriculum, saving 15+ hours/week and improving student performance.
- Produce Assistant Team Leader, Giant Eagle, Inc. (2025): Reduced shrink by 1% in 30 days, improved freshness and inventory operations.
- Product Manager, PanPalz (2024-2025): Led roadmap planning and UI design for a nonprofit social media platform.

Skills: Product Management, Artificial Intelligence (AI), Computer Vision, Data Analysis, Customer Discovery, Leadership, Entrepreneurship, Software Engineering, Figma, SQL, Python, Java, Data Structures, Agile, A/B Testing, Digital Transformation, Team Management, Communication.
---
`;

export async function POST(req: NextRequest) {
  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not set." }, { status: 500 });
    }
    const { message, history } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    // Compose messages for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history : []).map((m: any) => ({
        role: m.isUser ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: message },
    ];

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    return NextResponse.json({ message: aiMessage });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 