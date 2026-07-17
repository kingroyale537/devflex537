import { LinkedInProfile } from "@/types/types";

export const validateLinkedInUsername = (username: string): boolean => {
  const pattern = /^[\w\-]+$/;
  return pattern.test(username);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processLinkedInResponse = (data: any): LinkedInProfile | { error: string } => {
  if (!data || !data.profile) {
    return { error: "No profile data found" };
  }

  const profile = data.profile;

  return {
    basic_info: {
      full_name: profile.full_name || "",
      headline: profile.headline || "",
      location: {
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
      },
      summary: profile.summary || "",
      profile_url: `https://linkedin.com/in/${profile.public_identifier || ""}`,
      connections: profile.connections || 0,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    experience: (profile.experiences || []).map((exp: any) => ({
      title: exp.title || "",
      company: exp.company || "",
      location: exp.location || "",
      description: exp.description || null,
      duration: {
        start: {
          month: exp.starts_at?.month || undefined,
          year: exp.starts_at?.year || 0,
        },
        end: exp.ends_at
          ? {
              month: exp.ends_at.month || undefined,
              year: exp.ends_at.year || undefined,
            }
          : undefined,
      },
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    education: (profile.education || []).map((edu: any) => ({
      school: edu.school || "",
      degree: edu.degree_name || "",
      field: edu.field_of_study || null,
      duration: {
        start: {
          year: edu.starts_at?.year || 0,
        },
        end: {
          year: edu.ends_at?.year || 0,
        },
      },
    })),
  };
};

export const fetchLinkedInProfile = async (username: string): Promise<LinkedInProfile | null> => {
  if (!validateLinkedInUsername(username)) {
    console.error(`Invalid LinkedIn username: '${username}'`);
    return null;
  }

  const payload = {
    action: "wrapped",
    cache: false,
    email: "mail@example.com",
    linkedinUrl: `https://linkedin.com/in/${username}`,
    user: false,
  };

  try {
    const response = await fetch("https://notes.cleve.ai/api/linkedin-unwrapped", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const processed = processLinkedInResponse(json.data);
    
    if ("error" in processed) {
      console.warn("LinkedIn processing warning:", processed.error);
      return null;
    }

    return processed;
  } catch (error) {
    console.warn(`Error fetching LinkedIn data for ${username}:`, error);
    return null;
  }
};
