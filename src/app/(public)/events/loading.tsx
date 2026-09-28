import { EventGridSkeleton } from "@/components/public/event-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div className="container py-12">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="mt-3 h-5 w-80" />
      <EventGridSkeleton />
    </div>
  );
}
