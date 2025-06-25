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
      attachments,
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

    const emailAttachments =
      attachments?.map((attachment: any) => ({
        filename: attachment.name,
        content: attachment.content,
        content_type: attachment.mimeType,
      })) || [];

    // Send email to Lawrence
    const emailDestination = process.env.EMAIL_NAME || "lawrencehua2@gmail.com";
    const { data: lawrenceData, error: lawrenceError } =
      await resend.emails.send({
        from: `Lawrence Hua Portfolio <${process.env.FROM_EMAIL || "noreply@lawrencehua.com"}>`,
        to: [emailDestination],
        subject: `🤝 MEETING REQUEST: ${requesterName}${company ? ` from ${company}` : ""}${position ? ` - ${position}` : ""}${attachments?.length ? ` [${attachments.length} file(s) attached]` : ""}`,
        attachments: emailAttachments,
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
              ${(() => {
                try {
                  const parsedContext = JSON.parse(conversationContext);
                  return parsedContext.map((msg: any) => 
                    `<p><strong>${msg.role === "user" ? "Visitor" : "AI Assistant"}:</strong> ${msg.content.replace(/\n/g, "<br>")}</p>`
                  ).join("");
                } catch {
                  return conversationContext.replace(/\n/g, "<br>");
                }
              })()}
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

          ${
            attachments?.length
              ? `
          <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1e40af;">📎 Attachments</h4>
            <div style="background: white; padding: 10px; border-radius: 4px; font-size: 14px; color: #374151;">
              <p><strong>${attachments.length} file(s) attached:</strong></p>
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${attachments.map((att: any) => `<li>${att.name} (${att.mimeType})</li>`).join("")}
              </ul>
              <p style="font-style: italic; color: #64748b;">Files are attached to this email.</p>
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

    if (lawrenceError) {
      console.error("[MEETING REQUEST] Lawrence email error:", lawrenceError);
      return NextResponse.json(
        { error: "Failed to send meeting request email" },
        { status: 500 }
      );
    }

    // Send confirmation email to user if email is provided
    let userEmailSent = false;
    if (requesterEmail) {
      try {
        const { data: userData, error: userError } = await resend.emails.send({
          from: `Lawrence Hua Portfolio <${process.env.FROM_EMAIL || "noreply@lawrencehua.com"}>`,
          to: [requesterEmail],
          subject: `✅ Meeting Request Confirmation - Lawrence Hua`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10b981;">✅ Your Meeting Request Has Been Sent!</h2>
              
              <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0; font-size: 16px; color: #065f46;">
                  Hi ${requesterName},<br><br>
                  Thank you so much for your interest in meeting with me! Your meeting request has been successfully submitted and I truly appreciate you taking the time to reach out.
                </p>
              </div>

              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">📋 Request Summary</h3>
                <p><strong>Your Name:</strong> ${requesterName}</p>
                <p><strong>Your Email:</strong> ${requesterEmail}</p>
                ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
                ${position ? `<p><strong>Position:</strong> ${position}</p>` : ""}
                <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981; margin-top: 15px;">
                  <strong>Your Message:</strong><br>
                  ${message.replace(/\n/g, "<br>")}
                </div>
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">📞 What Happens Next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>I'll send a personalized response within 24-48 hours</li>
                  <li>In the meantime, feel free to explore more about my work at <a href="https://www.lawrencehua.com" style="color: #2563eb;">www.lawrencehua.com</a></li>
                </ul>
                
                <p style="color: #334155; font-size: 16px;">Best regards,<br><strong>Lawrence Hua</strong></p>
                
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                  📧 ${process.env.EMAIL_NAME || "lawrencehua2@gmail.com"}<br>
                  🔗 <a href="https://www.lawrencehua.com" style="color: #2563eb;">www.lawrencehua.com</a><br>
                  🎯 AI Product Manager | Full-Stack Developer | Startup Founder<br><br>
                  <em>I'm passionate about leveraging AI and data to solve real-world problems. Visit <a href="https://www.lawrencehua.com" style="color: #2563eb;">my website</a> to find out more information about my background, projects, and experience.</em>
                </p>
              </div>
            </div>
          `,
        });

        if (userError) {
          console.error(
            "[MEETING REQUEST] User confirmation email error:",
            userError
          );
          // Don't fail the whole request if user email fails, but log it
        } else {
          userEmailSent = true;
          console.log(
            "[MEETING REQUEST] User confirmation email sent successfully"
          );
        }
      } catch (userEmailError) {
        console.error(
          "[MEETING REQUEST] User email exception:",
          userEmailError
        );
        // Don't fail the whole request if user email fails
      }
    }

    console.log("[MEETING REQUEST] Email sent successfully");
    return NextResponse.json(
      {
        message: "Meeting request sent successfully",
        data: lawrenceData,
        success: true,
        userEmailSent,
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
