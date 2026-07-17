import Badge from "@/components/Badge";
import { getUserProfile, getUserProjects } from "@/lib/api";
import { ArrowDown } from "lucide-react";

export async function AboutSection({ username }: { username: string }) {
  const user = await getUserProfile(username);
  const userProjects = await getUserProjects(username);

  if (!user) return null;

  return (
    <>
      <div className="text-2xl font-bold mb-4 text-black animate-fade-in">
        <h2>
          Get to know me <ArrowDown strokeWidth={2} className="inline text-black" />
        </h2>
      </div>
      <div className="flex flex-col lg:flex-row gap-4">
        <div
          className="flex flex-col gap-4 flex-1 animate-slide-right"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-white rounded-xl p-6 border-1 border-black border-b-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-bold mb-4 text-black">💻 Languages</h2>
            <div className="flex flex-wrap gap-3">
              {userProjects?.top_languages?.map((language, index) => (
                <div
                  key={index}
                  className="mb-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Badge label={language[0]} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {Number(user.issues_closed) > 0 && (
              <div
                className="bg-[#B9FF66] rounded-xl p-6 border-1 border-black border-b-4 flex-1 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                style={{ animationDelay: "300ms" }}
              >
                <h2 className="font-bold mb-2 text-black">Issue Closed</h2>
                <p
                  className="text-2xl font-bold text-black animate-count-up"
                  data-value={user.issues_closed}
                >
                  {user.issues_closed}
                </p>
              </div>
            )}

            {Number(user.pull_requests_merged) > 0 && (
              <div
                className="bg-white rounded-xl p-6 border-1 border-black border-b-4 flex-1 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                style={{ animationDelay: "400ms" }}
              >
                <h2 className="font-bold mb-2 text-black">PR Merged</h2>
                <p
                  className="text-2xl font-bold text-black animate-count-up"
                  data-value={user.pull_requests_merged}
                >
                  {user.pull_requests_merged}
                </p>
              </div>
            )}
          </div>
        </div>

        <div
          className="flex flex-col gap-4 flex-1 animate-slide-left"
          style={{ animationDelay: "200ms" }}
        >
          {user?.about && (
            <div className="bg-white rounded-xl p-6 border-1 border-black border-b-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-bold mb-4 text-black">🤔 About</h2>
              <p className="text-gray-700">{user?.about}</p>
            </div>
          )}

          {user?.location && (
            <div
              className="bg-[#B9FF66] rounded-xl p-6 border-1 border-black border-b-4 col-span-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              style={{ animationDelay: "500ms" }}
            >
              <h2 className="text-xl font-bold mb-2 text-black">📍 Location</h2>
              <p className="text-black">{user?.location}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default AboutSection;
