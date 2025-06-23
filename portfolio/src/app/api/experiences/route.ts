import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Based on the portfolio content, counting actual work experiences
    // This would typically come from a database or CMS
    const experiences = [
      // These are the actual experiences from Lawrence's portfolio
      { id: 1, company: "Amazon Mechanical Turk" },
      { id: 2, company: "Netflix" },
      { id: 3, company: "Giant Eagle" },
      { id: 4, company: "5 Spice" },
      { id: 5, company: "Expired Solutions" },
      { id: 6, company: "Panpalz" },
      { id: 7, company: "PM Happy Hour" },
      { id: 8, company: "Motorola" },
      { id: 9, company: "Kearney" },
      { id: 10, company: "Tutora" },
      { id: 11, company: "Valohai" },
      { id: 12, company: "Mcginnis" },
    ];

    return NextResponse.json(experiences);
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}
