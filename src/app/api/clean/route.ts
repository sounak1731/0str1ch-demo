import { cleanData } from "@/ai/flows/clean-data-flow";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { salesData } = await request.json();
    if (!salesData) {
      return NextResponse.json(
        { error: "Sales data is required." },
        { status: 400 }
      );
    }
    const result = await cleanData({ salesData });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in clean API:", error);
    return NextResponse.json(
      { error: "Failed to clean data." },
      { status: 500 }
    );
  }
}
