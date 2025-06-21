import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { handleGirlfriendEasterEgg } from "../chatbot/girlfriend-easter-egg";

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

async function getFileContent(
  file: File,
  message: string,
  history: Array<{ role: string; content: string }>
): Promise<{ content: string | null; type: string; position?: string }> {
  console.log("NEW ROUTE: getFileContent called for file:", file.name);
  const an = file.name.split(".");
  const fileExtension = an[an.length - 1].toLowerCase();
  console.log("NEW ROUTE: File extension:", fileExtension);

  // Helper function to extract email from message
  function extractEmailFromMessage(text: string): string {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = text.match(emailRegex);
    return match ? match[0] : "Not provided";
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("NEW ROUTE: Buffer created, size:", buffer.length);

    if (fileExtension === "txt") {
      console.log("NEW ROUTE: Processing TXT file");
      const content = buffer.toString("utf-8");
      console.log(
        "NEW ROUTE: TXT processed successfully, content length:",
        content.length
      );
      return { content, type: "text" };
    } else if (fileExtension === "pdf") {
      console.log("NEW ROUTE: Processing PDF file");
      try {
        console.log("NEW ROUTE: Attempting to import pdf-parse...");
        // @ts-ignore
        const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
        console.log("NEW ROUTE: pdf-parse import successful");

        console.log("NEW ROUTE: Parsing PDF document...");
        const data = await pdfParse(buffer);
        console.log(
          "NEW ROUTE: PDF parsed successfully, text length:",
          data.text.length
        );

        return { content: data.text, type: "pdf" };
      } catch (pdfError: any) {
        console.error("NEW ROUTE: PDF processing error:", pdfError);
        return {
          content:
            "PDF_CONTENT_UNAVAILABLE: I can see you've uploaded a PDF file, but I'm currently experiencing technical difficulties with PDF parsing. To help you analyze Lawrence's fit for this role, could you please copy and paste the key job requirements and responsibilities from the document? I'll be happy to provide a detailed analysis based on that information.",
          type: "pdf",
        };
      }
    } else if (fileExtension === "docx") {
      console.log("NEW ROUTE: Processing DOCX file");
      const mammoth = (await import("mammoth")).default;
      const { value } = await mammoth.extractRawText({ buffer });
      console.log("NEW ROUTE: DOCX processed successfully");
      return { content: value, type: "docx" };
    } else if (["jpg", "jpeg", "png"].includes(fileExtension)) {
      console.log(
        "NEW ROUTE: Processing image file - vision analysis and email"
      );
      // Email the image to Lawrence (fire and forget)
      (async () => {
        try {
          // Use form-data library for proper multipart handling
          const FormData = (await import("form-data")).default;
          const imageFormData = new FormData();

          // Convert file to buffer and add to form
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          imageFormData.append("image", fileBuffer, {
            filename: file.name,
            contentType: file.type,
          });
          imageFormData.append("message", message);

          const userEmail =
            history.length > 0
              ? history[history.length - 1]?.role === "user"
                ? extractEmailFromMessage(
                    history[history.length - 1]?.content || ""
                  )
                : "Not provided"
              : "Not provided";
          imageFormData.append("email", userEmail);
          imageFormData.append("name", "Portfolio Visitor");

          // Get the headers from form-data
          const headers = imageFormData.getHeaders();

          await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/send-image`,
            {
              method: "POST",
              headers: headers,
              body: imageFormData as any, // Type assertion for form-data library
            }
          );
          console.log("NEW ROUTE: Image email sent successfully");
        } catch (emailError) {
          console.error(
            "NEW ROUTE: Error sending image email (non-blocking):",
            emailError
          );
        }
      })();
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
    console.log("NEW ROUTE: Unsupported file type:", fileExtension);
    return { content: null, type: "unsupported" };
  } catch (error) {
    console.error(`NEW ROUTE: Error processing file ${file.name}:`, error);
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
    console.error("NEW ROUTE: Error detecting position:", error);
    return null;
  }
}

async function analyzeFit(
  content: string,
  position: string | null,
  fileType: string
): Promise<string> {
  if (!openai)
    return "I'm sorry, I'm not configured to provide analysis right now.";

  const systemPrompt = `You are Lawrence Hua's AI assistant. Analyze the provided content and determine if Lawrence is a good fit for the position.

Lawrence's Background:
- **10+ years of product management experience** in technology and financial services
- **Bachelor's degree in Computer Science** from Carnegie Mellon University
- **Expertise in Agile/Scrum methodologies** and cross-functional team leadership
- **Strong technical skills**: PowerBI, SQL, JIRA, Trello, Figma, Miro, Lucid
- **Experience in regulated industries** and enterprise-scale products
- **Excellent communication skills** and executive-level influence
- **Background in financial technology** and government tech

Analysis Format:
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
        { role: "system", content: systemPrompt },
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
    console.error("NEW ROUTE: Error analyzing fit:", error);
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/meeting-request`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        message:
          "Meeting request sent successfully! Lawrence will contact you soon.",
      };
    } else {
      console.error("NEW ROUTE: Meeting request failed:", result);
      return {
        success: false,
        message:
          "Failed to send meeting request. Please try again or contact Lawrence directly.",
      };
    }
  } catch (error) {
    console.error("NEW ROUTE: Error sending meeting request:", error);
    return {
      success: false,
      message:
        "Failed to send meeting request. Please try again or contact Lawrence directly.",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("NEW ROUTE: POST function called");

    const formData = await request.formData();
    console.log("NEW ROUTE: Form data received");

    const message = formData.get("message") as string;
    const files = formData.getAll("files") as File[];
    const historyString = formData.get("history") as string;
    const history = historyString ? JSON.parse(historyString) : [];

    console.log("NEW ROUTE: Received message:", message);
    console.log("NEW ROUTE: Received files count:", files.length);
    console.log("NEW ROUTE: All form data keys:", Array.from(formData.keys()));

    // Check for meeting request intent
    const meetingRequestKeywords = [
      "schedule",
      "meeting",
      "call",
      "interview",
      "discuss",
      "talk",
      "connect",
      "book",
      "arrange",
      "set up",
      "coordinate",
      "meet",
      "conference",
    ];

    const isMeetingRequest = meetingRequestKeywords.some((keyword) =>
      message.toLowerCase().includes(keyword)
    );

    // Process files first
    let finalMessage = message;
    let hasFiles = false;
    let fileAnalysis = "";
    let detectedPosition: string | null = null;

    if (files.length > 0) {
      console.log("NEW ROUTE: Processing files");
      hasFiles = true;

      for (const file of files) {
        console.log("NEW ROUTE: Processing file:", file.name);
        console.log("NEW ROUTE: File type:", file.type);
        console.log("NEW ROUTE: File size:", file.size);

        const fileResult = await getFileContent(file, message, history);
        console.log(
          "NEW ROUTE: getFileContent returned:",
          fileResult.content ? "SUCCESS" : "FAILED"
        );

        if (fileResult.content) {
          console.log(
            "NEW ROUTE: File content length:",
            fileResult.content.length
          );

          if (fileResult.type === "image") {
            // Images are now emailed directly, just return the response
            return NextResponse.json({
              response: fileResult.content,
              imageSent: true,
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

          console.log("NEW ROUTE: Added file content to message");
        } else {
          console.log("NEW ROUTE: Failed to get file content for:", file.name);
        }
      }
    } else {
      console.log("NEW ROUTE: No files to process");
    }

    const userMessage = finalMessage || "User sent a file for analysis.";
    console.log("NEW ROUTE: Final user message length:", userMessage.length);

    // Check for girlfriend easter egg
    console.log("NEW ROUTE: Checking for girlfriend easter egg");
    const easterEggResponse = await handleGirlfriendEasterEgg(
      userMessage,
      history,
      openai
    );
    console.log(
      "NEW ROUTE: Easter egg response:",
      easterEggResponse ? "FOUND" : "NOT FOUND"
    );
    if (easterEggResponse) {
      console.log("NEW ROUTE: Returning easter egg response");
      return NextResponse.json(easterEggResponse);
    }

    if (!openai) {
      return NextResponse.json({
        response: `NEW ROUTE: I'm sorry, I'm not configured to respond right now. However, I can confirm that your file was processed successfully. The processed content length is: ${userMessage.length} characters. Please configure your OpenAI API key to get a full analysis.`,
      });
    }

    // Handle meeting requests
    if (isMeetingRequest) {
      console.log("NEW ROUTE: Detected meeting request intent");

      // Extract contact information from the message
      const contactInfo = await extractContactInfo(userMessage);

      const meetingData = {
        requesterName: contactInfo.name || "Anonymous",
        requesterEmail: contactInfo.email,
        company: contactInfo.company,
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
        "document"
      );
      const fullResponse = `${fileAnalysis}\n\n${analysis}\n\n**Next Steps**: Do you have any questions about Lawrence's fit for this role? I can help schedule a meeting with Lawrence right away if you'd like to discuss this opportunity further. Just let me know if you'd like to schedule a meeting!`;

      return NextResponse.json({ response: fullResponse });
    }

    // Regular conversation flow
    const systemPrompt = `You are Lawrence Hua's AI assistant. You have extensive knowledge about Lawrence's background, experience, skills, and achievements. 

IMPORTANT: When responding, use proper markdown formatting:
- Use **bold** for emphasis and important points
- Use *italic* for subtle emphasis
- Use \`code\` for technical terms, skills, or code references
- Use bullet points for lists
- Keep responses conversational but professional

Answer questions about Lawrence professionally and accurately. If users share files, analyze them and provide relevant insights about how they relate to Lawrence's experience or skills.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
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
      "NEW ROUTE: I'm sorry, I couldn't generate a response.";
    return NextResponse.json({ response });
  } catch (error) {
    console.error("NEW ROUTE: Error in chatbot route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function extractContactInfo(message: string): Promise<{
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
        console.error("NEW ROUTE: Error parsing contact info:", parseError);
        return {};
      }
    }
    return {};
  } catch (error) {
    console.error("NEW ROUTE: Error extracting contact info:", error);
    return {};
  }
}
