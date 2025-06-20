import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("TEST ROUTE: POST request received");

  const formData = await request.formData();
  const message = formData.get("message") as string;
  const files = formData.getAll("files") as File[];

  console.log("TEST ROUTE: Message:", message);
  console.log("TEST ROUTE: Files count:", files.length);

  if (files.length > 0) {
    console.log("TEST ROUTE: File name:", files[0].name);
    console.log("TEST ROUTE: File type:", files[0].type);
    console.log("TEST ROUTE: File size:", files[0].size);
  }

  return NextResponse.json({
    message: "Test route working",
    receivedMessage: message,
    fileCount: files.length,
  });
}
