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

const systemPrompt = `pmpt_6852c19a79ec819588edd870c0065373097c8eb16a7ee416`;

// Fallback responses for when OpenAI is not available
const fallbackResponses: { [key: string]: string } = {
  "who is lawrence hua": `**Lawrence Hua** is an **AI Product Manager** and Founder & CEO of Expired Solutions.\n\n**Education:**\n- Master's: Information Systems Management, Carnegie Mellon University\n- Bachelor's: Computer Science, University of Florida\n\n**Current Roles:**\n- Product Manager at PM Happy Hour\n- Founder & CEO at Expired Solutions\n\n**Expertise:**\nAI, machine learning, product management.`,
  "what does lawrence do": `**Lawrence** is an **AI Product Manager** and entrepreneur.\n\n- Founder & CEO of Expired Solutions (AI platform for grocery shrink reduction)\n- Product Manager at PM Happy Hour\n- Experience: Android development, machine learning, consulting`,
  "lawrence experience": `**Experience Highlights:**\n- Product Manager at PM Happy Hour\n- Founder & CEO at Expired Solutions\n- Product Manager at PanPalz\n- Student Consultant at Kearney\n- Embedded Android Engineer at Motorola Solutions\n- AI Product Consultant at Tutora\n\n**Specialties:** AI, product management, technical development.`,
  "lawrence skills": `**Key Skills:**\n- Product Management\n- A/B Testing\n- Machine Learning\n- Python, JavaScript, React, Node.js, SQL, Figma\n- OpenAI APIs, Azure, GPT, Vision AI, Flask, Android development`,
  "lawrence education": `**Education:**\n- Master's: Information Systems Management, Carnegie Mellon University (2023-2024)\n- Bachelor's: Computer Science, University of Florida (2017-2021)\n\n**Awards:**\n- Finalist, McGinnis Venture Competition (2025)\n- Gerhalt Sandbox Fund Scholar (2025)`,
  default: `I'm Lawrence's AI assistant!\n\n**About Lawrence:**\n- AI Product Manager & entrepreneur\n- Founder & CEO of Expired Solutions\n- Experience: machine learning, product management, technical development\n\n_You can ask me about his experience, skills, education, or projects!_`,
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
