import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <div className="container py-12">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="mt-3 h-5 w-1/3" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full" />
        ))}
      </div>
    </div>
  );
}
