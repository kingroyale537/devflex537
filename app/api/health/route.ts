import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Attempt database check
    await db.connect();
    
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: db.isConnected ? "connected" : "disconnected",
        engine: "Developer Portfolio Generator Engine v1.0.0",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
