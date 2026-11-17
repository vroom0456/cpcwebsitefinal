"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Tag as TagIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTag, deleteTag } from "@/lib/actions/tags.actions";
import type { Tag } from "@/types/database";

export function TagManager({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState(initialTags);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createTag(trimmed);
      setTags((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: trimmed,
          usage_count: 0,
          created_at: new Date().toISOString(),
        },
      ]);
      setName("");
    });
  }

  function handleDelete(tagId: string) {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    startTransition(async () => {
      await deleteTag(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    });
  }

  return (
    <div className="space-y-6 max-w-xl">
      <form onSubmit={handleCreate} className="flex items-center gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New tag name (e.g. hackathon, dance, cultural)"
          disabled={isPending}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending || !name.trim()}>
          <Plus size={14} />
          <span>Add Tag</span>
        </Button>
      </form>

      <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden divide-y divide-white/[0.06]">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between px-4 py-3 text-xs hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1 rounded-md bg-white/[0.04] text-[#C084FC]">
                <TagIcon size={12} />
              </span>
              <span className="font-semibold text-white">{tag.name}</span>
              <span className="text-[11px] text-white/40 font-mono">
                {tag.usage_count} {tag.usage_count === 1 ? "event" : "events"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${tag.name}`}
              onClick={() => handleDelete(tag.id)}
              disabled={isPending}
              className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        ))}

        {tags.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-white/40 font-mono">
            No tags registered yet. Create your first tag above.
          </div>
        )}
      </div>
    </div>
  );
}
