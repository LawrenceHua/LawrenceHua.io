import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, meeting } = await request.json();
    console.log("[DEBUG] Received data:", {
      name,
      email,
      subject,
      message,
      meeting,
    });

    // Validate required fields (email is now optional)
    console.log(
      "[DEBUG] Validation - name:",
      name,
      "| subject:",
      subject,
      "| message:",
      message
    );
    if (!name || !subject || !message) {
      console.log("[DEBUG] Validation failed: missing required fields");
      return NextResponse.json(
        { error: "Name, subject, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format only if email is provided
    if (email) {
      console.log("[DEBUG] Validating email format:", email);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log("[DEBUG] Validation failed: invalid email format");
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Lawrence Hua Portfolio <onboarding@resend.dev>",
      to: ["lawrencehua2@gmail.com"], // Updated email address
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email || "Not provided"}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
              ${message.replace(/\n/g, "<br>")}
            </div>
            ${meeting ? `<p style='margin-top:16px;'><strong>Meeting Requested:</strong> ${new Date(meeting).toLocaleDateString()}</p>` : ""}
          </div>
          <p style="color: #64748b; font-size: 14px;">
            This message was sent from your portfolio contact form at ${new Date().toLocaleString()}
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
      { message: "Email sent successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
