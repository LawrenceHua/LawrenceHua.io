import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const message = formData.get("message") as string;
    const userEmail = (formData.get("email") as string) || "Anonymous";
    const userName = (formData.get("name") as string) || "Portfolio Visitor";

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert image to buffer for email attachment
    const buffer = Buffer.from(await image.arrayBuffer());

    // Send email with image attachment
    const { data, error } = await resend.emails.send({
      from: `Lawrence Hua Portfolio <${process.env.FROM_EMAIL || "onboarding@resend.dev"}>`,
      to: [process.env.EMAIL_NAME || "lawrencehua2@gmail.com"],
      subject: `📸 Image Upload from Chatbot - ${userName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            📸 New Image from Chatbot
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">User Information</h3>
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
            <p><strong>Image Name:</strong> ${image.name}</p>
            <p><strong>Image Size:</strong> ${(image.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Image Type:</strong> ${image.type}</p>
          </div>

          ${
            message
              ? `
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">User Message</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          `
              : ""
          }
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #1e40af;">
              <strong>📎 Image Attachment:</strong> The image is attached to this email for your review.
            </p>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">
            🤖 This image was sent automatically from your chatbot at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: image.name,
          content: buffer,
        },
      ],
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to send image email" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message: "Image sent successfully",
        success: true,
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
