import { Skeleton } from "@/components/ui/skeleton";

export function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <div className="space-y-6 pl-4 border-l border-black/20">
        {[1, 2].map((i) => (
          <div key={i} className="relative space-y-2">
            <div className="absolute -left-[21px] top-1 w-3.5 h-3.5 rounded-full border border-black bg-white" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
