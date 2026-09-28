import { EventGridSkeleton } from "@/components/public/event-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArchiveLoading() {
  return (
    <div className="container py-12">
      <Skeleton className="h-10 w-48" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <EventGridSkeleton />
    </div>
  );
}
