import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // This is a mock endpoint and is not used by the primary demo flow anymore.
  // The main demo logic is now handled on the client-side for a more responsive feel.
  try {
    const { query } = await request.json();
    return NextResponse.json({ summary: `I have received your query: "${query}". This is a generic response.` });
  } catch (error) {
    console.error("Error in analyze API:", error);
    return NextResponse.json(
      { error: "Failed to analyze data." },
      { status: 500 }
    );
  }
}
