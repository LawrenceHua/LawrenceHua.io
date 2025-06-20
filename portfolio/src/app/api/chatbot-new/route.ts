import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { handleGirlfriendEasterEgg } from "../chatbot/girlfriend-easter-egg";

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

async function getFileContent(file: File): Promise<string | null> {
  console.log("NEW ROUTE: getFileContent called for file:", file.name);
  const an = file.name.split(".");
  const fileExtension = an[an.length - 1];
  console.log("NEW ROUTE: File extension:", fileExtension);

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
      return content;
    } else if (fileExtension === "pdf") {
      console.log("NEW ROUTE: Processing PDF file");
      try {
        console.log("NEW ROUTE: Attempting to import pdf-parse...");
        const pdfModule = await import("pdf-parse");
        console.log("NEW ROUTE: pdf-parse import successful");
        const pdfParse = pdfModule.default;

        console.log("NEW ROUTE: Attempting to parse PDF buffer...");
        const data = await pdfParse(buffer);
        console.log(
          "NEW ROUTE: PDF processed successfully, text length:",
          data.text.length
        );
        return data.text;
      } catch (pdfError: any) {
        console.error("NEW ROUTE: PDF processing error:", pdfError);
        console.error("NEW ROUTE: PDF error name:", pdfError.name);
        console.error("NEW ROUTE: PDF error message:", pdfError.message);

        // Return a helpful message when PDF parsing fails
        return "PDF_CONTENT_UNAVAILABLE: The PDF file was uploaded but could not be parsed. Please provide the key information from the document in text format, and I'll be happy to help analyze Lawrence's fit for the role.";
      }
    } else if (fileExtension === "docx") {
      console.log("NEW ROUTE: Processing DOCX file");
      const mammoth = (await import("mammoth")).default;
      const { value } = await mammoth.extractRawText({ buffer });
      console.log("NEW ROUTE: DOCX processed successfully");
      return value;
    }
    console.log("NEW ROUTE: Unsupported file type:", fileExtension);
    return null;
  } catch (error) {
    console.error(`NEW ROUTE: Error processing file ${file.name}:`, error);
    return null;
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

    // Process files first
    let finalMessage = message;
    if (files.length > 0) {
      console.log("NEW ROUTE: Processing files");
      for (const file of files) {
        console.log("NEW ROUTE: Processing file:", file.name);
        console.log("NEW ROUTE: File type:", file.type);
        console.log("NEW ROUTE: File size:", file.size);

        const fileContent = await getFileContent(file);
        console.log(
          "NEW ROUTE: getFileContent returned:",
          fileContent ? "SUCCESS" : "FAILED"
        );
        if (fileContent) {
          console.log("NEW ROUTE: File content length:", fileContent.length);
          finalMessage += `\n\nFile content from ${file.name}:\n${fileContent}`;
          console.log("NEW ROUTE: Added file content to message");
        } else {
          console.log("NEW ROUTE: Failed to get file content for:", file.name);
        }
      }
    } else {
      console.log("NEW ROUTE: No files to process");
    }

    // Simple response for testing
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
        response:
          "NEW ROUTE: I'm sorry, I'm not configured to respond right now.",
      });
    }

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
