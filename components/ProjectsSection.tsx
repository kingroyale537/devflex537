import { ArrowDown } from "lucide-react";
import ProjectCard from "@/components/project-card";
import { getUserProjects } from "@/lib/api";

export async function ProjectsSection({ username }: { username: string }) {
  const userProjects = await getUserProjects(username);

  const hasProjects = userProjects && userProjects?.top_projects?.length > 0;

  if (!hasProjects) return null;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-black mb-8">
        Projects <ArrowDown strokeWidth={2} className="inline text-black" />
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userProjects?.top_projects?.map((project, index, arr) => {
          const isInPair = index % 2 === 0 && index + 1 < arr.length;
          const nextInPair = index % 2 === 1;
          const heightClass = isInPair || nextInPair ? "h-full" : "";

          return (
            <div key={project.name} className={heightClass}>
              <ProjectCard {...project} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default ProjectsSection;
