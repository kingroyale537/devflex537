import Image from "next/image";
import { Github, Globe, Linkedin, Twitter, User, BookOpen, Instagram } from "lucide-react";
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton";
import { addUserToSupabase, getUserProfile } from "@/lib/api";
import ClientResumeButton from "@/components/ClientResumeButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { SupportModal } from "@/components/modal/support-modal";
import { UserProfileBanner } from "@/components/UserProfileBanner";

const extractDomainName = (url: string) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const iconComponents = {
  linkedin: Linkedin,
  twitter: Twitter,
  generic: Globe,
  medium: BookOpen,
  instagram: Instagram,
  huggingface: Globe,
};

const detectProvider = (url: string): string => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes("medium.com")) return "medium";
  if (urlLower.includes("instagram.com")) return "instagram";
  if (urlLower.includes("huggingface.co")) return "huggingface";
  return "generic";
};

export async function ProfileSection({
  username,
  searchParams,
}: {
  username: string;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const user = await getUserProfile(username);

  const urlSearchParams = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && typeof value === "string") {
        urlSearchParams.set(key, value);
      }
    });
  }

  // Analytics logging in background
  if (user) {
    addUserToSupabase(user, urlSearchParams).catch((error) => {
      console.error("Background analytics report failed:", error);
    });
  }

  if (!user) return <ProfileSkeleton />;

  return (
    <TooltipProvider>
      <UserProfileBanner user={user} />
      <div className="rounded-xl border-[1px] border-black bg-white overflow-hidden w-full max-w-md lg:max-w-none border-b-6 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        <div className="h-28 bg-[linear-gradient(94.26deg,#EAFFD1_31.3%,#B9FF66_93.36%)] relative">
          <div className="absolute left-1/2 lg:left-8 bottom-0 translate-x-[-50%] lg:translate-x-0 translate-y-1/2">
            <div className="bg-[#AFE555] rounded-[19px] w-32 h-32 flex items-center justify-center border-7 border-white">
              <Image
                src={user.avatar_url}
                alt={user?.name || username}
                width={120}
                height={120}
                className="rounded-[16px] object-cover"
                unoptimized
              />
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 pb-8 pt-20">
          <div className="flex flex-col items-start text-left">
            <h1 className="font-bold text-2xl mb-2 text-black">
              {(user.name || username).toUpperCase()}
            </h1>
            <p className="text-gray-700 text-md">{user.bio}</p>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4 text-black">
              <User className="w-5 h-5 stroke-[2]" />
              <h2 className="font-bold">Connect with me</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black hover:bg-[#B9FF66] transition-all duration-300 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                    <a
                      href={`https://github.com/${username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub"
                      className="w-full h-full flex items-center justify-center"
                    >
                      <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center">
                        <Github
                          size={24}
                          strokeWidth={2}
                          className="text-black"
                        />
                      </span>
                    </a>
                  </div>
                </TooltipTrigger>
                <TooltipContent>GitHub</TooltipContent>
              </Tooltip>

              {user.social_accounts?.map((account) => {
                if (account.provider.toLowerCase() === "github") return null;

                const provider =
                  account.provider.toLowerCase() === "generic"
                    ? detectProvider(account.url)
                    : account.provider.toLowerCase();

                const tooltipText =
                  provider === "generic"
                    ? extractDomainName(account.url)
                    : provider;

                return (
                  <Tooltip key={account.url}>
                    <TooltipTrigger asChild>
                      <div className="group relative w-12 h-12 flex items-center justify-center bg-white rounded-2xl border-[1px] border-black hover:bg-[#B9FF66] transition-all duration-300 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                        <a
                          href={account.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={tooltipText}
                          className="w-full h-full flex items-center justify-center"
                        >
                          {account.url.includes("portfoliomaker.io") ? (
                            <Image
                              src="/images/logo.png"
                              alt="PortfolioMaker"
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          ) : (
                            <span className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center">
                              {(() => {
                                const IconComponent =
                                  iconComponents[
                                    provider as keyof typeof iconComponents
                                  ] || iconComponents.generic;
                                return (
                                  <IconComponent
                                    size={24}
                                    strokeWidth={2}
                                    className="text-black"
                                  />
                                );
                              })()}
                            </span>
                          )}
                        </a>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipText}</TooltipContent>
                  </Tooltip>
                );
              })}
              <ClientResumeButton username={username} />
            </div>
          </div>

          {user.achievements?.total_contributions > 0 && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h2 className="font-bold mb-4 text-black text-sm">
                {user.achievements?.total_contributions.toLocaleString()} contributions in the last year
              </h2>
              <div className="w-full overflow-hidden rounded-lg relative" style={{ height: "100px" }}>
                <img
                  className="absolute right-0 top-0 h-full w-auto block max-w-none"
                  src={`https://ghchart.rshah.org/5F8417/${user.username}`}
                  alt={`${user.name}'s GitHub contributions`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <SupportModal user={user} />
    </TooltipProvider>
  );
}
export default ProfileSection;
