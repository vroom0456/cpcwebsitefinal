import { ImageOff } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
      <ImageOff className="mb-4 h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
