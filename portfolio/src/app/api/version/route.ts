import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";

export async function GET() {
  try {
    // Read package.json from the project root
    const packagePath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));

    let lastUpdated = new Date().toISOString();

    // Try to get the last commit date from Git
    try {
      const gitCommand = "git log -1 --format=%ct";
      const lastCommitTimestamp = execSync(gitCommand, {
        encoding: "utf8",
      }).trim();
      if (lastCommitTimestamp) {
        // Convert Unix timestamp to ISO string
        lastUpdated = new Date(
          parseInt(lastCommitTimestamp) * 1000
        ).toISOString();
      }
    } catch (gitError) {
      // If Git is not available or there's an error, use current time
      console.log("Git not available, using current time");
    }

    return NextResponse.json({
      version: packageJson.version,
      lastUpdated: lastUpdated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Fallback if package.json can't be read
    return NextResponse.json({
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    });
  }
}
