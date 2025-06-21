import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Based on the portfolio content, counting actual projects
    // This would typically come from a database or CMS
    const projects = [
      // These are the actual projects from Lawrence's portfolio
      { id: 1, title: "Netflix Streaming Platform" },
      { id: 2, title: "Giant Eagle Retail Tech" },
      { id: 3, title: "5 Spice Restaurant Management" },
      { id: 4, title: "Expired Solutions Inventory" },
      { id: 5, title: "Panpalz Social Network" },
      { id: 6, title: "PM Happy Hour Community" },
      { id: 7, title: "Motorola Mobile Devices" },
      { id: 8, title: "Kearney Consulting" },
      { id: 9, title: "Tutora Education Platform" },
      { id: 10, title: "Valohai ML Platform" },
      { id: 11, title: "Mcginnis Enterprise Software" },
      { id: 12, title: "Portfolio Website" },
      { id: 13, title: "AI Chatbot Integration" },
      { id: 14, title: "Meeting Request System" },
    ];

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}
