import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const userMessage = formData.get("message") as string;
    const userEmail = formData.get("email") as string;
    const userName = formData.get("name") as string;

    if (!imageFile) {
      return NextResponse.json(
        { success: false, message: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert image to base64 for email attachment
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    // Email the image to Lawrence using environment variable
    const emailResult = await resend.emails.send({
      from: "Lawrence's Portfolio <noreply@lawrencehua.io>",
      to: [process.env.EMAIL_NAME || "lawrencehua@gmail.com"],
      subject: `Image Attachment from Portfolio Chat - ${userName || "Anonymous"}`,
      html: `
        <h2>Image Attachment Received</h2>
        <p><strong>From:</strong> ${userName || "Anonymous"}</p>
        <p><strong>Email:</strong> ${userEmail || "Not provided"}</p>
        <p><strong>Message:</strong> ${userMessage || "No message provided"}</p>
        <p><strong>Image:</strong> ${imageFile.name}</p>
        <p><strong>File Size:</strong> ${(imageFile.size / 1024).toFixed(2)} KB</p>
        <hr>
        <p>Image is attached below.</p>
      `,
      attachments: [
        {
          filename: imageFile.name,
          content: base64,
          contentType: mimeType,
        },
      ],
    });

    if (emailResult.error) {
      console.error("Image email error:", emailResult.error);
      return NextResponse.json(
        { success: false, message: "Failed to send image email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image sent to Lawrence successfully!",
    });
  } catch (error) {
    console.error("Error sending image email:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
