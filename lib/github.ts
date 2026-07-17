import { Profile, Project, UserProject, LanguageUsage } from "@/types/types";

let tokenIndex = 0;
const getGithubToken = (): string => {
  const tokensStr =
    process.env.API_TOKEN_GITHUB ||
    process.env.GITHUB_TOKEN ||
    process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
    "";
  const tokens = tokensStr
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length === 0) {
    return "";
  }
  const token = tokens[tokenIndex % tokens.length];
  tokenIndex++;
  return token;
};

export const validateGithubUsername = (username: string): boolean => {
  if (!username) return false;
  const pattern = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  return pattern.test(username);
};

const getGithubHeaders = () => {
  const token = getGithubToken();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "devflex-clone",
  };
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }
  return headers;
};

// Simple edit distance string similarity helper
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  if (s1 === s2) return 1.0;

  const m = s1.length;
  const n = s2.length;
  if (m === 0 || n === 0) return 0;

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  const maxLen = Math.max(m, n);
  return (maxLen - dp[m][n]) / maxLen;
}

function findBestMatch(content: string, username: string, patterns: RegExp[]): string | null {
  const allMatches: { url: string; similarity: number }[] = [];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const fullUrl = match[0];
      const handle = match[1] || "";
      const cleanedHandle = handle.replace(/[\/@]/g, "").trim();

      const similarity = calculateSimilarity(username, cleanedHandle);
      allMatches.push({
        url: fullUrl.startsWith("http") ? fullUrl : `https://${fullUrl}`,
        similarity,
      });
    }
  }

  allMatches.sort((a, b) => b.similarity - a.similarity);
  return allMatches.length > 0 ? allMatches[0].url : null;
}

export const getSocialFromReadme = async (username: string): Promise<Record<string, string>> => {
  try {
    const token = getGithubToken();
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "devflex-clone",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const readmeUrl = `https://api.github.com/repos/${username}/${username}/readme`;
    const response = await fetch(readmeUrl, { headers });

    if (!response.ok) {
      // Try fallback README location
      const altUrl = `https://api.github.com/repos/${username}/${username}/contents/README.md`;
      const altResponse = await fetch(altUrl, { headers });
      if (!altResponse.ok) return {};

      const altJson = await altResponse.json();
      const content = Buffer.from(altJson.content || "", "base64").toString("utf-8");
      return parseReadmeSocials(content, username);
    }

    const json = await response.json();
    const content = Buffer.from(json.content || "", "base64").toString("utf-8");
    return parseReadmeSocials(content, username);
  } catch (error) {
    console.error("Error reading socials from README:", error);
    return {};
  }
};

const parseReadmeSocials = (content: string, username: string): Record<string, string> => {
  const linkedinPatterns = [
    /https?:\/\/(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/gi,
    /linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/gi,
  ];
  const mediumPatterns = [
    /https?:\/\/(?:www\.)?medium\.com\/@?([a-zA-Z0-9_-]+)\/?/gi,
    /medium\.com\/@?([a-zA-Z0-9_-]+)\/?/gi,
    /https?:\/\/([a-zA-Z0-9_-]+)\.medium\.com\/?/gi,
  ];

  const socials: Record<string, string> = {};

  const linkedinMatch = findBestMatch(content, username, linkedinPatterns);
  if (linkedinMatch) socials["linkedin"] = linkedinMatch;

  const mediumMatch = findBestMatch(content, username, mediumPatterns);
  if (mediumMatch) socials["medium"] = mediumMatch;

  return socials;
};

export const fetchSocialAccounts = async (username: string) => {
  const socialAccounts: { provider: string; url: string }[] = [];
  try {
    const baseSocialUrl = `https://api.github.com/users/${username}/social_accounts`;
    const response = await fetch(baseSocialUrl, { headers: getGithubHeaders() });

    if (response.ok) {
      const apiAccounts = await response.json();
      for (const account of apiAccounts) {
        socialAccounts.push({
          provider: account.provider || "generic",
          url: account.url || "",
        });
      }
    }

    let hasLinkedin = false;
    let hasMedium = false;

    for (const account of socialAccounts) {
      const provider = account.provider.toLowerCase();
      const url = account.url.toLowerCase();
      if (provider === "linkedin" || url.includes("linkedin.com")) {
        hasLinkedin = true;
      }
      if (provider === "medium" || url.includes("medium.com")) {
        hasMedium = true;
      }
    }

    if (!hasLinkedin || !hasMedium) {
      const readmeSocials = await getSocialFromReadme(username);
      if (!hasLinkedin && readmeSocials["linkedin"]) {
        socialAccounts.push({
          provider: "linkedin",
          url: readmeSocials["linkedin"],
        });
      }
      if (!hasMedium && readmeSocials["medium"]) {
        socialAccounts.push({
          provider: "generic",
          url: readmeSocials["medium"],
        });
      }
    }
  } catch (error) {
    console.error("Error fetching social accounts:", error);
  }
  return socialAccounts;
};

export const fetchUserProfile = async (username: string): Promise<Partial<Profile> | null> => {
  if (!validateGithubUsername(username)) {
    console.error(`Invalid GitHub username: ${username}`);
    return null;
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const oneYearAgoISO = oneYearAgo.toISOString();

  const graphqlQuery = {
    query: `
      query {
        user(login: "${username}") {
          name
          bio
          location
          avatarUrl
          url
          followers {
            totalCount
          }
          following {
            totalCount
          }
          repository(name: "${username}") {
            object(expression: "HEAD:README.md") {
              ... on Blob {
                text
              }
            }
          }
          repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
            totalCount
            nodes {
              name
              description
              stargazerCount
              forkCount
              primaryLanguage {
                name
              }
              url
              updatedAt
              isFork
              isArchived
              homepageUrl
            }
          }
          contributionsCollection(from: "${oneYearAgoISO}") {
            contributionCalendar {
              totalContributions
            }
          }
          pullRequests(first: 100, states: MERGED, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              createdAt
            }
            totalCount
          }
          issues(last: 100, states: CLOSED) {
            totalCount
            nodes {
              createdAt
            }
          }
          repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
            totalCount
          }
        }
      }
    `,
  };

  try {
    const token = getGithubToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "devflex-clone",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      throw new Error(`GitHub GraphQL API error: ${response.status}`);
    }

    const resJson = await response.json();
    const user = resJson.data?.user;

    if (!user) {
      throw new Error(`GitHub user ${username} not found via GraphQL`);
    }

    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(now.getDate() - 365);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prMergedLastYear = (user.pullRequests?.nodes || []).filter((pr: any) => {
      const prDate = new Date(pr.createdAt);
      return prDate > oneYearAgo;
    }).length;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const issuesClosedLastYear = (user.issues?.nodes || []).filter((issue: any) => {
      const issueDate = new Date(issue.createdAt);
      return issueDate > oneYearAgo;
    }).length;

    const social_accounts = await fetchSocialAccounts(username);

    return {
      username,
      name: user.name || username,
      bio: user.bio || "",
      location: user.location || "",
      avatar_url: user.avatarUrl || "",
      profile_url: user.url || "",
      followers: user.followers?.totalCount || 0,
      following: user.following?.totalCount || 0,
      public_repos: user.repositories?.totalCount || 0,
      pull_requests_merged: prMergedLastYear >= 100 ? "100+" : prMergedLastYear,
      issues_closed: issuesClosedLastYear >= 100 ? "100+" : issuesClosedLastYear,
      achievements: {
        total_contributions: user.contributionsCollection?.contributionCalendar?.totalContributions || 0,
        repositories_contributed_to: user.repositoriesContributedTo?.totalCount || 0,
      },
      social_accounts,
      readme_content: user.repository?.object?.text || "",
    };
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    return null;
  }
};

const LANGUAGE_COMPLEXITY: Record<string, number> = {
  Rust: 9.5,
  C: 8.5,
  "C++": 8.0,
  Haskell: 9.0,
  Scala: 8.5,
  Go: 8.0,
  Julia: 8.5,
  R: 7.5,
  TypeScript: 7.5,
  Kotlin: 7.5,
  Swift: 7.0,
  Python: 6.5,
  Ruby: 6.0,
  JavaScript: 5.5,
  Erlang: 9.0,
  Clojure: 8.5,
  Elixir: 8.0,
  Elm: 7.5,
  Crystal: 7.0,
  Nim: 7.0,
  Unknown: 3.0,
  HTML: 3.0,
  CSS: 3.0,
  Shell: 4.0,
};

export const fetchPinnedRepos = async (username: string): Promise<string[]> => {
  const query = {
    query: `
      query {
        user(login: "${username}") {
          pinnedItems(first: 6, types: REPOSITORY) {
            nodes {
              ... on Repository {
                name
              }
            }
          }
        }
      }
    `,
  };

  try {
    const token = getGithubToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "devflex-clone",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify(query),
    });

    if (response.ok) {
      const json = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodes = json.data?.user?.pinnedItems?.nodes || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return nodes.map((node: any) => node.name);
    }
  } catch (error) {
    console.error("Error fetching pinned repos:", error);
  }
  return [];
};

export const fetchFeaturedProjects = async (username: string): Promise<UserProject | null> => {
  try {
    const pinnedRepos = await fetchPinnedRepos(username);
    const token = getGithubToken();
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "devflex-clone",
    };
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    // Fetch up to 100 repositories
    let page = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repos: any[] = [];

    while (true) {
      const url = `https://api.github.com/users/${username}/repos?page=${page}&per_page=100`;
      const response = await fetch(url, { headers });
      if (!response.ok) break;

      const pageRepos = await response.json();
      if (!pageRepos || pageRepos.length === 0) break;

      repos.push(...pageRepos);
      page++;
    }

    // Calculate language frequencies
    const languageCounts: Record<string, number> = {};
    let totalLanguageRepos = 0;

    for (const repo of repos) {
      if (repo.fork || repo.archived) continue;
      const lang = repo.language || "Unknown";
      languageCounts[lang] = (languageCounts[lang] || 0) + 1;
      totalLanguageRepos++;
    }

    // Sort and calculate programming language scores
    const scoredLanguages: { language: string; count: number; score: number }[] = [];
    Object.entries(languageCounts).forEach(([lang, count]) => {
      if (lang === "Unknown") return;
      const complexity = LANGUAGE_COMPLEXITY[lang] || 5.0;
      const usage = totalLanguageRepos > 0 ? Math.sqrt(count / totalLanguageRepos) * 10 : 0;
      const score = complexity * 0.6 + usage * 0.4;

      scoredLanguages.push({ language: lang, count, score });
    });

    const topLanguages: LanguageUsage[] = scoredLanguages
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => [item.language, item.count]);

    // Rank projects
    const scoredProjects: Project[] = [];
    for (const repo of repos) {
      if (repo.fork || repo.archived) continue;

      const stars = repo.stargazers_count || 0;
      const forks = repo.forks_count || 0;
      const createdAt = new Date(repo.created_at);
      const updatedAt = new Date(repo.updated_at);
      const now = new Date();

      const daysSinceCreation = Math.max(1, (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24));
      const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 3600 * 24);

      const starWeight = 2.0;
      const forkWeight = 1.5;
      const recencyWeight = 1.0;
      const pinnedWeight = 10;

      const starScore = Math.log1p(stars) * starWeight;
      const forkScore = Math.log1p(forks) * forkWeight;

      let recencyBonus = 0.5;
      if (daysSinceUpdate <= 365) {
        recencyBonus = 1.5;
      } else if (daysSinceUpdate <= 730) {
        recencyBonus = 1.0;
      }

      const isPinned = pinnedRepos.includes(repo.name);
      const pinnedBonus = isPinned ? pinnedWeight : 0;

      const score =
        starScore +
        forkScore +
        recencyWeight * recencyBonus * (1 / Math.log1p(daysSinceCreation)) +
        pinnedBonus;

      scoredProjects.push({
        name: repo.name,
        description: repo.description || "No description",
        score,
        stars,
        forks,
        language: repo.language || "Unknown",
        url: repo.html_url || "",
        updatedAt: repo.updated_at || "",
        isPinned,
        homepage: repo.homepage || null,
      });
    }

    const topProjects = scoredProjects
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 8);

    return {
      top_projects: topProjects,
      top_languages: topLanguages,
    };
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    return null;
  }
};
