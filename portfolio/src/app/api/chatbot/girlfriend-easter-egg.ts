import OpenAI from "openai";

interface GirlfriendEasterEggResponse {
  response: string;
  needsPassword?: boolean;
  isMyleyResponse?: boolean;
}

export async function handleGirlfriendEasterEgg(
  message: string,
  history: Array<{ role: string; content: string }>,
  openai: OpenAI | null
): Promise<GirlfriendEasterEggResponse | null> {
  const lastBotMessage =
    history
      .slice()
      .reverse()
      .find((m) => m.role === "assistant")?.content || "";
  const needsPassword = lastBotMessage.includes(
    "...what's the secret password? 🤐"
  );

  // Check if this is a girlfriend-related question OR if we're awaiting a password
  const isGirlfriendQuestion =
    /who\s+is\s+lawrence'?s?\s+(girlfriend|favorite girl|partner)|is\s+lawrence\s+(dating|single)|does\s+lawrence\s+have\s+a\s+(girlfriend|partner)|tell\s+me\s+about\s+lawrence'?s?\s+(girlfriend|love life|relationship)|who\s+is\s+lawrence\s+girlfriend/i.test(
      message
    );

  if (!isGirlfriendQuestion && !needsPassword) {
    return null;
  }

  console.log("DEBUG: Girlfriend question detected:", message);

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
    /8\.21\.24/i,
    /08\.21\.2024/i,
    /^8\.21$/i, // Exact match for 8.21
    /^8\.21$/i, // Simple pattern for 8.21
  ];

  console.log("DEBUG: Checking password patterns for message:", message);
  const hasCorrectPassword = passwordPatterns.some((pattern) => {
    const matches = pattern.test(message);
    console.log("DEBUG: Pattern", pattern, "matches:", matches);
    return matches;
  });

  console.log("DEBUG: hasCorrectPassword:", hasCorrectPassword);

  if (!hasCorrectPassword) {
    // If no password provided, ask for it
    if (
      !message.toLowerCase().includes("august") &&
      !message.toLowerCase().includes("8/") &&
      !message.toLowerCase().includes("2024")
    ) {
      console.log("DEBUG: Asking for password");
      return {
        response: "...what's the secret password? 🤐",
        needsPassword: true,
      };
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
• **Sam Altman** - For his leadership in AI and startup ecosystem
• **Naval Ravikant** - For his wisdom on entrepreneurship and life philosophy

Lawrence believes in learning from the best and surrounding himself with people who challenge and inspire him to grow.`;

    return { response: mentorResponse };
  }

  // If password is correct, proceed with the original Myley response
  if (!openai) {
    return {
      response:
        "I'm having some trouble connecting to my creative circuits, but I can tell you Lawrence is very happy with his wonderful girlfriend, Myley!",
      isMyleyResponse: true,
    };
  }

  const poemPrompt =
    "You are a poet deeply in love. Write a short, romantic, and SFW poem for Myley. Each time you are asked, you must write a completely new and unique poem; do not repeat poems you have written in the past. Here is some context about Myley: she is very beautiful, incredibly smart (top of her class at the best schools), funny, and very hardworking. She can be sweet, and she takes wonderful care of her boyfriend and his two cats, Ory (a black and white tuxedo boy) and Ora (a grey girl). Capture this love and admiration in a 4-6 line poem. Do not use quotation marks in the poem.";

  try {
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

    console.log("DEBUG: Password correct, revealing Myley with poem");
    return { response, isMyleyResponse: true };
  } catch (error) {
    console.error("Error generating poem:", error);
    return {
      response:
        "Lawrence's favorite person in the world is his wonderful girlfriend, Myley. He thinks she is the most beautiful girl he has ever known and loves her more than words can say! 💕",
      isMyleyResponse: true,
    };
  }
}
