import { NextRequest } from "next/server";
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
      return Response.json({
        login: customRecord.username,
        avatar_url: customRecord.profile.avatar_url,
        name: customRecord.profile.name,
        bio: customRecord.profile.bio,
      });
    }

    const tokensStr =
      process.env.API_TOKEN_GITHUB ||
      process.env.GITHUB_TOKEN ||
      process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
      "";
    const tokens = tokensStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    let token = "";
    if (tokens.length > 0) {
      const randIndex = Math.floor(Math.random() * tokens.length);
      token = tokens[randIndex] || "";
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "devflex-clone-validation",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers,
    });

    if (!response.ok) {
      return Response.json({ error: "GitHub user not found" }, { status: response.status });
    }

    const data = await response.json();
    return Response.json({
      login: data.login,
      avatar_url: data.avatar_url,
      name: data.name || data.login,
      bio: data.bio || "No bio available",
    });
  } catch (error) {
    console.error("Error in validate API route:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
