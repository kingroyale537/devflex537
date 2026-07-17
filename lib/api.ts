import {
  LinkedInProfile,
  MediumBlog,
  Profile,
  UserProject,
} from "@/types/types";

const getBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    return "/api";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchResource = async <T>(endpoint: string, options: any = {}): Promise<T | null> => {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: {
        revalidate: 3600, // Revalidate every hour
        ...options.next,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching ${endpoint}: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
};

export const getUserProfile = async (username: string): Promise<Profile | null> => {
  if (!username) return null;
  return fetchResource<Profile>(`/user/${username}/profile`);
};

export const getUserProjects = async (username: string): Promise<UserProject | null> => {
  if (!username) return null;
  return fetchResource<UserProject>(`/user/${username}/projects`);
};

export const getUserLinkedInProfile = async (username: string): Promise<LinkedInProfile | null> => {
  if (!username) return null;
  return fetchResource<LinkedInProfile>(`/user/${username}/linkedin`);
};

export const getUserMediumBlogs = async (username: string): Promise<MediumBlog[] | null> => {
  if (!username) return null;
  return fetchResource<MediumBlog[]>(`/user/${username}/medium`);
};

// Server-side aliases
export const getProfileData = getUserProfile;
export const getProjectData = getUserProjects;
export const getLinkedInProfileData = getUserLinkedInProfile;

// Telemetry tracker helper
export const addUserToSupabase = async (
  user: Profile | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchParams?: URLSearchParams
): Promise<void> => {
  if (!user) return;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Fail silently to avoid breaking pages when Supabase telemetry keys are not set
    return;
  }

  const url = `${supabaseUrl}/functions/v1/portfoliomaker-io`;
  const mappedData = {
    name: user.username,
    "full name": user.name,
    "portfolio profile": `https://portfoliomaker.io/${user.username}`,
    github: `https://github.com/${user.username}`,
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(mappedData),
    });
  } catch (error) {
    console.error("Telemetry report failed:", error);
  }
};
