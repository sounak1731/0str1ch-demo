import { generateSalesForecast } from "@/ai/flows/generate-sales-forecast";
import { salesData } from "@/data/sales";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { months } = await request.json();
    const forecast = await generateSalesForecast({
      months: months,
      salesData: salesData,
    });
    return NextResponse.json(forecast);
  } catch (error) {
    console.error("Error in forecast API:", error);
    return NextResponse.json(
      { error: "Failed to generate forecast." },
      { status: 500 }
    );
  }
}
