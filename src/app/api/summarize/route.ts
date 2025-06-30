import { summarizeThread } from "@/ai/flows/summarize-thread";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { thread } = await request.json(); // thread is Comment[]
    const analysis = await summarizeThread({
      thread: JSON.stringify(thread),
    });
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error in summarize API:", error);
    return NextResponse.json(
      { error: "Failed to summarize thread." },
      { status: 500 }
    );
  }
}
