import React from "react";
import AnimatedTimelineCard from "./animated-timeline-card";

export type TimelineItem = {
  title: string;
  subtitle: string;
  location: string;
  duration: {
    start: string;
    end?: string;
  };
  logo?: string;
  bg?: string;
};

interface TimelineProps {
  items: TimelineItem[];
  backgroundColor?: string;
}

const Timeline: React.FC<TimelineProps> = ({
  items,
  backgroundColor = "bg-[#B9FF66]",
}) => {
  return (
    <div className="relative">
      {/* Continuous timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-black"></div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div className="absolute left-4 top-4 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-black bg-black z-10"></div>
            <div className="pl-10">
              <AnimatedTimelineCard
                {...item}
                bg={index % 2 === 0 ? backgroundColor : "bg-white"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
