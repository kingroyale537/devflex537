import { Skeleton } from "@/components/ui/skeleton";

export function MediumBlogsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-44" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl border-1 border-black border-b-4 overflow-hidden flex flex-col h-full">
            <Skeleton className="h-40 w-full" />
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
