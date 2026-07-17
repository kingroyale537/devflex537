import ProfileCardClient from "./client";

interface ProfileCardProps {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  index: number;
}

export default function ProfileCard({
  name,
  username,
  avatarUrl,
  bio,
  index,
}: ProfileCardProps) {
  return (
    <ProfileCardClient
      name={name}
      username={username}
      avatarUrl={avatarUrl}
      bio={bio}
      index={index}
    />
  );
}
