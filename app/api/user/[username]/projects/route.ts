import { NextRequest } from "next/server";
import { fetchFeaturedProjects } from "@/lib/github";
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
      return Response.json(customRecord.projects);
    }

    const projectsData = await fetchFeaturedProjects(username);
    if (!projectsData) {
      return Response.json({ error: "Failed to fetch projects data" }, { status: 404 });
    }

    return Response.json(projectsData);
  } catch (error) {
    console.error("Error in projects API route:", error);
    return Response.json({ error: "Failed to load projects" }, { status: 500 });
  }
}
