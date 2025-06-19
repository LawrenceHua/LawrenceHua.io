import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // Read package.json from the project root
    const packagePath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

    return NextResponse.json({
      version: packageJson.version,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Fallback if package.json can't be read
    return NextResponse.json({
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  }
}
