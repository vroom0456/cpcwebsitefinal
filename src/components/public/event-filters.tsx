"use client";

import { useState, useMemo } from "react";
import { Search, X, Sparkles, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/database";

interface FilterOptions {
  departments: string[];
  venues: string[];
  academicYears: string[];
  categories: string[];
  organizingClubs: string[];
}

interface EventFiltersProps {
  options: FilterOptions;
  events: Event[];
  q: string;
  setQ: (val: string) => void;
  year: string;
  setYear: (val: string) => void;
  month: string;
  setMonth: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  department: string;
  setDepartment: (val: string) => void;
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
  options,
  events = [],
  q,
  setQ,
  year,
  setYear,
  month,
  setMonth,
  category,
  setCategory,
  department,
  setDepartment,
  clearFilters,
}: EventFiltersProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Derive autocomplete suggestions client-side
  const suggestions = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    const list: { text: string; type: "Event" | "Category" | "Photographer" }[] = [];

    // Match categories
    options.categories.forEach((c) => {
      if (c.toLowerCase().includes(query)) {
        list.push({ text: c, type: "Category" });
      }
    });

    // Match departments/photographers
    options.departments.forEach((d) => {
      if (d.toLowerCase().includes(query)) {
        list.push({ text: d, type: "Photographer" });
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
      .slice(0, 50);
  }, [q, events, options]);

  const hasActiveFilters = Boolean(q || year || month || category || department);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setShowSuggestions(false);
  }

  function handleSuggestionClick(suggestion: string) {
    setQ(suggestion);
    setShowSuggestions(false);
  }

  return (
    <div className="mt-8 space-y-6 max-w-4xl mx-auto">
      {/* Search Bar Container */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full flex-1">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9D5EE5]/70" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search events, themes, or keywords..."
            className="w-full pl-12 pr-12 h-14 glass text-white placeholder:text-white/35 rounded-2xl border-purple-500/20 focus-visible:ring-2 focus-visible:ring-[#9D5EE5]/50 text-[15px] font-medium transition-all duration-300 shadow-xl"
            aria-label="Search events"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setShowSuggestions(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full glass hover:bg-white/10 text-white/60 hover:text-white transition-all focus-visible:outline-none cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 glass-card rounded-2xl overflow-y-auto max-h-[320px] scrollbar-none shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-50 divide-y divide-white/[0.04] border border-purple-500/30">
              {suggestions.map((suggestion) => {
                const badgeColor =
                  suggestion.type === "Event"
                    ? "glass-purple text-[#C084FC]"
                    : suggestion.type === "Category"
                    ? "bg-blue-500/10 text-blue-300 border border-blue-500/20"
                    : "bg-pink-500/10 text-pink-300 border border-pink-500/20";
                return (
                  <button
                    key={suggestion.text}
                    type="button"
                    onMouseDown={() => handleSuggestionClick(suggestion.text)}
                    className="w-full text-left px-5 py-3.5 text-sm font-semibold text-white/80 hover:bg-[#9D5EE5]/15 hover:text-white transition-all duration-200 flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate pr-4">{suggestion.text}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeColor}`}>
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
            className="h-14 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest text-[#F8F5FB]/70 hover:text-white glass hover:bg-[#9D5EE5]/20 transition-all duration-300 border border-purple-500/30 shrink-0 flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Filter Pills with Glass UI */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#9D5EE5] flex items-center gap-1.5 mr-1 hidden sm:flex">
          <Filter size={12} />
          Filters:
        </div>

        {/* Year Filter */}
        <div className="relative flex-1 sm:flex-none min-w-[130px]">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="appearance-none w-full glass text-white/90 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 shadow-lg cursor-pointer outline-none focus:ring-2 focus:ring-[#9D5EE5]/50 border-purple-500/20 pr-10 hover:border-purple-500/40"
            aria-label="Filter by academic year"
          >
            <option value="" className="bg-[#050208] text-white">Year (All)</option>
            {options.academicYears.map((y) => (
              <option key={y} value={y} className="bg-[#050208] text-white">
                {y}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#9D5EE5]">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Month Filter */}
        <div className="relative flex-1 sm:flex-none min-w-[130px]">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="appearance-none w-full glass text-white/90 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 shadow-lg cursor-pointer outline-none focus:ring-2 focus:ring-[#9D5EE5]/50 border-purple-500/20 pr-10 hover:border-purple-500/40"
            aria-label="Filter by month"
          >
            <option value="" className="bg-[#050208] text-white">Month (All)</option>
            {monthsList.map((m) => (
              <option key={m.value} value={m.value} className="bg-[#050208] text-white">
                {m.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#9D5EE5]">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="relative flex-1 sm:flex-none min-w-[140px]">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none w-full glass text-white/90 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 shadow-lg cursor-pointer outline-none focus:ring-2 focus:ring-[#9D5EE5]/50 border-purple-500/20 pr-10 hover:border-purple-500/40"
            aria-label="Filter by category"
          >
            <option value="" className="bg-[#050208] text-white">Category (All)</option>
            {options.categories.map((c) => (
              <option key={c} value={c} className="bg-[#050208] text-white">
                {c}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#9D5EE5]">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Department Filter */}
        <div className="relative flex-1 sm:flex-none min-w-[150px]">
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="appearance-none w-full glass text-white/90 rounded-full px-5 py-2.5 text-[13px] font-semibold transition-all duration-300 shadow-lg cursor-pointer outline-none focus:ring-2 focus:ring-[#9D5EE5]/50 border-purple-500/20 pr-10 hover:border-purple-500/40"
            aria-label="Filter by department"
          >
            <option value="" className="bg-[#050208] text-white">Dept (All)</option>
            {options.departments.map((d) => (
              <option key={d} value={d} className="bg-[#050208] text-white">
                {d}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#9D5EE5]">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
