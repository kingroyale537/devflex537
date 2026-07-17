import GitHubModalClient from "./client";

interface GitHubModalProps {
  onClose: () => void;
}

export default function GitHubModal({ onClose }: GitHubModalProps) {
  return <GitHubModalClient onClose={onClose} />;
}
