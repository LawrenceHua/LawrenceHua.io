import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const {
      requesterName,
      requesterEmail,
      company,
      position,
      message,
      conversationContext,
      fileAnalysis,
    } = await request.json();

    console.log("[MEETING REQUEST] Received data:", {
      requesterName,
      requesterEmail,
      company,
      position,
      message,
      conversationContext: conversationContext ? "Provided" : "Not provided",
      fileAnalysis: fileAnalysis ? "Provided" : "Not provided",
    });

    // Validate required fields
    if (!requesterName || !message) {
      console.log(
        "[MEETING REQUEST] Validation failed: missing required fields"
      );
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (requesterEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(requesterEmail)) {
        console.log(
          "[MEETING REQUEST] Validation failed: invalid email format"
        );
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Lawrence Hua Portfolio <onboarding@resend.dev>",
      to: ["lawrencehua2@gmail.com"],
      subject: `🤝 MEETING REQUEST: ${requesterName}${company ? ` from ${company}` : ""}${position ? ` - ${position}` : ""}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🤝 New Meeting Request!</h2>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <h3 style="margin-top: 0; color: #1e40af;">Contact Information</h3>
            <p><strong>Name:</strong> ${requesterName}</p>
            <p><strong>Email:</strong> ${requesterEmail || "Not provided"}</p>
            <p><strong>Company:</strong> ${company || "Not specified"}</p>
            <p><strong>Position:</strong> ${position || "Not specified"}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Meeting Request Message</h3>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          ${
            conversationContext
              ? `
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #92400e;">🤖 AI Conversation Context</h4>
            <div style="background: white; padding: 10px; border-radius: 4px; font-size: 14px; color: #374151;">
              ${conversationContext.replace(/\n/g, "<br>")}
            </div>
          </div>
          `
              : ""
          }

          ${
            fileAnalysis
              ? `
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #166534;">📄 File Analysis</h4>
            <div style="background: white; padding: 10px; border-radius: 4px; font-size: 14px; color: #374151;">
              ${fileAnalysis.replace(/\n/g, "<br>")}
            </div>
          </div>
          `
              : ""
          }
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #dc2626;">📅 Next Steps</h4>
            <p style="margin-bottom: 10px;">This meeting request was generated through your AI assistant. Please:</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Review the conversation context and file analysis above</li>
              <li>Contact ${requesterName} at ${requesterEmail || "their provided contact method"}</li>
              <li>Schedule a meeting at your earliest convenience</li>
            </ul>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            🤖 This meeting request was sent through your AI assistant at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[MEETING REQUEST] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send meeting request email" },
        { status: 500 }
      );
    }

    console.log("[MEETING REQUEST] Email sent successfully");
    return NextResponse.json(
      {
        message: "Meeting request sent successfully",
        data,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[MEETING REQUEST] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
