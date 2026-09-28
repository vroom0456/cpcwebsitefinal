import { Skeleton } from "@/components/ui/skeleton";

export default function TimelineLoading() {
  return (
    <div className="container py-12">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-2 h-4 w-72" />

      <div className="mt-10 space-y-20 sm:space-y-28">
        {Array.from({ length: 2 }).map((_, section) => (
          <div key={section}>
            <div className="mb-4 flex gap-2">
              {Array.from({ length: 4 }).map((_, pill) => (
                <Skeleton key={pill} className="h-7 w-20 rounded-full" />
              ))}
            </div>

            <div className="flex gap-4 overflow-hidden pb-6">
              <Skeleton className="h-24 w-24 shrink-0 sm:h-28 sm:w-32" />
              {Array.from({ length: 3 }).map((_, col) => (
                <div key={col} className="flex w-[78vw] shrink-0 flex-col gap-3 sm:w-72">
                  <Skeleton className="h-3 w-24" />
                  {Array.from({ length: 3 }).map((_, card) => (
                    <Skeleton key={card} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
