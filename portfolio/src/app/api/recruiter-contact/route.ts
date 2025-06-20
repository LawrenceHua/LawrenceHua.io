import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { recruiterName, company, email, message, conversationContext } =
      await request.json();
    console.log("[DEBUG] Received recruiter contact:", {
      recruiterName,
      company,
      email,
      message,
      conversationContext,
    });

    // Validate required fields
    if (!recruiterName || !message || !email) {
      console.log("[DEBUG] Validation failed: missing required fields");
      return NextResponse.json(
        { error: "Recruiter name, email, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("[DEBUG] Validation failed: invalid email format");
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Lawrence Hua Portfolio <onboarding@resend.dev>",
      to: ["lawrencehua2@gmail.com"],
      subject: `🎯 RECRUITER INTEREST: ${recruiterName}${company ? ` from ${company}` : ""}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎯 New Recruiter Interest!</h2>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p><strong>Recruiter Name:</strong> ${recruiterName}</p>
            <p><strong>Company:</strong> ${company || "Not specified"}</p>
            <p><strong>Email:</strong> ${email || "Not provided"}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          ${
            conversationContext
              ? `
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #64748b;">Conversation Context:</h4>
            <div style="background: white; padding: 10px; border-radius: 4px; font-size: 14px; color: #64748b;">
              ${conversationContext.replace(/\n/g, "<br>")}
            </div>
          </div>
          `
              : ""
          }
          
          <p style="color: #64748b; font-size: 14px;">
            This message was sent through your AI assistant at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Recruiter message sent successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Recruiter contact error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
