import { salesData } from "@/data/sales";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(salesData);
}
