import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="rounded-xl border-[1px] border-black bg-white overflow-hidden w-full max-w-md lg:max-w-none border-b-6 p-6 space-y-6">
      <div className="flex flex-col items-center lg:items-start gap-4">
        <Skeleton className="w-24 h-24 rounded-2xl" />
        <div className="space-y-2 w-full flex flex-col items-center lg:items-start">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="flex gap-2 justify-center lg:justify-start">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}
