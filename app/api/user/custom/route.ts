import { NextRequest } from "next/server";
import { saveCustomUser, getCustomUser } from "@/lib/custom-db";
import { Profile, UserProject, LinkedInProfile, Project, Experience } from "@/types/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, name, bio, avatar_url, location, social_accounts, projects, experience } = body;

    if (!username || !name) {
      return Response.json({ error: "Username and Name are required" }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "");

    // Verify availability
    const existing = await getCustomUser(cleanUsername);
    if (existing) {
      // Allow updating existing manual profiles
      // If we want to allow editing, we can proceed. Let's log it.
    }

    // Map basic Profile data
    const profile: Profile = {
      username: cleanUsername,
      name,
      bio: bio || "",
      location: location || "Remote",
      avatar_url: avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      profile_url: `https://github.com/${cleanUsername}`,
      followers: 0,
      following: 0,
      public_repos: projects?.length || 0,
      pull_requests_merged: 0,
      issues_closed: 0,
      achievements: {
        total_contributions: 0,
        repositories_contributed_to: 0,
      },
      social_accounts: social_accounts || [],
      readme_content: `# ${name}\n\n${bio || ""}`,
      about: bio || "",
      seo: {
        title: `${name} - Developer Portfolio`,
        description: bio || `${name}'s personal developer portfolio showcasing skills, projects, and career timeline.`,
        keywords: `${name}, Portfolio, Software Engineer, Web Developer, Projects`,
      },
      cached: true,
    };

    // Map projects data
    const formattedProjects: Project[] = (projects || []).map((p: any) => ({
      name: p.name,
      description: p.description || null,
      score: 100,
      stars: Number(p.stars) || 0,
      forks: 0,
      language: p.language || "TypeScript",
      url: p.url || "#",
      updatedAt: new Date().toISOString(),
      isPinned: true,
      homepage: p.homepage || p.url || null,
    }));

    const userProjects: UserProject = {
      top_projects: formattedProjects,
      top_languages: Object.entries(
        formattedProjects.reduce((acc: Record<string, number>, curr) => {
          acc[curr.language] = (acc[curr.language] || 0) + 1;
          return acc;
        }, {})
      ).map(([lang, count]) => [lang, count]),
    };

    // Map Experience Timeline (LinkedIn format)
    const formattedExperience: Experience[] = (experience || []).map((exp: any) => {
      const startYear = Number(exp.startYear) || new Date().getFullYear();
      const endYear = exp.endYear ? Number(exp.endYear) : undefined;
      return {
        title: exp.title,
        company: exp.company,
        location: exp.location || "Remote",
        description: exp.description || null,
        duration: {
          start: { year: startYear, month: Number(exp.startMonth) || undefined },
          end: endYear ? { year: endYear, month: Number(exp.endMonth) || undefined } : undefined,
        },
      };
    });

    const linkedinProfile: LinkedInProfile = {
      basic_info: {
        full_name: name,
        headline: bio || "",
        location: {
          city: location || "Remote",
          state: "",
          country: "",
        },
        summary: bio || "",
        profile_url: `#`,
        connections: 500,
      },
      experience: formattedExperience,
      education: [],
    };

    const success = await saveCustomUser({
      username: cleanUsername,
      profile,
      projects: userProjects,
      linkedin: linkedinProfile,
    });

    if (!success) {
      return Response.json({ error: "Failed to save profile to database" }, { status: 500 });
    }

    return Response.json({ success: true, username: cleanUsername });
  } catch (error) {
    console.error("Error creating custom profile:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
