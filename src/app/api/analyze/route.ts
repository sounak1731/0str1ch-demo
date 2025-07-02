import { analyzeDataQuery } from "@/ai/flows/analyze-data-query";
import { salesData } from "@/data/sales";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { query, history } = await request.json();
    const analysis = await analyzeDataQuery({
      query: query,
      salesData: JSON.stringify(salesData),
      history: history,
    });
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error in analyze API:", error);
    return NextResponse.json(
      { error: "Failed to analyze data." },
      { status: 500 }
    );
  }
}
