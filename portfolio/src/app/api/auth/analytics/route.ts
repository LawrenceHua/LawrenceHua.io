import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Server-side password validation (more secure)
    const validPassword = process.env.NEXT_PUBLIC_SECRET_PASS;

    if (!validPassword) {
      return NextResponse.json(
        { error: "Analytics access not configured" },
        { status: 500 }
      );
    }

    if (password === validPassword) {
      // Generate a secure session token (in production, use JWT)
      const sessionToken =
        Math.random().toString(36).substring(2) + Date.now().toString(36);

      return NextResponse.json({
        success: true,
        sessionToken,
        message: "Authentication successful",
      });
    } else {
      // Add delay to prevent brute force attacks
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
