import { getTags } from "@/lib/services/tags.service";
import { TagManager } from "@/components/admin/tag-manager";
import { Tag as TagIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await getTags();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TagIcon size={14} className="text-[#C084FC]" />
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#C084FC]/80">
            Metadata Management
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Event Tags & Categories
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1 max-w-xl">
          Create, view, and organize searchable tags used across gallery collections and event filters.
        </p>
      </div>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Manage Tags ({tags.length})</CardTitle>
          <CardDescription>
            Tags help attendees find photos by category, club, or fest name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TagManager initialTags={tags} />
        </CardContent>
      </Card>
    </div>
  );
}
