"use client";

import { useState, useTransition } from "react";
import { setEventTags } from "@/lib/actions/tags.actions";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/database";

export function EventTagPicker({
  eventId,
  allTags: initialAllTags,
  initialTagIds,
}: {
  eventId: string;
  allTags: Tag[];
  initialTagIds: string[];
}) {
  const [tags, setTags] = useState(initialAllTags);
  const [selected, setSelected] = useState(new Set(initialTagIds));
  const [newTagName, setNewTagName] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggle(tagId: string) {
    const next = new Set(selected);
    next.has(tagId) ? next.delete(tagId) : next.add(tagId);
    setSelected(next);
    startTransition(() => setEventTags(eventId, Array.from(next)));
  }

  return (
    <div className="space-y-4">
      {/* Existing Tag Pills */}
      <div className={cn("flex flex-wrap gap-2", isPending && "opacity-60")}>
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              selected.has(tag.id)
                ? "border-purple-500/60 bg-[#9D5EE5]/30 text-white shadow-md shadow-purple-950/40"
                : "border-white/10 text-white/50 hover:text-white hover:border-white/20 glass"
            )}
          >
            {tag.name}
          </button>
        ))}
        {tags.length === 0 && (
          <p className="text-xs text-white/40">No tags created yet.</p>
        )}
      </div>

      {/* Add New Tag Form Inline */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const trimmed = newTagName.trim();
          if (!trimmed) return;
          const { createTag } = await import("@/lib/actions/tags.actions");
          startTransition(async () => {
            await createTag(trimmed);
            const newTag = { id: crypto.randomUUID(), name: trimmed, usage_count: 1, created_at: new Date().toISOString() };
            setTags((prev) => [...prev, newTag]);
            setSelected((prev) => new Set([...prev, newTag.id]));
            setNewTagName("");
          });
        }}
        className="flex items-center gap-2 max-w-sm pt-2"
      >
        <input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="+ Add custom tag name"
          className="glass text-white text-xs px-3.5 py-2 rounded-xl border border-purple-500/20 flex-1 focus:outline-none focus:border-purple-500/40"
        />
        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl btn-primary-glow text-white text-xs font-bold shrink-0 cursor-pointer"
        >
          Add Tag
        </button>
      </form>
    </div>
  );
}
