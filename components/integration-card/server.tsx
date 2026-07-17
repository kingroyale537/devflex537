import IntegrationCardClient from "./client";

interface IntegrationCardProps {
  type: "github" | "linkedin" | "medium" | "more";
  index: number;
}

export default function IntegrationCard({ type, index }: IntegrationCardProps) {
  return <IntegrationCardClient type={type} index={index} />;
}
