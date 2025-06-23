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
      from: `Lawrence Hua Portfolio <${process.env.FROM_EMAIL || "noreply@lawrencehua.com"}>`,
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

    // Send confirmation email to user
    let userEmailSent = false;
    try {
      const userSubject = ismeeting
        ? `✅ Meeting Request Confirmation - Lawrence Hua`
        : `✅ Message Sent Successfully - Lawrence Hua`;

      const userEmailContent = ismeeting
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Your Meeting Request Has Been Sent!</h2>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 16px; color: #065f46;">
                Hi ${name},<br><br>
                Thank you so much for your interest in meeting with me! Your meeting request has been successfully submitted and I truly appreciate you taking the time to reach out.
              </p>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">📋 Meeting Request Summary</h3>
              <p><strong>Your Name:</strong> ${name}</p>
              <p><strong>Your Email:</strong> ${email}</p>
              ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
              <p><strong>Requested Date & Time:</strong> ${dateTime}</p>
              <p><strong>Meeting Type:</strong> ${meetingType || "30min"}</p>
              ${
                message
                  ? `
                <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981; margin-top: 15px;">
                  <strong>Your Message:</strong><br>
                  ${message.replace(/\n/g, "<br>")}
                </div>
              `
                  : ""
              }
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
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Your Message Has Been Sent!</h2>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0; font-size: 16px; color: #065f46;">
                Hi ${name},<br><br>
                Thank you so much for reaching out! Your message has been successfully submitted and I truly appreciate you taking the time to contact me.
              </p>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">📋 Message Summary</h3>
              <p><strong>Your Name:</strong> ${name}</p>
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
        `;

      const { data: userData, error: userError } = await resend.emails.send({
        from: `Lawrence Hua Portfolio <${process.env.FROM_EMAIL || "noreply@lawrencehua.com"}>`,
        to: [email],
        subject: userSubject,
        html: userEmailContent,
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
      { message: "Email sent successfully", id: data?.id, userEmailSent },
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
