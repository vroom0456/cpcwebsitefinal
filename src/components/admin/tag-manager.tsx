"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
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
      setTags((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed, usage_count: 0, created_at: new Date().toISOString() }]);
      setName("");
    });
  }

  function handleDelete(tagId: string) {
    startTransition(async () => {
      await deleteTag(tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    });
  }

  return (
    <div className="max-w-md">
      <form onSubmit={handleCreate} className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name" />
        <Button type="submit" disabled={isPending}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

      <ul className="mt-6 divide-y divide-border rounded-lg border border-border">
        {tags.map((tag) => (
          <li key={tag.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span>
              {tag.name} <span className="text-muted-foreground">· used {tag.usage_count}×</span>
            </span>
            <button
              aria-label={`Delete ${tag.name}`}
              onClick={() => handleDelete(tag.id)}
              className="text-muted-foreground hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {tags.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">No tags yet.</li>
        )}
      </ul>
    </div>
  );
}
