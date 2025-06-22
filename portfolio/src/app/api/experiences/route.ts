import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Based on the portfolio content, counting actual work experiences
    // This would typically come from a database or CMS
    const experiences = [
      // These are the actual experiences from Lawrence's portfolio
      // COMMENTED OUT - Amazon MTurk position no longer active
      // { id: 1, company: "Amazon Mechanical Turk" },
      { id: 1, company: "Netflix" },
      { id: 2, company: "Giant Eagle" },
      { id: 3, company: "5 Spice" },
      { id: 4, company: "Expired Solutions" },
      { id: 5, company: "Panpalz" },
      { id: 6, company: "PM Happy Hour" },
      { id: 7, company: "Motorola" },
      { id: 8, company: "Kearney" },
      { id: 9, company: "Tutora" },
      { id: 10, company: "Valohai" },
      { id: 11, company: "Mcginnis" },
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
