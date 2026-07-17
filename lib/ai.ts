import { SEOContent } from "@/types/types";

const callGemini = async (prompt: string, systemInstruction?: string, jsonMode = false): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }

  const model = "gemini-1.5-flash"; // Standard robust, fast model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: jsonMode
      ? {
          responseMimeType: "application/json",
        }
      : undefined,
    systemInstruction: systemInstruction
      ? {
          parts: [{ text: systemInstruction }],
        }
      : undefined,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("No text response from Gemini API");
  }
  return text;
};

const callGroq = async (prompt: string, systemInstruction?: string, jsonMode = false): Promise<string> => {
  const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || "";
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in environment variables.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
        { role: "user", content: prompt },
      ],
      response_format: jsonMode ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("No text response from Groq API");
  }
  return text;
};

const callAI = async (prompt: string, systemInstruction?: string, jsonMode = false): Promise<string> => {
  const hasGroq = !!(process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY);
  const hasGemini = !!(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  if (hasGroq) {
    try {
      return await callGroq(prompt, systemInstruction, jsonMode);
    } catch (error) {
      console.warn("Groq failed, trying Gemini if available...", error);
      if (hasGemini) {
        return await callGemini(prompt, systemInstruction, jsonMode);
      }
      throw error;
    }
  } else if (hasGemini) {
    return await callGemini(prompt, systemInstruction, jsonMode);
  } else {
    throw new Error("Neither GROQ_API_KEY nor GEMINI_API_KEY is defined in environment variables.");
  }
};

export const generateSeoContents = async (profileData: {
  name: string;
  username: string;
  followers: number;
  public_repos: number;
  bio: string;
  readme_content: string;
}): Promise<SEOContent> => {
  const prompt = `
Generate a concise, professional, and SEO-optimized profile snippet for a developer profile page.

Return the output strictly in the following JSON format (without any additional commentary):
{
  "title": "<Max 10 words. Format: FirstName (@username). Role passionate about [what they do]>",
  "description": "<Max 30 words (120–160 characters). Meta-style description that highlights skills and invites engagement>",
  "keywords": "<8–15 comma-separated keywords or phrases. Focus on Next.js-related terms, long-tail SEO phrases, and specific skills>"
}

Use this input data to personalize the content, handling missing or empty fields gracefully:
- Name: ${profileData.name || "Anonymous Developer"}
- Username: ${profileData.username || "username"}
- Followers: ${profileData.followers || 0} ${profileData.followers > 500 ? "(highlight this network size)" : ""}
- Public Repositories: ${profileData.public_repos || 0} ${profileData.public_repos > 20 ? "(highlight this amount of repos)" : ""}
- Bio: ${profileData.bio || ""}
- README: ${profileData.readme_content || ""}

If data is sparse, infer likely skills or focus areas. Avoid filler or generic phrases. Prioritize precision and clarity.
`;

  const system =
    "You are an SEO-optimized profile content generator for developer portfolios and GitHub profiles. Create search engine friendly, professional profile summaries that enhance discoverability and professional presence. Generate content in natural paragraph format without headings, lists, or bullet points. Focus on keyword integration, meta-friendly descriptions, and compelling copy that drives engagement and showcases technical expertise effectively. Your output should be properly formatted JSON when requested, with each field containing well-crafted, SEO-optimized content.";

  try {
    const text = await callAI(prompt, system, true);
    const result = JSON.parse(text);

    return {
      title: result.title || `${profileData.name} (@${profileData.username})`,
      description: result.description || `${profileData.name}'s professional developer profile and projects.`,
      keywords: result.keywords || "developer portfolio, projects, github, resume",
    };
  } catch (error) {
    console.error("AI SEO content generation failed, returning default:", error);
    return {
      title: `${profileData.name} (@${profileData.username}) | Software Engineer Portfolio`,
      description: `${profileData.name}'s developer profile containing featured GitHub repositories, contribution highlights, and professional history.`,
      keywords: "developer portfolio, github, portfolio, developer projects, software engineer",
    };
  }
};

export const generateProfileSummary = async (profileData: {
  name: string;
  username: string;
  followers: number;
  public_repos: number;
  bio: string;
  readme_content: string;
}): Promise<string> => {
  const prompt = `
Write only the final profile summary text — no introductions, no explanations, and no meta sentences.
Craft a Concise, SEO-optimized first-person profile description that:
- Highlights the developer's strongest technical skills and expertise
- Concise and on to the point
- Uses simple, direct language without excessive superlatives
- Incorporates unique details from the profile, bio and readme.md (if available)
- Limits the bio to 2-3 sentences

Profile Details:
Name: ${profileData.name}
- Followers: ${profileData.followers} (indicating professional network and influence)
- Public Repositories: ${profileData.public_repos} (demonstrating active development)
- Bio: ${profileData.bio}
- README: ${profileData.readme_content}

Generate a short, engaging summary.
`;

  const system =
    "You are a professional profile summarizer for GitHub developers. Create a professional first-person profile summary without any heading, list, or bullet points.";

  try {
    return await callAI(prompt, system, false);
  } catch (error) {
    console.error("AI Profile Summary generation failed, returning default:", error);
    return profileData.bio || "Passionate software engineer building modern applications and solving coding challenges.";
  }
};
