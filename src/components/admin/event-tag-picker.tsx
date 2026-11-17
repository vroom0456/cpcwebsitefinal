"use client";

import { useState, useTransition, useMemo } from "react";
import { setEventTags, createTag } from "@/lib/actions/tags.actions";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/database";
import { Tag as TagIcon, Plus, X, Check, Search, Sparkles, CheckCircle2 } from "lucide-react";

const CBIT_PRESET_TAGS = [
  "Sudhee Fest",
  "Shruthi Fest",
  "Cultural",
  "Technical",
  "Sports / Kreeda",
  "Hackathon",
  "Orientation",
  "Farewell",
  "Workshop",
  "Conference",
  "Flash Mob",
  "Celebration",
  "OAT Stage",
  "Alumni Meet",
  "Independence Day",
];

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
  const [selectedIds, setSelectedIds] = useState(new Set(initialTagIds));
  const [newTagName, setNewTagName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  // Sync with server
  const saveTags = (nextSet: Set<string>) => {
    setSelectedIds(nextSet);
    startTransition(async () => {
      await setEventTags(eventId, Array.from(nextSet));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    });
  };

  const toggleTag = (tagId: string) => {
    const next = new Set(selectedIds);
    if (next.has(tagId)) {
      next.delete(tagId);
    } else {
      next.add(tagId);
    }
    saveTags(next);
  };

  const removeTag = (tagId: string) => {
    const next = new Set(selectedIds);
    next.delete(tagId);
    saveTags(next);
  };

  // Add tag by name (existing or newly created)
  const addTagByName = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Check if tag already exists in local list
    const existing = tags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      const next = new Set(selectedIds);
      next.add(existing.id);
      saveTags(next);
      setNewTagName("");
      return;
    }

    // Create via server
    const created = await createTag(trimmed);
    const tagObj: Tag = created || {
      id: crypto.randomUUID(),
      name: trimmed,
      usage_count: 1,
      created_at: new Date().toISOString(),
    };

    setTags((prev) => [...prev, tagObj]);
    const next = new Set(selectedIds);
    next.add(tagObj.id);
    saveTags(next);
    setNewTagName("");
  };

  // Active tags objects
  const activeTags = useMemo(() => {
    return tags.filter((t) => selectedIds.has(t.id));
  }, [tags, selectedIds]);

  // Filtered available tags
  const filteredTags = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, searchQuery]);

  return (
    <div className="space-y-5">
      {/* ── Active Tags Bar ── */}
      <div className="p-4 rounded-2xl glass-card border border-purple-500/20 bg-white/[0.02] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TagIcon size={15} className="text-[#C084FC]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Active Event Tags
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#9D5EE5]/20 text-[#C084FC] border border-[#9D5EE5]/30">
              {activeTags.length} active
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono">
            {isPending && <span className="text-[#C084FC] animate-pulse">Syncing…</span>}
            {justSaved && !isPending && (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 size={12} /> Saved
              </span>
            )}
          </div>
        </div>

        {activeTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {activeTags.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/15 border border-white/30 text-white shadow-md shadow-black/30 group transition-all"
              >
                <span>{t.name}</span>
                <button
                  type="button"
                  onClick={() => removeTag(t.id)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                  title="Remove tag"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/40 italic py-1">
            No tags assigned yet. Select from the presets below or add custom tags to improve event categorization.
          </p>
        )}
      </div>

      {/* ── Quick Preset Tags ── */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-400" />
          <span>Quick Campus Presets (Click to Toggle)</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          {CBIT_PRESET_TAGS.map((preset) => {
            const matchedTag = tags.find((t) => t.name.toLowerCase() === preset.toLowerCase());
            const isSelected = matchedTag ? selectedIds.has(matchedTag.id) : false;

            return (
              <button
                key={preset}
                type="button"
                onClick={() => addTagByName(preset)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1.5",
                  isSelected
                    ? "bg-white text-black font-bold border-white shadow-sm"
                    : "glass border-white/10 text-white/60 hover:text-white hover:border-white/30 hover:bg-white/[0.05]"
                )}
              >
                {isSelected ? <Check size={11} className="text-emerald-400" /> : <Plus size={11} className="text-white/40" />}
                <span>{preset}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Add Custom Tag Form & Search Existing ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/[0.06]">
        {/* Create new tag */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTagByName(newTagName);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <TagIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Create new custom tag…"
              className="w-full glass text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-purple-500/20 focus:outline-none focus:border-[#C084FC]"
            />
          </div>
          <button
            type="submit"
            disabled={!newTagName.trim()}
            className="px-4 py-2.5 rounded-xl btn-primary-glow text-white text-xs font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
          >
            Add
          </button>
        </form>

        {/* Filter from existing library */}
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all existing tags in library…"
            className="w-full glass text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500/40"
          />
        </div>
      </div>

      {/* ── All Existing Tags Browser (When filtered or browsing) ── */}
      {searchQuery && (
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">
            Matching Tags in Library ({filteredTags.length})
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-black/30 border border-white/10">
            {filteredTags.map((t) => {
              const isSelected = selectedIds.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTag(t.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all flex items-center gap-1",
                    isSelected
                      ? "bg-white text-black font-bold border-white"
                      : "bg-white/[0.03] border-white/10 text-white/60 hover:text-white"
                  )}
                >
                  {isSelected && <Check size={10} className="text-emerald-400" />}
                  <span>{t.name}</span>
                </button>
              );
            })}
            {filteredTags.length === 0 && (
              <p className="text-xs text-white/30 p-2">No existing tags match &quot;{searchQuery}&quot;</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
