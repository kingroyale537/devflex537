import Image from "next/image";
import Footer from "@/components/footer";
import AnimatedNav from "@/components/animated-nav/server";
import AnimatedHero from "@/components/animated-hero/server";
import IntegrationCard from "@/components/integration-card/server";
import ProfileCard from "@/components/profile-card/server";
import HowItWorksCard from "@/components/how-it-works-card/server";
import NextContributorCard from "@/components/next-contributor-card";
import { Compare } from "@/components/ui/compare";

interface Profile {
  username: string;
  name: string;
  avatar_url: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  social_accounts?: {
    provider: string;
    url: string;
  }[];
}

async function getProfiles(): Promise<Profile[]> {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/rishikeshrai/portfoliomaker/refs/heads/data/docs/data/processed_users.json",
      {
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data: Record<string, Profile> = await response.json();
      return Object.values(data).slice(-6);
    }
    return [];
  } catch (error) {
    console.warn("Error fetching recent profiles:", error);
    return [];
  }
}

const FALLBACK_CONTRIBUTORS: Profile[] = [
  {
    name: "Rishikesh Rai",
    username: "rishikeshrai",
    avatar_url: "https://api.dicebear.com/7.x/initials/svg?seed=Rishikesh%20Rai",
    bio: "Creator of PortfolioMaker, Full Stack Engineer",
    followers: 120,
    following: 80,
    public_repos: 45,
  }
];

async function getContributors(): Promise<Profile[]> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/rishikeshrai/portfoliomaker/contributors",
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "portfoliomaker-clone",
        },
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contributorsData = await response.json();

    if (!Array.isArray(contributorsData)) {
      console.warn("Contributors data is not an array:", contributorsData);
      return FALLBACK_CONTRIBUTORS;
    }

    const cleanedData = contributorsData.filter(
      (profile) =>
        profile &&
        typeof profile === "object" &&
        profile.login &&
        profile.login !== "actions-user"
    );

    const contributors = await Promise.all(
      cleanedData.slice(0, 7).map(async (profile) => {
        try {
          const userResponse = await fetch(
            `https://api.github.com/users/${profile.login}`,
            {
              headers: {
                Accept: "application/json",
                "User-Agent": "portfoliomaker-clone",
              },
              next: {
                revalidate: 3600,
              },
            }
          );

          if (!userResponse.ok) {
            throw new Error(`HTTP error! status: ${userResponse.status}`);
          }

          const userData = await userResponse.json();
          return {
            name: userData.name || profile.login,
            username: profile.login,
            avatar_url: profile.avatar_url,
            bio: userData.bio || "No bio available",
            followers: userData.followers || 0,
            following: userData.following || 0,
            public_repos: userData.public_repos || 0,
          };
        } catch (error) {
          console.warn(`Error fetching data for ${profile.login}:`, error);
          return {
            name: profile.login,
            username: profile.login,
            avatar_url: profile.avatar_url,
            bio: "No bio available",
            followers: 0,
            following: 0,
            public_repos: 0,
          };
        }
      })
    );

    return contributors.length > 0 ? contributors : FALLBACK_CONTRIBUTORS;
  } catch (error) {
    console.warn("Error fetching contributors, using fallback:", error);
    return FALLBACK_CONTRIBUTORS;
  }
}

export default async function Home() {
  const profiles = await getProfiles();
  const contributors = await getContributors();

  const howItWorksSteps = [
    {
      iconName: "Github" as const,
      title: "Connect GitHub",
      description:
        "Link your GitHub account to automatically showcase your repositories and contributions.",
    },
    {
      iconName: "RefreshCw" as const,
      title: "Weekly Updates",
      description:
        "Your portfolio stays fresh with automatic weekly updates of your latest projects and activities.",
    },
    {
      iconName: "Share2" as const,
      title: "Share Your Work",
      description:
        "Share your curated collection of projects and achievements with the world.",
    },
  ];

  return (
    <>
      <AnimatedNav />

      <main className="min-h-screen px-6 pt-20 md:px-24 md:pt-32 pb-0 overflow-hidden bg-white">
        <div id="home">
          <AnimatedHero />
        </div>

        {/* Compare Section */}
        <section className="py-20" id="services">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                Before & After
              </h2>
              <p className="text-xl text-gray-600">
                See the difference PortfolioMaker makes to your portfolio
              </p>
            </div>
            <div className="flex justify-center">
              <Compare
                firstImage="/images/compare-1.png"
                secondImage="/images/compare-2.png"
                firstImageClassName="object-cover object-left-top"
                secondImageClassname="object-cover object-left-top"
                className="w-full max-w-5xl h-[350px] md:h-[500px]"
                slideMode="hover"
              />
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-10 md:pt-20">
          <div className="container md:mx-auto md:px-4">
            <div className="flex">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 order-first md:order-last">
                  <h1 className="text-2xl md:text-4xl font-bold text-black leading-tight">
                    Stop Portfolio Panic: <br />
                    Build Yours in a Snap
                  </h1>
                  <p className="text-xl text-gray-600">
                    Staring down a blank screen, dreading the hours it&apos;ll
                    take to build a portfolio? Not anymore! PortfolioMaker is your
                    coding BFF, turning your messy GitHub profile into a sleek,
                    professional bio easily, not marathons.
                  </p>
                </div>
                <div className="flex-1 relative md:order-first">
                  <div className="relative xl:p-20">
                    <Image
                      src="/images/graph.png"
                      alt="Illustration"
                      width={500}
                      height={500}
                      className="w-full rounded-2xl border border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                Connect Your Developer Identity
              </h2>
              <p className="text-xl text-gray-600">
                Integrate with your favorite platforms to showcase your complete
                developer profile
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <IntegrationCard type="github" index={0} />
              <IntegrationCard type="linkedin" index={1} />
              <IntegrationCard type="medium" index={2} />
              <IntegrationCard type="more" index={3} />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20" id="how-it-works">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Create your developer portfolio in three simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howItWorksSteps.map((step, index) => (
                <HowItWorksCard
                  key={step.title}
                  iconName={step.iconName}
                  title={step.title}
                  description={step.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Contributors Section */}
        <section className="py-20" id="people">
          <div className="container mx-auto md:px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                Our Contributors
              </h2>
              <p className="text-xl text-gray-600">
                Meet the amazing developers who have contributed to making PortfolioMaker
                better
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
              {contributors.map((profile, index) => (
                <ProfileCard
                  key={profile.username}
                  name={profile.name}
                  username={profile.username}
                  avatarUrl={profile.avatar_url}
                  bio={profile.bio}
                  index={index}
                />
              ))}
              <NextContributorCard index={contributors.length} />
            </div>
          </div>
        </section>

        {/* Recent Profiles Section */}
        {profiles.length > 0 && (
          <section className="py-20 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                  Recent Profiles
                </h2>
                <p className="text-xl text-gray-600">
                  Check out the latest developers who created their portfolios
                  using PortfolioMaker
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {profiles.map((profile, index) => (
                  <div key={profile.username}>
                    <ProfileCard
                      name={profile.name}
                      username={profile.username}
                      avatarUrl={profile.avatar_url}
                      bio={profile.bio}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
