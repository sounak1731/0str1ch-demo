import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { message } = await request.json();

  // Mock response for chat
  const response = {
    response: `You said: "${message}". This is a mock response. For a real analysis, please use the analyze feature.`,
    threads: [
      { id: 'thread_1', title: 'Q1 Revenue Analysis' },
      { id: 'thread_2', title: 'Product Performance' },
    ]
  };

  return NextResponse.json(response);
}
