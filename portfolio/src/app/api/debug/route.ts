import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("DEBUG ROUTE: POST function called");

  try {
    const formData = await request.formData();
    console.log("DEBUG ROUTE: Form data received");

    const message = formData.get("message") as string;
    const files = formData.getAll("files") as File[];

    console.log("DEBUG ROUTE: Message:", message);
    console.log("DEBUG ROUTE: Files count:", files.length);
    console.log(
      "DEBUG ROUTE: All form data keys:",
      Array.from(formData.keys())
    );

    if (files.length > 0) {
      console.log("DEBUG ROUTE: File name:", files[0].name);
      console.log("DEBUG ROUTE: File type:", files[0].type);
      console.log("DEBUG ROUTE: File size:", files[0].size);
    }

    return NextResponse.json({
      message: "Debug route working",
      receivedMessage: message,
      fileCount: files.length,
      fileNames: files.map((f) => f.name),
    });
  } catch (error) {
    console.error("DEBUG ROUTE: Error:", error);
    return NextResponse.json({ error: "Debug route error" }, { status: 500 });
  }
}
