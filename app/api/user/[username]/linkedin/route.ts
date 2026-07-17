import { NextRequest } from "next/server";
import { fetchLinkedInProfile } from "@/lib/linkedin";
import { getCustomUser } from "@/lib/custom-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    const customRecord = await getCustomUser(username);
    if (customRecord) {
      return Response.json(customRecord.linkedin);
    }

    const linkedinData = await fetchLinkedInProfile(username);
    if (!linkedinData) {
      return Response.json({ error: "LinkedIn profile not found or failed to load" }, { status: 404 });
    }

    return Response.json(linkedinData);
  } catch (error) {
    console.error("Error in linkedin API route:", error);
    return Response.json({ error: "Failed to load LinkedIn profile" }, { status: 500 });
  }
}
