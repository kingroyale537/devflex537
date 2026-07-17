import { NextRequest } from "next/server";
import { fetchUserProfile } from "@/lib/github";
import { generateProfileSummary, generateSeoContents } from "@/lib/ai";
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
      return Response.json(customRecord.profile);
    }

    const githubProfile = await fetchUserProfile(username);
    if (!githubProfile) {
      return Response.json({ error: "GitHub profile not found" }, { status: 404 });
    }

    // Generate AI content (summary and SEO)
    const [about, seo] = await Promise.all([
      generateProfileSummary({
        name: githubProfile.name || username,
        username,
        followers: githubProfile.followers || 0,
        public_repos: githubProfile.public_repos || 0,
        bio: githubProfile.bio || "",
        readme_content: githubProfile.readme_content || "",
      }),
      generateSeoContents({
        name: githubProfile.name || username,
        username,
        followers: githubProfile.followers || 0,
        public_repos: githubProfile.public_repos || 0,
        bio: githubProfile.bio || "",
        readme_content: githubProfile.readme_content || "",
      }),
    ]);

    const fullProfile = {
      ...githubProfile,
      about,
      seo,
      cached: false,
    };

    return Response.json(fullProfile);
  } catch (error) {
    console.error("Error in profile API route:", error);
    return Response.json({ error: "Failed to load user profile" }, { status: 500 });
  }
}
