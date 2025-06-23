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
      from: `Lawrence Hua Portfolio <${process.env.FROM_EMAIL || "noreply@lawrencehua.com"}>`,
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

    // Send confirmation email to recruiter
    let userEmailSent = false;
    try {
      const { data: userData, error: userError } = await resend.emails.send({
        from: `Lawrence Hua Portfolio <${process.env.FROM_EMAIL || "noreply@lawrencehua.com"}>`,
        to: [email],
        subject: `✅ Recruiter Message Sent Successfully - Lawrence Hua`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Your Message Has Been Sent!</h2>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 16px; color: #065f46;">
                Hi ${recruiterName},<br><br>
                Thank you so much for your interest in working with me! Your message has been successfully submitted and I truly appreciate you taking the time to reach out.
              </p>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">📋 Message Summary</h3>
              <p><strong>Your Name:</strong> ${recruiterName}</p>
              <p><strong>Your Email:</strong> ${email}</p>
              ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
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
        console.error("User confirmation email error:", userError);
        // Don't fail the whole request if user email fails, but log it
      } else {
        userEmailSent = true;
        console.log("User confirmation email sent successfully");
      }
    } catch (userEmailError) {
      console.error("User email exception:", userEmailError);
      // Don't fail the whole request if user email fails
    }

    return NextResponse.json(
      { message: "Recruiter message sent successfully", data, userEmailSent },
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
