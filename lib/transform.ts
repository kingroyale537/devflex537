import { Education, Experience } from "@/types/types";
import { getMonth } from "@/lib/utils";
import { TimelineItem } from "@/components/timeline";

export const transformLinkedInData = (
  data: Experience[] | Education[]
): TimelineItem[] => {
  return data.map((item) => {
    if ("company" in item) {
      const exp = item as Experience;
      return {
        title: exp.title || "",
        subtitle: exp.company || "",
        location: exp.location || "",
        duration: {
          start: `${exp.duration?.start?.year || ""} ${
            exp.duration?.start?.month ? `${getMonth(exp.duration.start.month)}` : ""
          }`.trim(),
          end: exp.duration?.end
            ? `${exp.duration.end?.year || ""} ${
                exp.duration.end?.month ? `${getMonth(exp.duration.end.month)}` : ""
              }`.trim()
            : undefined,
        },
        logo: exp.company && exp.company.length > 0 ? `${exp.company[0]}` : "",
      };
    } else {
      const edu = item as Education;
      return {
        title: edu.degree || "",
        subtitle: edu.school || "",
        location: edu.field || "",
        duration: {
          start: `${edu.duration?.start?.year || ""}`,
          end: `${edu.duration?.end?.year || ""}`,
        },
        logo: edu.school && edu.school.length > 0 ? `${edu.school[0]}` : "",
      };
    }
  });
};
