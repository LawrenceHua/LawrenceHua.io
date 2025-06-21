import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      company,
      message,
      type,
      dateTime,
      meetingType,
      selectedTime,
    } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Different validation for meeting vs message
    if (type === "meeting") {
      if (!dateTime) {
        return NextResponse.json(
          { error: "Meeting date and time are required" },
          { status: 400 }
        );
      }
    } else {
      if (!message) {
        return NextResponse.json(
          { error: "Message is required" },
          { status: 400 }
        );
      }
    }

    // Determine email subject and content based on type
    const ismeeting = type === "meeting";
    const subject = ismeeting
      ? `Meeting Request from ${name}`
      : `New Contact Form Submission from ${name}`;

    const emailContent = ismeeting
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px;">
          📅 New Meeting Request
        </h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
        </div>

        <div style="background-color: #ecfdf5; padding: 20px; border: 1px solid #10b981; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #065f46;">Meeting Details</h3>
          <p><strong>Requested Date & Time:</strong> ${dateTime}</p>
          <p><strong>Meeting Type:</strong> ${meetingType || "30min"}</p>
        </div>

        ${
          message
            ? `
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #1e293b;">Additional Message</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
        `
            : ""
        }

        <div style="margin-top: 20px; padding: 15px; background-color: #ecfdf5; border-radius: 8px; border-left: 4px solid #059669;">
          <p style="margin: 0; color: #065f46;">
            <strong>Action Required:</strong> Reply to ${email} to confirm the meeting time and send calendar invite.
          </p>
        </div>
      </div>
    `
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">Contact Information</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #1e293b;">Message</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #2563eb;">
          <p style="margin: 0; color: #1e40af;">
            <strong>Next Steps:</strong> Reply to ${email} to continue the conversation.
          </p>
        </div>
      </div>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Lawrence Hua Portfolio <onboarding@resend.dev>",
      to: [process.env.EMAIL_NAME || "lawrencehua2@gmail.com"],
      subject: subject,
      html: emailContent,
      replyTo: email,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully", id: data?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
