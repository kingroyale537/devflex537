import { Skeleton } from "@/components/ui/skeleton";

export function AboutSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl p-6 border-1 border-black border-b-4 space-y-3">
            <Skeleton className="h-5 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-20 w-1/2 rounded-xl" />
            <Skeleton className="h-20 w-1/2 rounded-xl" />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <div className="bg-white rounded-xl p-6 border-1 border-black border-b-4 space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
