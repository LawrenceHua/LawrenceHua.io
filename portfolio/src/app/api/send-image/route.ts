import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log("[SEND-IMAGE] Starting image email process");

    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const userMessage = formData.get("message") as string;
    const userEmail = formData.get("email") as string;
    const userName = formData.get("name") as string;

    console.log("[SEND-IMAGE] Received data:", {
      imageFile: imageFile
        ? `${imageFile.name} (${imageFile.size} bytes)`
        : "No file",
      userMessage,
      userEmail,
      userName,
    });

    if (!imageFile) {
      console.log("[SEND-IMAGE] No image file provided");
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert image to base64 for email attachment
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    console.log("[SEND-IMAGE] Image processed:", {
      filename: imageFile.name,
      size: imageFile.size,
      mimeType,
    });

    // Email the image to Lawrence using environment variable
    console.log(
      "[SEND-IMAGE] Sending email to:",
      process.env.EMAIL_NAME || "lawrencehua@gmail.com"
    );

    const emailResult = await resend.emails.send({
      from: "Lawrence's Portfolio <onboarding@resend.dev>",
      to: [process.env.EMAIL_NAME || "lawrencehua@gmail.com"],
      subject: `📷 Image Attachment from Portfolio Chat - ${userName || "Anonymous"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📷 Image Attachment Received</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>From:</strong> ${userName || "Anonymous"}</p>
            <p><strong>Email:</strong> ${userEmail || "Not provided"}</p>
            <p><strong>Message:</strong> ${userMessage || "No message provided"}</p>
            <p><strong>Image:</strong> ${imageFile.name}</p>
            <p><strong>File Size:</strong> ${(imageFile.size / 1024).toFixed(2)} KB</p>
          </div>
          <p>Image is attached below.</p>
          <p style="color: #64748b; font-size: 14px;">
            This image was sent from your portfolio chatbot at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      attachments: [
        {
          filename: imageFile.name,
          content: base64,
          contentType: mimeType,
        },
      ],
    });

    console.log("[SEND-IMAGE] Email result:", emailResult);

    if (emailResult.error) {
      console.error("[SEND-IMAGE] Image email error:", emailResult.error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send image email",
          error: emailResult.error,
        },
        { status: 500 }
      );
    }

    console.log("[SEND-IMAGE] Image email sent successfully");
    return NextResponse.json({
      success: true,
      message: "Image sent to Lawrence successfully!",
      data: emailResult.data,
    });
  } catch (error) {
    console.error("[SEND-IMAGE] Error sending image email:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
