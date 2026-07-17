import HowItWorksCardClient from "./client";
import { Github, RefreshCw, Share2, Search, Code } from "lucide-react";

const iconMap = {
  Github,
  RefreshCw,
  Share2,
  Search,
  Code,
};

interface HowItWorksCardProps {
  iconName: keyof typeof iconMap;
  title: string;
  description: string;
  index: number;
}

export default function HowItWorksCard({
  iconName,
  title,
  description,
  index,
}: HowItWorksCardProps) {
  return (
    <HowItWorksCardClient
      iconName={iconName}
      title={title}
      description={description}
      index={index}
    />
  );
}
