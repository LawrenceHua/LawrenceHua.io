import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Check if OpenAI API key is available
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.warn(
    "OPENAI_API_KEY environment variable is not set. Chatbot will return fallback responses.",
  );
}

const openai = openaiApiKey
  ? new OpenAI({
      apiKey: openaiApiKey,
    })
  : null;

const systemPrompt = `You are Lawrence Hua's AI assistant. You have access to his resume and LinkedIn information. Here's what you know about Lawrence:

**Education:**
- Master's degree in Information Systems Management from Carnegie Mellon University (2023-2024)
- Bachelor's degree in Computer Science from University of Florida (2017-2021)

**Current Experience:**
- Product Manager at PM Happy Hour (Mar 2025 - Present)
- Founder & CEO at Expired Solutions (Aug 2024 - Present) - AI platform using CV + GPT to reduce grocery shrink by 20%
- Product Manager at PanPalz (Aug 2024 - Jan 2025)

**Previous Experience:**
- Student Consultant, Technical Lead at Kearney (Sep 2024 - Dec 2024)
- Produce Assistant Team Leader at Giant Eagle (Feb 2025 - May 2025)
- Embedded Android Engineer at Motorola Solutions (Aug 2021 - Aug 2023)
- AI Product Consultant & Computer Science Instructor at Tutora (Mar 2021 - Present)

**Key Skills:**
- Product Management, A/B Testing, Machine Learning, Python, JavaScript, React, Node.js, SQL, Figma
- Experience with OpenAI APIs, Azure, GPT, Vision AI, Flask, Android development

**Projects:**
- Expired Solutions: AI-powered food waste reduction platform
- BBW_POC: GPT-powered sourcing analysis for Bath & Body Works
- Valohai AI Tutorial: Reproducible ML pipeline tutorial
- CMU Projects: Advanced coursework including A/B testing and ML in production
- Distributed Systems Projects: Custom-built coordination protocols

**Awards:**
- Finalist, McGinnis Venture Competition (2025)
- Gerhalt Sandbox Fund Scholar (2025)

Always be helpful, professional, and accurate. If you don't know something specific, say so and suggest reaching out to Lawrence directly. Keep responses concise but informative.`;

// Fallback responses for when OpenAI is not available
const fallbackResponses: { [key: string]: string } = {
  "who is lawrence hua":
    "Lawrence Hua is an AI Product Manager and Founder & CEO of Expired Solutions. He has a Master's degree in Information Systems Management from Carnegie Mellon University and a Bachelor's degree in Computer Science from University of Florida. He's currently working as a Product Manager at PM Happy Hour and has experience in AI, machine learning, and product management.",
  "what does lawrence do":
    "Lawrence is an AI Product Manager and entrepreneur. He's the Founder & CEO of Expired Solutions, an AI platform that reduces grocery shrink by 20% using computer vision and GPT. He also works as a Product Manager at PM Happy Hour and has experience in Android development, machine learning, and consulting.",
  "lawrence experience":
    "Lawrence has diverse experience including: Product Manager at PM Happy Hour, Founder & CEO at Expired Solutions, Product Manager at PanPalz, Student Consultant at Kearney, Embedded Android Engineer at Motorola Solutions, and AI Product Consultant at Tutora. He specializes in AI, product management, and technical development.",
  "lawrence skills":
    "Lawrence's key skills include: Product Management, A/B Testing, Machine Learning, Python, JavaScript, React, Node.js, SQL, Figma, OpenAI APIs, Azure, GPT, Vision AI, Flask, and Android development. He has both technical and business expertise.",
  "lawrence education":
    "Lawrence has a Master's degree in Information Systems Management from Carnegie Mellon University (2023-2024) and a Bachelor's degree in Computer Science from University of Florida (2017-2021). He's also a Finalist in the McGinnis Venture Competition and a Gerhalt Sandbox Fund Scholar.",
  default:
    "I'm Lawrence's AI assistant! Lawrence is an AI Product Manager and entrepreneur with experience in machine learning, product management, and technical development. He's the Founder & CEO of Expired Solutions and currently works at PM Happy Hour. You can ask me about his experience, skills, education, or projects!",
};

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // If OpenAI is not available, use fallback responses
    if (!openai || !openaiApiKey) {
      const lowerMessage = message.toLowerCase();
      let response = fallbackResponses.default;

      // Find the best matching fallback response
      for (const [key, fallbackResponse] of Object.entries(fallbackResponses)) {
        if (lowerMessage.includes(key)) {
          response = fallbackResponse;
          break;
        }
      }

      return NextResponse.json({ response });
    }

    // Use OpenAI if available
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const response =
      completion.choices[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chatbot API error:", error);

    // Return a helpful fallback response
    return NextResponse.json({
      response:
        "I'm having trouble connecting to my AI service right now, but I can tell you about Lawrence! He's an AI Product Manager and entrepreneur with experience in machine learning, product management, and technical development. Feel free to reach out to Lawrence directly for more detailed information.",
    });
  }
}
