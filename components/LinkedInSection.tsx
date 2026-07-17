import { ArrowDown } from "lucide-react";
import Timeline from "@/components/timeline";
import { getUserLinkedInProfile, getUserProfile } from "@/lib/api";
import { transformLinkedInData } from "@/lib/transform";

export async function LinkedInSection({ username }: { username: string }) {
  try {
    const user = await getUserProfile(username);
    if (!user) return null;

    const linkedInAccount = user?.social_accounts?.find(
      (e) => e.provider.toLowerCase() === "linkedin"
    );
    const linkedInUsername =
      linkedInAccount?.url?.split("in/").pop()?.replace("/", "") || "";

    if (!linkedInUsername) return null;

    console.log(`Fetching LinkedIn data for ${linkedInUsername}...`);
    const linkedInData = await getUserLinkedInProfile(linkedInUsername);

    if (!linkedInData) {
      console.warn(
        `Failed to fetch LinkedIn data for ${linkedInUsername} after retries`
      );
      return null;
    }

    const hasExperience =
      linkedInData?.experience &&
      Array.isArray(linkedInData.experience) &&
      linkedInData.experience.length > 0;
    const hasEducation =
      linkedInData?.education &&
      Array.isArray(linkedInData.education) &&
      linkedInData.education.length > 0;

    if (!hasExperience && !hasEducation) {
      console.log(
        `No experience or education data found for ${linkedInUsername}`
      );
      return null;
    }

    console.log(`Successfully fetched LinkedIn data for ${linkedInUsername}`);
    return (
      <>
        {hasExperience && (
          <div className="mb-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-black mb-8">
              Experience <ArrowDown strokeWidth={2} className="inline text-black" />
            </h2>
            <Timeline
              items={
                linkedInData.experience
                  ? transformLinkedInData(linkedInData.experience)
                  : []
              }
              backgroundColor="bg-[#B9FF66]"
            />
          </div>
        )}

        {hasEducation && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-black mb-8">
              Education <ArrowDown strokeWidth={2} className="inline text-black" />
            </h2>
            <Timeline
              items={
                linkedInData.education
                  ? transformLinkedInData(linkedInData.education)
                  : []
              }
              backgroundColor="bg-white"
            />
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error("Error in LinkedInSection:", error);
    return null;
  }
}
export default LinkedInSection;
