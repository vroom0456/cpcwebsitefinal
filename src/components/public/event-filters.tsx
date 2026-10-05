"use client";

import { useState, useMemo } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database";

interface EventFiltersProps {
  venues: string[];
  organizingClubs: string[];
  years: string[];
  events: Event[];
  q: string;
  setQ: (val: string) => void;
  venue: string;
  setVenue: (val: string) => void;
  organizingClub: string;
  setOrganizingClub: (val: string) => void;
  month: string;
  setMonth: (val: string) => void;
  year: string;
  setYear: (val: string) => void;
  clearFilters: () => void;
}

const monthsList = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function EventFilters({
  venues,
  organizingClubs,
  years,
  events = [],
  q,
  setQ,
  venue,
  setVenue,
  organizingClub,
  setOrganizingClub,
  month,
  setMonth,
  year,
  setYear,
  clearFilters,
}: EventFiltersProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Derive autocomplete suggestions client-side
  const suggestions = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    const list: { text: string; type: "Event" | "Club" | "Venue" }[] = [];

    // Match clubs
    organizingClubs.forEach((c) => {
      if (c.toLowerCase().includes(query)) {
        list.push({ text: c, type: "Club" });
      }
    });

    // Match venues
    venues.forEach((v) => {
      if (v.toLowerCase().includes(query)) {
        list.push({ text: v, type: "Venue" });
      }
    });

    // Match events
    events.forEach((e) => {
      if (e.title.toLowerCase().includes(query)) {
        list.push({ text: e.title, type: "Event" });
      }
    });

    // Deduplicate and slice
    const seen = new Set<string>();
    return list
      .filter((item) => {
        if (seen.has(item.text)) return false;
        seen.add(item.text);
        return true;
      })
      .slice(0, 30);
  }, [q, events, organizingClubs, venues]);

  const hasActiveFilters = Boolean(q || venue || organizingClub || month || year);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
  }

  function handleSuggestionClick(suggestion: string) {
    setQ(suggestion);
    setShowSuggestions(false);
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Search Bar Container */}
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9D5EE5]/70" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search all 131+ events, fests, or dates…"
            className="w-full pl-11 pr-10 h-12 glass text-white placeholder:text-white/35 rounded-xl border-purple-500/20 focus-visible:ring-1 focus-visible:ring-[#9D5EE5]/50 text-xs sm:text-[13px] font-medium transition-all shadow-lg"
            aria-label="Search events"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setShowSuggestions(false);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full glass hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 glass-card rounded-2xl overflow-y-auto max-h-[280px] scrollbar-none shadow-2xl z-50 divide-y divide-white/[0.04] border border-purple-500/30">
              {suggestions.map((suggestion) => {
                const badgeColor =
                  suggestion.type === "Event"
                    ? "glass-purple text-[#C084FC]"
                    : suggestion.type === "Club"
                    ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20";
                return (
                  <button
                    key={suggestion.text}
                    type="button"
                    onMouseDown={() => handleSuggestionClick(suggestion.text)}
                    className="w-full text-left px-4 py-3 text-xs font-semibold text-white/80 hover:bg-[#9D5EE5]/15 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate pr-4">{suggestion.text}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {suggestion.type}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </form>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={clearFilters}
            className="h-12 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white/70 hover:text-white glass hover:bg-[#9D5EE5]/20 transition-all border border-purple-500/30 shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* 4 Required Filters: Venue, Organising Club, Month, Year */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* 1. Venue Filter */}
        <div className="relative">
          <select
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className={`appearance-none w-full glass rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all shadow-md cursor-pointer outline-none pr-8 truncate ${
              venue
                ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white ring-1 ring-[#C084FC] shadow-[0_0_20px_rgba(157,94,229,0.3)]"
                : "text-white/80 border-purple-500/20 hover:border-purple-500/50"
            }`}
            aria-label="Filter by venue"
          >
            <option value="" className="bg-[#050208] text-white">Venue (All)</option>
            {venues.map((v) => (
              <option key={v} value={v} className="bg-[#050208] text-white">
                {v}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#C084FC]">
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 2. Organising Club Filter */}
        <div className="relative">
          <select
            value={organizingClub}
            onChange={(e) => setOrganizingClub(e.target.value)}
            className={`appearance-none w-full glass rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all shadow-md cursor-pointer outline-none pr-8 truncate ${
              organizingClub
                ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white ring-1 ring-[#C084FC] shadow-[0_0_20px_rgba(157,94,229,0.3)]"
                : "text-white/80 border-purple-500/20 hover:border-purple-500/50"
            }`}
            aria-label="Filter by organising club"
          >
            <option value="" className="bg-[#050208] text-white">Organising Club (All)</option>
            {organizingClubs.map((c) => (
              <option key={c} value={c} className="bg-[#050208] text-white">
                {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#C084FC]">
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 3. Month Filter */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className={`appearance-none w-full glass rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all shadow-md cursor-pointer outline-none pr-8 truncate ${
              month
                ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white ring-1 ring-[#C084FC] shadow-[0_0_20px_rgba(157,94,229,0.3)]"
                : "text-white/80 border-purple-500/20 hover:border-purple-500/50"
            }`}
            aria-label="Filter by month"
          >
            <option value="" className="bg-[#050208] text-white">Month (All)</option>
            {monthsList.map((m) => (
              <option key={m.value} value={m.value} className="bg-[#050208] text-white">
                {m.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#C084FC]">
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* 4. Year Filter */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`appearance-none w-full glass rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all shadow-md cursor-pointer outline-none pr-8 truncate ${
              year
                ? "bg-[#9D5EE5]/30 border-[#C084FC] text-white ring-1 ring-[#C084FC] shadow-[0_0_20px_rgba(157,94,229,0.3)]"
                : "text-white/80 border-purple-500/20 hover:border-purple-500/50"
            }`}
            aria-label="Filter by year"
          >
            <option value="" className="bg-[#050208] text-white">Year (All)</option>
            {years.map((y) => (
              <option key={y} value={y} className="bg-[#050208] text-white">
                {y}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#C084FC]">
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
